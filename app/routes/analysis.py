from fastapi import APIRouter, HTTPException
from app.services.market_data import market_service
from app.services.ai_analysis import ai_service
import asyncio

router = APIRouter()

@router.get("/analyze/{ticker}")
async def analyze_stock(ticker: str):
    """
    Full AI-powered stock analysis with real market data.
    Returns risk score, price targets, geopolitical risks, and more.
    """
    ticker = ticker.upper().strip()

    try:
        # Fetch all data in parallel for speed
        quote, overview, sentiment = await asyncio.gather(
            market_service.get_quote(ticker),
            market_service.get_overview(ticker),
            market_service.get_news_sentiment(ticker),
            return_exceptions=True
        )

        # Handle partial failures gracefully
        if isinstance(quote, Exception):
            raise HTTPException(status_code=404, detail=f"Hisse bulunamadı: {ticker}")
        if isinstance(overview, Exception):
            overview = {}
        if isinstance(sentiment, Exception):
            sentiment = {"sentiment_score": 0.5, "sentiment_label": "NEUTRAL", "article_count": 0, "articles": []}

        # Run AI analysis with real data
        analysis = await ai_service.analyze(ticker, quote, overview, sentiment)

        # Merge everything into final response
        return {
            "ticker": ticker,
            "companyName": overview.get("name", ticker),
            "sector": overview.get("sector", "Unknown"),
            "exchange": overview.get("exchange", ""),
            "currentPrice": quote.get("price", 0),
            "dailyChange": quote.get("change", 0),
            "dailyChangePercent": float(quote.get("change_percent", 0)),
            "volume": quote.get("volume", 0),
            "week52High": overview.get("week_52_high", ""),
            "week52Low": overview.get("week_52_low", ""),
            "analystTarget": overview.get("analyst_target", ""),
            "marketCap": overview.get("market_cap", ""),
            "peRatio": overview.get("pe_ratio", ""),
            "beta": overview.get("beta", ""),
            "newsSentiment": sentiment,
            **analysis  # All AI-generated fields merged in
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analiz hatası: {str(e)}")


@router.get("/quote/{ticker}")
async def get_quote(ticker: str):
    """Quick price quote only"""
    try:
        return await market_service.get_quote(ticker.upper())
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/news/{ticker}")
async def get_news(ticker: str):
    """News and sentiment for a ticker"""
    try:
        return await market_service.get_news_sentiment(ticker.upper())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
