import Head from "next/head";
import { FormEvent, useEffect, useMemo, useState } from "react";

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
  charts?: {
    price_history: number[];
    score_history: number[];
    momentum_history: number[];
    volatility_history: number[];
    backtest_curve: number[];
  };
  disclaimer: string;
};

type WatchlistRow = {
  ticker: string;
  price: number;
  change: number;
  aiScore: number;
  momentum: number;
  risk: string;
  signal: string;
};

type OpportunityRow = {
  rank: number;
  ticker: string;
  price: number;
  opportunity_score: number;
  quality_score: number;
  signal: string;
  expected_upside_percent: number;
  risk_level: string;
  risk_reward_ratio: number;
  entry_zone: { low: number; high: number };
  target_1: number;
  catalyst: string;
  reason: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const fallbackWatchlist: WatchlistRow[] = [
  { ticker: "NVDA", price: 135.42, change: 1.84, aiScore: 82, momentum: 78, risk: "MED", signal: "BUY" },
  { ticker: "MSFT", price: 421.19, change: 0.42, aiScore: 74, momentum: 66, risk: "LOW", signal: "WATCH" },
  { ticker: "AAPL", price: 190.31, change: -0.37, aiScore: 59, momentum: 48, risk: "LOW", signal: "NEUTRAL" },
  { ticker: "AMZN", price: 186.77, change: 1.12, aiScore: 71, momentum: 69, risk: "MED", signal: "WATCH" },
  { ticker: "META", price: 512.64, change: 2.05, aiScore: 79, momentum: 73, risk: "MED", signal: "BUY" },
  { ticker: "GOOGL", price: 176.88, change: 0.64, aiScore: 68, momentum: 61, risk: "LOW", signal: "WATCH" },
  { ticker: "AMD", price: 158.22, change: -1.28, aiScore: 54, momentum: 52, risk: "HIGH", signal: "NEUTRAL" },
  { ticker: "TSLA", price: 178.03, change: -2.46, aiScore: 43, momentum: 39, risk: "HIGH", signal: "AVOID" },
];

const marketTape = [
  { label: "SPX", value: "5,327.4", change: "+0.31%" },
  { label: "NDX", value: "18,742.8", change: "+0.58%" },
  { label: "VIX", value: "13.9", change: "-2.14%" },
  { label: "10Y", value: "4.41%", change: "+3bp" },
  { label: "DXY", value: "104.6", change: "-0.18%" },
  { label: "WTI", value: "79.2", change: "+0.72%" },
];

const formatCurrency = (value?: number) =>
  typeof value === "number"
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
    : "--";

const formatNumber = (value?: number) =>
  typeof value === "number" ? new Intl.NumberFormat("en-US").format(value) : "--";

const clamp = (value: number) => Math.max(0, Math.min(100, value));

function MetricTile({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="metricTile">
      <span>{label}</span>
      <strong>{value}</strong>
      {sub ? <small>{sub}</small> : null}
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="scoreBar">
      <div>
        <span>{label}</span>
        <b>{value}</b>
      </div>
      <i>
        <em style={{ width: `${clamp(value)}%` }} />
      </i>
    </div>
  );
}

function MiniChart({ label, data, tone = "amber" }: { label: string; data: number[]; tone?: "amber" | "green" | "blue" | "red" }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 88 - ((value - min) / range) * 72;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className={`chartCard ${tone}`}>
      <div className="chartTop">
        <span>{label}</span>
        <b>{data[data.length - 1].toFixed(1)}</b>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 88 H100" />
        <path d="M0 62 H100" />
        <path d="M0 36 H100" />
        <polyline points={points} />
      </svg>
    </div>
  );
}

function signalClass(signal: string) {
  return signal.toLowerCase();
}

