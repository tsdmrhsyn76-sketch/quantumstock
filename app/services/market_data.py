import httpx
import os
from typing import Optional

ALPHA_VANTAGE_BASE = "https://www.alphavantage.co/query"

class MarketDataService:
    def __init__(self):
        self.api_key = os.getenv("ALPHA_VANTAGE_KEY", "")

    async def get_quote(self, ticker: str) -> dict:
        """Get real-time stock quote"""
        async with httpx.AsyncClient(timeout=15) as client:
            res = await client.get(ALPHA_VANTAGE_BASE, params={
                "function": "GLOBAL_QUOTE",
                "symbol": ticker,
                "apikey": self.api_key
            })
            data = res.json()
            quote = data.get("Global Quote", {})
            if not quote:
                raise ValueError(f"Ticker '{ticker}' bulunamadı veya API limiti aşıldı.")
            return {
                "ticker": ticker.upper(),
                "price": float(quote.get("05. price", 0)),
                "change": float(quote.get("09. change", 0)),
                "change_percent": quote.get("10. change percent", "0%").replace("%", ""),
                "volume": int(quote.get("06. volume", 0)),
                "high": float(quote.get("03. high", 0)),
                "low": float(quote.get("04. low", 0)),
                "prev_close": float(quote.get("08. previous close", 0)),
            }

    async def get_overview(self, ticker: str) -> dict:
        """Get company overview / fundamentals"""
        async with httpx.AsyncClient(timeout=15) as client:
            res = await client.get(ALPHA_VANTAGE_BASE, params={
                "function": "OVERVIEW",
                "symbol": ticker,
                "apikey": self.api_key
            })
            data = res.json()
            if not data or "Symbol" not in data:
                return {}
            return {
                "name": data.get("Name", ""),
                "sector": data.get("Sector", ""),
                "industry": data.get("Industry", ""),
                "description": data.get("Description", "")[:500],
                "market_cap": data.get("MarketCapitalization", ""),
                "pe_ratio": data.get("PERatio", ""),
                "eps": data.get("EPS", ""),
                "dividend_yield": data.get("DividendYield", ""),
                "profit_margin": data.get("ProfitMargin", ""),
                "debt_to_equity": data.get("DebtToEquityRatio", ""),
                "revenue_per_share": data.get("RevenuePerShareTTM", ""),
                "analyst_target": data.get("AnalystTargetPrice", ""),
                "week_52_high": data.get("52WeekHigh", ""),
                "week_52_low": data.get("52WeekLow", ""),
                "beta": data.get("Beta", ""),
                "exchange": data.get("Exchange", ""),
            }

    async def get_news_sentiment(self, ticker: str) -> dict:
        """Get news & sentiment for ticker"""
        async with httpx.AsyncClient(timeout=15) as client:
            res = await client.get(ALPHA_VANTAGE_BASE, params={
                "function": "NEWS_SENTIMENT",
                "tickers": ticker,
                "limit": 10,
                "apikey": self.api_key
            })
            data = res.json()
            feed = data.get("feed", [])
            if not feed:
                return {"sentiment_score": 0.5, "articles": [], "overall": "NEUTRAL"}

            scores = []
            articles = []
            for item in feed[:10]:
                for ts in item.get("ticker_sentiment", []):
                    if ts.get("ticker", "").upper() == ticker.upper():
                        score = float(ts.get("ticker_sentiment_score", 0))
                        scores.append(score)
                articles.append({
                    "title": item.get("title", ""),
                    "source": item.get("source", ""),
                    "time": item.get("time_published", ""),
                    "url": item.get("url", ""),
                })

            avg = sum(scores) / len(scores) if scores else 0.5
            overall = "BULLISH" if avg > 0.15 else "BEARISH" if avg < -0.15 else "NEUTRAL"

            return {
                "sentiment_score": round(avg, 3),
                "sentiment_label": overall,
                "article_count": len(articles),
                "articles": articles[:5],
            }

market_service = MarketDataService()
