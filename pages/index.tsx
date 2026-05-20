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
  stop_loss: number;
  target_1: number;
  target_2: number;
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
  { ticker: "AVGO", price: 178.4, change: 0.88, aiScore: 76, momentum: 72, risk: "MED", signal: "WATCH" },
  { ticker: "ORCL", price: 136.8, change: 0.31, aiScore: 66, momentum: 58, risk: "MED", signal: "WATCH" },
  { ticker: "CRM", price: 286.2, change: -0.44, aiScore: 61, momentum: 55, risk: "MED", signal: "NEUTRAL" },
  { ticker: "NFLX", price: 622.4, change: 1.22, aiScore: 70, momentum: 67, risk: "MED", signal: "WATCH" },
  { ticker: "ADBE", price: 531.6, change: -0.21, aiScore: 63, momentum: 54, risk: "LOW", signal: "NEUTRAL" },
  { ticker: "QCOM", price: 205.7, change: 0.74, aiScore: 69, momentum: 64, risk: "MED", signal: "WATCH" },
  { ticker: "AMAT", price: 214.5, change: 0.96, aiScore: 72, momentum: 70, risk: "MED", signal: "WATCH" },
  { ticker: "PANW", price: 326.9, change: 0.52, aiScore: 67, momentum: 62, risk: "MED", signal: "WATCH" },
  { ticker: "CRWD", price: 352.1, change: 1.48, aiScore: 73, momentum: 75, risk: "HIGH", signal: "WATCH" },
  { ticker: "PLTR", price: 24.8, change: 2.35, aiScore: 65, momentum: 71, risk: "HIGH", signal: "WATCH" },
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

