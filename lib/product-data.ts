export const navItems = [
  { label: "Overview", href: "/overview" },
  { label: "Market Pulse", href: "/market-pulse" },
  { label: "Stock Screener", href: "/stock-screener" },
  { label: "Quant Signals", href: "/quant-signals" },
  { label: "AI Analytics", href: "/ai-analytics" },
  { label: "Portfolio Risk", href: "/portfolio-risk" },
  { label: "Backtesting", href: "/backtesting" },
  { label: "Alerts", href: "/alerts" },
  { label: "News Feed", href: "/news" },
  { label: "Economic Calendar", href: "/economic-calendar" },
  { label: "Settings", href: "/settings" },
];

export const newsData = [
  {
    title: "AI semiconductor leaders extend relative strength versus broader market",
    source: "QuantumStock Sample Wire",
    category: "AI & Semiconductors",
    time: "12m ago",
    ticker: "NVDA",
    sentiment: "Bullish",
  },
  {
    title: "Fed speakers keep rate-cut expectations data dependent before CPI release",
    source: "Macro Desk",
    category: "Fed / Macro",
    time: "41m ago",
    ticker: "SPY",
    sentiment: "Neutral",
  },
  {
    title: "Cloud software earnings revisions improve after enterprise demand update",
    source: "Earnings Monitor",
    category: "Earnings",
    time: "1h ago",
    ticker: "MSFT",
    sentiment: "Bullish",
  },
  {
    title: "Market rotation favors mega-cap quality while high-beta names remain volatile",
    source: "Market Structure",
    category: "Market Rotation",
    time: "2h ago",
    ticker: "QQQ",
    sentiment: "Neutral",
  },
  {
    title: "Large ETF inflows concentrate around AI infrastructure and cyber-security themes",
    source: "Flow Desk",
    category: "Institutional Flows",
    time: "3h ago",
    ticker: "CRWD",
    sentiment: "Bullish",
  },
  {
    title: "Electric vehicle leaders trade mixed as margin expectations remain under pressure",
    source: "Sector Desk",
    category: "Earnings",
    time: "4h ago",
    ticker: "TSLA",
    sentiment: "Cautious",
  },
];

export const screenerData = [
  { ticker: "NVDA", sector: "Semiconductors", aiScore: 92, momentum: 91, risk: "Medium", volume: "2.1x", signal: "BUY" },
  { ticker: "AVGO", sector: "Semiconductors", aiScore: 88, momentum: 84, risk: "Medium", volume: "1.7x", signal: "WATCH" },
  { ticker: "CRWD", sector: "Cybersecurity", aiScore: 84, momentum: 79, risk: "High", volume: "1.9x", signal: "WATCH" },
  { ticker: "MSFT", sector: "Cloud Software", aiScore: 82, momentum: 76, risk: "Low", volume: "1.2x", signal: "BUY" },
  { ticker: "AMAT", sector: "Semicap Equipment", aiScore: 79, momentum: 75, risk: "Medium", volume: "1.4x", signal: "WATCH" },
];

export const calendarData = [
  { event: "FOMC Minutes", category: "Fed", date: "This week", impact: "High" },
  { event: "CPI Inflation", category: "Macro", date: "Next release", impact: "High" },
  { event: "PPI Inflation", category: "Macro", date: "Next release", impact: "Medium" },
  { event: "Nonfarm Payrolls", category: "Jobs", date: "Monthly", impact: "High" },
  { event: "NVDA Earnings Window", category: "Earnings", date: "Upcoming", impact: "High" },
];

export const featurePages: Record<
  string,
  {
    title: string;
    eyebrow: string;
    description: string;
    status: string;
    cards: { label: string; value: string; text: string }[];
    table?: { headers: string[]; rows: string[][] };
  }
