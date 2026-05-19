from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any

import numpy as np
import pandas as pd
import requests
import yfinance as yf
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="QuantumStock Research API",
    description="AI-powered stock opportunity engine for research and education.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NASDAQ_100_UNIVERSE = [
    "AAPL",
    "MSFT",
    "NVDA",
    "AMZN",
    "META",
    "AVGO",
    "GOOGL",
    "GOOG",
    "TSLA",
    "COST",
    "NFLX",
    "AMD",
    "PEP",
    "ADBE",
    "CSCO",
    "TMUS",
    "LIN",
    "INTU",
    "AMAT",
    "TXN",
    "QCOM",
    "ISRG",
    "BKNG",
    "AMGN",
    "HON",
    "CMCSA",
    "VRTX",
    "PANW",
    "ADP",
    "SBUX",
    "GILD",
    "MU",
    "ADI",
    "LRCX",
    "MELI",
    "KLAC",
    "MDLZ",
    "REGN",
    "CRWD",
    "PYPL",
    "CDNS",
    "SNPS",
    "MAR",
    "ORLY",
    "CSX",
    "ABNB",
    "MRVL",
    "CTAS",
    "FTNT",
    "WDAY",
    "NXPI",
    "ROP",
    "ADSK",
    "PCAR",
    "CPRT",
    "CHTR",
    "MNST",
    "AEP",
    "PAYX",
    "KDP",
    "ROST",
    "FAST",
    "ODFL",
    "KHC",
    "EA",
    "DDOG",
    "VRSK",
    "BKR",
    "EXC",
    "CTSH",
    "GEHC",
    "XEL",
    "IDXX",
    "CCEP",
    "ZS",
    "FANG",
    "TEAM",
    "TTD",
    "DXCM",
    "CSGP",
    "ANSS",
    "ON",
    "BIIB",
    "MDB",
    "GFS",
    "ILMN",
    "WBD",
    "DLTR",
    "MRNA",
    "SIRI",
]

DEFAULT_CUSTOM_UNIVERSE = [
    "NVDA",
    "MSFT",
    "AAPL",
    "AMZN",
    "META",
    "GOOGL",
    "AMD",
    "TSLA",
    "AVGO",
    "CRM",
    "ORCL",
    "NFLX",
]


@dataclass
class IndicatorPack:
    current_price: float
    volume: int
    avg_volume_20: float
    ma20: float
    ma50: float
    ma200: float
    volatility_20: float
    rsi: float
    macd: float
    macd_signal: float
    support: float
    resistance: float


def _as_float(value: Any, fallback: float = 0.0) -> float:
    if value is None:
        return fallback
    if isinstance(value, (pd.Series, pd.DataFrame)):
        value = value.iloc[-1]
    if pd.isna(value):
        return fallback
    return round(float(value), 2)


def _normalize_history(frame: pd.DataFrame) -> pd.DataFrame:
    if frame.empty:
        return frame
    if isinstance(frame.columns, pd.MultiIndex):
        frame.columns = frame.columns.get_level_values(0)
    required_columns = ["Open", "High", "Low", "Close", "Volume"]
    missing_columns = [column for column in required_columns if column not in frame.columns]
    if missing_columns:
        return pd.DataFrame()
    return frame[required_columns].dropna()


def _download_with_yfinance_ticker(ticker: str, period: str) -> pd.DataFrame:
    stock = yf.Ticker(ticker)
    frame = stock.history(period=period, interval="1d", auto_adjust=True, actions=False)
    return _normalize_history(frame)


def _download_with_yfinance_download(ticker: str, period: str) -> pd.DataFrame:
    frame = yf.download(
        ticker,
        period=period,
        interval="1d",
        auto_adjust=True,
        progress=False,
        threads=False,
    )
    return _normalize_history(frame)


def _download_with_yahoo_chart(ticker: str, period: str) -> pd.DataFrame:
    days = 365 if period == "1y" else 92
    end = datetime.now(UTC)
    start = end - timedelta(days=days + 10)
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
    response = requests.get(
        url,
        params={
            "period1": int(start.timestamp()),
            "period2": int(end.timestamp()),
            "interval": "1d",
            "events": "history",
            "includeAdjustedClose": "true",
        },
        headers={"User-Agent": "QuantumStock Research Terminal/0.1"},
        timeout=12,
    )
    response.raise_for_status()
    result = response.json()["chart"]["result"]
    if not result:
        return pd.DataFrame()

    payload = result[0]
    timestamps = payload.get("timestamp") or []
    quote = payload.get("indicators", {}).get("quote", [{}])[0]
    adjusted = payload.get("indicators", {}).get("adjclose", [{}])[0].get("adjclose")
    close_values = adjusted or quote.get("close", [])

    frame = pd.DataFrame(
        {
            "Open": quote.get("open", []),
            "High": quote.get("high", []),
            "Low": quote.get("low", []),
            "Close": close_values,
            "Volume": quote.get("volume", []),
        },
        index=pd.to_datetime(timestamps, unit="s", utc=True),
    )
    return _normalize_history(frame).tail(days)


def _download_history(ticker: str, period: str) -> pd.DataFrame:
    errors: list[str] = []
    for downloader in (
        _download_with_yfinance_ticker,
        _download_with_yfinance_download,
        _download_with_yahoo_chart,
    ):
        try:
            frame = downloader(ticker, period)
            if not frame.empty:
                return frame
        except Exception as exc:
            errors.append(f"{downloader.__name__}: {exc}")

    raise HTTPException(
        status_code=404,
        detail=f"No market data found for {ticker}. Tried multiple market data methods.",
    )


def _parse_timestamp(value: Any) -> str | None:
    if not value:
        return None
    try:
        return datetime.fromtimestamp(int(value), UTC).isoformat()
    except (TypeError, ValueError, OSError):
        return None


def _extract_news_item(item: dict[str, Any]) -> dict[str, Any] | None:
    content = item.get("content") if isinstance(item.get("content"), dict) else item
    title = content.get("title") or item.get("title")
    if not title:
        return None

    provider = content.get("provider") or item.get("publisher") or {}
    if isinstance(provider, dict):
        source = provider.get("displayName") or provider.get("name") or "Yahoo Finance"
    else:
        source = str(provider) if provider else "Yahoo Finance"

    click_url = content.get("clickThroughUrl") or content.get("canonicalUrl") or item.get("link") or {}
    if isinstance(click_url, dict):
        url = click_url.get("url")
    else:
        url = click_url

    summary = content.get("summary") or item.get("summary") or ""
    published_at = (
        content.get("pubDate")
        or _parse_timestamp(content.get("providerPublishTime"))
        or _parse_timestamp(item.get("providerPublishTime"))
    )

    return {
        "title": title,
        "source": source,
        "url": url or "",
        "published_at": published_at,
        "summary": summary,
        "catalyst_type": _classify_news(title, summary),
    }


def _classify_news(title: str, summary: str = "") -> str:
    text = f"{title} {summary}".lower()
    if any(word in text for word in ("earnings", "revenue", "profit", "guidance", "quarter")):
        return "Earnings"
    if any(word in text for word in ("deal", "partnership", "contract", "agreement", "customer")):
        return "Deal"
    if any(word in text for word in ("upgrade", "downgrade", "price target", "analyst")):
        return "Analyst"
    if any(word in text for word in ("launch", "product", "chip", "ai", "cloud", "platform")):
        return "Product"
    if any(word in text for word in ("sec", "filing", "8-k", "10-q", "10-k")):
        return "Filing"
    return "Market"