export default function Home() {
  const [ticker, setTicker] = useState("NVDA");
  const [selectedTicker, setSelectedTicker] = useState("NVDA");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [liveWatchlist, setLiveWatchlist] = useState<WatchlistRow[]>(fallbackWatchlist);
  const [opportunities, setOpportunities] = useState<OpportunityRow[]>([]);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(false);
  const [opportunitiesError, setOpportunitiesError] = useState("");
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [watchlistError, setWatchlistError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeRow = liveWatchlist.find((row) => row.ticker === selectedTicker) ?? liveWatchlist[0];
  const score = result?.opportunity_score ?? activeRow.aiScore;
  const momentum = result?.momentum_score ?? activeRow.momentum;
  const volatility = result?.volatility ?? 24.6;
  const riskLevel = result?.risk_level ?? activeRow.risk;
  const signal = result?.signal ?? activeRow.signal;

  const chartData = useMemo(() => {
    if (result?.charts) {
      return {
        price: result.charts.price_history,
        ai: result.charts.score_history,
        momentum: result.charts.momentum_history,
        volatility: result.charts.volatility_history,
        backtest: result.charts.backtest_curve,
      };
    }

    const base = score;
    return {
      price: [activeRow.price * 0.93, activeRow.price * 0.96, activeRow.price * 0.95, activeRow.price * 0.99, activeRow.price * 1.02, activeRow.price],
      ai: [base - 13, base - 8, base - 10, base - 4, base - 2, base + 1, base],
      momentum: [momentum - 16, momentum - 7, momentum - 10, momentum - 3, momentum + 4, momentum + 1, momentum],
      volatility: [volatility + 5, volatility + 1, volatility + 8, volatility - 2, volatility + 3, volatility - 4, volatility],
      backtest: [100, 103, 106, 104, 111, 116, 123, 128, 126, 134],
    };
  }, [activeRow.price, momentum, result, score, volatility]);

  const assistantBullets = useMemo(() => {
    if (!result) {
      return [
        `${selectedTicker} is loaded from the live opportunity scanner. Run a focused analysis for the full trade plan.`,
        "The model weighs trend, momentum, realized volatility, volume confirmation, and distance from support.",
        "The next production layer will add OpenAI reasoning, saved portfolios, and historical chart endpoints.",
      ];
    }

    const horizon =
      result.opportunity_score >= 78
        ? "swing-to-position setup"
        : result.opportunity_score >= 62
          ? "watchlist setup"
          : "defensive research setup";

    return [
      `${result.ticker} is classified as ${result.signal} with an opportunity score of ${result.opportunity_score}/100.`,
      `The model sees support near ${formatCurrency(result.support)} and resistance near ${formatCurrency(result.resistance)}.`,
      `The key risk is ${result.risk_level.toLowerCase()} realized volatility with RSI at ${result.rsi}.`,
      `This currently behaves like a ${horizon}, not an automatic trade instruction.`,
      "Monitor the entry zone, volume confirmation, MACD direction, and whether price holds above the stop-loss band.",
    ];
  }, [result, selectedTicker]);

  useEffect(() => {
    let ignore = false;

    async function loadWatchlist() {
      setWatchlistLoading(true);
      setWatchlistError("");

      try {
        const symbols = fallbackWatchlist.map((row) => row.ticker).join(",");
        const response = await fetch(`${API_BASE_URL}/api/watchlist?tickers=${symbols}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Watchlist scan failed.");
        }
        const rows: WatchlistRow[] = data.results.map(
          (item: {
            ticker: string;
            price: number;
            daily_change_percent: number;
            ai_score: number;
            momentum_score: number;
            risk_level: string;
            signal: string;
          }) => ({
            ticker: item.ticker,
            price: item.price,
            change: item.daily_change_percent,
            aiScore: item.ai_score,
            momentum: item.momentum_score,
            risk: item.risk_level,
            signal: item.signal,
          })
        );
        if (!ignore && rows.length) {
          setLiveWatchlist(rows);
        }
      } catch (err) {
        if (!ignore) {
          setWatchlistError(err instanceof Error ? err.message : "Watchlist scan failed.");
        }
      } finally {
        if (!ignore) {
          setWatchlistLoading(false);
        }
      }
    }

    loadWatchlist();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadOpportunities() {
      setOpportunitiesLoading(true);
      setOpportunitiesError("");

      try {
        const symbols = "NVDA,MSFT,AAPL,AMZN,META,GOOGL,AMD,TSLA,AVGO,CRM,ORCL,NFLX";
        const response = await fetch(`${API_BASE_URL}/api/opportunities?tickers=${symbols}&limit=10`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Opportunity scan failed.");
        }
        if (!ignore) {
          setOpportunities(data.results ?? []);
        }
      } catch (err) {
        if (!ignore) {
          setOpportunitiesError(err instanceof Error ? err.message : "Opportunity scan failed.");
        }
      } finally {
        if (!ignore) {
          setOpportunitiesLoading(false);
        }
      }
    }

    loadOpportunities();
    return () => {
      ignore = true;
    };
  }, []);

  async function runAnalysis(nextTicker = ticker) {
    const symbol = nextTicker.trim().toUpperCase();
    if (!symbol) return;
    setTicker(symbol);
    setSelectedTicker(symbol);
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

  function selectTicker(symbol: string) {
    setTicker(symbol);
    setSelectedTicker(symbol);
    setResult(null);
  }

  return (
    <>
      <Head>
        <title>QuantumStock | Institutional Quant Terminal</title>
        <meta
          name="description"
          content="AI-powered stock opportunity engine for institutional-style equity research."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="terminalShell">
        <header className="topBar">
          <div>
            <p className="kicker">QuantumStock OS</p>
            <h1>AI Equity Opportunity Terminal</h1>
          </div>
          <form className="analysisForm" onSubmit={onSubmit}>
            <input
              aria-label="Ticker"
              value={ticker}
              onChange={(event) => setTicker(event.target.value.toUpperCase())}
              placeholder="NVDA"
            />
            <button disabled={loading} type="submit">
              {loading ? "Analyzing" : "Run Analysis"}
            </button>
          </form>
        </header>

        <section className="marketTape">
          {marketTape.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <b>{item.value}</b>
              <em className={item.change.startsWith("-") ? "down" : "up"}>{item.change}</em>
            </div>
          ))}
        </section>

        {error ? <div className="errorBox">{error}</div> : null}

        <section className="terminalGrid">
          <aside className="panel watchPanel">
            <div className="panelHead">
              <p className="eyebrow">Portfolio Watchlist</p>
              <span>{watchlistLoading ? "Scanning live" : `${liveWatchlist.length} names`}</span>
            </div>
            {watchlistError ? <p className="watchError">{watchlistError}</p> : null}
            <div className="watchTable">
              <div className="watchRow head">
                <span>Ticker</span>
                <span>Price</span>
                <span>Chg</span>
                <span>AI</span>
                <span>Signal</span>
              </div>
              {liveWatchlist.map((row) => (
                <button
                  className={`watchRow ${row.ticker === selectedTicker ? "active" : ""}`}
                  key={row.ticker}
                  onClick={() => selectTicker(row.ticker)}
                  type="button"
                >
                  <b>{row.ticker}</b>
                  <span>{formatCurrency(row.price)}</span>
                  <span className={row.change >= 0 ? "up" : "down"}>{row.change.toFixed(2)}%</span>
                  <span>{row.aiScore}</span>
                  <em className={signalClass(row.signal)}>{row.signal}</em>
                </button>
              ))}
            </div>
          </aside>

          <section className="mainStack">
            <div className="panel scorePanel">
              <div className="panelHead">
                <p className="eyebrow">Opportunity Engine</p>
                <span>{loading ? "Live query running" : "Research mode"}</span>
              </div>
              <div className="scoreDeck">
                <div className="scoreReadout">
                  <strong>{score}</strong>
                  <div>
                    <h2>
                      {selectedTicker} <span className={signalClass(signal)}>{signal}</span>
                    </h2>
                    <p>
                      {result?.explanation ??
                        "Mock watchlist values are displayed until a live backend analysis is executed."}
                    </p>
                  </div>
                </div>
                <div className="factorGrid">
                  <ScoreBar label="Trend" value={result?.trend_score ?? 70} />
                  <ScoreBar label="Momentum" value={momentum} />
                  <ScoreBar label="Volatility" value={result?.volatility_score ?? 64} />
                  <ScoreBar label="Volume" value={result?.volume_score ?? 68} />
                </div>
              </div>
            </div>

            <div className="metricGrid">
              <MetricTile label="Last Price" value={formatCurrency(result?.current_price ?? activeRow.price)} sub="Realtime proxy" />
              <MetricTile label="Expected Upside" value={result ? `${result.expected_upside_percent}%` : "8.4%"} sub="Target model" />
              <MetricTile label="Risk/Reward" value={result?.risk_reward_ratio ?? "2.1"} sub="Plan quality" />
              <MetricTile label="Risk Level" value={riskLevel} sub="Volatility adjusted" />
            </div>

            <div className="panel opportunitiesPanel">
              <div className="panelHead">
                <p className="eyebrow">Weekly Opportunities</p>
                <span>{opportunitiesLoading ? "Scanning universe" : `${opportunities.length || 10} ranked names`}</span>
              </div>
              {opportunitiesError ? <p className="watchError">{opportunitiesError}</p> : null}
              <div className="opportunityTable">
                <div className="opportunityRow head">
                  <span>Rank</span>
                  <span>Ticker</span>
                  <span>Score</span>
                  <span>Upside</span>
                  <span>R/R</span>
                  <span>Risk</span>
                  <span>Catalyst</span>
                </div>
                {(opportunities.length ? opportunities : []).map((item) => (
                  <button
                    className="opportunityRow"
                    key={`${item.rank}-${item.ticker}`}
                    onClick={() => runAnalysis(item.ticker)}
                    type="button"
                  >
                    <b>#{item.rank}</b>
                    <strong>{item.ticker}</strong>
                    <span>{item.opportunity_score}</span>
                    <span className={item.expected_upside_percent >= 0 ? "up" : "down"}>
                      {item.expected_upside_percent}%
                    </span>
                    <span>{item.risk_reward_ratio}</span>
                    <em>{item.risk_level}</em>
                    <small>{item.catalyst}</small>
                  </button>
                ))}
                {!opportunities.length && !opportunitiesLoading ? (
                  <p className="emptyState">Run backend scanner to rank this week's opportunity set.</p>
                ) : null}
              </div>
            </div>

            <div className="chartGrid">
              <MiniChart label="Price History" data={chartData.price} tone="blue" />
              <MiniChart label="AI Score History" data={chartData.ai} tone="amber" />
              <MiniChart label="Momentum Trend" data={chartData.momentum} tone="green" />
              <MiniChart label="Volatility" data={chartData.volatility} tone="red" />
              <MiniChart label="Backtest Equity Curve" data={chartData.backtest} tone="blue" />
            </div>

            <div className="panel tradePanel">
              <div className="panelHead">
                <p className="eyebrow">Trade Plan</p>
                <span>Structured research output</span>
              </div>
              <div className="tradeGrid">
                <MetricTile
                  label="Entry Zone"
                  value={
                    result
                      ? `${formatCurrency(result.entry_zone.low)} - ${formatCurrency(result.entry_zone.high)}`
                      : "$129.20 - $134.80"
                  }
                />
                <MetricTile label="Stop-Loss" value={formatCurrency(result?.stop_loss) || "$121.40"} />
                <MetricTile label="Target 1" value={formatCurrency(result?.target_1) || "$148.20"} />
                <MetricTile label="Target 2" value={formatCurrency(result?.target_2) || "$157.10"} />
                <MetricTile label="Support" value={formatCurrency(result?.support) || "$126.80"} />
                <MetricTile label="Resistance" value={formatCurrency(result?.resistance) || "$148.20"} />
              </div>
            </div>
          </section>

          <aside className="panel modelPanel">
            <div className="panelHead">
              <p className="eyebrow">Model Explanation</p>
              <span>AI reasoning layer</span>
            </div>
            <h2>{selectedTicker} Research Notes</h2>
            <ul>
              {assistantBullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="riskMatrix">
              <ScoreBar label="Trend Quality" value={result?.trend_score ?? 70} />
              <ScoreBar label="Momentum Quality" value={momentum} />
              <ScoreBar label="Volume Confirm" value={result?.volume_score ?? 68} />
            </div>
            <div className="dataStrip">
              <span>RSI {result?.rsi ?? "61.8"}</span>
              <span>MACD {result?.macd?.value ?? "1.42"}</span>
              <span>VOL {result ? `${result.volatility}%` : "24.6%"}</span>
            </div>
            {result?.warnings?.length ? (
              <div className="warningBox">
                {result.warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            ) : null}
          </aside>
        </section>

        <p className="disclaimer">For research and educational purposes only. Not financial advice.</p>
      </main>
    </>
  );
}