> = {
  overview: {
    eyebrow: "Product Overview",
    title: "Institutional AI equity research terminal.",
    description:
      "Overview consolidates opportunity ranking, market regime, trade plans, portfolio risk, analyst reasoning, and news context in one operating view.",
    status: "Live dashboard active. Advanced workspace personalization coming soon.",
    cards: [
      { label: "Opportunity Engine", value: "Online", text: "Ranks stocks by AI score, momentum, risk/reward, and catalyst quality." },
      { label: "Market Regime", value: "Active", text: "Tracks SPY, QQQ, and VIX context for exposure posture." },
      { label: "AI Analyst", value: "MVP", text: "Explains why a setup matters, what can go wrong, and what to monitor." },
    ],
  },
  "market-pulse": {
    eyebrow: "Market Pulse",
    title: "Market regime, index performance, volatility, and sector rotation.",
    description:
      "This workspace will monitor risk-on/risk-off conditions, VIX pressure, broad index trend, and macro context before allocating to single-name ideas.",
    status: "Sample data shown. Live macro data integration in progress.",
    cards: [
      { label: "Regime", value: "Selective Risk", text: "Momentum remains constructive, but volatility requires staged entries." },
      { label: "VIX", value: "17.8", text: "Volatility pressure remains moderate." },
      { label: "Sector Rotation", value: "AI Infra", text: "Semiconductors and AI infrastructure remain relative-strength leaders." },
      { label: "Macro Overview", value: "Fed Watch", text: "Rates and inflation releases remain the key market catalysts." },
    ],
  },
  "stock-screener": {
    eyebrow: "Stock Screener",
    title: "Filter the market by AI score, momentum, risk, volume, and sector.",
    description:
      "The screener is designed to become the main discovery engine for NASDAQ, S&P 500, and custom watchlist universes.",
    status: "Sample screener shown. Live universe filters coming soon.",
    cards: [
      { label: "AI Score Filter", value: "70+", text: "Prioritize high-quality model setups." },
      { label: "Momentum Filter", value: "65+", text: "Find stocks with improving relative strength." },
      { label: "Risk Filter", value: "Low-Med", text: "Avoid excessive volatility unless reward compensates." },
      { label: "Volume Filter", value: "1.5x", text: "Spot unusual participation and institutional interest." },
    ],
    table: {
      headers: ["Ticker", "Sector", "AI", "Momentum", "Risk", "Volume", "Signal"],
      rows: screenerData.map((row) => [row.ticker, row.sector, String(row.aiScore), String(row.momentum), row.risk, row.volume, row.signal]),
    },
  },
  "quant-signals": {
    eyebrow: "Quant Signals",
    title: "Buy, watch, and avoid signals with model explanation.",
    description:
      "Quant Signals groups opportunities by technical quality, trend alignment, volume confirmation, and risk/reward discipline.",
    status: "Signal engine MVP active. Institutional flow signals coming soon.",
    cards: [
      { label: "Top Buy Signals", value: "NVDA, MSFT", text: "High score with constructive risk/reward." },
      { label: "Watch Signals", value: "AVGO, AMAT", text: "Good quality, but entry discipline required." },
      { label: "Avoid Signals", value: "High beta", text: "Weak risk/reward or elevated volatility." },
      { label: "Signal Logic", value: "Explainable", text: "Trend, RSI, MACD, support, volume, and volatility are blended." },
    ],
  },
  "ai-analytics": {
    eyebrow: "AI Analytics",
    title: "AI analyst reasoning, confidence, and key driver breakdown.",
    description:
      "AI Analytics is the explainability layer for each stock: why attractive, key risk, entry logic, catalysts, and what to monitor next.",
    status: "Advanced AI analyst mode coming soon.",
    cards: [
      { label: "Model Confidence", value: "84%", text: "Confidence blends score quality, catalyst tone, and market regime." },
      { label: "Key Drivers", value: "5 factors", text: "Trend, momentum, volume, volatility, and support/resistance." },
      { label: "Reasoning", value: "Structured", text: "Analyst memo format instead of generic chatbot language." },
      { label: "Pro Lock", value: "Coming", text: "Upgrade to Pro to unlock live institutional AI explanations." },
    ],
  },
  "portfolio-risk": {
    eyebrow: "Portfolio Risk",
    title: "Exposure, beta, volatility, drawdown, and concentration risk.",
    description:
      "Portfolio Risk will help users understand not only which stocks rank well, but whether the full book is too concentrated or too volatile.",
    status: "Portfolio stress testing is available in Pro roadmap.",
    cards: [
      { label: "Sector Allocation", value: "42% Tech", text: "Sample allocation indicates concentration in technology." },
      { label: "Beta", value: "1.08", text: "Portfolio beta proxy versus broad market." },
      { label: "Volatility", value: "18.7%", text: "30-day realized volatility placeholder." },
      { label: "Drawdown", value: "-6.3%", text: "Maximum drawdown sample for current model book." },
    ],
  },
  backtesting: {
    eyebrow: "Backtesting",
    title: "Strategy results, equity curve, win rate, Sharpe, and drawdown.",
    description:
      "Backtesting will validate whether signal rules, entry zones, and risk/reward filters produce repeatable research outcomes over time.",
    status: "Backtesting preview. Full historical engine coming soon.",
    cards: [
      { label: "Equity Curve", value: "+34%", text: "Sample curve for illustrative signal strategy." },
      { label: "Win Rate", value: "58%", text: "Placeholder until historical engine is connected." },
      { label: "Sharpe Ratio", value: "1.42", text: "Risk-adjusted return sample metric." },
      { label: "Max Drawdown", value: "-8.9%", text: "Illustrative drawdown for strategy risk review." },
    ],
  },
  alerts: {
    eyebrow: "Alerts",
    title: "Price, signal, risk, and earnings alerts.",
    description:
      "Alerts will notify users when a stock enters its model entry zone, breaks invalidation, receives a new signal, or approaches earnings.",
    status: "Upgrade to Pro to unlock live institutional alerts.",
    cards: [
      { label: "Price Alerts", value: "Entry zone", text: "Notify when price enters model-defined buy watch zone." },
      { label: "Signal Alerts", value: "BUY/WATCH", text: "Notify when model signal changes." },
      { label: "Risk Alerts", value: "Stop-loss", text: "Notify when invalidation levels are tested." },
      { label: "Earnings Alerts", value: "Calendar", text: "Notify before earnings and macro events." },
    ],
  },
  news: {
    eyebrow: "News Feed",
    title: "Market news, sentiment, ticker tags, and catalyst categories.",
    description:
      "News Feed restores the dedicated news workspace with categorized headlines for AI, macro, earnings, market rotation, and institutional flows.",
    status: "Sample news shown. Live news API integration in progress.",
    cards: newsData.slice(0, 4).map((item) => ({
      label: item.category,
      value: item.ticker,
      text: `${item.title} (${item.source}, ${item.time}, ${item.sentiment})`,
    })),
    table: {
      headers: ["Ticker", "Category", "Sentiment", "Source", "Time", "Headline"],
      rows: newsData.map((item) => [item.ticker, item.category, item.sentiment, item.source, item.time, item.title]),
    },
  },
  "economic-calendar": {
    eyebrow: "Economic Calendar",
    title: "Fed events, CPI, PPI, jobs reports, earnings, and FOMC.",
    description:
      "Economic Calendar will connect macro releases and earnings dates to market regime and stock-level catalyst risk.",
    status: "Sample calendar shown. Live economic calendar integration in progress.",
    cards: calendarData.slice(0, 4).map((item) => ({
      label: item.category,
      value: item.impact,
      text: `${item.event} - ${item.date}`,
    })),
    table: {
      headers: ["Event", "Category", "Date", "Impact"],
      rows: calendarData.map((item) => [item.event, item.category, item.date, item.impact]),
    },
  },
  settings: {
    eyebrow: "Settings",
    title: "Profile, subscription, data sources, notifications, and API status.",
    description:
      "Settings will manage account profile, subscription tier, connected data providers, notification preferences, and backend API health.",
    status: "Account system coming soon.",
    cards: [
      { label: "Profile", value: "Quantum User", text: "User identity and workspace preferences." },
      { label: "Subscription", value: "Pro Plan", text: "Billing, plan limits, and premium modules." },
      { label: "Data Sources", value: "yfinance MVP", text: "Future support for Polygon, Finnhub, Alpha Vantage, and news APIs." },
      { label: "API Status", value: "Connected", text: "Frontend connects to deployed FastAPI backend." },
    ],
  },
};