def _fetch_yahoo_search_news(ticker: str, limit: int) -> list[dict[str, Any]]:
    response = requests.get(
        "https://query2.finance.yahoo.com/v1/finance/search",
        params={"q": ticker, "newsCount": limit, "quotesCount": 0},
        headers={"User-Agent": "QuantumStock Research Terminal/0.1"},
        timeout=12,
    )
    response.raise_for_status()
    payload = response.json()
    return payload.get("news", []) or []


def _fetch_news_items(ticker: str, limit: int = 8) -> list[dict[str, Any]]:
    raw_items: list[dict[str, Any]] = []
    try:
        raw_items = yf.Ticker(ticker).news or []
    except Exception:
        raw_items = []

    if not raw_items:
        try:
            raw_items = _fetch_yahoo_search_news(ticker, limit)
        except Exception:
            raw_items = []

    normalized: list[dict[str, Any]] = []
    seen_titles: set[str] = set()
    for item in raw_items:
        parsed = _extract_news_item(item)
        if not parsed:
            continue
        key = parsed["title"].strip().lower()
        if key in seen_titles:
            continue
        seen_titles.add(key)
        normalized.append(parsed)
        if len(normalized) >= limit:
            break

    return normalized


def _safe_info_number(info: dict[str, Any], key: str) -> float | None:
    value = info.get(key)
    if value in (None, "None", "N/A"):
        return None
    try:
        if pd.isna(value):
            return None
        return round(float(value), 2)
    except (TypeError, ValueError):
        return None


def _format_market_cap(value: float | None) -> str:
    if value is None:
        return "N/A"
    if value >= 1_000_000_000_000:
        return f"${value / 1_000_000_000_000:.2f}T"
    if value >= 1_000_000_000:
        return f"${value / 1_000_000_000:.2f}B"
    if value >= 1_000_000:
        return f"${value / 1_000_000:.2f}M"
    return f"${value:,.0f}"


def _normalize_earnings_dates(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, (list, tuple, set)):
        raw_values = list(value)
    else:
        raw_values = [value]

    dates: list[str] = []
    for item in raw_values:
        if item is None:
            continue
        try:
            parsed = pd.Timestamp(item)
            if pd.isna(parsed):
                continue
            dates.append(parsed.date().isoformat())
        except (TypeError, ValueError):
            continue
    return dates[:2]


def _extract_raw_value(payload: dict[str, Any], key: str) -> Any:
    value = payload.get(key)
    if isinstance(value, dict):
        return value.get("raw") if "raw" in value else value.get("fmt")
    return value


def _fetch_yahoo_quote_summary_profile(ticker: str) -> dict[str, Any]:
    response = requests.get(
        f"https://query1.finance.yahoo.com/v10/finance/quoteSummary/{ticker}",
        params={
            "modules": "assetProfile,summaryDetail,financialData,defaultKeyStatistics,price,recommendationTrend,calendarEvents"
        },
        headers={"User-Agent": "QuantumStock Research Terminal/0.1"},
        timeout=12,
    )
    response.raise_for_status()
    result = response.json().get("quoteSummary", {}).get("result") or []
    if not result:
        return {}

    payload = result[0]
    asset = payload.get("assetProfile", {}) or {}
    price = payload.get("price", {}) or {}
    summary = payload.get("summaryDetail", {}) or {}
    financial = payload.get("financialData", {}) or {}
    stats = payload.get("defaultKeyStatistics", {}) or {}
    calendar = payload.get("calendarEvents", {}) or {}

    officers = []
    for officer in asset.get("companyOfficers", [])[:4]:
        name = officer.get("name")
        title = officer.get("title")
        if name and title:
            officers.append({"name": name, "title": title})

    earnings_dates = []
    earnings = calendar.get("earnings", {}) if isinstance(calendar.get("earnings"), dict) else {}
    for item in earnings.get("earningsDate", []) or []:
        raw_value = item.get("raw") if isinstance(item, dict) else item
        try:
            earnings_dates.append(datetime.fromtimestamp(int(raw_value), UTC).date().isoformat())
        except (TypeError, ValueError, OSError):
            continue

    info = {
        "longName": _extract_raw_value(price, "longName") or _extract_raw_value(price, "shortName"),
        "shortName": _extract_raw_value(price, "shortName"),
        "sector": asset.get("sector"),
        "industry": asset.get("industry"),
        "website": asset.get("website"),
        "longBusinessSummary": asset.get("longBusinessSummary"),
        "marketCap": _extract_raw_value(price, "marketCap") or _extract_raw_value(summary, "marketCap"),
        "currentPrice": _extract_raw_value(financial, "currentPrice") or _extract_raw_value(price, "regularMarketPrice"),
        "targetMeanPrice": _extract_raw_value(financial, "targetMeanPrice"),
        "beta": _extract_raw_value(summary, "beta") or _extract_raw_value(stats, "beta"),
        "trailingPE": _extract_raw_value(summary, "trailingPE"),
        "forwardPE": _extract_raw_value(stats, "forwardPE"),
        "profitMargins": _extract_raw_value(stats, "profitMargins"),
        "revenueGrowth": _extract_raw_value(financial, "revenueGrowth"),
        "recommendationKey": _extract_raw_value(financial, "recommendationKey"),
        "numberOfAnalystOpinions": _extract_raw_value(financial, "numberOfAnalystOpinions"),
        "companyOfficers": officers,
        "earningsDate": earnings_dates,
    }
    return {key: value for key, value in info.items() if value not in (None, "", [])}


def _fetch_yahoo_quote_profile(ticker: str) -> dict[str, Any]:
    response = requests.get(
        "https://query1.finance.yahoo.com/v7/finance/quote",
        params={"symbols": ticker},
        headers={"User-Agent": "QuantumStock Research Terminal/0.1"},
        timeout=12,
    )
    response.raise_for_status()
    result = response.json().get("quoteResponse", {}).get("result") or []
    if not result:
        return {}

    quote = result[0]
    return {
        key: value
        for key, value in {
            "longName": quote.get("longName"),
            "shortName": quote.get("shortName"),
            "marketCap": quote.get("marketCap"),
            "regularMarketPrice": quote.get("regularMarketPrice"),
            "trailingPE": quote.get("trailingPE"),
            "forwardPE": quote.get("forwardPE"),
            "epsTrailingTwelveMonths": quote.get("epsTrailingTwelveMonths"),
            "sharesOutstanding": quote.get("sharesOutstanding"),
        }.items()
        if value not in (None, "", [])
    }


