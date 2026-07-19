"""Backend API tests for Dalil Matar (دليل مطر) — FastAPI + MongoDB."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback: read from frontend/.env
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


# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
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
        assert data["message"] == payload["message"]
        assert "id" in data and isinstance(data["id"], str)
        assert "created_at" in data

        # Verify persistence via list endpoint
        r2 = client.get(f"{API}/contact", timeout=15)
        assert r2.status_code == 200
        items = r2.json()
        assert any(x["id"] == data["id"] for x in items), "created contact not found in list"

    def test_contact_missing_fields_returns_422(self, client):
        r = client.post(f"{API}/contact", json={"name": "x"}, timeout=15)
        assert r.status_code == 422

    def test_contact_invalid_email_returns_422(self, client):
        r = client.post(
            f"{API}/contact",
            json={"name": "TEST_bad", "email": "not-an-email", "message": "hi"},
            timeout=15,
        )
        assert r.status_code == 422


# ---------- Prayer Times proxy ----------
class TestPrayerTimes:
    def test_prayer_default_riyadh(self, client):
        r = client.get(f"{API}/prayer-times", timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "data" in data
        timings = data["data"].get("timings")
        assert timings and "Fajr" in timings and "Isha" in timings

    def test_prayer_custom_city(self, client):
        r = client.get(f"{API}/prayer-times", params={"city": "Mecca", "country": "SA"}, timeout=20)
        assert r.status_code == 200
        assert "data" in r.json()


# ---------- Currency proxy ----------
class TestCurrency:
    def test_currency_default_sar(self, client):
        r = client.get(f"{API}/currency", timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "sar" in data
        assert isinstance(data["sar"], dict)
        assert "usd" in data["sar"]

    def test_currency_base_usd(self, client):
        r = client.get(f"{API}/currency", params={"base": "usd"}, timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert "usd" in data
        assert "sar" in data["usd"]


# ---------- Gold Price ----------
class TestGoldPrice:
    def test_gold_price_shape(self, client):
        r = client.get(f"{API}/gold-price", timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "usd_per_ounce" in data
        assert "sar_per_ounce" in data
        assert "karats" in data
        # Sanity: 24k > 22k > 21k > 18k
        k = data["karats"]
        assert k["24k_sar_g"] > k["22k_sar_g"] > k["21k_sar_g"] > k["18k_sar_g"]
        assert data["usd_per_ounce"] and data["usd_per_ounce"] > 0
