import Head from "next/head";
import { FormEvent, useMemo, useState } from "react";

type AnalyzeResult = {
  ticker: string;
  current_price: number;
  volume: number;
  opportunity_score: number;
  signal: string;
  expected_upside_percent: number;
  entry_zone: { low: number; high: number };
  stop_loss: number;
  target_price: number;
  target_1: number;
  target_2: number;
  risk_reward_ratio: number;
  trend_score: number;
  momentum_score: number;
  volatility_score: number;
  volume_score: number;
  risk_level: string;
  explanation: string;
  warnings: string[];
  moving_averages: { ma20: number; ma50: number; ma200: number };
  volatility: number;
  rsi: number;
  macd: { value: number; signal: number };
  support: number;
  resistance: number;
  disclaimer: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const sampleTickers = ["NVDA", "MSFT", "AAPL", "AMZN", "META", "GOOGL", "AMD", "TSLA"];

const formatCurrency = (value?: number) =>
  typeof value === "number"
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
    : "--";

const formatNumber = (value?: number) =>
  typeof value === "number" ? new Intl.NumberFormat("en-US").format(value) : "--";

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="scoreBar">
      <div>
        <span>{label}</span>
        <b>{value}</b>
      </div>
      <i>
        <em style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </i>
    </div>
  );
}

function DataBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="dataBox">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function Home() {
  const [ticker, setTicker] = useState("NVDA");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const assistantBullets = useMemo(() => {
    if (!result) {
      return [
        "Run an analysis to generate an institutional trade plan.",
        "The assistant will explain attractiveness, key risk, price levels, setup horizon, and monitoring conditions."
      ];
    }

    const setup =
      result.opportunity_score >= 78
        ? "swing-to-position setup"
        : result.opportunity_score >= 62
          ? "watchlist setup"
          : "defensive research setup";

    return [
      `${result.ticker} is classified as ${result.signal} with an opportunity score of ${result.opportunity_score}/100.`,
      `The most important price level is support near ${formatCurrency(result.support)}; a break below the stop zone weakens the setup.`,
      `The key risk is ${result.risk_level.toLowerCase()} volatility with RSI at ${result.rsi}.`,
      `The setup currently looks like a ${setup}, not a blind buy signal.`,
      "Before buying, monitor price behavior near the entry zone, volume confirmation, and whether MACD remains constructive."
    ];
  }, [result]);

  async function runAnalysis(nextTicker = ticker) {
    const symbol = nextTicker.trim().toUpperCase();
    if (!symbol) return;
    setTicker(symbol);
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze?ticker=${encodeURIComponent(symbol)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Analysis request failed.");
      }
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Analysis request failed.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAnalysis();
  }

  return (
    <>
      <Head>
        <title>QuantumStock | AI Stock Opportunity Engine</title>
        <meta
          name="description"
          content="AI-powered stock opportunity engine for institutional-style equity research."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="terminalShell">
        <header className="terminalHeader">
          <div>
            <p className="kicker">QuantumStock Opportunity Engine</p>
            <h1>AI-Powered Stock Research Terminal</h1>
            <p className="muted">Live yfinance data via FastAPI. OpenAI assistant layer comes next.</p>
          </div>
          <form className="analysisForm" onSubmit={onSubmit}>
            <input
              aria-label="Ticker"
              value={ticker}
              onChange={(event) => setTicker(event.target.value.toUpperCase())}
              placeholder="NVDA"
            />
            <button disabled={loading} type="submit">
              {loading ? "Analyzing..." : "Run Analysis"}
            </button>
          </form>
        </header>

        <section className="quickTickers">
          {sampleTickers.map((symbol) => (
            <button disabled={loading} key={symbol} onClick={() => runAnalysis(symbol)} type="button">
              {symbol}
            </button>
          ))}
        </section>

        {error ? <div className="errorBox">{error}</div> : null}

        <section className="grid heroGrid">
          <div className="panel scorePanel">
            <p className="eyebrow">Opportunity Score</p>
            <div className="scoreReadout">
              <strong>{result?.opportunity_score ?? "--"}</strong>
              <div>
                <h2>{result ? `${result.ticker} ${result.signal}` : "Run first analysis"}</h2>
                <p>{result?.explanation ?? "Fetch live/recent market data and generate a structured trade plan."}</p>
              </div>
            </div>
            <div className="scoreGrid">
              <ScoreBar label="Trend" value={result?.trend_score ?? 0} />
              <ScoreBar label="Momentum" value={result?.momentum_score ?? 0} />
              <ScoreBar label="Volatility" value={result?.volatility_score ?? 0} />
              <ScoreBar label="Volume" value={result?.volume_score ?? 0} />
            </div>
          </div>

          <div className="panel tradePlan">
            <p className="eyebrow">Trade Plan</p>
            <div className="tradeGrid">
              <DataBox
                label="Buy Zone"
                value={
                  result
                    ? `${formatCurrency(result.entry_zone.low)} - ${formatCurrency(result.entry_zone.high)}`
                    : "--"
                }
              />
              <DataBox label="Stop-Loss" value={formatCurrency(result?.stop_loss)} />
              <DataBox label="Target 1" value={formatCurrency(result?.target_1)} />
              <DataBox label="Target 2" value={formatCurrency(result?.target_2)} />
              <DataBox label="Expected Upside" value={result ? `${result.expected_upside_percent}%` : "--"} />
              <DataBox label="Risk/Reward" value={result?.risk_reward_ratio ?? "--"} />
            </div>
          </div>
        </section>

        <section className="grid researchGrid">
          <div className="panel">
            <p className="eyebrow">Market Data</p>
            <div className="dataGrid">
              <DataBox label="Current Price" value={formatCurrency(result?.current_price)} />
              <DataBox label="Volume" value={formatNumber(result?.volume)} />
              <DataBox label="MA20" value={formatCurrency(result?.moving_averages?.ma20)} />
              <DataBox label="MA50" value={formatCurrency(result?.moving_averages?.ma50)} />
              <DataBox label="MA200" value={formatCurrency(result?.moving_averages?.ma200)} />
              <DataBox label="RSI" value={result?.rsi ?? "--"} />
              <DataBox label="MACD" value={result?.macd?.value ?? "--"} />
              <DataBox label="Volatility" value={result ? `${result.volatility}%` : "--"} />
              <DataBox label="Support" value={formatCurrency(result?.support)} />
              <DataBox label="Resistance" value={formatCurrency(result?.resistance)} />
            </div>
          </div>

          <div className="panel assistantPanel">
            <p className="eyebrow">AI Assistant</p>
            <h2>Research Explanation</h2>
            <ul>
              {assistantBullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {result?.warnings?.length ? (
              <div className="warningBox">
                {result.warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <p className="disclaimer">For research and educational purposes only. Not financial advice.</p>
      </main>
    </>
  );
}