def _static_company_profile(ticker: str) -> dict[str, Any]:
    profiles = {
        "NVDA": {
            "longName": "NVIDIA Corporation",
            "sector": "Technology",
            "industry": "Semiconductors",
            "website": "https://www.nvidia.com",
            "longBusinessSummary": "NVIDIA designs accelerated computing platforms, GPUs, networking products, and AI infrastructure used across data centers, gaming, professional visualization, automotive, and robotics markets.",
        },
        "MSFT": {
            "longName": "Microsoft Corporation",
            "sector": "Technology",
            "industry": "Software - Infrastructure",
            "website": "https://www.microsoft.com",
            "longBusinessSummary": "Microsoft provides cloud, productivity, operating system, gaming, and AI infrastructure products for consumers, enterprises, and developers globally.",
        },
        "AAPL": {
            "longName": "Apple Inc.",
            "sector": "Technology",
            "industry": "Consumer Electronics",
            "website": "https://www.apple.com",
            "longBusinessSummary": "Apple designs consumer electronics, software, services, and wearables built around its iPhone, Mac, iPad, Apple Watch, and services ecosystem.",
        },
        "AMZN": {
            "longName": "Amazon.com, Inc.",
            "sector": "Consumer Cyclical",
            "industry": "Internet Retail",
            "website": "https://www.amazon.com",
            "longBusinessSummary": "Amazon operates global e-commerce, cloud computing, advertising, logistics, subscription, and digital media businesses.",
        },
        "META": {
            "longName": "Meta Platforms, Inc.",
            "sector": "Communication Services",
            "industry": "Internet Content & Information",
            "website": "https://about.meta.com",
            "longBusinessSummary": "Meta builds social, messaging, advertising, AI, and virtual reality products across Facebook, Instagram, WhatsApp, Threads, and Reality Labs.",
        },
        "GOOGL": {
            "longName": "Alphabet Inc.",
            "sector": "Communication Services",
            "industry": "Internet Content & Information",
            "website": "https://abc.xyz",
            "longBusinessSummary": "Alphabet operates Google Search, YouTube, Android, Google Cloud, advertising products, AI initiatives, and other technology bets.",
        },
        "AMD": {
            "longName": "Advanced Micro Devices, Inc.",
            "sector": "Technology",
            "industry": "Semiconductors",
            "website": "https://www.amd.com",
            "longBusinessSummary": "AMD designs CPUs, GPUs, adaptive computing products, and AI accelerators for data center, client, gaming, and embedded markets.",
        },
        "TSLA": {
            "longName": "Tesla, Inc.",
            "sector": "Consumer Cyclical",
            "industry": "Auto Manufacturers",
            "website": "https://www.tesla.com",
            "longBusinessSummary": "Tesla designs electric vehicles, energy generation and storage products, autonomous driving software, and related services.",
        },
    }
    return profiles.get(ticker, {})


def _fetch_company_profile(ticker: str) -> dict[str, Any]:
    stock = yf.Ticker(ticker)
    try:
        info = stock.get_info()
    except Exception:
        info = {}

    if not info:
        try:
            info = stock.info
        except Exception:
            info = {}

    if not info or not (info.get("longName") or info.get("shortName") or info.get("sector")):
        try:
            fallback_info = _fetch_yahoo_quote_summary_profile(ticker)
            info = {**info, **fallback_info}
        except Exception:
            pass

    if not info or not (info.get("longName") or info.get("shortName") or info.get("marketCap")):
        try:
            quote_info = _fetch_yahoo_quote_profile(ticker)
            info = {**info, **quote_info}
        except Exception:
            pass

    static_info = _static_company_profile(ticker)
    if static_info:
        clean_dynamic = {key: value for key, value in info.items() if value not in (None, "", [], "N/A")}
        info = {**clean_dynamic}
        for key, value in static_info.items():
            current = info.get(key)
            if current in (None, "", [], "N/A", ticker):
                info[key] = value

    if not info:
        raise HTTPException(status_code=404, detail=f"No company profile found for {ticker}.")

    earnings_dates = _normalize_earnings_dates(info.get("earningsDate"))
    if not earnings_dates:
        try:
            calendar = stock.calendar
            if isinstance(calendar, pd.DataFrame) and not calendar.empty:
                earnings_dates = _normalize_earnings_dates(calendar.loc["Earnings Date"].dropna().tolist())
            elif isinstance(calendar, dict):
                earnings_dates = _normalize_earnings_dates(calendar.get("Earnings Date") or calendar.get("EarningsDate"))
        except Exception:
            earnings_dates = []

    officers = []
    for officer in info.get("companyOfficers", [])[:4]:
        if not isinstance(officer, dict):
            continue
        name = officer.get("name")
        title = officer.get("title")
        if name and title:
            officers.append({"name": name, "title": title})

    long_summary = str(info.get("longBusinessSummary") or "")
    if len(long_summary) > 520:
        long_summary = f"{long_summary[:520].rsplit(' ', 1)[0]}..."

    market_cap = _safe_info_number(info, "marketCap")
    current_price = _safe_info_number(info, "currentPrice") or _safe_info_number(info, "regularMarketPrice")
    target_mean_price = _safe_info_number(info, "targetMeanPrice")
    upside_to_target = None
    if current_price and target_mean_price:
        upside_to_target = round(((target_mean_price / current_price) - 1) * 100, 2)

    return {
        "ticker": ticker,
        "company_name": info.get("longName") or info.get("shortName") or ticker,
        "sector": info.get("sector") or "N/A",
        "industry": info.get("industry") or "N/A",
        "website": info.get("website") or "",
        "market_cap": market_cap,
        "market_cap_display": _format_market_cap(market_cap),
        "beta": _safe_info_number(info, "beta"),
        "trailing_pe": _safe_info_number(info, "trailingPE"),
        "forward_pe": _safe_info_number(info, "forwardPE"),
        "profit_margins": _safe_info_number(info, "profitMargins"),
        "revenue_growth": _safe_info_number(info, "revenueGrowth"),
        "target_mean_price": target_mean_price,
        "upside_to_target_percent": upside_to_target,
        "recommendation": info.get("recommendationKey") or "N/A",
        "analyst_count": info.get("numberOfAnalystOpinions"),
        "earnings_dates": earnings_dates,
        "officers": officers,
        "business_summary": long_summary,
        "disclaimer": "Company profile data is provided for research context only. Not financial advice.",
    }


def _calculate_rsi(close: pd.Series, window: int = 14) -> pd.Series:
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(alpha=1 / window, min_periods=window, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1 / window, min_periods=window, adjust=False).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    return 100 - (100 / (1 + rs))


def _calculate_indicators(history_1y: pd.DataFrame, history_3mo: pd.DataFrame) -> IndicatorPack:
    close = history_1y["Close"]
    volume = history_1y["Volume"]
    current_price = _as_float(close.iloc[-1])

    ema12 = close.ewm(span=12, adjust=False).mean()
    ema26 = close.ewm(span=26, adjust=False).mean()
    macd_line = ema12 - ema26
    macd_signal = macd_line.ewm(span=9, adjust=False).mean()

    returns = close.pct_change()
    volatility_20 = returns.tail(20).std() * np.sqrt(252) * 100

    recent_low = history_3mo["Low"].rolling(5).min().dropna()
    recent_high = history_3mo["High"].rolling(5).max().dropna()

    return IndicatorPack(
        current_price=current_price,
        volume=int(volume.iloc[-1]),
        avg_volume_20=_as_float(volume.tail(20).mean()),
        ma20=_as_float(close.rolling(20).mean().iloc[-1]),
        ma50=_as_float(close.rolling(50).mean().iloc[-1]),
        ma200=_as_float(close.rolling(200).mean().iloc[-1]),
        volatility_20=_as_float(volatility_20),
        rsi=_as_float(_calculate_rsi(close).iloc[-1], fallback=50),
        macd=_as_float(macd_line.iloc[-1]),
        macd_signal=_as_float(macd_signal.iloc[-1]),
        support=_as_float(recent_low.tail(20).min(), fallback=current_price * 0.94),
        resistance=_as_float(recent_high.tail(20).max(), fallback=current_price * 1.08),
    )


