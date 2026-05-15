import httpx
import json
import os

CLAUDE_API = "https://api.anthropic.com/v1/messages"

SYSTEM_PROMPT = """You are an elite quantitative analyst and AI risk engine. Given real market data about a stock, produce a comprehensive risk and probability analysis.

Return ONLY a valid JSON object with this exact structure (no markdown, no backticks):
{
  "riskScore": 28,
  "riskLevel": "LOW",
  "overallVerdict": "BULLISH",
  "verdictReason": "One sentence summary",
  "timeTargets": {
    "shortTerm": {
      "period": "1-3 Ay",
      "priceLow": 0,
      "priceMid": 0,
      "priceHigh": 0,
      "upProbability": 58,
      "downProbability": 42,
      "verdict": "NEUTRAL",
      "keyDriver": "Main catalyst for 1-3 months"
    },
    "midTerm": {
      "period": "3-6 Ay",
      "priceLow": 0,
      "priceMid": 0,
      "priceHigh": 0,
      "upProbability": 63,
      "downProbability": 37,
      "verdict": "BULLISH",
      "keyDriver": "Main catalyst for 3-6 months"
    },
    "longTerm": {
      "period": "6-12 Ay",
      "priceLow": 0,
      "priceMid": 0,
      "priceHigh": 0,
      "upProbability": 68,
      "downProbability": 32,
      "verdict": "BULLISH",
      "keyDriver": "Main catalyst for 6-12 months"
    }
  },
  "fundamentals": {
    "score": 82,
    "debtLevel": "LOW",
    "revenueGrowth": "STRONG",
    "profitMargin": "HIGH",
    "keyStrengths": ["strength1", "strength2", "strength3"],
    "keyWeaknesses": ["weakness1", "weakness2", "weakness3"]
  },
  "companyInternals": {
    "score": 75,
    "managementQuality": "EXCELLENT",
    "majorLawsuits": false,
    "insiderSentiment": "POSITIVE",
    "rdInvestment": "HIGH",
    "visionMissionAlignment": "Brief description"
  },
  "macroFactors": {
    "score": 65,
    "interestRateSensitivity": "MEDIUM",
    "inflationImpact": "LOW",
    "dollarStrengthImpact": "NEGATIVE",
    "fedPolicyRisk": "MEDIUM",
    "sectorCyclicality": "LOW"
  },
  "geopoliticalRisks": [
    { "risk": "Risk name", "severity": "HIGH", "probability": 70, "impact": "Impact description" },
    { "risk": "Risk name", "severity": "MEDIUM", "probability": 45, "impact": "Impact description" }
  ],
  "catalysts": {
    "positive": ["catalyst1", "catalyst2", "catalyst3"],
    "negative": ["risk1", "risk2", "risk3"]
  },
  "sentimentAnalysis": {
    "analystConsensus": "BUY",
    "institutionalOwnership": "HIGH",
    "shortInterest": "LOW"
  },
  "scenarioAnalysis": [
    { "scenario": "Bull Case", "probability": 35, "priceTarget": 0, "description": "Bull scenario description" },
    { "scenario": "Base Case", "probability": 45, "priceTarget": 0, "description": "Base scenario description" },
    { "scenario": "Bear Case", "probability": 20, "priceTarget": 0, "description": "Bear scenario description" }
  ],
  "oneYearOutlook": "3-4 sentence comprehensive outlook for the next 12 months."
}

Base your analysis on the real market data provided. Be precise, realistic, and data-driven. RETURN ONLY THE JSON OBJECT."""


class AIAnalysisService:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY", "")

    async def analyze(self, ticker: str, quote: dict, overview: dict, sentiment: dict) -> dict:
        prompt = f"""Analyze this stock using the real market data below:

TICKER: {ticker}
COMPANY: {overview.get('name', ticker)}
SECTOR: {overview.get('sector', 'Unknown')}
INDUSTRY: {overview.get('industry', 'Unknown')}

PRICE DATA:
- Current Price: ${quote.get('price', 0)}
- Daily Change: {quote.get('change_percent', 0)}%
- 52W High: ${overview.get('week_52_high', 'N/A')}
- 52W Low: ${overview.get('week_52_low', 'N/A')}
- Beta: {overview.get('beta', 'N/A')}
- Volume: {quote.get('volume', 0):,}

FUNDAMENTALS:
- P/E Ratio: {overview.get('pe_ratio', 'N/A')}
- EPS: {overview.get('eps', 'N/A')}
- Profit Margin: {overview.get('profit_margin', 'N/A')}
- Debt/Equity: {overview.get('debt_to_equity', 'N/A')}
- Analyst Target: ${overview.get('analyst_target', 'N/A')}
- Market Cap: ${overview.get('market_cap', 'N/A')}
- Dividend Yield: {overview.get('dividend_yield', 'N/A')}

NEWS SENTIMENT:
- Sentiment Score: {sentiment.get('sentiment_score', 0)} (-1 bearish to +1 bullish)
- Overall: {sentiment.get('sentiment_label', 'NEUTRAL')}
- Recent Articles: {sentiment.get('article_count', 0)}

COMPANY DESCRIPTION:
{overview.get('description', 'No description available')}

Based on this REAL data, provide your comprehensive risk and probability analysis. Return only the JSON object."""

        headers = {
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01",
            "x-api-key": self.api_key,
        }

        body = {
            "model": "claude-sonnet-4-5",
            "max_tokens": 4000,
            "system": SYSTEM_PROMPT,
            "messages": [{"role": "user", "content": prompt}]
        }

        async with httpx.AsyncClient(timeout=60) as client:
            res = await client.post(CLAUDE_API, json=body, headers=headers)
            if not res.is_success:
                raise ValueError(f"Claude API error: {res.status_code}")
            data = res.json()
            raw = "".join(b.get("text", "") for b in data.get("content", []))
            cleaned = raw.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)

ai_service = AIAnalysisService()
