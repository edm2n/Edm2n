from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Request, UploadFile, File
from fastapi.responses import Response, PlainTextResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import io
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


# ==================== SITEMAP & ROBOTS ====================
STATIC_ROUTES = [
    ("/",         "1.0", "daily"),
    ("/about",    "0.6", "monthly"),
    ("/faq",      "0.6", "monthly"),
    ("/privacy",  "0.4", "yearly"),
    ("/terms",    "0.4", "yearly"),
    ("/links",    "0.5", "monthly"),
]


def _load_tool_slugs():
    try:
        p = Path(__file__).parent / "tool_slugs.txt"
        return [s.strip() for s in p.read_text(encoding="utf-8").splitlines() if s.strip()]
    except Exception:
        return []


def _base_url_from_request(req: Request) -> str:
    proto = req.headers.get("x-forwarded-proto", req.url.scheme or "https")
    host = req.headers.get("x-forwarded-host") or req.headers.get("host") or req.url.hostname
    return f"{proto}://{host}"


@api_router.get("/sitemap.xml")
async def sitemap_xml(request: Request):
    base = _base_url_from_request(request)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    urls = []

    # Static routes
    for path, priority, changefreq in STATIC_ROUTES:
        urls.append({"loc": f"{base}{path}", "lastmod": now, "priority": priority, "changefreq": changefreq})

    # Tools
    for slug in _load_tool_slugs():
        urls.append({"loc": f"{base}/tool/{slug}", "lastmod": now, "priority": "0.8", "changefreq": "monthly"})

    # Published custom pages / articles
    docs = await db.custom_pages.find({"published": True}, {"_id": 0, "slug": 1, "created_at": 1}).to_list(1000)
    for d in docs:
        lastmod = (d.get("created_at") or now)[:10]
        urls.append({"loc": f"{base}/p/{d['slug']}", "lastmod": lastmod, "priority": "0.7", "changefreq": "weekly"})

    def esc(s: str) -> str:
        return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                 .replace('"', "&quot;").replace("'", "&apos;"))

    body = ['<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in urls:
        body.append("  <url>")
        body.append(f"    <loc>{esc(u['loc'])}</loc>")
        body.append(f"    <lastmod>{u['lastmod']}</lastmod>")
        body.append(f"    <changefreq>{u['changefreq']}</changefreq>")
        body.append(f"    <priority>{u['priority']}</priority>")
        body.append("  </url>")
    body.append("</urlset>")
    return Response(content="\n".join(body), media_type="application/xml; charset=utf-8",
                    headers={"Cache-Control": "public, max-age=3600"})


@api_router.get("/robots.txt", response_class=PlainTextResponse)
async def robots_txt(request: Request):
    base = _base_url_from_request(request)
    lines = [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin",
        "Disallow: /api/admin/",
        "",
        f"Sitemap: {base}/sitemap.xml",
        f"Sitemap: {base}/api/sitemap.xml",
    ]
    return "\n".join(lines)


@api_router.post("/contact", response_model=ContactMessage)
async def create_contact(payload: ContactCreate):
    obj = ContactMessage(**payload.model_dump())
    await db.contacts.insert_one(obj.model_dump())
    return obj
#بداية دالة صفهة تفريغ الصورع
# ضع مفتاحك هنا أو في ملف الـ .env
REMOVE_BG_API_KEY = os.environ.get("REMOVE_BG_API_KEY", "Awmp2DCjJgHCJr8cuJpCR1ri")

@api_router.post("/remove-bg")
async def remove_background_api(file: UploadFile = File(...)):
    """إزالة الخلفية بلمح البصر وبأعلى دقة باستخدام Remove.bg Official API"""
    try:
        input_image = await file.read()
        
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                "https://api.remove.bg/v1.0/removebg",
                files={"image_file": input_image},
                data={"size": "auto"},
                headers={"X-Api-Key": REMOVE_BG_API_KEY},
            )
            
            if response.status_code == 200:
                return Response(content=response.content, media_type="image/png")
            else:
                logger.error(f"Remove.bg API Error: {response.text}")
                raise HTTPException(status_code=response.status_code, detail="فشلت المعالجة من خادم Remove.bg")

    except Exception as e:
        logger.error(f"Error in remove-bg: {str(e)}")
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء معالجة الصورة: {str(e)}")
#نهاية صفحة تفريغ الصوره

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