def _bounded(value: float, floor: float = 0, ceiling: float = 100) -> int:
    return int(round(max(floor, min(ceiling, value))))


def _compact_series(series: pd.Series, points: int = 24, fallback: float = 0.0) -> list[float]:
    clean = series.replace([np.inf, -np.inf], np.nan).dropna()
    if clean.empty:
        return [round(fallback, 2)] * points
    if len(clean) <= points:
        values = clean.tolist()
    else:
        indexes = np.linspace(0, len(clean) - 1, points).round().astype(int)
        values = clean.iloc[indexes].tolist()
    return [round(float(value), 2) for value in values]


def _build_chart_series(history: pd.DataFrame, opportunity: dict[str, Any]) -> dict[str, list[float]]:
    close = history["Close"]
    returns = close.pct_change().fillna(0)
    rsi = _calculate_rsi(close).fillna(50)
    momentum = close.pct_change(20).fillna(0) * 100
    volatility = returns.rolling(20).std().fillna(0) * np.sqrt(252) * 100
    ma50 = close.rolling(50).mean()
    ma200 = close.rolling(200).mean()

    trend_component = ((close / ma50) - 1).fillna(0) * 220 + 55
    long_trend_component = ((close / ma200) - 1).fillna(0) * 140 + 50
    momentum_component = momentum * 2.4 + 50
    rsi_component = 100 - (rsi - 58).abs() * 1.7
    score_history = (
        trend_component.clip(0, 100) * 0.32
        + long_trend_component.clip(0, 100) * 0.22
        + momentum_component.clip(0, 100) * 0.24
        + rsi_component.clip(0, 100) * 0.22
    )

    signal = (close > ma50).astype(float).fillna(0)
    strategy_returns = returns * signal.shift(1).fillna(0)
    backtest_curve = (1 + strategy_returns).cumprod() * 100

    price_history = _compact_series(close.tail(120), points=30, fallback=float(close.iloc[-1]))
    score_series = _compact_series(score_history.tail(120), points=30, fallback=opportunity["opportunity_score"])
    if score_series:
        score_series[-1] = float(opportunity["opportunity_score"])

    return {
        "price_history": price_history,
        "score_history": score_series,
        "momentum_history": _compact_series((momentum + 50).clip(0, 100).tail(120), points=30, fallback=opportunity["momentum_score"]),
        "volatility_history": _compact_series(volatility.tail(120), points=30, fallback=0),
        "backtest_curve": _compact_series(backtest_curve.tail(180), points=30, fallback=100),
    }


def _score_opportunity(ind: IndicatorPack) -> dict[str, Any]:
    trend_score = 35
    if ind.current_price > ind.ma50:
        trend_score += 25
    if ind.current_price > ind.ma200:
        trend_score += 25
    if ind.ma50 > ind.ma200:
        trend_score += 15
    trend_score = _bounded(trend_score)

    momentum_score = 40
    if 45 <= ind.rsi <= 65:
        momentum_score += 25
    elif 35 <= ind.rsi < 45 or 65 < ind.rsi <= 75:
        momentum_score += 10
    elif ind.rsi > 75:
        momentum_score -= 20
    if ind.macd > ind.macd_signal:
        momentum_score += 25
    momentum_score = _bounded(momentum_score)

    volatility_score = _bounded(100 - (ind.volatility_20 * 1.6))
    volume_ratio = ind.volume / ind.avg_volume_20 if ind.avg_volume_20 else 1
    volume_score = _bounded(45 + min(volume_ratio, 2.2) * 25)

    support_distance = (ind.current_price - ind.support) / ind.current_price
    resistance_distance = (ind.resistance - ind.current_price) / ind.current_price
    entry_score = _bounded(100 - abs(support_distance - 0.03) * 900)

    opportunity_score = _bounded(
        trend_score * 0.28
        + momentum_score * 0.24
        + volatility_score * 0.16
        + volume_score * 0.14
        + entry_score * 0.18
    )

    if opportunity_score >= 78:
        signal = "BUY"
    elif opportunity_score >= 62:
        signal = "WATCH"
    elif opportunity_score >= 48:
        signal = "NEUTRAL"
    else:
        signal = "AVOID"

    risk_level = "LOW" if volatility_score >= 72 else "MEDIUM" if volatility_score >= 48 else "HIGH"

    raw_entry_low = round(max(ind.support * 0.995, ind.current_price * 0.96), 2)
    raw_entry_high = round(min(ind.support * 1.035, ind.current_price * 1.015), 2)
    entry_low = min(raw_entry_low, raw_entry_high)
    entry_high = max(raw_entry_low, raw_entry_high)
    stop_loss = round(min(ind.support * 0.965, ind.current_price * 0.93), 2)
    target_price = round(max(ind.resistance, ind.current_price * (1 + max(0.06, resistance_distance))), 2)
    target_2 = round(target_price * 1.06, 2)

    risk = max(ind.current_price - stop_loss, 0.01)
    reward = max(target_price - ind.current_price, 0.01)
    risk_reward_ratio = round(reward / risk, 2)
    expected_upside_percent = round(((target_price / ind.current_price) - 1) * 100, 2)

    warnings: list[str] = []
    if ind.rsi > 75:
        warnings.append("RSI is above 75, which increases pullback risk.")
    if ind.volatility_20 > 45:
        warnings.append("20-day annualized volatility is elevated.")
    if ind.current_price < ind.ma200:
        warnings.append("Price is below the 200-day moving average.")
    if risk_reward_ratio < 1.5:
        warnings.append("Risk/reward ratio is below the preferred institutional threshold.")

    explanation = (
        f"Trend score is {trend_score}/100 with price at ${ind.current_price}, "
        f"MA50 at ${ind.ma50}, and MA200 at ${ind.ma200}. "
        f"Momentum score is {momentum_score}/100 with RSI at {ind.rsi} and "
        f"MACD {'above' if ind.macd > ind.macd_signal else 'below'} signal. "
        f"Support is approximated near ${ind.support}, resistance near ${ind.resistance}. "
        f"The setup is classified as {signal} with {risk_level.lower()} risk."
    )

    return {
        "opportunity_score": opportunity_score,
        "signal": signal,
        "expected_upside_percent": expected_upside_percent,
        "entry_zone": {"low": entry_low, "high": entry_high},
        "stop_loss": stop_loss,
        "target_price": target_price,
        "target_1": target_price,
        "target_2": target_2,
        "risk_reward_ratio": risk_reward_ratio,
        "trend_score": trend_score,
        "momentum_score": momentum_score,
        "volatility_score": volatility_score,
        "volume_score": volume_score,
        "risk_level": risk_level,
        "explanation": explanation,
        "warnings": warnings,
    }


