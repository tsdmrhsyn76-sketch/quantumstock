from fastapi import APIRouter, HTTPException
from app.services.market_data import market_service
from app.services.ai_analysis import ai_service

router = APIRouter()

@router.get("/analyze/{ticker}")
async def analyze_stock(ticker: str):
    ticker = ticker.upper().strip()
    try:
        try:
            quote = await market_service.get_quote(ticker)
        except Exception:
            raise HTTPException(status_code=404, detail=f"Hisse bulunamadi: {ticker}")
        try:
            overview = await market_service.get_overview(ticker)
            if not overview:
                overview = {"name": ticker, "sector": "Unknown", "industry": "Unknown", "description": f"{ticker} stock"}
        except Exception:
            overview = {"name": ticker, "sector": "Unknown", "industry": "Unknown", "description": f"{ticker} stock"}
        try:
            sentiment = await market_service.get_news_sentiment(ticker)
        except Exception:
            sentiment = {"sentiment_score": 0.5, "sentiment_label": "NEUTRAL", "article_count": 0, "articles": []}
        analysis = await ai_service.analyze(ticker, quote, overview, sentiment)
        return {"ticker": ticker, "companyName": overview.get("name", ticker), "sector": overview.get("sector", "Unknown"), "currentPrice": quote.get("price", 0), "dailyChange": quote.get("change", 0), "volume": quote.get("volume", 0), "newsSentiment": sentiment, **analysis}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analiz hatasi: {str(e)}")

@router.get("/quote/{ticker}")
async def get_quote(ticker: str):
    try:
        return await market_service.get_quote(ticker.upper())
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/news/{ticker}")
async def get_news(ticker: str):
    try:
        return await market_service.get_news_sentiment(ticker.upper())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