# بدايه صفحة الجلب
@api_router.post("/admin/smart-fetch")
async def smart_fetch(body: SmartFetchBody, _: str = Depends(verify_admin)):
    """جلب بيانات الـ API وتفكيك الـ JSON تلقائياً إلى جداول وقوائم مرتبة"""
    import json

    q = (body.query or "").strip()
    if not q:
        raise HTTPException(status_code=400, detail="أدخل رابط الـ API المطلوب")

    # إضافة البرتوكول إذا لم يكن موجوداً
    url = q if q.startswith(("http://", "https://")) else f"https://{q}"

    try:
        async with httpx.AsyncClient(
            timeout=15.0,
            follow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "application/json, text/plain, */*",
            },
        ) as hc:
            r = await hc.get(url)

            if r.status_code >= 400:
                raise HTTPException(
                    status_code=422,
                    detail=f"الـ API أرجع خطأ (HTTP {r.status_code})",
                )

            try:
                json_data = r.json()
            except Exception:
                raise HTTPException(
                    status_code=422,
                    detail="الرابط لا يرجع بيانات JSON صالحة للتفكيك.",
                )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"تعذّر الاتصال بالرابط: {str(e)}",
        )

    # --- دالة تفكيك وإعادة رسم البيانات (Parsing & Rendering) ---
    def render_json_to_markdown(data, depth=0):
        md_output = ""

        # حالة 1: المصفوفات القابلة للجدولة (List of Objects)
        if isinstance(data, list):
            if not data:
                return "_لا توجد عناصر لعرضها_\n"

            # إذا كانت القائمة تحتوي على قواميس (Objects)
            if isinstance(data[0], dict):
                # استخراج كافة المفاتيح/الأعمدة
                keys = list(
                    dict.fromkeys([k for item in data if isinstance(item, dict) for k in item.keys()])
                )
                if keys:
                    # بناء رأس الجدول
                    header = "| " + " | ".join(str(k) for k in keys) + " |"
                    divider = "| " + " | ".join(["---"] * len(keys)) + " |"
                    rows = []

                    for item in data[:50]:  # تحديد حد أقصى لعرض 50 عنصر
                        if isinstance(item, dict):
                            row = "| " + " | ".join(str(item.get(k, "")).replace("\n", " ") for k in keys) + " |"
                            rows.append(row)

                    return f"{header}\n{divider}\n" + "\n".join(rows) + "\n\n"

            # إذا كانت القائمة عناصر نصية/عادية
            list_items = [f"* {str(x)}" for x in data]
            return "\n".join(list_items) + "\n\n"

        # حالة 2: القواميس/الكائنات (Dictionary / Object)
        elif isinstance(data, dict):
            simple_pairs = {}
            nested_items = {}

            # فصل العناصر البسيطة عن العناصر المركبة
            for k, v in data.items():
                if isinstance(v, (dict, list)):
                    nested_items[k] = v
                else:
                    simple_pairs[k] = v

            # إخراج العناصر البسيطة في جدول أنيق
            if simple_pairs:
                header = "| العنصر / المفتاح | القيمة |"
                divider = "| :--- | :--- |"
                rows = [f"| **{k}** | {str(v)} |" for k, v in simple_pairs.items()]
                md_output += f"{header}\n{divider}\n" + "\n".join(rows) + "\n\n"

            # معالجة الكائنات المتداخلة (Nested Objects)
            for k, v in nested_items.items():
                heading_level = "#" * min(depth + 3, 6)
                md_output += f"{heading_level} 📌 {k}\n\n"
                md_output += render_json_to_markdown(v, depth + 1)

            return md_output

        # حالة 3: القيم المباشرة
        else:
            return f"{str(data)}\n\n"

    # تفكيك ورسم البيانات
    rendered_content = render_json_to_markdown(json_data)

    clean_url = url.split("?")[0].rstrip("/")
    endpoint_name = clean_url.split("/")[-1] or "API Data"

    title = f"بيانات الـ API: {endpoint_name}"
    excerpt = f"بيانات منسقة ومفككة تم جلبها من: {url}"
    content = f"### 📊 البيانات المجلوبة والمنسقة:\n\n{rendered_content}"

    return {
        "slug": _slugify(endpoint_name) or f"api-{uuid.uuid4().hex[:8]}",
        "title": title[:200],
        "content": content,
        "excerpt": excerpt,
        "image": "",
        "source_url": url,
    }
# نهاية صفحة الجلب

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