def _analyze_symbol(symbol: str) -> dict[str, Any]:
    history_1y = _download_history(symbol, "1y")
    history_3mo = _download_history(symbol, "3mo")
    indicators = _calculate_indicators(history_1y, history_3mo)
    opportunity = _score_opportunity(indicators)
    chart_series = _build_chart_series(history_1y, opportunity)
    close = history_1y["Close"]
    previous_close = _as_float(close.iloc[-2], fallback=indicators.current_price) if len(close) > 1 else indicators.current_price
    daily_change_percent = (
        round(((indicators.current_price - previous_close) / previous_close) * 100, 2)
        if previous_close
        else 0.0
    )

    return {
        "ticker": symbol,
        "current_price": indicators.current_price,
        "previous_close": previous_close,
        "daily_change_percent": daily_change_percent,
        "volume": indicators.volume,
        "moving_averages": {
            "ma20": indicators.ma20,
            "ma50": indicators.ma50,
            "ma200": indicators.ma200,
        },
        "volatility": indicators.volatility_20,
        "rsi": indicators.rsi,
        "macd": {
            "value": indicators.macd,
            "signal": indicators.macd_signal,
        },
        "support": indicators.support,
        "resistance": indicators.resistance,
        "charts": chart_series,
        **opportunity,
        "disclaimer": "For research and educational purposes only. Not financial advice.",
    }


def _build_catalyst_note(analysis: dict[str, Any]) -> str:
    if analysis["trend_score"] >= 80 and analysis["momentum_score"] >= 70:
        return "Trend and momentum alignment"
    if analysis["volume_score"] >= 78:
        return "Volume confirmation"
    if analysis["expected_upside_percent"] >= 8:
        return "Upside to resistance"
    if analysis["risk_level"] == "LOW":
        return "Lower-volatility setup"
    return "Technical watchlist candidate"


def _build_research_reason(analysis: dict[str, Any]) -> str:
    return (
        f"{analysis['ticker']} ranks with a {analysis['opportunity_score']}/100 score, "
        f"{analysis['momentum_score']}/100 momentum, {analysis['risk_level'].lower()} risk, "
        f"and {analysis['expected_upside_percent']}% modeled upside to target."
    )


def _score_catalysts(news_items: list[dict[str, Any]]) -> dict[str, Any]:
    if not news_items:
        return {
            "catalyst_score": 42,
            "catalyst_count": 0,
            "top_headline": "No recent catalyst headlines returned.",
            "catalyst_types": [],
        }

    positive_terms = (
        "beat",
        "upgrade",
        "raises",
        "partnership",
        "contract",
        "launch",
        "growth",
        "record",
        "approved",
        "expands",
    )
    risk_terms = (
        "downgrade",
        "miss",
        "lawsuit",
        "probe",
        "cuts",
        "warning",
        "recall",
        "delay",
        "falls",
        "slumps",
    )

    score = 50
    catalyst_types: list[str] = []
    for item in news_items[:6]:
        title = f"{item.get('title', '')} {item.get('summary', '')}".lower()
        catalyst_type = str(item.get("catalyst_type", "Market"))
        if catalyst_type not in catalyst_types:
            catalyst_types.append(catalyst_type)
        if any(term in title for term in positive_terms):
            score += 9
        if any(term in title for term in risk_terms):
            score -= 11
        if catalyst_type in {"Earnings", "Deal", "Product"}:
            score += 4

    return {
        "catalyst_score": _bounded(score),
        "catalyst_count": len(news_items),
        "top_headline": news_items[0].get("title", "Recent catalyst detected."),
        "catalyst_types": catalyst_types[:4],
    }


def _parse_symbols(tickers: str, max_symbols: int) -> list[str]:
    symbols: list[str] = []
    for item in tickers.split(","):
        symbol = item.strip().upper()
        if symbol and symbol not in symbols:
            symbols.append(symbol)
    return symbols[:max_symbols]


def _resolve_universe(tickers: str, universe: str, max_symbols: int) -> tuple[list[str], str]:
    custom_symbols = _parse_symbols(tickers, max_symbols)
    if custom_symbols:
        return custom_symbols, "CUSTOM"

    normalized = universe.strip().upper().replace("-", "")
    if normalized in {"NASDAQ", "NASDAQ100", "NDX", "QQQ"}:
        return NASDAQ_100_UNIVERSE[:max_symbols], "NASDAQ-100"

    return DEFAULT_CUSTOM_UNIVERSE[:max_symbols], "DEFAULT"


def _parse_signal_filter(value: str) -> set[str] | None:
    normalized = value.strip().upper()
    if normalized in {"", "ALL", "ANY"}:
        return None
    signals = {item.strip().upper() for item in normalized.split(",") if item.strip()}
    allowed = {"BUY", "WATCH", "NEUTRAL", "AVOID"}
    return signals & allowed or None


def _signal_rank(signal: str) -> int:
    return {"BUY": 3, "WATCH": 2, "NEUTRAL": 1, "AVOID": 0}.get(signal, 0)


def _risk_reward_penalty(ratio: float) -> int:
    if ratio >= 2:
        return 0
    if ratio >= 1.5:
        return 4
    if ratio >= 1:
        return 10
    return 18


def _rank_opportunities(
    symbols: list[str],
    limit: int,
    include_news: bool = True,
    min_score: int = 0,
    min_risk_reward: float = 0,
    signals: set[str] | None = None,
    max_risk: str = "ANY",
) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    candidates: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []
    risk_rank = {"LOW": 1, "MEDIUM": 2, "HIGH": 3}
    max_risk_rank = risk_rank.get(max_risk.upper(), 3)

    for symbol in symbols:
        try:
            analysis = _analyze_symbol(symbol)
            if analysis["opportunity_score"] < min_score:
                continue
            if analysis["risk_reward_ratio"] < min_risk_reward:
                continue
            if signals and analysis["signal"] not in signals:
                continue
            if risk_rank.get(analysis["risk_level"], 3) > max_risk_rank:
                continue

            news_items = _fetch_news_items(symbol, 4) if include_news else []
            catalyst_pack = _score_catalysts(news_items)
            static_profile = _static_company_profile(symbol)
            headline = _select_relevant_headline(symbol, {"company_name": static_profile.get("longName", symbol)}, news_items)
            signal_bonus = {"BUY": 14, "WATCH": 7, "NEUTRAL": -8, "AVOID": -18}.get(analysis["signal"], 0)
            risk_penalty = 8 if analysis["risk_level"] == "HIGH" else 0
            quality_score = _bounded(
                analysis["opportunity_score"] * 0.44
                + min(analysis["risk_reward_ratio"], 4) * 7
                + max(analysis["expected_upside_percent"], 0) * 1.05
                + analysis["volume_score"] * 0.1
                + catalyst_pack["catalyst_score"] * 0.18
                + signal_bonus
                - risk_penalty
                - _risk_reward_penalty(analysis["risk_reward_ratio"])
            )
            candidates.append(
                {
                    "rank": 0,
                    "ticker": analysis["ticker"],
                    "price": analysis["current_price"],
                    "daily_change_percent": analysis["daily_change_percent"],
                    "opportunity_score": analysis["opportunity_score"],
                    "quality_score": quality_score,
                    "signal": analysis["signal"],
                    "expected_upside_percent": analysis["expected_upside_percent"],
                    "risk_level": analysis["risk_level"],
                    "risk_reward_ratio": analysis["risk_reward_ratio"],
                    "entry_zone": analysis["entry_zone"],
                    "stop_loss": analysis["stop_loss"],
                    "target_1": analysis["target_1"],
                    "target_2": analysis["target_2"],
                    "catalyst": _build_catalyst_note(analysis),
                    "catalyst_score": catalyst_pack["catalyst_score"],
                    "catalyst_count": catalyst_pack["catalyst_count"],
                    "catalyst_types": catalyst_pack["catalyst_types"],
                    "top_headline": headline,
                    "reason": _build_research_reason(analysis),
                    "warnings": analysis["warnings"],
                }
            )
        except Exception as exc:
            errors.append({"ticker": symbol, "detail": str(exc)})

    ranked = sorted(
        candidates,
        key=lambda item: (
            _signal_rank(item["signal"]),
            item["risk_reward_ratio"] >= 1.5,
            item["quality_score"],
            item["opportunity_score"],
            item["catalyst_score"],
            item["expected_upside_percent"],
        ),
        reverse=True,
    )[:limit]

    for index, item in enumerate(ranked, start=1):
        item["rank"] = index

    return ranked, errors


def _build_market_regime() -> dict[str, Any]:
    symbols = ["SPY", "QQQ", "^VIX"]
    regime: dict[str, Any] = {
        "label": "Mixed market",
        "risk_state": "Neutral",
        "summary": "Market regime could not be fully calculated, so the scanner remains stock-specific.",
        "signals": [],
    }

    try:
        spy = _analyze_symbol("SPY")
        qqq = _analyze_symbol("QQQ")
        vix_history = _download_history("^VIX", "3mo")
        vix_level = _as_float(vix_history["Close"].iloc[-1], fallback=18)
        bullish_count = sum(
            [
                spy["current_price"] > spy["moving_averages"]["ma50"],
                spy["current_price"] > spy["moving_averages"]["ma200"],
                qqq["current_price"] > qqq["moving_averages"]["ma50"],
                qqq["current_price"] > qqq["moving_averages"]["ma200"],
            ]
        )

        if bullish_count >= 3 and vix_level < 20:
            label = "Risk-on trend"
            risk_state = "Constructive"
        elif bullish_count <= 1 or vix_level > 25:
            label = "Defensive regime"
            risk_state = "Elevated"
        else:
            label = "Selective risk"
            risk_state = "Neutral"

        regime = {
            "label": label,
            "risk_state": risk_state,
            "vix": vix_level,
            "spy_score": spy["opportunity_score"],
            "qqq_score": qqq["opportunity_score"],
            "summary": f"{label}: SPY score {spy['opportunity_score']}, QQQ score {qqq['opportunity_score']}, VIX {vix_level}.",
            "signals": symbols,
        }
    except Exception:
        return regime

    return regime


def _classify_time_horizon(analysis: dict[str, Any]) -> str:
    if analysis["opportunity_score"] >= 78 and analysis["volatility_score"] >= 55:
        return "swing-to-position"
    if analysis["momentum_score"] >= 72 and analysis["volatility_score"] < 55:
        return "short-term tactical"
    if analysis["trend_score"] >= 78 and analysis["risk_level"] != "HIGH":
        return "position / longer-term"
    return "watchlist / research-only"


def _select_relevant_headline(symbol: str, profile: dict[str, Any], news_items: list[dict[str, Any]]) -> str:
    if not news_items:
        return "No recent catalyst headline was returned."

    company_name = str(profile.get("company_name") or "")
    company_tokens = [
        token.lower()
        for token in company_name.replace(",", " ").replace(".", " ").split()
        if len(token) >= 4
    ][:4]
    needles = {symbol.lower(), *company_tokens}

    for item in news_items:
        title = str(item.get("title") or "")
        haystack = title.lower()
        if any(needle in haystack for needle in needles):
            return title

    return "Recent sector or market headline detected, but no company-specific headline was isolated."


def _build_research_memo(symbol: str) -> dict[str, Any]:
    analysis = _analyze_symbol(symbol)
    news_items = _fetch_news_items(symbol, 6)
    catalyst_pack = _score_catalysts(news_items)
    try:
        profile = _fetch_company_profile(symbol)
    except Exception:
        static_profile = _static_company_profile(symbol)
        profile = {
            "company_name": static_profile.get("longName", symbol),
            "sector": static_profile.get("sector", "N/A"),
            "industry": static_profile.get("industry", "N/A"),
            "market_cap_display": _format_market_cap(None),
            "target_mean_price": None,
            "upside_to_target_percent": None,
            "recommendation": "N/A",
            "earnings_dates": [],
        }

    static_profile = _static_company_profile(symbol)
    if static_profile and profile.get("company_name") in (None, "", "N/A", symbol):
        profile = {
            **profile,
            "company_name": static_profile.get("longName", symbol),
            "sector": profile.get("sector") if profile.get("sector") not in (None, "", "N/A") else static_profile.get("sector", "N/A"),
            "industry": profile.get("industry") if profile.get("industry") not in (None, "", "N/A") else static_profile.get("industry", "N/A"),
            "business_summary": profile.get("business_summary") or static_profile.get("longBusinessSummary", ""),
        }

    horizon = _classify_time_horizon(analysis)
    headline = _select_relevant_headline(symbol, profile, news_items)
    attractive_reasons = [
        f"Opportunity score is {analysis['opportunity_score']}/100 with a {analysis['signal']} classification.",
        f"Trend score is {analysis['trend_score']}/100 and momentum score is {analysis['momentum_score']}/100.",
        f"Modeled upside to target is {analysis['expected_upside_percent']}% with a {analysis['risk_reward_ratio']}x risk/reward ratio.",
    ]
    if catalyst_pack["catalyst_count"]:
        attractive_reasons.append(
            f"Recent catalyst tone score is {catalyst_pack['catalyst_score']}/100 across {catalyst_pack['catalyst_count']} headline(s)."
        )
    if profile.get("upside_to_target_percent") is not None:
        attractive_reasons.append(
            f"Consensus target data implies {profile['upside_to_target_percent']}% upside from the current profile snapshot."
        )

    key_risks = analysis["warnings"][:] if analysis["warnings"] else []
    if analysis["risk_level"] == "HIGH":
        key_risks.append("Realized volatility is elevated, so position sizing should be conservative.")
    if analysis["rsi"] > 70:
        key_risks.append("RSI is extended, increasing the risk of a near-term pullback.")
    if not key_risks:
        key_risks.append("Primary risk is thesis drift: price failing to hold the entry/support zone after analysis.")

    invalidation = [
        f"Price closes below the stop-loss zone near ${analysis['stop_loss']}.",
        f"Price loses support near ${analysis['support']} while momentum deteriorates.",
        "Catalyst headlines turn negative or earnings guidance weakens.",
    ]

    monitor = [
        f"Entry zone: ${analysis['entry_zone']['low']} - ${analysis['entry_zone']['high']}.",
        f"Target 1: ${analysis['target_1']}; Target 2: ${analysis['target_2']}.",
        f"Resistance level to watch: ${analysis['resistance']}.",
        f"Latest catalyst: {headline}",
    ]
    if profile.get("earnings_dates"):
        monitor.append(f"Earnings date watch: {' / '.join(profile['earnings_dates'])}.")

    summary = (
        f"{symbol} is a {horizon} setup with {analysis['signal']} signal quality. "
        f"The setup is strongest when price remains above the support/entry zone and catalyst tone stays constructive. "
        f"This memo is a research summary, not a trade instruction."
    )

    return {
        "ticker": symbol,
        "company_name": profile.get("company_name", symbol),
        "generated_at": datetime.now(UTC).isoformat(),
        "signal": analysis["signal"],
        "confidence_score": analysis["opportunity_score"],
        "time_horizon": horizon,
        "setup_type": "momentum continuation" if analysis["momentum_score"] >= 70 else "selective pullback / watchlist",
        "summary": summary,
        "why_attractive": attractive_reasons,
        "key_risks": key_risks[:5],
        "entry_logic": (
            f"Preferred entry is inside ${analysis['entry_zone']['low']} - ${analysis['entry_zone']['high']}, "
            f"with stop-loss near ${analysis['stop_loss']} and risk/reward of {analysis['risk_reward_ratio']}x."
        ),
        "catalyst_watch": {
            "score": catalyst_pack["catalyst_score"],
            "types": catalyst_pack["catalyst_types"],
            "top_headline": headline,
        },
        "invalidation": invalidation,
        "monitor_before_buying": monitor,
        "trade_plan": {
            "entry_zone": analysis["entry_zone"],
            "stop_loss": analysis["stop_loss"],
            "target_1": analysis["target_1"],
            "target_2": analysis["target_2"],
            "expected_upside_percent": analysis["expected_upside_percent"],
            "risk_reward_ratio": analysis["risk_reward_ratio"],
        },
        "profile_context": {
            "sector": profile.get("sector"),
            "industry": profile.get("industry"),
            "market_cap": profile.get("market_cap_display"),
            "recommendation": profile.get("recommendation"),
            "target_mean_price": profile.get("target_mean_price"),
        },
        "disclaimer": "For research and educational purposes only. Not financial advice.",
    }


