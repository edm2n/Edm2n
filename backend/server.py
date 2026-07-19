from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
import httpx
import jwt
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Matar@2026')
JWT_SECRET = os.environ.get('JWT_SECRET', 'change-me')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Dalil Matar API")
api_router = APIRouter(prefix="/api")


# ==================== MODELS ====================
class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    message: str


class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    message: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class LoginBody(BaseModel):
    username: str
    password: str


class ToolOverride(BaseModel):
    slug: str
    hidden: bool = False
    name: Optional[str] = None
    desc: Optional[str] = None
    order: Optional[int] = None
    featured: bool = False


class CustomPage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title: str
    content: str  # Markdown or plain text
    excerpt: Optional[str] = ""
    image: Optional[str] = ""
    source_url: Optional[str] = ""
    published: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class SmartFetchBody(BaseModel):
    query: str  # URL or keyword


class SiteConfig(BaseModel):
    ga_id: Optional[str] = ""
    editor_picks: List[str] = []
    latest: List[str] = []


class BioRequest(BaseModel):
    name: str
    job: str
    skills: str = ""
    tone: str = "professional"


class TashkeelRequest(BaseModel):
    text: str


# ==================== AUTH ====================
def make_token(username: str) -> str:
    payload = {"sub": username, "exp": datetime.now(timezone.utc) + timedelta(days=30)}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def verify_admin(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if payload.get("sub") != ADMIN_USERNAME:
            raise HTTPException(status_code=403, detail="Not admin")
        return payload["sub"]
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ==================== PUBLIC ROUTES ====================
@api_router.get("/")
async def root():
    return {"message": "Dalil Matar API", "version": "1.1"}


@api_router.post("/contact", response_model=ContactMessage)
async def create_contact(payload: ContactCreate):
    obj = ContactMessage(**payload.model_dump())
    await db.contacts.insert_one(obj.model_dump())
    return obj


@api_router.get("/prayer-times")
async def prayer_times(city: str = "Riyadh", country: str = "SA", method: int = 4):
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as hc:
            r = await hc.get("https://api.aladhan.com/v1/timingsByCity",
                             params={"city": city, "country": country, "method": method})
            r.raise_for_status()
            return r.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Prayer API error: {e}")


@api_router.get("/currency")
async def currency_rates(base: str = "sar"):
    base = base.lower()
    urls = [
        f"https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/{base}.json",
        f"https://latest.currency-api.pages.dev/v1/currencies/{base}.json",
    ]
    async with httpx.AsyncClient(timeout=10.0) as hc:
        for u in urls:
            try:
                r = await hc.get(u)
                if r.status_code == 200:
                    return r.json()
            except Exception:
                continue
    raise HTTPException(status_code=502, detail="Currency API unavailable")


@api_router.get("/gold-price")
async def gold_price():
    urls = [
        "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/xau.json",
        "https://latest.currency-api.pages.dev/v1/currencies/xau.json",
    ]
    async with httpx.AsyncClient(timeout=10.0) as hc:
        for u in urls:
            try:
                r = await hc.get(u)
                if r.status_code == 200:
                    data = r.json()
                    rates = data.get("xau", {})
                    usd_per_oz = rates.get("usd")
                    sar_per_oz = rates.get("sar")
                    gram = 31.1035
                    return {
                        "date": data.get("date"),
                        "usd_per_ounce": usd_per_oz,
                        "sar_per_ounce": sar_per_oz,
                        "usd_per_gram": (usd_per_oz / gram) if usd_per_oz else None,
                        "sar_per_gram": (sar_per_oz / gram) if sar_per_oz else None,
                        "karats": {
                            "24k_sar_g": (sar_per_oz / gram) if sar_per_oz else None,
                            "22k_sar_g": (sar_per_oz / gram * 22 / 24) if sar_per_oz else None,
                            "21k_sar_g": (sar_per_oz / gram * 21 / 24) if sar_per_oz else None,
                            "18k_sar_g": (sar_per_oz / gram * 18 / 24) if sar_per_oz else None,
                        }
                    }
            except Exception:
                continue
    raise HTTPException(status_code=502, detail="Gold API unavailable")


# ==================== SITE CONFIG (public read) ====================
@api_router.get("/config")
async def get_config():
    doc = await db.site_config.find_one({"_id": "singleton"}, {"_id": 0})
    if not doc:
        return {"ga_id": "", "editor_picks": [], "latest": []}
    return doc


@api_router.get("/pages/{slug}")
async def get_page(slug: str):
    doc = await db.custom_pages.find_one({"slug": slug, "published": True}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Page not found")
    return doc


@api_router.get("/pages")
async def list_pages():
    docs = await db.custom_pages.find({"published": True}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return docs


@api_router.get("/tools/overrides")
async def get_tool_overrides():
    docs = await db.tool_overrides.find({}, {"_id": 0}).to_list(500)
    return docs


# ==================== TRACKING ====================
@api_router.post("/track/tool/{slug}")
async def track_tool(slug: str):
    await db.tool_views.update_one(
        {"slug": slug},
        {"$inc": {"count": 1}, "$set": {"last_view": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"ok": True}


@api_router.get("/admin/stats")
async def admin_stats(_: str = Depends(verify_admin)):
    # Top viewed tools
    top = await db.tool_views.find({}, {"_id": 0}).sort("count", -1).limit(15).to_list(15)
    # True total across ALL tracked tools (not just top 15)
    agg = await db.tool_views.aggregate([{"$group": {"_id": None, "s": {"$sum": "$count"}}}]).to_list(1)
    total_views = agg[0]["s"] if agg else 0

    # Contacts breakdowns
    now = datetime.now(timezone.utc)
    week_ago = (now - timedelta(days=7)).isoformat()
    month_ago = (now - timedelta(days=30)).isoformat()
    total_contacts = await db.contacts.count_documents({})
    week_contacts = await db.contacts.count_documents({"created_at": {"$gte": week_ago}})
    month_contacts = await db.contacts.count_documents({"created_at": {"$gte": month_ago}})

    # Contacts per day for last 14 days
    docs = await db.contacts.find({"created_at": {"$gte": (now - timedelta(days=14)).isoformat()}}, {"_id": 0, "created_at": 1}).to_list(2000)
    per_day = {}
    for d in docs:
        try:
            day = d["created_at"][:10]
            per_day[day] = per_day.get(day, 0) + 1
        except Exception:
            continue
    daily = [{"date": k, "count": v} for k, v in sorted(per_day.items())]

    total_pages = await db.custom_pages.count_documents({})
    total_tools_tracked = await db.tool_views.count_documents({})

    return {
        "top_tools": top,
        "total_views": total_views,
        "total_tools_tracked": total_tools_tracked,
        "contacts": {
            "total": total_contacts,
            "last_7d": week_contacts,
            "last_30d": month_contacts,
        },
        "contacts_daily": daily,
        "total_pages": total_pages,
    }


# ==================== AI ENDPOINTS ====================
@api_router.post("/ai/bio")
async def ai_bio(req: BioRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")
    tone_map = {
        "professional": "احترافية ورسمية",
        "friendly": "ودّية وشخصية",
        "creative": "إبداعية وممتعة",
    }
    tone_ar = tone_map.get(req.tone, "احترافية")
    prompt = f"""اكتب لي بايو (سيرة قصيرة) باللغة العربية الفصحى بأسلوب {tone_ar}.

الاسم: {req.name}
المسمى الوظيفي / المجال: {req.job}
المهارات والاهتمامات: {req.skills or 'غير محدد'}

المتطلبات:
- بالضبط 3 إلى 4 جمل قصيرة.
- لا تضيف تحيّة ولا مقدمة، اكتب البايو مباشرة.
- استخدم صيغة المتكلّم (أنا) لا صيغة الغائب.
- اجعله جذاباً ومناسباً لمنصات تويتر وإنستقرام.
- لا تستخدم رموز إيموجي كثيرة (رمز واحد أو اثنان بحد أقصى).
"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"bio-{uuid.uuid4()}",
            system_message="أنت كاتب محتوى عربي محترف تكتب البايو والسير الذاتية القصيرة."
        ).with_model("anthropic", "claude-sonnet-4-6")
        # Non-streaming: use stream_message and collect
        text = ""
        async for ev in chat.stream_message(UserMessage(text=prompt)):
            from emergentintegrations.llm.chat import TextDelta, StreamDone
            if isinstance(ev, TextDelta):
                text += ev.content
            elif isinstance(ev, StreamDone):
                break
        return {"bio": text.strip()}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI error: {e}")


@api_router.post("/ai/tashkeel")
async def ai_tashkeel(req: TashkeelRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")
    prompt = f"""أضف التشكيل الكامل (الحركات) للنص العربي التالي بشكل صحيح لغوياً.

النص:
{req.text}

المتطلبات:
- أعِد النص فقط مع التشكيل الكامل، بدون أي تعليق أو مقدمة.
- لا تغيّر الكلمات، فقط أضف الحركات (فتحة، ضمة، كسرة، شدة، تنوين، سكون).
"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"tashkeel-{uuid.uuid4()}",
            system_message="أنت خبير في اللغة العربية والنحو، متخصص في تشكيل النصوص العربية."
        ).with_model("anthropic", "claude-sonnet-4-6")
        text = ""
        async for ev in chat.stream_message(UserMessage(text=prompt)):
            from emergentintegrations.llm.chat import TextDelta, StreamDone
            if isinstance(ev, TextDelta):
                text += ev.content
            elif isinstance(ev, StreamDone):
                break
        return {"text": text.strip()}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI error: {e}")


# ==================== ADMIN ROUTES ====================
@api_router.post("/admin/login")
async def admin_login(body: LoginBody):
    if body.username != ADMIN_USERNAME or body.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="بيانات الدخول غير صحيحة")
    return {"token": make_token(body.username)}


@api_router.get("/admin/verify")
async def admin_verify(_: str = Depends(verify_admin)):
    return {"ok": True}


@api_router.get("/admin/contacts", response_model=List[ContactMessage])
async def admin_contacts(_: str = Depends(verify_admin)):
    docs = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api_router.get("/admin/config")
async def admin_get_config(_: str = Depends(verify_admin)):
    doc = await db.site_config.find_one({"_id": "singleton"}, {"_id": 0})
    return doc or {"ga_id": "", "editor_picks": [], "latest": []}


@api_router.put("/admin/config")
async def admin_put_config(body: SiteConfig, _: str = Depends(verify_admin)):
    await db.site_config.update_one(
        {"_id": "singleton"},
        {"$set": body.model_dump()},
        upsert=True,
    )
    return body.model_dump()


@api_router.get("/admin/pages")
async def admin_list_pages(_: str = Depends(verify_admin)):
    docs = await db.custom_pages.find({}, {"_id": 0}).to_list(500)
    return docs


@api_router.post("/admin/pages", response_model=CustomPage)
async def admin_create_page(page: CustomPage, _: str = Depends(verify_admin)):
    if await db.custom_pages.find_one({"slug": page.slug}):
        raise HTTPException(status_code=400, detail="هذا الرابط مستخدم بالفعل")
    await db.custom_pages.insert_one(page.model_dump())
    return page


@api_router.put("/admin/pages/{page_id}", response_model=CustomPage)
async def admin_update_page(page_id: str, page: CustomPage, _: str = Depends(verify_admin)):
    await db.custom_pages.update_one({"id": page_id}, {"$set": page.model_dump()})
    return page


@api_router.delete("/admin/pages/{page_id}")
async def admin_delete_page(page_id: str, _: str = Depends(verify_admin)):
    await db.custom_pages.delete_one({"id": page_id})
    return {"deleted": True}


@api_router.put("/admin/tools/{slug}")
async def admin_upsert_tool_override(slug: str, override: ToolOverride, _: str = Depends(verify_admin)):
    data = override.model_dump()
    data["slug"] = slug
    await db.tool_overrides.update_one({"slug": slug}, {"$set": data}, upsert=True)
    return data


@api_router.delete("/admin/tools/{slug}")
async def admin_delete_tool_override(slug: str, _: str = Depends(verify_admin)):
    await db.tool_overrides.delete_one({"slug": slug})
    return {"deleted": True}


# ==================== SMART FETCH ====================
import re
import unicodedata


def _slugify(text: str, maxlen: int = 60) -> str:
    text = unicodedata.normalize("NFKD", text or "")
    text = re.sub(r"[^\w\s\u0600-\u06FF-]", "", text)  # keep Arabic + alnum
    text = re.sub(r"[\s_]+", "-", text.strip())
    return text.lower()[:maxlen] or f"page-{uuid.uuid4().hex[:8]}"


USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"


async def _resolve_query_to_url(query: str) -> Optional[str]:
    """If query is URL return it. Otherwise search DuckDuckGo HTML for first result."""
    q = query.strip()
    if q.startswith("http://") or q.startswith("https://"):
        return q
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True,
                                  headers={"User-Agent": USER_AGENT}) as hc:
        try:
            r = await hc.get("https://html.duckduckgo.com/html/", params={"q": q})
            if r.status_code == 200:
                m = re.search(r'<a[^>]+class="result__a"[^>]+href="([^"]+)"', r.text)
                if m:
                    href = m.group(1)
                    m2 = re.search(r"uddg=([^&]+)", href)
                    if m2:
                        from urllib.parse import unquote
                        return unquote(m2.group(1))
                    return href
        except Exception:
            pass
    return None


@api_router.post("/admin/smart-fetch")
async def smart_fetch(body: SmartFetchBody, _: str = Depends(verify_admin)):
    import trafilatura
    from trafilatura.settings import use_config
    q = (body.query or "").strip()
    if not q:
        raise HTTPException(status_code=400, detail="أدخل رابطاً أو كلمة مفتاحية")

    url = await _resolve_query_to_url(q)
    if not url:
        raise HTTPException(status_code=404, detail="لم يتم العثور على أي نتيجة")

    # Download page
    try:
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True,
                                      headers={
                                          "User-Agent": USER_AGENT,
                                          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                                          "Accept-Language": "ar,en-US;q=0.9,en;q=0.8",
                                      }) as hc:
            r = await hc.get(url)
            if r.status_code >= 400:
                raise HTTPException(status_code=422, detail=f"الرابط لا يستجيب (HTTP {r.status_code})")
            html = r.text
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"تعذّر الوصول للرابط: {type(e).__name__}")

    # Extract with trafilatura → Markdown output + metadata
    cfg = use_config()
    cfg.set("DEFAULT", "MIN_EXTRACTED_SIZE", "80")

    extracted = trafilatura.extract(
        html,
        url=url,
        output_format="markdown",
        include_images=True,
        include_links=True,
        include_tables=True,
        favor_recall=True,
        config=cfg,
    )
    if not extracted or len(extracted.strip()) < 50:
        raise HTTPException(status_code=422, detail="تعذّر استخراج محتوى مفيد من الصفحة (قد تكون الصفحة تمنع الاستخراج أو خالية من نص).")

    meta = trafilatura.extract_metadata(html) or None
    title = ""
    image = ""
    excerpt = ""
    if meta:
        title = meta.title or ""
        image = meta.image or ""
        excerpt = (meta.description or "")[:220]
    if not title:
        m = re.search(r"<title[^>]*>([^<]+)</title>", html, re.IGNORECASE)
        if m: title = m.group(1).strip()
    if not title:
        title = url

    if not excerpt:
        # Take first paragraph of extracted content
        first_para = next((p.strip() for p in extracted.split("\n") if len(p.strip()) > 40), "")
        excerpt = first_para[:220]

    if not image:
        m = re.search(r'<meta[^>]+property="og:image"[^>]+content="([^"]+)"', html, re.IGNORECASE)
        if m: image = m.group(1)

    slug = _slugify(title) or f"article-{uuid.uuid4().hex[:8]}"

    return {
        "slug": slug,
        "title": title[:200],
        "content": extracted,
        "excerpt": excerpt,
        "image": image,
        "source_url": url,
    }


class SmartFetchSaveBody(BaseModel):
    query: str
    slug: Optional[str] = None
    publish: bool = True


@api_router.post("/admin/smart-fetch-save", response_model=CustomPage)
async def smart_fetch_save(body: SmartFetchSaveBody, _: str = Depends(verify_admin)):
    """One-shot: fetch a URL/keyword and directly save as a published page."""
    data = await smart_fetch(SmartFetchBody(query=body.query), _)
    slug = body.slug or data["slug"]
    # ensure unique slug
    base = slug
    n = 1
    while await db.custom_pages.find_one({"slug": slug}):
        n += 1
        slug = f"{base}-{n}"
    page = CustomPage(
        slug=slug,
        title=data["title"],
        content=data["content"] + ("\n\n---\n\n*المصدر: [" + data["source_url"] + "](" + data["source_url"] + ")*" if data.get("source_url") else ""),
        excerpt=data.get("excerpt", ""),
        image=data.get("image", ""),
        source_url=data.get("source_url", ""),
        published=body.publish,
    )
    await db.custom_pages.insert_one(page.model_dump())
    return page


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
