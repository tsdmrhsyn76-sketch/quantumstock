# QuantumStock API 🚀
AI-Powered Stock Risk & Probability Engine

## Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/health` | API durumu |
| GET | `/api/v1/analyze/{ticker}` | Tam AI analizi |
| GET | `/api/v1/quote/{ticker}` | Anlık fiyat |
| GET | `/api/v1/news/{ticker}` | Haberler & sentiment |

## Örnek Kullanım

```bash
# Tam analiz
GET https://your-api.railway.app/api/v1/analyze/AAPL

# Fiyat
GET https://your-api.railway.app/api/v1/quote/TSLA
```

## Railway Deploy

1. GitHub'a push et
2. railway.app → New Project → Deploy from GitHub
3. Environment Variables ekle:
   - ALPHA_VANTAGE_KEY
   - ANTHROPIC_API_KEY

## Local Çalıştırma

```bash
pip install -r requirements.txt
cp .env.example .env  # API keylerini doldur
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs
