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

    entry_low = round(max(ind.support * 0.995, ind.current_price * 0.96), 2)
    entry_high = round(min(ind.support * 1.035, ind.current_price * 1.015), 2)
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


def _rank_opportunities(symbols: list[str], limit: int, include_news: bool = True) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    candidates: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []

    for symbol in symbols[:24]:
        try:
            analysis = _analyze_symbol(symbol)
            news_items = _fetch_news_items(symbol, 4) if include_news else []
            catalyst_pack = _score_catalysts(news_items)
            quality_score = _bounded(
                analysis["opportunity_score"] * 0.44
                + min(analysis["risk_reward_ratio"], 4) * 7
                + max(analysis["expected_upside_percent"], 0) * 1.05
                + analysis["volume_score"] * 0.1
                + catalyst_pack["catalyst_score"] * 0.18
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
                    "top_headline": catalyst_pack["top_headline"],
                    "reason": _build_research_reason(analysis),
                    "warnings": analysis["warnings"],
                }
            )
        except Exception as exc:
            errors.append({"ticker": symbol, "detail": str(exc)})

    ranked = sorted(
        candidates,
        key=lambda item: (
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
    tickers: str = Query(
        "NVDA,MSFT,AAPL,AMZN,META,GOOGL,AMD,TSLA,AVGO,CRM,ORCL,NFLX",
        min_length=1,
        max_length=240,
    ),
    limit: int = Query(10, ge=1, le=20),
) -> dict[str, Any]:
    symbols = _parse_symbols(tickers, 24)

    if not symbols:
        raise HTTPException(status_code=400, detail="At least one ticker is required.")

    ranked, errors = _rank_opportunities(symbols, limit, include_news=True)

    if not ranked:
        raise HTTPException(status_code=404, detail="No opportunity candidates could be loaded.")

    return {
        "universe": symbols,
        "generated_at": datetime.now(UTC).isoformat(),
        "methodology": "Ranks equities by opportunity score, catalyst score, risk/reward, upside to target, and volume confirmation.",
        "results": ranked,
        "errors": errors,
        "disclaimer": "For research and educational purposes only. Not financial advice.",
    }


@app.get("/api/weekly-report")
def weekly_report(
    tickers: str = Query(
        "NVDA,MSFT,AAPL,AMZN,META,GOOGL,AMD,TSLA,AVGO,CRM,ORCL,NFLX",
        min_length=1,
        max_length=240,
    ),
    limit: int = Query(10, ge=1, le=20),
) -> dict[str, Any]:
    symbols = _parse_symbols(tickers, 24)
    if not symbols:
        raise HTTPException(status_code=400, detail="At least one ticker is required.")

    ranked, errors = _rank_opportunities(symbols, limit, include_news=True)
    if not ranked:
        raise HTTPException(status_code=404, detail="No weekly opportunity candidates could be loaded.")

    market_regime = _build_market_regime()
    top = ranked[0]
    risk_names = [item["ticker"] for item in ranked if item["risk_level"] == "HIGH"][:3]
    catalyst_names = [item["ticker"] for item in ranked if item["catalyst_score"] >= 65][:3]

    return {
        "generated_at": datetime.now(UTC).isoformat(),
        "universe": symbols,
        "market_regime": market_regime,
        "summary": (
            f"{top['ticker']} leads this weekly scan with a {top['quality_score']}/100 blended quality score. "
            f"The report blends technical opportunity, risk/reward, volume confirmation, and recent catalyst tone."
        ),
        "top_idea": top,
        "catalyst_focus": catalyst_names,
        "risk_watch": risk_names,
        "results": ranked,
        "errors": errors,
        "methodology": "Blended weekly score = technical opportunity + catalyst tone + risk/reward + upside + volume confirmation.",
        "disclaimer": "For research and educational purposes only. Not financial advice.",
    }
