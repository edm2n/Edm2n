"""Backend API tests for Dalil Matar (دليل مطر) — FastAPI + MongoDB.
Covers: health, contact, prayer, currency, gold, config (public), pages (public),
tools/overrides (public), admin auth (login + protected endpoints), AI endpoints,
admin CRUD on pages + tool overrides + config.
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                    break
    except Exception:
        pass

assert BASE_URL, "REACT_APP_BACKEND_URL must be set"
API = f"{BASE_URL}/api"

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Matar@2026"


# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(client):
    r = client.post(f"{API}/admin/login", json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    tok = r.json().get("token")
    assert isinstance(tok, str) and len(tok) > 10
    return tok


@pytest.fixture()
def admin_client(client, admin_token):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {admin_token}"})
    return s


# ---------- Health ----------
class TestHealth:
    def test_root(self, client):
        r = client.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("message") == "Dalil Matar API"
        assert "version" in data


# ---------- Contact CRUD ----------
class TestContact:
    def test_create_contact_persists(self, client):
        payload = {
            "name": f"TEST_{uuid.uuid4().hex[:8]}",
            "email": f"test_{uuid.uuid4().hex[:6]}@example.com",
            "message": "TEST message from pytest",
        }
        r = client.post(f"{API}/contact", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        assert "id" in data

    def test_contact_invalid_email_returns_422(self, client):
        r = client.post(f"{API}/contact", json={"name": "TEST_bad", "email": "not-an-email", "message": "hi"}, timeout=15)
        assert r.status_code == 422


# ---------- Prayer / Currency / Gold ----------
class TestExternal:
    def test_prayer_default_riyadh(self, client):
        r = client.get(f"{API}/prayer-times", timeout=20)
        assert r.status_code == 200
        timings = r.json()["data"].get("timings")
        assert timings and "Fajr" in timings

    def test_currency_default_sar(self, client):
        r = client.get(f"{API}/currency", timeout=20)
        assert r.status_code == 200
        assert "sar" in r.json()

    def test_gold_price_realistic(self, client):
        r = client.get(f"{API}/gold-price", timeout=20)
        assert r.status_code == 200
        data = r.json()
        # Sanity: 1 troy oz gold should be > $1000 (as of 2026 realistic).
        assert data.get("usd_per_ounce") and data["usd_per_ounce"] > 1000, f"gold usd_per_ounce too low: {data.get('usd_per_ounce')}"
        k = data["karats"]
        assert k["24k_sar_g"] > k["22k_sar_g"] > k["21k_sar_g"] > k["18k_sar_g"]


# ---------- Public config / pages / overrides ----------
class TestPublicMeta:
    def test_config_public(self, client):
        r = client.get(f"{API}/config", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "ga_id" in data
        assert "editor_picks" in data
        assert "latest" in data

    def test_list_pages_public(self, client):
        r = client.get(f"{API}/pages", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_tool_overrides_public(self, client):
        r = client.get(f"{API}/tools/overrides", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_get_page_404_when_missing(self, client):
        r = client.get(f"{API}/pages/does-not-exist-{uuid.uuid4().hex[:6]}", timeout=15)
        assert r.status_code == 404


# ---------- Admin auth ----------
class TestAdminAuth:
    def test_login_success(self, client):
        r = client.post(f"{API}/admin/login", json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200
        assert "token" in r.json()

    def test_login_wrong_password(self, client):
        r = client.post(f"{API}/admin/login", json={"username": ADMIN_USERNAME, "password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_verify_without_token_401(self, client):
        r = client.get(f"{API}/admin/verify", timeout=15)
        assert r.status_code == 401

    def test_verify_with_token_ok(self, admin_client):
        r = admin_client.get(f"{API}/admin/verify", timeout=15)
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_admin_pages_requires_token(self, client):
        r = client.get(f"{API}/admin/pages", timeout=15)
        assert r.status_code == 401

    def test_admin_config_requires_token(self, client):
        r = client.get(f"{API}/admin/config", timeout=15)
        assert r.status_code == 401

    def test_admin_tools_put_requires_token(self, client):
        r = client.put(f"{API}/admin/tools/zakat", json={"slug": "zakat", "hidden": True}, timeout=15)
        assert r.status_code == 401


# ---------- Admin CRUD: pages ----------
class TestAdminPages:
    def test_create_get_update_delete_page(self, admin_client, client):
        slug = f"test-page-{uuid.uuid4().hex[:6]}"
        payload = {"slug": slug, "title": "TEST_صفحة", "content": "TEST_محتوى", "published": True}
        # Create
        r = admin_client.post(f"{API}/admin/pages", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        page = r.json()
        assert page["slug"] == slug
        assert "id" in page
        page_id = page["id"]

        # Public GET should return it
        r2 = client.get(f"{API}/pages/{slug}", timeout=15)
        assert r2.status_code == 200
        assert r2.json()["content"] == "TEST_محتوى"

        # Update
        upd = {**payload, "id": page_id, "content": "TEST_محدث"}
        r3 = admin_client.put(f"{API}/admin/pages/{page_id}", json=upd, timeout=15)
        assert r3.status_code == 200

        # Verify update via public
        r4 = client.get(f"{API}/pages/{slug}", timeout=15)
        assert r4.status_code == 200
        assert r4.json()["content"] == "TEST_محدث"

        # Delete
        r5 = admin_client.delete(f"{API}/admin/pages/{page_id}", timeout=15)
        assert r5.status_code == 200
        assert r5.json().get("deleted") is True

        # 404 after delete
        r6 = client.get(f"{API}/pages/{slug}", timeout=15)
        assert r6.status_code == 404

    def test_duplicate_slug_400(self, admin_client):
        slug = f"dup-{uuid.uuid4().hex[:6]}"
        p = {"slug": slug, "title": "t", "content": "c", "published": True}
        r1 = admin_client.post(f"{API}/admin/pages", json=p, timeout=15)
        assert r1.status_code == 200
        r2 = admin_client.post(f"{API}/admin/pages", json=p, timeout=15)
        assert r2.status_code == 400
        # cleanup
        admin_client.delete(f"{API}/admin/pages/{r1.json()['id']}", timeout=15)


# ---------- Admin: tool overrides ----------
class TestAdminToolOverride:
    def test_upsert_and_delete_override(self, admin_client, client):
        slug = "zakat"
        r = admin_client.put(f"{API}/admin/tools/{slug}", json={"slug": slug, "hidden": True}, timeout=15)
        assert r.status_code == 200
        # verify via public
        r2 = client.get(f"{API}/tools/overrides", timeout=15)
        assert r2.status_code == 200
        overrides = r2.json()
        assert any(o["slug"] == slug and o["hidden"] is True for o in overrides)
        # cleanup
        r3 = admin_client.delete(f"{API}/admin/tools/{slug}", timeout=15)
        assert r3.status_code == 200


# ---------- Admin: config ----------
class TestAdminConfig:
    def test_put_and_public_get(self, admin_client, client):
        body = {"ga_id": "G-TEST123", "editor_picks": ["bmi", "zakat"], "latest": ["ai-bio", "qr-reader"]}
        r = admin_client.put(f"{API}/admin/config", json=body, timeout=15)
        assert r.status_code == 200
        # Public GET reflects it
        r2 = client.get(f"{API}/config", timeout=15)
        assert r2.status_code == 200
        data = r2.json()
        assert data["ga_id"] == "G-TEST123"
        assert data["editor_picks"] == ["bmi", "zakat"]

    def test_admin_contacts_requires_token(self, client, admin_client):
        r = client.get(f"{API}/admin/contacts", timeout=15)
        assert r.status_code == 401
        r2 = admin_client.get(f"{API}/admin/contacts", timeout=15)
        assert r2.status_code == 200
        assert isinstance(r2.json(), list)


# ---------- Tracking + Admin Stats (iteration 3) ----------
class TestTrackingAndStats:
    def test_track_tool_is_public_no_auth(self, client):
        # Public POST — should not require auth. Use a TEST slug so we can verify increment.
        slug = f"test-slug-{uuid.uuid4().hex[:8]}"
        r = client.post(f"{API}/track/tool/{slug}", timeout=15)
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True

    def test_track_increments_and_stats_reflects(self, client, admin_client):
        slug = f"test-track-{uuid.uuid4().hex[:8]}"
        # Hit the tracker 3 times
        for _ in range(3):
            r = client.post(f"{API}/track/tool/{slug}", timeout=15)
            assert r.status_code == 200
        # Verify via admin stats
        rs = admin_client.get(f"{API}/admin/stats", timeout=15)
        assert rs.status_code == 200, rs.text
        data = rs.json()
        # Structure assertions
        assert "top_tools" in data and isinstance(data["top_tools"], list)
        assert "total_views" in data and isinstance(data["total_views"], int)
        assert "total_tools_tracked" in data and isinstance(data["total_tools_tracked"], int)
        assert "contacts" in data and isinstance(data["contacts"], dict)
        for k in ("total", "last_7d", "last_30d"):
            assert k in data["contacts"]
        assert "contacts_daily" in data and isinstance(data["contacts_daily"], list)
        assert "total_pages" in data and isinstance(data["total_pages"], int)
        # top_tools might not include our slug if there are >15 hotter tools, but total_tools_tracked must be >=1
        assert data["total_tools_tracked"] >= 1
        # If our slug is in top_tools (small dataset), its count must be >=3
        for t in data["top_tools"]:
            if t["slug"] == slug:
                assert t["count"] >= 3

    def test_admin_stats_requires_token(self, client):
        r = client.get(f"{API}/admin/stats", timeout=15)
        assert r.status_code == 401


# ---------- AI endpoints (may be slow; allow generous timeout) ----------
class TestAI:
    def test_ai_bio(self, client):
        r = client.post(f"{API}/ai/bio", json={"name": "أحمد الشمري", "job": "مصمم UX", "skills": "Figma, RTL", "tone": "professional"}, timeout=60)
        assert r.status_code == 200, f"AI bio failed: {r.status_code} {r.text[:400]}"
        data = r.json()
        assert "bio" in data
        assert isinstance(data["bio"], str) and len(data["bio"]) > 20

    def test_ai_tashkeel(self, client):
        r = client.post(f"{API}/ai/tashkeel", json={"text": "العلم نور والجهل ظلام"}, timeout=60)
        assert r.status_code == 200, f"AI tashkeel failed: {r.status_code} {r.text[:400]}"
        data = r.json()
        assert "text" in data
        assert isinstance(data["text"], str) and len(data["text"]) > 5


# ---------- Smart Fetch (iteration 5) ----------
class TestSmartFetch:
    def test_smart_fetch_requires_auth(self, client):
        r = client.post(f"{API}/admin/smart-fetch", json={"query": "https://example.com"}, timeout=15)
        assert r.status_code in (401, 403), f"expected 401/403, got {r.status_code}: {r.text[:200]}"

    def test_smart_fetch_save_requires_auth(self, client):
        r = client.post(f"{API}/admin/smart-fetch-save", json={"query": "https://example.com", "publish": True}, timeout=15)
        assert r.status_code in (401, 403)

    def test_smart_fetch_example_com(self, admin_client):
        r = admin_client.post(f"{API}/admin/smart-fetch", json={"query": "https://example.com"}, timeout=30)
        assert r.status_code == 200, f"smart-fetch example.com failed: {r.status_code} {r.text[:400]}"
        data = r.json()
        # Required keys
        for k in ("slug", "title", "content", "excerpt", "image", "source_url"):
            assert k in data, f"missing key: {k}"
        assert "Example Domain" in data["title"], f"unexpected title: {data['title']}"
        assert isinstance(data["content"], str) and len(data["content"]) > 20
        assert data["source_url"].startswith("https://example.com")
        assert isinstance(data["slug"], str) and len(data["slug"]) > 0

    def test_smart_fetch_invalid_url_returns_error_arabic(self, admin_client):
        r = admin_client.post(f"{API}/admin/smart-fetch",
                              json={"query": "https://this-domain-does-not-exist-xyz123.com"}, timeout=30)
        # Should be a 5xx-family error (502) with Arabic detail, not a crash
        assert r.status_code >= 400 and r.status_code < 600, f"expected error status, got {r.status_code}"
        # NOTE: The ingress/Cloudflare in front of this preview environment replaces
        # backend 502 responses with its own HTML Bad Gateway page — the Arabic detail
        # message is lost in transit. We still assert the status code family is correct.
        # Confirm Arabic detail is generated correctly by hitting an endpoint that produces
        # a 4xx (not intercepted by CF). Empty query → 400 with Arabic detail.
        r2 = admin_client.post(f"{API}/admin/smart-fetch", json={"query": "   "}, timeout=15)
        assert r2.status_code == 400
        data = r2.json()
        assert "detail" in data
        assert any("\u0600" <= ch <= "\u06FF" for ch in data["detail"]), \
            f"expected Arabic detail, got: {data['detail']}"

    def test_smart_fetch_short_content_returns_422(self, admin_client):
        # httpbin returns tiny content — trafilatura should reject as too short.
        # If extraction succeeds anyway, we still assert some sane error/success shape.
        r = admin_client.post(f"{API}/admin/smart-fetch",
                              json={"query": "https://httpbin.org/html"}, timeout=30)
        # httpbin/html actually returns a nontrivial Herman Melville excerpt — likely 200.
        # Try a truly empty page instead:
        r2 = admin_client.post(f"{API}/admin/smart-fetch",
                               json={"query": "https://httpbin.org/robots.txt"}, timeout=30)
        # robots.txt has almost no markup — should yield 422 (too short) or 502
        assert r2.status_code in (422, 502), f"expected 422/502 for empty page, got {r2.status_code}: {r2.text[:200]}"
        if r2.status_code == 422:
            data = r2.json()
            assert "detail" in data
            assert any("\u0600" <= ch <= "\u06FF" for ch in data["detail"])

    def test_smart_fetch_save_creates_public_page(self, admin_client, client):
        r = admin_client.post(f"{API}/admin/smart-fetch-save",
                              json={"query": "https://example.com", "publish": True}, timeout=30)
        assert r.status_code == 200, f"smart-fetch-save failed: {r.status_code} {r.text[:400]}"
        page = r.json()
        assert "id" in page and "slug" in page
        assert page["published"] is True
        assert page["source_url"].startswith("https://example.com")
        # Public list should now include this page
        r2 = client.get(f"{API}/pages", timeout=15)
        assert r2.status_code == 200
        listing = r2.json()
        assert any(p["slug"] == page["slug"] for p in listing), \
            f"created slug {page['slug']} not in /api/pages list"
        # Sort order sanity: created_at desc — first item should have most recent created_at
        if len(listing) >= 2:
            assert listing[0]["created_at"] >= listing[-1]["created_at"]
        # Public GET by slug
        r3 = client.get(f"{API}/pages/{page['slug']}", timeout=15)
        assert r3.status_code == 200
        fetched = r3.json()
        assert fetched["title"] == page["title"]
        for k in ("excerpt", "image", "source_url", "published", "created_at"):
            assert k in fetched, f"missing {k} in public page response"
        # cleanup
        admin_client.delete(f"{API}/admin/pages/{page['id']}", timeout=15)

    def test_smart_fetch_save_duplicate_slug_no_crash(self, admin_client, client):
        # Call twice — should not crash; must create unique slug or update
        r1 = admin_client.post(f"{API}/admin/smart-fetch-save",
                               json={"query": "https://example.com", "publish": True}, timeout=30)
        assert r1.status_code == 200, r1.text
        p1 = r1.json()
        r2 = admin_client.post(f"{API}/admin/smart-fetch-save",
                               json={"query": "https://example.com", "publish": True}, timeout=30)
        assert r2.status_code == 200, f"duplicate call crashed: {r2.status_code} {r2.text[:300]}"
        p2 = r2.json()
        # Either same slug (update-in-place, unlikely per code) OR different slug (n-suffix)
        assert p2["slug"] != p1["slug"] or p2["id"] == p1["id"], \
            "expected unique slug or same doc"
        # cleanup both
        for pid in {p1["id"], p2["id"]}:
            admin_client.delete(f"{API}/admin/pages/{pid}", timeout=15)
