import Head from "next/head";

const thesisMetrics = [
  { label: "Real-Time Data", value: "Live market analysis" },
  { label: "AI Insights", value: "Explainable research" },
  { label: "Risk Engine", value: "Entry, stop, targets" },
  { label: "Optimized Decisions", value: "Ranked opportunities" },
];

const heroFeatures = [
  {
    title: "AI Analyst",
    icon: "AI",
    text: "Analyst-style reasoning explains why a stock is attractive, what is risky, and what to monitor next.",
  },
  {
    title: "Quant Models",
    icon: "Q",
    text: "Momentum, trend, volatility, volume, support, resistance, and risk/reward are evaluated together.",
  },
  {
    title: "Risk Management",
    icon: "R",
    text: "Model trade plans define entry zones, invalidation levels, upside targets, and portfolio posture.",
  },
  {
    title: "Actionable Signals",
    icon: "S",
    text: "NASDAQ opportunities are ranked into clear watch, wait, and allocation-ready research outputs.",
  },
];

const terminalSignals = [
  { ticker: "NVDA", signal: "BUY", score: "92", upside: "+11.7%" },
  { ticker: "AMD", signal: "WATCH", score: "88", upside: "+9.3%" },
  { ticker: "MSFT", signal: "WATCH", score: "84", upside: "+6.8%" },
  { ticker: "AVGO", signal: "BUY", score: "81", upside: "+8.1%" },
];

const revenueStreams = [
  {
    title: "Retail Pro",
    price: "$29 - $99 / month",
    text: "Advanced opportunity scans, AI analyst memos, watchlists, market regime context, and model trade plans for self-directed investors.",
  },
  {
    title: "Professional Seat",
    price: "$199 - $499 / month",
    text: "Higher scan limits, saved portfolios, alerts, exportable research, risk dashboards, and institutional-grade workflow controls.",
  },
  {
    title: "Team / Advisor License",
    price: "$1,500+ / month",
    text: "Multi-seat dashboards for advisory teams, family offices, boutique funds, research publishers, and financial education businesses.",
  },
  {
    title: "API / White Label",
    price: "Usage based",
    text: "Opportunity scoring, market regime intelligence, trade-plan levels, and explainable AI research embedded into partner platforms.",
  },
];

const packages = [
  {
    name: "Starter",
    audience: "Active retail investors",
    price: "$29",
    features: ["Core ticker analysis", "Popular tech watchlist", "Market regime snapshot"],
  },
  {
    name: "Pro",
    audience: "Serious operators",
    price: "$99",
    features: ["NASDAQ opportunity scanner", "AI analyst memo", "Model trade plan", "Risk/reward ranking"],
    featured: true,
  },
  {
    name: "Desk",
    audience: "Professionals and teams",
    price: "$499+",
    features: ["Saved portfolios", "Report export", "Alerts", "Team workflows"],
  },
];

const growthProjection = [
  { year: "Year 1", subscribers: "1,000", arr: "$0.7M", growth: "Launch year", focus: "Paid MVP, conversion, retention" },
  { year: "Year 2", subscribers: "5,000", arr: "$3.8M", growth: "5.0x", focus: "Pro subscriptions, alerts, saved portfolios" },
  { year: "Year 3", subscribers: "18,000", arr: "$15M", growth: "3.9x", focus: "Advisor seats, reports, team workflows" },
  { year: "Year 4", subscribers: "45,000", arr: "$44M", growth: "2.9x", focus: "B2B licenses, API pilots, enterprise sales" },
  { year: "Year 5", subscribers: "100,000", arr: "$110M", growth: "2.5x", focus: "Platform scale, white-label distribution" },
];

const fundingUse = [
  {
    title: "Product & Engineering",
    allocation: "35%",
    text: "Accounts, saved portfolios, alerts, research export, portfolio analytics, AI copilot, billing, and production-grade infrastructure.",
  },
  {
    title: "Data & AI Infrastructure",
    allocation: "30%",
    text: "Premium market data providers, news/catalyst feeds, model evaluation, scoring improvements, uptime, and security.",
  },
  {
    title: "Growth & Distribution",
    allocation: "20%",
    text: "Investor acquisition, financial creator partnerships, advisor outreach, content engine, and conversion experiments.",
  },
  {
    title: "Operations, Compliance & Security",
    allocation: "15%",
    text: "Legal review, disclaimers, finance operations, customer support, documentation, and institutional sales readiness.",
  },
];

