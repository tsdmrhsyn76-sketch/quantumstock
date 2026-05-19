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
  catalyst_score: number;
  catalyst_count: number;
  catalyst_types: string[];
  top_headline: string;
  reason: string;
};

type NewsItem = {
  title: string;
  source: string;
  url: string;
  published_at?: string | null;
  summary?: string;
  catalyst_type: string;
};

type WeeklyReport = {
  generated_at: string;
  summary: string;
  methodology: string;
  universe_name?: string;
  scanned_count?: number;
  message?: string | null;
  catalyst_focus: string[];
  risk_watch: string[];
  market_regime: {
    label: string;
    risk_state: string;
    summary: string;
    vix?: number;
    spy_score?: number;
    qqq_score?: number;
  };
  top_idea?: OpportunityRow;
};

type CompanyProfile = {
  ticker: string;
  company_name: string;
  sector: string;
  industry: string;
  website: string;
  market_cap_display: string;
  beta?: number | null;
  trailing_pe?: number | null;
  forward_pe?: number | null;
  profit_margins?: number | null;
  revenue_growth?: number | null;
  target_mean_price?: number | null;
  upside_to_target_percent?: number | null;
  recommendation: string;
  analyst_count?: number | null;
  earnings_dates: string[];
  officers: { name: string; title: string }[];
  business_summary: string;
};

type ResearchMemo = {
  ticker: string;
  company_name: string;
  generated_at: string;
  signal: string;
  confidence_score: number;
  time_horizon: string;
  setup_type: string;
  summary: string;
  why_attractive: string[];
  key_risks: string[];
  entry_logic: string;
  catalyst_watch: {
    score: number;
    types: string[];
    top_headline: string;
  };
  invalidation: string[];
  monitor_before_buying: string[];
  trade_plan: {
    entry_zone: { low: number; high: number };
    stop_loss: number;
    target_1: number;
    target_2: number;
    expected_upside_percent: number;
    risk_reward_ratio: number;
  };
};

