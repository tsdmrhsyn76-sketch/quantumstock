from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np
import pandas as pd
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


def _download_history(ticker: str, period: str) -> pd.DataFrame:
    frame = yf.download(
        ticker,
        period=period,
        interval="1d",
        auto_adjust=True,
        progress=False,
        threads=False,
    )
    if frame.empty:
        raise HTTPException(status_code=404, detail=f"No market data found for {ticker}")
    if isinstance(frame.columns, pd.MultiIndex):
        frame.columns = frame.columns.get_level_values(0)
    return frame.dropna()


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


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy", "service": "quantumstock-research-api"}


@app.get("/api/analyze")
def analyze(ticker: str = Query(..., min_length=1, max_length=12)) -> dict[str, Any]:
    symbol = ticker.strip().upper()
    try:
        history_1y = _download_history(symbol, "1y")
        history_3mo = _download_history(symbol, "3mo")
        indicators = _calculate_indicators(history_1y, history_3mo)
        opportunity = _score_opportunity(indicators)
        return {
            "ticker": symbol,
            "current_price": indicators.current_price,
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
            **opportunity,
            "disclaimer": "For research and educational purposes only. Not financial advice.",
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed for {symbol}: {exc}") from exc