function TerminalPriceChart({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = 8 + (index / Math.max(data.length - 1, 1)) * 84;
      const y = 78 - ((value - min) / range) * 56;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="terminalPriceSvg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M8 78 H94 M8 60 H94 M8 42 H94 M8 24 H94" />
      <polyline points={points} />
      {data.slice(-12).map((value, index) => (
        <rect
          height={12 + ((value - min) / range) * 20}
          key={`${value}-${index}`}
          width="2.8"
          x={10 + index * 7}
          y={82 - (12 + ((value - min) / range) * 20)}
        />
      ))}
    </svg>
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
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState([
    {
      role: "assistant",
      text: "Ask about the selected stock, trade plan, risk, catalyst, or market regime. I will answer from the current model output.",
    },
  ]);

  const activeRow = liveWatchlist.find((row) => row.ticker === selectedTicker) ?? liveWatchlist[0];
  const score = result?.opportunity_score ?? activeRow.aiScore;
  const momentum = result?.momentum_score ?? activeRow.momentum;
  const volatility = result?.volatility ?? 24.6;
  const riskLevel = result?.risk_level ?? activeRow.risk;
  const signal = result?.signal ?? activeRow.signal;
  const topOpportunity = opportunities[0] ?? weeklyReport?.top_idea ?? null;
  const scannerUniverse = weeklyReport?.universe_name ?? "NASDAQ-100";
  const scannerCount = weeklyReport?.scanned_count ?? 30;
  const scannerDecision = committeeReport?.recommended_action ?? "Rank opportunities and wait for confirmation";
  const marketRegime = weeklyReport?.market_regime;
  const marketAction =
    marketRegime?.risk_state === "Constructive"
      ? "Increase Exposure Selectively"
      : marketRegime?.risk_state === "Elevated"
        ? "Reduce Risk"
        : marketRegime?.risk_state === "Neutral"
          ? "Stay Selective"
          : "Await Signal";
  const regimeTone =
    marketRegime?.risk_state === "Constructive"
      ? "buy"
      : marketRegime?.risk_state === "Elevated"
        ? "avoid"
        : "neutral";
  const portfolioRisk = useMemo(() => {
    const count = opportunities.length || 1;
    const averageScore = opportunities.length
      ? Math.round(opportunities.reduce((sum, item) => sum + item.quality_score, 0) / count)
      : 0;
    const averageRiskReward = opportunities.length
      ? opportunities.reduce((sum, item) => sum + item.risk_reward_ratio, 0) / count
      : 0;
    const highRiskCount = opportunities.filter((item) => item.risk_level === "HIGH").length;
    const buyWatchCount = opportunities.filter((item) => ["BUY", "WATCH"].includes(item.signal)).length;
    const highRiskPercent = opportunities.length ? Math.round((highRiskCount / opportunities.length) * 100) : 0;
    const posture =
      !opportunities.length || averageScore < 45
        ? "Cash-Heavy"
        : highRiskPercent >= 45
          ? "Conservative"
          : averageRiskReward >= 1.5 && buyWatchCount >= 4
            ? "Balanced"
            : "Selective";
    const note =
      posture === "Balanced"
        ? "Portfolio can stage exposure across top-ranked names with normal risk controls."
        : posture === "Conservative"
          ? "High-risk concentration is elevated; size positions smaller and wait for cleaner entries."
          : posture === "Selective"
            ? "The scanner found candidates, but entries should be staged only near model zones."
            : "No broad allocation signal. Preserve cash until the opportunity book improves.";

    return {
      averageScore,
      averageRiskReward,
      highRiskCount,
      highRiskPercent,
      buyWatchCount,
      posture,
      note,
    };
  }, [opportunities]);
  const watchlistIntelligence = useMemo(() => {
    const byScore = [...liveWatchlist].sort((a, b) => b.aiScore - a.aiScore);
    const byMomentum = [...liveWatchlist].sort((a, b) => b.momentum - a.momentum);
    const byRisk = [...liveWatchlist].sort((a, b) => {
      const riskRank: Record<string, number> = { HIGH: 3, MED: 2, MEDIUM: 2, LOW: 1 };
      return (riskRank[b.risk] ?? 0) - (riskRank[a.risk] ?? 0) || b.aiScore - a.aiScore;
    });
    const reboundCandidate =
      [...liveWatchlist].filter((row) => row.change < 0).sort((a, b) => b.aiScore - a.aiScore)[0] ?? byScore[0];

    return [
      { label: "Best Setup", value: byScore[0]?.ticker ?? "--", sub: `${byScore[0]?.aiScore ?? "--"} AI score` },
      {
        label: "Momentum Leader",
        value: byMomentum[0]?.ticker ?? "--",
        sub: `${byMomentum[0]?.momentum ?? "--"} momentum`,
      },
      { label: "Highest Risk", value: byRisk[0]?.ticker ?? "--", sub: `${byRisk[0]?.risk ?? "--"} risk` },
      {
        label: "Pullback Watch",
        value: reboundCandidate?.ticker ?? "--",
        sub:
          typeof reboundCandidate?.change === "number"
            ? `${reboundCandidate.change.toFixed(2)}% daily change`
            : "Awaiting data",
      },
    ];
  }, [liveWatchlist]);
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
  const analysisDataState = result ? "Live analysis" : loading ? "Loading live data" : "Watchlist proxy";
  const chartDataState = result?.charts ? "Live/recent price data" : "Sample trend preview";
  const tradePlanDataState = tradePlanSource ? "Calculated by model" : "Run analysis required";

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
          scan_limit: "30",
          limit: "10",
          min_score: String(minScore),
          min_rr: String(minRiskReward),
          signal: signalFilter,
          max_risk: maxRisk,
        });
        const weeklyResponse = await fetch(`${API_BASE_URL}/api/weekly-report?${params.toString()}`);
        const data = await weeklyResponse.json();
        if (!weeklyResponse.ok) {
          throw new Error(data.detail || "Weekly report scan failed.");
        }
        const rows: OpportunityRow[] = data.results ?? [];
        const buyCount = rows.filter((item) => item.signal === "BUY").length;
        const watchCount = rows.filter((item) => item.signal === "WATCH").length;
        const highRiskCount = rows.filter((item) => item.risk_level === "HIGH").length;
        const derivedCommittee: CommitteeReport = {
          generated_at: data.generated_at,
          title: "QuantumStock Investment Committee Snapshot",
          recommended_action:
            data.market_regime?.risk_state === "Constructive" && buyCount
              ? "Consider staged exposure only in the highest-quality setups"
              : highRiskCount >= 4
                ? "Stay defensive; high-risk concentration is elevated"
                : "Build watchlist and wait for cleaner entry confirmation",
          sections: [
            {
              title: "Executive View",
              body:
                data.summary ??
                "The opportunity book is built from the current NASDAQ-100 scan and filtered through risk/reward discipline.",
            },
            {
              title: "Opportunity Book",
              body: `${buyCount} BUY, ${watchCount} WATCH, and ${highRiskCount} high-risk candidate(s) were identified across ${data.scanned_count ?? 30} scanned names.`,
            },
          ],
          allocation_notes: rows.slice(0, 3).map((item) => ({
            ticker: item.ticker,
            stance: item.signal === "BUY" ? "candidate for staged allocation" : "watch for entry confirmation",
            score: item.quality_score,
            risk: item.risk_level,
            entry_zone: item.entry_zone,
            stop_loss: item.stop_loss,
            target_1: item.target_1,
          })),
        };
        if (!ignore) {
          setOpportunities(rows);
          setWeeklyReport(data);
          setCommitteeReport(derivedCommittee);
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

  function buildAssistantReply(question: string) {
    const normalized = question.toLowerCase();
    if (!result && !researchMemo) {
      return `I need a focused analysis for ${selectedTicker} first. Click Run or New Analysis so I can use live/recent market data instead of watchlist proxy data.`;
    }
    if (normalized.includes("risk")) {
      return researchMemo?.key_risks?.[0] ?? `${selectedTicker} risk level is ${riskLevel}. Watch volatility, stop-loss discipline, and market regime before sizing any position.`;
    }
    if (normalized.includes("entry") || normalized.includes("buy") || normalized.includes("al")) {
      return tradePlanSource
        ? `${selectedTicker} entry watch zone is ${formatCurrency(tradePlanSource.entryZone.low)} - ${formatCurrency(tradePlanSource.entryZone.high)}. Invalidation is near ${formatCurrency(tradePlanSource.stopLoss)}. This is research only, not a buy instruction.`
        : `Run analysis first so the model can calculate an entry zone, stop-loss, and targets for ${selectedTicker}.`;
    }
    if (normalized.includes("target") || normalized.includes("tp") || normalized.includes("upside")) {
      return tradePlanSource
        ? `${selectedTicker} target 1 is ${formatCurrency(tradePlanSource.target1)}, target 2 is ${formatCurrency(tradePlanSource.target2)}, with modeled upside of ${tradePlanSource.upside}%.`
        : `Target levels are not available until analysis is completed.`;
    }
    if (normalized.includes("news") || normalized.includes("catalyst") || normalized.includes("haber")) {
      return researchMemo?.catalyst_watch?.top_headline
        ? `Current catalyst watch: ${researchMemo.catalyst_watch.top_headline}. Catalyst score is ${researchMemo.catalyst_watch.score}/100.`
        : `No strong catalyst headline is loaded yet for ${selectedTicker}.`;
    }
    if (normalized.includes("market") || normalized.includes("regime") || normalized.includes("piyasa")) {
      return marketRegime
        ? `Current regime is ${marketRegime.label} / ${marketRegime.risk_state}. Suggested posture: ${marketAction}.`
        : "Market regime is still loading. The engine uses SPY, QQQ, and VIX context.";
    }
    return researchMemo?.summary ?? `${selectedTicker} is classified as ${signal} with score ${score}/100. Monitor the trade plan, market regime, and risk/reward before making any decision.`;
  }

  function onAssistantSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = assistantInput.trim();
    if (!question) return;
    const reply = buildAssistantReply(question);
    setAssistantMessages((messages) => [
      ...messages,
      { role: "user", text: question },
      { role: "assistant", text: reply },
    ]);
    setAssistantInput("");
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

      <main className="qsTerminal">
        <aside className="qsSidebar">
          <a className="qsBrand" href="/">
            <span>Q</span>
            Quantum<strong>Stock</strong>
          </a>
          <nav className="qsNav" aria-label="Terminal navigation">
            {["Overview", "Market Pulse", "Stock Screener", "Quant Signals", "AI Analytics", "Portfolio Risk", "Backtesting", "Alerts", "News Feed", "Economic Calendar", "Settings"].map((item, index) => (
              <button className={index === 0 ? "active" : ""} key={item} type="button">
                <i aria-hidden="true">{item.slice(0, 1)}</i>
                {item}
              </button>
            ))}
          </nav>
          <div className="premiumCard">
            <b>Unlock Premium</b>
            <p>Get advanced analytics, real-time signals, and portfolio insights.</p>
            <button type="button">Upgrade Now</button>
          </div>
          <div className="userCard">
            <span>Quantum User</span>
            <strong>Pro Plan</strong>
          </div>
        </aside>

        <section className="qsWorkspace">
          <header className="qsTopbar">
            <form className="qsSearch" onSubmit={onSubmit}>
              <input
                aria-label="Search ticker"
                onChange={(event) => setTicker(event.target.value.toUpperCase())}
                placeholder="Search ticker, company..."
                value={ticker}
              />
              <button disabled={loading} type="submit">{loading ? "..." : "Run"}</button>
            </form>
            <div className="qsTopActions">
              <span>☼</span>
              <span>◌</span>
              <b>Pro</b>
            </div>
          </header>

          <section className="qsMarketStrip">
            {marketTape.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <em className={item.change.startsWith("-") ? "down" : "up"}>{item.change}</em>
              </div>
            ))}
          </section>
          <div className="dataStateBar">
            <span><b>Live</b> ticker analysis, watchlist, opportunity scanner, research memo, company profile, news</span>
            <span><b>Sample</b> market tape, portfolio exposure allocation, broad sentiment split</span>
          </div>

          {error ? <div className="errorBox">{error}</div> : null}

          <section className="qsPrimaryGrid">
            <article className="qsCard topOpportunityCard">
              <div className="qsCardHead">
                <span>Top Opportunity</span>
                <button type="button">{analysisDataState}</button>
              </div>
              <h2>{selectedTicker}</h2>
              <p>{companyProfile?.company_name ?? `${selectedTicker} research book`}</p>
              <div className="priceLine">
                <strong>{formatCurrency(result?.current_price ?? activeRow.price)}</strong>
                <span>USD</span>
              </div>
              <em className={activeRow.change >= 0 ? "up" : "down"}>{activeRow.change >= 0 ? "+" : ""}{activeRow.change.toFixed(2)}%</em>
              <button className={signalClass(signal)} type="button">{signal}</button>
              <div className="scoreMiniGrid">
                <span><b>{score}</b>AI Score</span>
                <span><b>{result?.trend_score ?? 70}</b>Trend</span>
                <span><b>{momentum}</b>Momentum</span>
                <span><b>{riskLevel}</b>Risk</span>
              </div>
            </article>

            <article className="qsCard chartTerminalCard">
              <div className="qsCardHead">
                <span>Price Chart</span>
                <div className="chartTabs"><em>{chartDataState}</em><b>1D</b><b>1W</b><b>1M</b><b>3M</b><b>1Y</b></div>
              </div>
              <TerminalPriceChart data={chartData.price} />
            </article>

            <article className="qsCard aiTerminalCard">
              <div className="qsCardHead">
                <span>AI Analyst</span>
                <button type="button" onClick={() => runAnalysis(selectedTicker)}>New Analysis</button>
              </div>
              {loading ? <p className="loadingText">Loading live/recent market analysis for {selectedTicker}...</p> : null}
              {memoError ? <p className="watchError">{memoError}</p> : null}
              <h3>Summary</h3>
              <p>{researchMemo?.summary ?? assistantBullets[0]}</p>
              <div className="aiStats">
                <span><b>{researchMemo?.signal ?? signal}</b>Bias</span>
                <span><b>{researchMemo?.confidence_score ?? score}%</b>Confidence</span>
              </div>
              <div className="assistantChat">
                <div>
                  {assistantMessages.slice(-4).map((message, index) => (
                    <p className={message.role} key={`${message.role}-${index}`}>{message.text}</p>
                  ))}
                </div>
                <form onSubmit={onAssistantSubmit}>
                  <input
                    aria-label="Ask AI Assistant"
                    onChange={(event) => setAssistantInput(event.target.value)}
                    placeholder="Ask about risk, entry, target..."
                    value={assistantInput}
                  />
                  <button type="submit">Ask</button>
                </form>
              </div>
            </article>
          </section>

          <section className="qsSecondaryGrid">
            <article className="qsCard tradeTerminalCard">
              <div className="qsCardHead">
                <span>Trade Plan</span>
                <em>{tradePlanDataState}</em>
              </div>
              {!tradePlanSource ? <p className="loadingText">Run analysis to calculate entry, stop-loss, targets, and risk/reward.</p> : null}
              {[
                ["Entry Zone", entryZoneText],
                ["Stop Loss", tradePlanSource ? formatCurrency(tradePlanSource.stopLoss) : pendingTradePlanText],
                ["Target 1", tradePlanSource ? formatCurrency(tradePlanSource.target1) : pendingTradePlanText],
                ["Target 2", tradePlanSource ? formatCurrency(tradePlanSource.target2) : pendingTradePlanText],
                ["Expected Upside", tradePlanSource ? `${tradePlanSource.upside}%` : pendingTradePlanText],
                ["Risk / Reward", tradePlanSource ? `${tradePlanSource.riskReward}x` : pendingTradePlanText],
              ].map(([label, value]) => (
                <div key={label}><span>{label}</span><strong>{value}</strong></div>
              ))}
            </article>

            <article className="qsCard sentimentCard">
              <div className="qsCardHead"><span>Market Sentiment</span><em>Sample split</em></div>
              <div className="sentimentDial"><strong>{marketRegime?.spy_score ?? 64}</strong><span>{marketRegime?.risk_state ?? "Bullish"}</span></div>
              <div className="sentimentStats"><span>Bullish 64%</span><span>Neutral 24%</span><span>Bearish 12%</span></div>
            </article>

            <article className="qsCard exposureCard">
              <div className="qsCardHead"><span>Portfolio Exposure</span><em>Sample allocation</em></div>
              <div className="donut"><span>Total Value<br /><b>$1,248,430</b></span></div>
              <ul>
                <li>Technology <b>42.1%</b></li>
                <li>Healthcare <b>18.3%</b></li>
                <li>Financials <b>12.7%</b></li>
                <li>Cash <b>9.7%</b></li>
              </ul>
            </article>

            <article className="qsCard riskCard">
              <div className="qsCardHead"><span>Risk Summary</span><em>Calculated</em></div>
              <div><span>Portfolio Risk Score</span><strong>{portfolioRisk.highRiskPercent || 32}/100</strong></div>
              <div><span>Volatility (30D)</span><strong>{volatility}%</strong></div>
              <div><span>Risk Posture</span><strong>{portfolioRisk.posture}</strong></div>
              <button type="button">View Full Risk Report</button>
            </article>
          </section>

          <section className="qsBottomGrid">
            <article className="qsCard topSignalsCard">
              <div className="qsCardHead">
                <span>Top Signals</span>
                <em>{opportunitiesLoading ? "Scanning" : `${opportunities.length || liveWatchlist.length} names`}</em>
              </div>
              <div className="signalTable">
                <div className="signalRow head"><span>Ticker</span><span>Signal</span><span>AI Score</span><span>Price</span><span>Upside</span><span>Momentum</span><span>Risk</span><span>Action</span></div>
                {(opportunities.length ? opportunities.slice(0, 6) : liveWatchlist.slice(0, 6)).map((item) => {
                  const tickerValue = "ticker" in item ? item.ticker : "";
                  const itemSignal = "signal" in item ? item.signal : "WATCH";
                  const itemScore = "quality_score" in item ? item.quality_score : item.aiScore;
                  const itemPrice = "price" in item ? item.price : 0;
                  const upsideValue = "expected_upside_percent" in item ? `${item.expected_upside_percent}%` : `${item.change.toFixed(1)}%`;
                  const itemMomentum = "momentum" in item ? item.momentum : item.opportunity_score;
                  const itemRisk = "risk_level" in item ? item.risk_level : item.risk;
                  return (
                    <button className="signalRow" key={tickerValue} onClick={() => runAnalysis(tickerValue)} type="button">
                      <b>{tickerValue}</b>
                      <em className={signalClass(itemSignal)}>{itemSignal}</em>
                      <span>{itemScore}</span>
                      <span>{formatCurrency(itemPrice)}</span>
                      <span className={upsideValue.startsWith("-") ? "down" : "up"}>{upsideValue}</span>
                      <span>{itemMomentum}</span>
                      <span>{itemRisk}</span>
                      <i>↗</i>
                    </button>
                  );
                })}
              </div>
            </article>

            <article className="qsCard newsTerminalCard">
              <div className="qsCardHead"><span>News & Insights</span><a href="/investor">View All</a></div>
              <div className="terminalNewsList">
                {(newsItems.length ? newsItems.slice(0, 4) : []).map((item) => (
                  <a href={item.url || "#"} key={item.title} rel="noreferrer" target="_blank">
                    <b>{item.catalyst_type.slice(0, 2)}</b>
                    <span>{item.title}<small>{item.source}</small></span>
                  </a>
                ))}
                {!newsItems.length ? <p className="emptyState">No recent catalyst headlines returned for {selectedTicker}.</p> : null}
              </div>
            </article>
          </section>

          <footer className="qsFooter">
            <span><i /> Market Open</span>
            <span>S&P 500 5,349.34 <b>+0.63%</b></span>
            <span>NASDAQ 17,188.90 <b>+0.81%</b></span>
            <em>For research and educational purposes only. Not financial advice.</em>
          </footer>
        </section>
      </main>
    </>
  );
}