const currentStage = [
  "MVP is live: public frontend, deployed backend API, and a working AI research terminal experience.",
  "Core workflows exist: ticker analysis, NASDAQ opportunity ranking, market regime, portfolio risk posture, and analyst memo.",
  "Current need: turn the MVP into a paid product with accounts, saved workflows, alerts, stronger data, and customer analytics.",
  "Investment goal: fund 18-24 months of product, data, AI infrastructure, growth, and operating runway to validate paid retention and B2B demand.",
];

const whyNow = [
  {
    title: "Investors are overloaded",
    text: "Retail and professional users have more charts, news, social signals, and data feeds than they can synthesize consistently.",
  },
  {
    title: "Institutional systems are inaccessible",
    text: "Bloomberg-style terminals and portfolio systems are powerful, but expensive and built for large organizations.",
  },
  {
    title: "AI is changing research workflows",
    text: "The opportunity is not generic chat. It is AI reasoning connected to quantitative models, risk controls, and repeatable decision output.",
  },
  {
    title: "Decision support is moving upmarket",
    text: "Investors increasingly expect software to explain why an opportunity matters, what can go wrong, and what should be monitored next.",
  },
];

const competitivePositioning = [
  {
    platform: "Bloomberg-style terminal",
    reasoning: "Partial",
    tradePlans: "Limited",
    portfolioRisk: "Yes",
    interface: "Institutional",
  },
  {
    platform: "Charting platforms",
    reasoning: "Limited",
    tradePlans: "Partial",
    portfolioRisk: "Limited",
    interface: "Medium",
  },
  {
    platform: "Research publishers",
    reasoning: "Partial",
    tradePlans: "No",
    portfolioRisk: "Limited",
    interface: "Content-led",
  },
  {
    platform: "QuantumStock",
    reasoning: "Yes",
    tradePlans: "Yes",
    portfolioRisk: "In product roadmap",
    interface: "Institutional-grade",
    highlighted: true,
  },
];

const tractionSignals = [
  { metric: "Live MVP", label: "Frontend + backend deployed" },
  { metric: "NASDAQ-100", label: "Initial opportunity universe" },
  { metric: "AI memos", label: "Analyst reasoning workflow live" },
  { metric: "Risk engine", label: "Entry, stop, targets, posture" },
];

const marketOpportunity = [
  {
    title: "Fragmented research workflow",
    text: "Investors jump between screeners, charting tools, news feeds, spreadsheets, and social commentary without a unified decision layer.",
  },
  {
    title: "AI adoption window",
    text: "The market is moving from static dashboards toward AI systems that synthesize data, explain risk, and produce repeatable research output.",
  },
  {
    title: "Expandable customer base",
    text: "The same intelligence layer can serve retail users first, then advisors, educators, publishers, fintech apps, and boutique institutions.",
  },
];

const roadmap = [
  {
    phase: "Phase 1",
    title: "AI stock analysis MVP",
    text: "Live stock analysis, NASDAQ-100 opportunity scan, market regime engine, portfolio risk posture, and analyst reasoning.",
  },
  {
    phase: "Phase 2",
    title: "Portfolio risk engine",
    text: "Saved portfolios, exposure tracking, correlation, drawdown monitoring, alerts, and exportable research reports.",
  },
  {
    phase: "Phase 3",
    title: "Institutional terminal",
    text: "Professional workflows, watchlist intelligence, report automation, premium data integrations, and team seats.",
  },
  {
    phase: "Phase 4",
    title: "AI investment copilot",
    text: "Natural-language research assistant connected to scoring models, trade plans, company context, and risk controls.",
  },
  {
    phase: "Phase 5",
    title: "Multi-asset intelligence platform",
    text: "Expansion beyond equities into ETFs, options context, crypto, commodities, macro signals, APIs, and white-label distribution.",
  },
];

const investorSummary = [
  "Clear wedge: start with opportunity discovery for equity investors.",
  "Revenue expansion: subscription first, professional seats second, B2B/API licensing third.",
  "Product defensibility: workflow data, scoring logic, research templates, and explainable AI output compound over time.",
  "Strategic vision: become the intelligence layer between market data and investment decision workflows.",
];