def _build_investment_committee_report(
    symbols: list[str],
    limit: int,
    min_score: int = 0,
    min_risk_reward: float = 0,
    signals: set[str] | None = None,
    max_risk: str = "ANY",
) -> dict[str, Any]:
    ranked, errors = _rank_opportunities(
        symbols,
        limit,
        include_news=True,
        min_score=min_score,
        min_risk_reward=min_risk_reward,
        signals=signals,
        max_risk=max_risk,
    )
    if not ranked:
        market_regime = _build_market_regime()
        return {
            "generated_at": datetime.now(UTC).isoformat(),
            "title": "QuantumStock Weekly Investment Committee Report",
            "universe": symbols,
            "market_regime": market_regime,
            "recommended_action": "No allocation candidate qualifies under the current filters",
            "top_idea": None,
            "sections": [
                {
                    "title": "Executive View",
                    "body": "No qualified opportunity passed the active screening controls. Loosen filters or expand the ticker universe.",
                },
                {
                    "title": "Risk Controls",
                    "body": "No trade is preferable to forcing a weak setup. Current controls are excluding low-quality entries.",
                },
            ],
            "allocation_notes": [],
            "ranked_opportunities": [],
            "errors": errors,
            "message": "No qualified opportunities under current filters.",
            "methodology": "Committee report blends market regime, opportunity score, catalyst tone, risk/reward, and model trade plan.",
            "filters": {
                "min_score": min_score,
                "min_rr": min_risk_reward,
                "signal": sorted(signals) if signals else "ALL",
                "max_risk": max_risk,
            },
            "disclaimer": "For research and educational purposes only. Not financial advice.",
        }

    market_regime = _build_market_regime()
    top = next(
        (
            item
            for item in ranked
            if item["signal"] in {"BUY", "WATCH"} and item["risk_reward_ratio"] >= 1 and item["risk_level"] != "HIGH"
        ),
        ranked[0],
    )
    buy_candidates = [item for item in ranked if item["signal"] == "BUY"]
    watch_candidates = [item for item in ranked if item["signal"] == "WATCH"]
    high_risk = [item for item in ranked if item["risk_level"] == "HIGH"]
    strong_catalysts = [item for item in ranked if item["catalyst_score"] >= 70]

    recommended_action = "Maintain watchlist discipline"
    actionable_buy_candidates = [
        item for item in buy_candidates if item["risk_level"] != "HIGH" and item["risk_reward_ratio"] >= 1.5
    ]
    if actionable_buy_candidates and market_regime.get("risk_state") == "Constructive":
        recommended_action = "Consider staged allocation to the highest-ranked BUY candidates"
    elif top["risk_reward_ratio"] < 1.5:
        recommended_action = "Do not chase; wait for improved entry zone or stronger risk/reward"
    elif watch_candidates:
        recommended_action = "Build watchlist and wait for confirmation before allocation"

    sections = [
        {
            "title": "Executive View",
            "body": (
                f"{top['ticker']} leads the current opportunity book with a {top['quality_score']}/100 blended score. "
                f"The regime is classified as {market_regime.get('label', 'Mixed market')} and the recommended posture is: {recommended_action}."
            ),
        },
        {
            "title": "Opportunity Book",
            "body": (
                f"{len(buy_candidates)} BUY candidate(s), {len(watch_candidates)} WATCH candidate(s), "
                f"and {len(high_risk)} high-risk name(s) were identified across {len(symbols)} scanned tickers."
            ),
        },
        {
            "title": "Catalyst Monitor",
            "body": (
                f"{', '.join(item['ticker'] for item in strong_catalysts[:5]) or 'No ticker'} shows elevated catalyst tone. "
                "Catalysts should be monitored against price behavior, volume confirmation, and upcoming earnings risk."
            ),
        },
        {
            "title": "Risk Controls",
            "body": (
                "No position should be treated as automatic. Entries should be staged near model-defined zones, "
                "stop-loss levels should be respected, and low risk/reward setups should remain research-only."
            ),
        },
    ]

    allocation_notes = []
    for item in ranked[:5]:
        if item["signal"] == "BUY" and item["risk_level"] != "HIGH" and item["risk_reward_ratio"] >= 1.5:
            stance = "candidate for staged allocation"
        elif item["signal"] in {"BUY", "WATCH"}:
            stance = "watch for entry confirmation"
        else:
            stance = "research-only"
        allocation_notes.append(
            {
                "ticker": item["ticker"],
                "stance": stance,
                "score": item["quality_score"],
                "risk": item["risk_level"],
                "entry_zone": item["entry_zone"],
                "stop_loss": item["stop_loss"],
                "target_1": item["target_1"],
            }
        )

    return {
        "generated_at": datetime.now(UTC).isoformat(),
        "title": "QuantumStock Weekly Investment Committee Report",
        "universe": symbols,
        "market_regime": market_regime,
        "recommended_action": recommended_action,
        "top_idea": top,
        "sections": sections,
        "allocation_notes": allocation_notes,
        "ranked_opportunities": ranked,
        "errors": errors,
        "methodology": "Committee report blends market regime, opportunity score, catalyst tone, risk/reward, and model trade plan.",
        "filters": {
            "min_score": min_score,
            "min_rr": min_risk_reward,
            "signal": sorted(signals) if signals else "ALL",
            "max_risk": max_risk,
        },
        "disclaimer": "For research and educational purposes only. Not financial advice.",
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy", "service": "quantumstock-research-api"}


@app.get("/api/analyze")
def analyze(ticker: str = Query(..., min_length=1, max_length=12)) -> dict[str, Any]:
    symbol = ticker.strip().upper()
    try:
        return _analyze_symbol(symbol)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed for {symbol}: {exc}") from exc


@app.get("/api/news")
def news(ticker: str = Query(..., min_length=1, max_length=12), limit: int = Query(8, ge=1, le=20)) -> dict[str, Any]:
    symbol = ticker.strip().upper()
    try:
        items = _fetch_news_items(symbol, limit)
        return {
            "ticker": symbol,
            "count": len(items),
            "items": items,
            "disclaimer": "News is provided for research context only. Not financial advice.",
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"News fetch failed for {symbol}: {exc}") from exc


@app.get("/api/company-profile")
def company_profile(ticker: str = Query(..., min_length=1, max_length=12)) -> dict[str, Any]:
    symbol = ticker.strip().upper()
    try:
        return _fetch_company_profile(symbol)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Company profile failed for {symbol}: {exc}") from exc


@app.get("/api/research-memo")
def research_memo(ticker: str = Query(..., min_length=1, max_length=12)) -> dict[str, Any]:
    symbol = ticker.strip().upper()
    try:
        return _build_research_memo(symbol)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Research memo failed for {symbol}: {exc}") from exc


@app.get("/api/watchlist")
def watchlist(
    tickers: str = Query(
        "NVDA,MSFT,AAPL,AMZN,META,GOOGL,AMD,TSLA",
        min_length=1,
        max_length=160,
    )
) -> dict[str, Any]:
    symbols = []
    for item in tickers.split(","):
        symbol = item.strip().upper()
        if symbol and symbol not in symbols:
            symbols.append(symbol)

    if not symbols:
        raise HTTPException(status_code=400, detail="At least one ticker is required.")

    symbols = symbols[:12]
    results: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []

    for symbol in symbols:
        try:
            analysis = _analyze_symbol(symbol)
            results.append(
                {
                    "ticker": analysis["ticker"],
                    "price": analysis["current_price"],
                    "daily_change_percent": analysis["daily_change_percent"],
                    "ai_score": analysis["opportunity_score"],
                    "momentum_score": analysis["momentum_score"],
                    "risk_level": analysis["risk_level"],
                    "signal": analysis["signal"],
                }
            )
        except Exception as exc:
            errors.append({"ticker": symbol, "detail": str(exc)})

    if not results:
        raise HTTPException(status_code=404, detail="No watchlist market data could be loaded.")

    return {"tickers": symbols, "results": results, "errors": errors}


@app.get("/api/opportunities")
def opportunities(
    tickers: str = Query("", max_length=2000),
    universe: str = Query("NASDAQ100", max_length=24),
    scan_limit: int = Query(40, ge=10, le=90),
    limit: int = Query(10, ge=1, le=20),
    min_score: int = Query(0, ge=0, le=100),
    min_rr: float = Query(0, ge=0, le=10),
    signal: str = Query("ALL", max_length=40),
    max_risk: str = Query("ANY", max_length=12),
) -> dict[str, Any]:
    symbols, universe_name = _resolve_universe(tickers, universe, scan_limit)

    if not symbols:
        raise HTTPException(status_code=400, detail="At least one ticker is required.")

    ranked, errors = _rank_opportunities(
        symbols,
        limit,
        include_news=True,
        min_score=min_score,
        min_risk_reward=min_rr,
        signals=_parse_signal_filter(signal),
        max_risk=max_risk,
    )

    return {
        "universe": symbols,
        "universe_name": universe_name,
        "scanned_count": len(symbols),
        "generated_at": datetime.now(UTC).isoformat(),
        "methodology": "Ranks the selected equity universe by opportunity score, catalyst score, risk/reward, upside to target, and volume confirmation.",
        "filters": {"min_score": min_score, "min_rr": min_rr, "signal": signal, "max_risk": max_risk},
        "results": ranked,
        "message": None if ranked else "No qualified opportunities under current filters.",
        "errors": errors,
        "disclaimer": "For research and educational purposes only. Not financial advice.",
    }


@app.get("/api/weekly-report")
def weekly_report(
    tickers: str = Query("", max_length=2000),
    universe: str = Query("NASDAQ100", max_length=24),
    scan_limit: int = Query(40, ge=10, le=90),
    limit: int = Query(10, ge=1, le=20),
    min_score: int = Query(0, ge=0, le=100),
    min_rr: float = Query(0, ge=0, le=10),
    signal: str = Query("ALL", max_length=40),
    max_risk: str = Query("ANY", max_length=12),
) -> dict[str, Any]:
    symbols, universe_name = _resolve_universe(tickers, universe, scan_limit)
    if not symbols:
        raise HTTPException(status_code=400, detail="At least one ticker is required.")

    ranked, errors = _rank_opportunities(
        symbols,
        limit,
        include_news=True,
        min_score=min_score,
        min_risk_reward=min_rr,
        signals=_parse_signal_filter(signal),
        max_risk=max_risk,
    )
    market_regime = _build_market_regime()
    top = ranked[0] if ranked else None
    risk_names = [item["ticker"] for item in ranked if item["risk_level"] == "HIGH"][:3]
    catalyst_names = [item["ticker"] for item in ranked if item["catalyst_score"] >= 65][:3]

    return {
        "generated_at": datetime.now(UTC).isoformat(),
        "universe": symbols,
        "universe_name": universe_name,
        "scanned_count": len(symbols),
        "market_regime": market_regime,
        "summary": (
            f"{top['ticker']} leads this weekly scan with a {top['quality_score']}/100 blended quality score. "
            f"The report blends technical opportunity, risk/reward, volume confirmation, and recent catalyst tone."
            if top
            else "No qualified opportunities matched the current screening controls."
        ),
        "top_idea": top,
        "catalyst_focus": catalyst_names,
        "risk_watch": risk_names,
        "results": ranked,
        "message": None if ranked else "No qualified opportunities under current filters.",
        "errors": errors,
        "methodology": "Blended weekly score = technical opportunity + catalyst tone + risk/reward + upside + volume confirmation.",
        "filters": {"min_score": min_score, "min_rr": min_rr, "signal": signal, "max_risk": max_risk},
        "disclaimer": "For research and educational purposes only. Not financial advice.",
    }


@app.get("/api/investment-committee-report")
def investment_committee_report(
    tickers: str = Query("", max_length=2000),
    universe: str = Query("NASDAQ100", max_length=24),
    scan_limit: int = Query(40, ge=10, le=90),
    limit: int = Query(10, ge=1, le=20),
    min_score: int = Query(0, ge=0, le=100),
    min_rr: float = Query(0, ge=0, le=10),
    signal: str = Query("ALL", max_length=40),
    max_risk: str = Query("ANY", max_length=12),
) -> dict[str, Any]:
    symbols, _universe_name = _resolve_universe(tickers, universe, scan_limit)
    if not symbols:
        raise HTTPException(status_code=400, detail="At least one ticker is required.")
    return _build_investment_committee_report(
        symbols,
        limit,
        min_score=min_score,
        min_risk_reward=min_rr,
        signals=_parse_signal_filter(signal),
        max_risk=max_risk,
    )