type CommitteeReport = {
  generated_at: string;
  title: string;
  recommended_action: string;
  message?: string | null;
  sections: { title: string; body: string }[];
  allocation_notes: {
    ticker: string;
    stance: string;
    score: number;
    risk: string;
    entry_zone: { low: number; high: number };
    stop_loss: number;
    target_1: number;
  }[];
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

const formatPercent = (value?: number | null) =>
  typeof value === "number" ? `${(value * 100).toFixed(1)}%` : "--";

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

function decisionLabel(item?: OpportunityRow | null) {
  if (!item) return "No Qualified Setup";
  if (item.signal === "BUY" && item.risk_reward_ratio >= 1.5 && item.risk_level !== "HIGH") {
    return "Strong Buy Setup";
  }
  if (item.signal === "BUY" || item.signal === "WATCH") {
    if (item.risk_reward_ratio < 1) return "Wait for Better Entry";
    if (item.risk_level === "HIGH") return "Watch for Entry";
    return "Watch for Confirmation";
  }
  if (item.expected_upside_percent >= 10 && item.risk_reward_ratio >= 1.5) {
    return "Research Candidate";
  }
  return "Avoid / High Risk";
}

function decisionTone(item?: OpportunityRow | null) {
  const label = decisionLabel(item);
  if (label === "Strong Buy Setup") return "buy";
  if (label.includes("Watch")) return "watch";
  if (label.includes("Wait") || label.includes("Research")) return "neutral";
  return "avoid";
}

export default function Home() {
  const [ticker, setTicker] = useState("NVDA");
  const [selectedTicker, setSelectedTicker] = useState("NVDA");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [liveWatchlist, setLiveWatchlist] = useState<WatchlistRow[]>(fallbackWatchlist);
  const [opportunities, setOpportunities] = useState<OpportunityRow[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [committeeReport, setCommitteeReport] = useState<CommitteeReport | null>(null);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(false);
  const [opportunitiesError, setOpportunitiesError] = useState("");
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState("");
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [researchMemo, setResearchMemo] = useState<ResearchMemo | null>(null);
  const [memoLoading, setMemoLoading] = useState(false);
  const [memoError, setMemoError] = useState("");
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [watchlistError, setWatchlistError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [minRiskReward, setMinRiskReward] = useState(0);
  const [signalFilter, setSignalFilter] = useState("ALL");
  const [maxRisk, setMaxRisk] = useState("ANY");

  const activeRow = liveWatchlist.find((row) => row.ticker === selectedTicker) ?? liveWatchlist[0];
  const score = result?.opportunity_score ?? activeRow.aiScore;
  const momentum = result?.momentum_score ?? activeRow.momentum;
  const volatility = result?.volatility ?? 24.6;
  const riskLevel = result?.risk_level ?? activeRow.risk;
  const signal = result?.signal ?? activeRow.signal;
  const topOpportunity = opportunities[0] ?? weeklyReport?.top_idea ?? null;
  const scannerUniverse = weeklyReport?.universe_name ?? "NASDAQ-100";
  const scannerCount = weeklyReport?.scanned_count ?? 40;
  const scannerDecision = committeeReport?.recommended_action ?? "Rank opportunities and wait for confirmation";
  const tradePlanSource = result
    ? {
        entryZone: result.entry_zone,
        stopLoss: result.stop_loss,
        target1: result.target_1 ?? result.target_price,
        target2: result.target_2,
        support: result.support,
        resistance: result.resistance,
        riskReward: result.risk_reward_ratio,
        upside: result.expected_upside_percent,
      }
    : researchMemo
      ? {
          entryZone: researchMemo.trade_plan.entry_zone,
          stopLoss: researchMemo.trade_plan.stop_loss,
          target1: researchMemo.trade_plan.target_1,
          target2: researchMemo.trade_plan.target_2,
          support: undefined,
          resistance: undefined,
          riskReward: researchMemo.trade_plan.risk_reward_ratio,
          upside: researchMemo.trade_plan.expected_upside_percent,
        }
      : null;
  const pendingTradePlanText = loading ? "Loading..." : "Run Analysis";
  const entryZoneText = tradePlanSource
    ? `${formatCurrency(tradePlanSource.entryZone.low)} - ${formatCurrency(tradePlanSource.entryZone.high)}`
    : pendingTradePlanText;

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
        const params = new URLSearchParams({
          universe: "NASDAQ100",
          scan_limit: "40",
          limit: "10",
          min_score: String(minScore),
          min_rr: String(minRiskReward),
          signal: signalFilter,
          max_risk: maxRisk,
        });
        const [weeklyResponse, committeeResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/weekly-report?${params.toString()}`),
          fetch(`${API_BASE_URL}/api/investment-committee-report?${params.toString()}`),
        ]);
        const data = await weeklyResponse.json();
        const committeeData = await committeeResponse.json();
        if (!weeklyResponse.ok) {
          throw new Error(data.detail || "Weekly report scan failed.");
        }
        if (!ignore) {
          setOpportunities(data.results ?? []);
          setWeeklyReport(data);
          setCommitteeReport(committeeResponse.ok ? committeeData : null);
          setOpportunitiesError("");
        }
      } catch (err) {
        if (!ignore) {
          setWeeklyReport(null);
          setCommitteeReport(null);
          setOpportunitiesError(err instanceof Error ? err.message : "Weekly report scan failed.");
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
  }, [maxRisk, minRiskReward, minScore, signalFilter]);

  useEffect(() => {
    let ignore = false;

    async function loadSelectedTickerContext() {
      setNewsLoading(true);
      setProfileLoading(true);
      setMemoLoading(true);
      setNewsError("");
      setProfileError("");
      setMemoError("");

      try {
        const [newsResponse, profileResponse, memoResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/news?ticker=${selectedTicker}&limit=6`),
          fetch(`${API_BASE_URL}/api/company-profile?ticker=${selectedTicker}`),
          fetch(`${API_BASE_URL}/api/research-memo?ticker=${selectedTicker}`),
        ]);
        const newsData = await newsResponse.json();
        const profileData = await profileResponse.json();
        const memoData = await memoResponse.json();

        if (!ignore) {
          if (newsResponse.ok) {
            setNewsItems(newsData.items ?? []);
          } else {
            setNewsItems([]);
            setNewsError(newsData.detail || "News fetch failed.");
          }

          if (profileResponse.ok) {
            setCompanyProfile(profileData);
          } else {
            setCompanyProfile(null);
            setProfileError(profileData.detail || "Company profile failed.");
          }

          if (memoResponse.ok) {
            setResearchMemo(memoData);
          } else {
            setResearchMemo(null);
            setMemoError(memoData.detail || "Research memo failed.");
          }
        }
      } catch (err) {
        if (!ignore) {
          setNewsItems([]);
          setCompanyProfile(null);
          setResearchMemo(null);
          const message = err instanceof Error ? err.message : "Selected ticker context failed.";
          setNewsError(message);
          setProfileError(message);
          setMemoError(message);
        }
      } finally {
        if (!ignore) {
          setNewsLoading(false);
          setProfileLoading(false);
          setMemoLoading(false);
        }
      }
    }

    loadSelectedTickerContext();
    return () => {
      ignore = true;
    };
  }, [selectedTicker]);

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

            <div className="panel topPickPanel">
              <div className="panelHead">
                <p className="eyebrow">Auto Opportunity Ranking</p>
                <span>{opportunitiesLoading ? "Scanning NASDAQ-100" : decisionLabel(topOpportunity)}</span>
              </div>
              <div className="topPickGrid">
                <div>
                  <span>Top Pick This Week</span>
                  <strong>{topOpportunity?.ticker ?? "--"}</strong>
                  <em className={decisionTone(topOpportunity)}>{decisionLabel(topOpportunity)}</em>
                </div>
                <div>
                  <span>Why It Ranks</span>
                  <p>
                    {topOpportunity
                      ? `${topOpportunity.ticker} ranks highest after scanning ${weeklyReport?.scanned_count ?? 40} NASDAQ-100 names and blending AI score, signal quality, risk/reward, upside, and catalyst tone.`
                      : "The system scans a broad NASDAQ-100 universe and ranks the strongest 10 qualified opportunities automatically."}
                  </p>
                </div>
                <div>
                  <span>Universe</span>
                  <p>
                    {weeklyReport?.universe_name ?? "NASDAQ-100"} coverage · {weeklyReport?.scanned_count ?? 40} names scanned for this MVP run.
                  </p>
                </div>
                <div>
                  <span>Trade Discipline</span>
                  <p>
                    {topOpportunity
                      ? `Entry ${formatCurrency(topOpportunity.entry_zone.low)} - ${formatCurrency(topOpportunity.entry_zone.high)} · R/R ${topOpportunity.risk_reward_ratio} · risk ${topOpportunity.risk_level}.`
                      : "No forced trade. If no candidate qualifies, the correct output is to wait."}
                  </p>
                </div>
              </div>
            </div>

            <div className="panel scannerPanel">
              <div className="panelHead">
                <p className="eyebrow">Universe Scanner</p>
                <span>{opportunitiesLoading ? "Live scan running" : "Weekly opportunity engine"}</span>
              </div>
              <div className="scannerGrid">
                <div>
                  <span>Universe</span>
                  <strong>{scannerUniverse}</strong>
                  <small>Broad NASDAQ opportunity set</small>
                </div>
                <div>
                  <span>Names Scanned</span>
                  <strong>{scannerCount}</strong>
                  <small>MVP scan limit for stable free data</small>
                </div>
                <div>
                  <span>Qualified Output</span>
                  <strong>{opportunities.length}</strong>
                  <small>Ranked candidates shown below</small>
                </div>
                <div>
                  <span>Committee Posture</span>
                  <strong>{topOpportunity ? decisionLabel(topOpportunity) : "Wait"}</strong>
                  <small>{scannerDecision}</small>
                </div>
              </div>
            </div>

            <details className="panel filterPanel">
              <summary>
                <span>
                  <b>Advanced Filters</b>
                  Fine-tune the scanner only when you want stricter rules.
                </span>
                <em>{opportunitiesLoading ? "Applying" : "Optional"}</em>
              </summary>
              <div className="filterGrid">
                <label>
                  Min AI Score
                  <input
                    max="100"
                    min="0"
                    onChange={(event) => setMinScore(Number(event.target.value))}
                    type="number"
                    value={minScore}
                  />
                </label>
                <label>
                  Min R/R
                  <input
                    max="10"
                    min="0"
                    onChange={(event) => setMinRiskReward(Number(event.target.value))}
                    step="0.1"
                    type="number"
                    value={minRiskReward}
                  />
                </label>
                <label>
                  Signal
                  <select onChange={(event) => setSignalFilter(event.target.value)} value={signalFilter}>
                    <option value="ALL">All</option>
                    <option value="BUY,WATCH">Buy + Watch</option>
                    <option value="BUY">Buy only</option>
                    <option value="WATCH">Watch only</option>
                  </select>
                </label>
                <label>
                  Max Risk
                  <select onChange={(event) => setMaxRisk(event.target.value)} value={maxRisk}>
                    <option value="ANY">Any</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </label>
              </div>
            </details>

            <div className="panel weeklyBriefPanel">
              <div className="panelHead">
                <p className="eyebrow">Weekly Research Brief</p>
                <span>{opportunitiesLoading ? "Building report" : weeklyReport?.market_regime.label ?? "Awaiting scan"}</span>
              </div>
              <div className="briefGrid">
                <div>
                  <strong>Market Regime</strong>
                  <p>{weeklyReport?.market_regime.summary ?? "The weekly scanner will summarize SPY, QQQ, and VIX conditions here."}</p>
                </div>
                <div>
                  <strong>Top Idea</strong>
                  <p>
                    {weeklyReport?.top_idea
                      ? `${weeklyReport.top_idea.ticker} leads with ${weeklyReport.top_idea.quality_score}/100 blended quality and ${weeklyReport.top_idea.catalyst_score}/100 catalyst score.`
                      : "Top ranked opportunity will appear after the backend finishes scanning."}
                  </p>
                </div>
                <div>
                  <strong>Focus List</strong>
                  <p>
                    Catalyst focus: {weeklyReport?.catalyst_focus?.length ? weeklyReport.catalyst_focus.join(", ") : "None yet"}.
                    {" "}Risk watch: {weeklyReport?.risk_watch?.length ? weeklyReport.risk_watch.join(", ") : "None flagged"}.
                  </p>
                </div>
              </div>
              <div className="committeePanel">
                <div className="committeeHeader">
                  <strong>Investment Committee Report</strong>
                  <span>{committeeReport ? "Generated" : "Pending"}</span>
                </div>
                <p>{committeeReport?.recommended_action ?? "Committee recommendation will appear after the report endpoint completes."}</p>
                <div className="committeeSections">
                  {(committeeReport?.sections ?? []).slice(0, 2).map((section) => (
                    <div key={section.title}>
                      <b>{section.title}</b>
                      <span>{section.body}</span>
                    </div>
                  ))}
                </div>
                {committeeReport?.allocation_notes?.length ? (
                  <div className="allocationList">
                    {committeeReport.allocation_notes.slice(0, 3).map((item) => (
                      <span key={`${item.ticker}-${item.stance}`}>
                        <b>{item.ticker}</b>
                        {item.stance} · score {item.score} · risk {item.risk}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="panel opportunitiesPanel">
              <div className="panelHead">
                <p className="eyebrow">Weekly Opportunities</p>
                <span>
                  {opportunitiesLoading
                    ? "Scanning NASDAQ-100"
                    : `${opportunities.length} ranked names · ${weeklyReport?.scanned_count ?? 40} scanned`}
                </span>
              </div>
              {opportunitiesError ? <p className="watchError">{opportunitiesError}</p> : null}
              <div className="opportunityTable">
                <div className="opportunityRow head">
                  <span>Rank</span>
                  <span>Ticker</span>
                  <span>Blend</span>
                  <span>AI</span>
                  <span>Upside</span>
                  <span>R/R</span>
                  <span>Cat</span>
                  <span>Headline</span>
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
                    <span>{item.quality_score}</span>
                    <span>{item.opportunity_score}</span>
                    <span className={item.expected_upside_percent >= 0 ? "up" : "down"}>
                      {item.expected_upside_percent}%
                    </span>
                    <span>{item.risk_reward_ratio}</span>
                    <em>{item.catalyst_score}</em>
                    <small>
                      <b>{decisionLabel(item)}</b>
                      {item.top_headline || item.catalyst}
                    </small>
                  </button>
                ))}
                {!opportunities.length && !opportunitiesLoading ? (
                  <p className="emptyState">
                    {weeklyReport?.message ??
                      "No qualified opportunities under current filters. Lower Min R/R, allow higher risk, or expand the signal filter."}
                  </p>
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
                <p className="eyebrow">Model Trade Plan</p>
                <span>Research-only price levels</span>
              </div>
              <p className="panelNote">
                These levels show where the model would monitor entry, invalidation, and upside. They are not buy or sell
                instructions.
              </p>
              <div className="tradeGrid">
                <MetricTile
                  label="Entry Watch Zone"
                  value={entryZoneText}
                  sub="Preferred area to monitor"
                />
                <MetricTile
                  label="Invalidation"
                  value={tradePlanSource ? formatCurrency(tradePlanSource.stopLoss) : pendingTradePlanText}
                  sub="Model stop-loss area"
                />
                <MetricTile
                  label="Target 1"
                  value={tradePlanSource ? formatCurrency(tradePlanSource.target1) : pendingTradePlanText}
                  sub="First upside objective"
                />
                <MetricTile
                  label="Target 2"
                  value={tradePlanSource ? formatCurrency(tradePlanSource.target2) : pendingTradePlanText}
                  sub="Extended upside scenario"
                />
                <MetricTile
                  label="Support"
                  value={typeof tradePlanSource?.support === "number" ? formatCurrency(tradePlanSource.support) : "Focused analysis"}
                  sub="Nearest demand zone"
                />
                <MetricTile
                  label="Resistance"
                  value={
                    typeof tradePlanSource?.resistance === "number"
                      ? formatCurrency(tradePlanSource.resistance)
                      : "Focused analysis"
                  }
                  sub="Nearest supply zone"
                />
                <MetricTile
                  label="Risk / Reward"
                  value={tradePlanSource ? `${tradePlanSource.riskReward}x` : pendingTradePlanText}
                  sub="Reward versus modeled risk"
                />
                <MetricTile
                  label="Modeled Upside"
                  value={tradePlanSource ? `${tradePlanSource.upside}%` : pendingTradePlanText}
                  sub="To first target"
                />
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
            <div className="memoPanel">
              <div className="panelHead compact">
                <p className="eyebrow">AI Research Memo</p>
                <span>{memoLoading ? "Generating" : researchMemo?.time_horizon ?? "Rule-based"}</span>
              </div>
              {memoError ? <p className="watchError">{memoError}</p> : null}
              {researchMemo ? (
                <>
                  <div className="memoHeader">
                    <strong>{researchMemo.confidence_score}</strong>
                    <div>
                      <b>{researchMemo.signal}</b>
                      <span>{researchMemo.setup_type}</span>
                    </div>
                  </div>
                  <p>{researchMemo.summary}</p>
                  <div className="memoSection">
                    <span>Why Attractive</span>
                    <ul>
                      {researchMemo.why_attractive.slice(0, 3).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="memoSection">
                    <span>Key Risk</span>
                    <ul>
                      {researchMemo.key_risks.slice(0, 3).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="memoSection">
                    <span>Before Buying</span>
                    <ul>
                      {researchMemo.monitor_before_buying.slice(0, 3).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : !memoLoading && !memoError ? (
                <p className="emptyState">Research memo will appear after the backend returns analysis context.</p>
              ) : null}
            </div>
            <div className="companyPanel">
              <div className="panelHead compact">
                <p className="eyebrow">Company Intelligence</p>
                <span>{profileLoading ? "Loading" : companyProfile?.sector ?? "Profile"}</span>
              </div>
              {profileError ? <p className="watchError">{profileError}</p> : null}
              {companyProfile ? (
                <>
                  <h3>{companyProfile.company_name}</h3>
                  <p>{companyProfile.industry}</p>
                  <div className="profileGrid">
                    <span>
                      Market Cap
                      <b>{companyProfile.market_cap_display}</b>
                    </span>
                    <span>
                      Forward P/E
                      <b>{companyProfile.forward_pe ?? "--"}</b>
                    </span>
                    <span>
                      Beta
                      <b>{companyProfile.beta ?? "--"}</b>
                    </span>
                    <span>
                      Rev Growth
                      <b>{formatPercent(companyProfile.revenue_growth)}</b>
                    </span>
                    <span>
                      Profit Margin
                      <b>{formatPercent(companyProfile.profit_margins)}</b>
                    </span>
                    <span>
                      Analyst Target
                      <b>{formatCurrency(companyProfile.target_mean_price ?? undefined)}</b>
                    </span>
                  </div>
                  <div className="eventStrip">
                    <span>Recommendation: {companyProfile.recommendation.toUpperCase()}</span>
                    <span>
                      Earnings: {companyProfile.earnings_dates.length ? companyProfile.earnings_dates.join(" / ") : "N/A"}
                    </span>
                  </div>
                  {companyProfile.officers.length ? (
                    <div className="officerList">
                      {companyProfile.officers.slice(0, 3).map((officer) => (
                        <span key={`${officer.name}-${officer.title}`}>
                          <b>{officer.name}</b>
                          {officer.title}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <p className="businessSummary">{companyProfile.business_summary}</p>
                </>
              ) : !profileLoading && !profileError ? (
                <p className="emptyState">Company profile will appear after the backend returns fundamentals.</p>
              ) : null}
            </div>
            <div className="newsPanel">
              <div className="panelHead compact">
                <p className="eyebrow">News & Catalysts</p>
                <span>{newsLoading ? "Loading" : `${newsItems.length} items`}</span>
              </div>
              {newsError ? <p className="watchError">{newsError}</p> : null}
              <div className="newsList">
                {newsItems.map((item) => (
                  <a href={item.url || "#"} key={item.title} rel="noreferrer" target="_blank">
                    <span>{item.catalyst_type}</span>
                    <strong>{item.title}</strong>
                    <small>{item.source}</small>
                  </a>
                ))}
                {!newsItems.length && !newsLoading && !newsError ? (
                  <p className="emptyState">No recent catalyst headlines returned for {selectedTicker}.</p>
                ) : null}
              </div>
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