const founderStory = [
  "Built from an operator's perspective, not only a software demo.",
  "Commodity, international trade, operational finance, and market experience shape the product's focus on risk, timing, and decision quality.",
  "The founder insight: investors do not need more disconnected screens; they need a system that explains opportunity, risk, and next action.",
];

export default function InvestorPage() {
  return (
    <>
      <Head>
        <title>QuantumStock | Investor Overview</title>
        <meta
          name="description"
          content="QuantumStock investor overview, business model, subscription packages, market opportunity, roadmap, and investor summary."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="investorShell">
        <header className="investorHero">
          <nav className="investorNav" aria-label="Investor navigation">
            <span className="brandMark">Quantum<span>Stock</span></span>
            <div>
              <a href="/">Terminal</a>
              <span>Investor Overview</span>
            </div>
          </nav>

          <section className="investorHeroGrid">
            <div className="investorHeroCopy">
              <p className="kicker">QuantumStock</p>
              <h1>
                AI-powered <span>investment intelligence</span>
              </h1>
              <p>
                Institutional-grade analytics, AI-driven insights, and disciplined risk models for smarter equity
                research decisions.
              </p>
              <div className="heroFeatureList">
                {heroFeatures.map((item) => (
                  <article key={item.title}>
                    <i aria-hidden="true">{item.icon}</i>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.text}</p>
                    </div>
                  </article>
                ))}
              </div>
              <div className="investorActions">
                <a href="/">Open Terminal</a>
                <a href="#revenue">Revenue Model</a>
              </div>
            </div>

            <aside className="terminalPreview" aria-label="QuantumStock terminal preview">
              <div className="previewTopbar">
                <b><span /> QuantumStock OS</b>
                <span>Dashboard</span>
                <span>Markets</span>
                <span>Portfolio</span>
                <em>Pro</em>
              </div>
              <div className="previewTape">
                {["SPY +0.68%", "QQQ +0.72%", "VIX -1.34%", "NVDA +2.08%"].map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <div className="previewGrid">
                <section className="previewOpportunity">
                  <small>Top Opportunity</small>
                  <strong>NVDA</strong>
                  <small>NVIDIA Corporation</small>
                  <span>$912.48</span>
                  <em>BUY</em>
                  <div>
                    <b>AI Score 92</b>
                    <b>Momentum 91</b>
                    <b>Risk 28</b>
                  </div>
                </section>
                <section className="previewChart">
                  <small>Price Chart</small>
                  <div className="previewTabs">
                    <b>1D</b>
                    <b>1W</b>
                    <b>1M</b>
                    <b>3M</b>
                  </div>
                  <svg viewBox="0 0 320 150" aria-hidden="true">
                    <path d="M0 120 H320 M0 88 H320 M0 56 H320 M0 24 H320" />
                    <polyline points="4,118 30,96 58,100 86,72 112,84 140,54 168,62 196,38 224,44 252,20 280,32 316,16" />
                    <rect x="20" y="112" width="8" height="24" />
                    <rect x="52" y="102" width="8" height="34" />
                    <rect x="84" y="118" width="8" height="18" />
                    <rect x="116" y="88" width="8" height="48" />
                    <rect x="148" y="96" width="8" height="40" />
                    <rect x="180" y="74" width="8" height="62" />
                    <rect x="212" y="82" width="8" height="54" />
                    <rect x="244" y="60" width="8" height="76" />
                    <rect x="276" y="72" width="8" height="64" />
                  </svg>
                </section>
                <section className="previewAnalyst">
                  <small>AI Analyst</small>
                  <p>
                    Momentum remains constructive above key moving averages. Position sizing should respect elevated
                    volatility and earnings risk.
                  </p>
                </section>
                <section className="previewTradePlan">
                  <small>Trade Plan</small>
                  <p>Entry $900 - $915</p>
                  <p>Stop $865</p>
                  <p>Target $950 / $1,020</p>
                  <p>R/R 2.8x</p>
                </section>
              </div>
              <div className="previewSignals">
                {terminalSignals.map((item) => (
                  <span key={item.ticker}>
                    <b>{item.ticker}</b>
                    <em>{item.signal}</em>
                    <strong>{item.score}</strong>
                    <i>{item.upside}</i>
                  </span>
                ))}
              </div>
            </aside>
          </section>

          <section className="investorStats">
            {thesisMetrics.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </section>
        </header>

        <section className="investorGrid investorThesisGrid">
          <article className="investorPanel large">
            <p className="eyebrow">Problem</p>
            <h2>Investors have more data than ever, but the decision workflow is still fragmented.</h2>
            <p>
              Most users combine charting tools, screeners, market news, spreadsheets, and intuition. The missing layer
              is synthesis: ranking what matters, explaining why it matters, and making the risk visible before capital
              is deployed.
            </p>
          </article>

          <article className="investorPanel">
            <p className="eyebrow">Solution</p>
            <h2>A research operating system, not another static dashboard.</h2>
            <p>
              QuantumStock scores opportunities, builds model trade plans, evaluates market regime, summarizes company
              context, and produces analyst-style reasoning in one workflow.
            </p>
          </article>

          <article className="investorPanel">
            <p className="eyebrow">Differentiation</p>
            <h2>Explainable AI plus disciplined market structure.</h2>
            <p>
              The platform connects trend, momentum, volatility, volume, risk/reward, catalysts, and portfolio posture
              so the output is actionable rather than generic.
            </p>
          </article>
        </section>

        <section className="investorSection convictionSection">
          <div className="sectionHead">
            <p className="eyebrow">Why Now</p>
            <h2>AI-assisted investment intelligence is moving from novelty into workflow infrastructure.</h2>
            <p>
              The timing is attractive because investor behavior, market complexity, and AI capability are converging.
              QuantumStock is positioned around explainable research output, not generic AI language.
            </p>
          </div>
          <div className="whyNowGrid">
            {whyNow.map((item) => (
              <article key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="investorSection">
          <div className="sectionHead">
            <p className="eyebrow">Competitive Positioning</p>
            <h2>QuantumStock combines AI reasoning, trade planning, and institutional-style workflow design.</h2>
            <p>
              This positioning snapshot shows the product direction against common research categories. The goal is to
              make opportunity discovery, risk discipline, and analyst-style explanation available in one system.
            </p>
          </div>
          <div className="competitiveTable" aria-label="Competitive positioning table">
            <div className="competitiveRow competitiveHead">
              <span>Platform</span>
              <span>AI Reasoning</span>
              <span>Trade Plans</span>
              <span>Portfolio Risk</span>
              <span>Institutional UI</span>
            </div>
            {competitivePositioning.map((item) => (
              <div className={item.highlighted ? "competitiveRow highlighted" : "competitiveRow"} key={item.platform}>
                <strong>{item.platform}</strong>
                <span>{item.reasoning}</span>
                <span>{item.tradePlans}</span>
                <span>{item.portfolioRisk}</span>
                <span>{item.interface}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="investorSection" id="revenue">
          <div className="sectionHead">
            <p className="eyebrow">Revenue Model</p>
            <h2>Four monetization paths with a natural expansion ladder.</h2>
            <p>
              QuantumStock can start with individual subscriptions, then move upmarket into professional seats, team
              licensing, and embedded intelligence products.
            </p>
          </div>
          <div className="revenueGrid">
            {revenueStreams.map((item) => (
              <article key={item.title}>
                <span>{item.price}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="investorSection">
          <div className="sectionHead">
            <p className="eyebrow">Early Signals</p>
            <h2>The MVP already demonstrates the core research loop investors need to trust.</h2>
            <p>
              Before scaling paid acquisition, the important signal is whether the product can generate structured,
              repeatable investment research from live market inputs.
            </p>
          </div>
          <div className="tractionGrid">
            {tractionSignals.map((item) => (
              <article key={item.metric}>
                <strong>{item.metric}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="investorSection">
          <div className="sectionHead">
            <p className="eyebrow">Subscription Packages</p>
            <h2>Pricing architecture designed for retail entry and professional expansion.</h2>
          </div>
          <div className="packageGrid">
            {packages.map((item) => (
              <article className={item.featured ? "packageCard featured" : "packageCard"} key={item.name}>
                <div>
                  <span>{item.audience}</span>
                  <h3>{item.name}</h3>
                </div>
                <strong>{item.price}</strong>
                <ul>
                  {item.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="investorSection projectionSection">
          <div className="sectionHead">
            <p className="eyebrow">Projected Growth Model</p>
            <h2>Illustrative five-year scenario built around subscriptions, professional seats, and B2B expansion.</h2>
            <p>
              These are planning assumptions, not guaranteed results. The model shows how QuantumStock could scale if
              product retention, paid conversion, data quality, and distribution partnerships improve year by year.
            </p>
          </div>

          <div className="projectionTable" aria-label="Five year growth projection">
            <div className="projectionRow projectionHead">
              <span>Year</span>
              <span>Paid Subscribers</span>
              <span>Estimated ARR</span>
              <span>Growth</span>
              <span>Operating Focus</span>
            </div>
            {growthProjection.map((item) => (
              <div className="projectionRow" key={item.year}>
                <strong>{item.year}</strong>
                <span>{item.subscribers}</span>
                <span>{item.arr}</span>
                <span>{item.growth}</span>
                <p>{item.focus}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="investorGrid fundingGrid">
          <article className="investorPanel large">
            <p className="eyebrow">Current Stage</p>
            <h2>QuantumStock is in live MVP stage and ready for productization.</h2>
            <div className="summaryGrid stageGrid">
              {currentStage.map((item) => (
                <div key={item}>
                  <span />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="investorPanel">
            <p className="eyebrow">Investment Need</p>
            <h2>Target raise: $2M - $5M seed round.</h2>
            <p>
              Capital would fund 18-24 months of product development, premium data infrastructure, AI research systems,
              go-to-market execution, compliance readiness, security hardening, and B2B sales preparation.
            </p>
          </article>
        </section>

        <section className="investorSection">
          <div className="sectionHead">
            <p className="eyebrow">Use of Funds</p>
            <h2>Investment converts directly into product depth, data quality, distribution, and operational readiness.</h2>
          </div>
          <div className="fundingUseGrid">
            {fundingUse.map((item) => (
              <article key={item.title}>
                <span>{item.allocation}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="investorGrid">
          <article className="investorPanel large">
            <p className="eyebrow">Market Opportunity</p>
            <h2>AI research infrastructure can sit between raw market data and investor decisions.</h2>
            <div className="opportunityStack">
              {marketOpportunity.map((item) => (
                <div key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="investorPanel">
            <p className="eyebrow">Target Customers</p>
            <h2>Built for users who need repeatable research output.</h2>
            <ul>
              <li>Active self-directed investors</li>
              <li>Financial educators and research publishers</li>
              <li>Independent advisors and boutique wealth teams</li>
              <li>Small funds and family offices</li>
            </ul>
          </article>

          <article className="investorPanel">
            <p className="eyebrow">Why Now</p>
            <h2>AI is shifting from content generation to decision infrastructure.</h2>
            <p>
              Investors do not only need summaries. They need systems that connect signals, risk controls, and
              explainable output inside a workflow they can repeat every week.
            </p>
          </article>
        </section>

        <section className="investorSection">
          <div className="sectionHead">
            <p className="eyebrow">Roadmap</p>
            <h2>From AI stock analysis MVP to multi-asset investment intelligence platform.</h2>
          </div>
          <div className="roadmapGrid">
            {roadmap.map((item) => (
              <article key={item.phase}>
                <span>{item.phase}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="investorGrid">
          <article className="investorPanel large">
            <p className="eyebrow">Founder Story</p>
            <h2>Built by an operator with real exposure to markets, trade, and financial decision pressure.</h2>
            <div className="summaryGrid stageGrid">
              {founderStory.map((item) => (
                <div key={item}>
                  <span />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="investorPanel">
            <p className="eyebrow">Positioning</p>
            <h2>Institutional-grade investment intelligence powered by AI reasoning.</h2>
            <p>
              QuantumStock is not trying to replace human judgment. It helps investors see better setups, understand
              risk faster, and turn scattered market inputs into disciplined research output.
            </p>
          </article>
        </section>

        <section className="investorSection" id="summary">
          <div className="sectionHead">
            <p className="eyebrow">Investor Summary</p>
            <h2>QuantumStock is building the AI decision layer for equity research workflows.</h2>
            <p>
              The near-term wedge is a premium research terminal for active equity investors. The strategic opportunity
              is a platform business: reusable scoring, risk, reporting, and explanation infrastructure that can be sold
              as seats, team licenses, APIs, and white-label products.
            </p>
          </div>

          <div className="summaryGrid">
            {investorSummary.map((item) => (
              <div key={item}>
                <span />
                <p>{item}</p>
              </div>
            ))}
          </div>

          <div className="summaryBand">
            <strong>QuantumStock</strong>
            <span>Find better opportunities. Understand the risk. Build repeatable research.</span>
          </div>
        </section>
      </main>
    </>
  );
}
