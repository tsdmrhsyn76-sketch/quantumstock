import Head from "next/head";

const thesisMetrics = [
  { label: "Product wedge", value: "AI equity research terminal" },
  { label: "Initial market", value: "Active investors + advisors" },
  { label: "Model", value: "SaaS, B2B, API licensing" },
  { label: "Long-term path", value: "Investment intelligence OS" },
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
    allocation: "40%",
    text: "Accounts, saved portfolios, alerts, research export, portfolio analytics, AI copilot, and production-grade infrastructure.",
  },
  {
    title: "Data & AI Infrastructure",
    allocation: "25%",
    text: "Premium market data providers, news/catalyst feeds, model evaluation, scoring improvements, uptime, and security.",
  },
  {
    title: "Growth & Distribution",
    allocation: "20%",
    text: "Investor acquisition, financial creator partnerships, advisor outreach, content engine, and conversion experiments.",
  },
  {
    title: "Operations & Compliance",
    allocation: "15%",
    text: "Legal review, disclaimers, finance operations, customer support, documentation, and institutional sales readiness.",
  },
];

const currentStage = [
  "MVP is live: public frontend, deployed backend API, and a working AI research terminal experience.",
  "Core workflows exist: ticker analysis, NASDAQ opportunity ranking, market regime, portfolio risk posture, and analyst memo.",
  "Current need: turn the MVP into a paid product with accounts, saved workflows, alerts, stronger data, and customer analytics.",
  "Investment goal: fund 12-18 months of product, data, growth, and operating runway to validate paid retention and B2B demand.",
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
    phase: "Now",
    title: "MVP terminal",
    text: "Live stock analysis, NASDAQ-100 opportunity scan, market regime engine, portfolio risk posture, and analyst reasoning.",
  },
  {
    phase: "Next",
    title: "Retention layer",
    text: "User accounts, saved watchlists, alerts, exportable reports, improved data providers, and deeper company intelligence.",
  },
  {
    phase: "Scale",
    title: "Portfolio intelligence",
    text: "Correlation, sector exposure, drawdown monitoring, allocation simulation, and weekly investment committee reports.",
  },
  {
    phase: "Platform",
    title: "Licensing engine",
    text: "AI copilot, advisor workflows, API access, embedded research widgets, and white-label dashboards for partners.",
  },
];

const investorSummary = [
  "Clear wedge: start with opportunity discovery for equity investors.",
  "Revenue expansion: subscription first, professional seats second, B2B/API licensing third.",
  "Product defensibility: workflow data, scoring logic, research templates, and explainable AI output compound over time.",
  "Strategic vision: become the intelligence layer between market data and investment decision workflows.",
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
            <a href="/">Terminal</a>
            <span>Investor Overview</span>
          </nav>

          <section className="investorHeroGrid">
            <div className="investorHeroCopy">
              <p className="kicker">QuantumStock</p>
              <h1>AI-native equity research infrastructure for the next generation of investors.</h1>
              <p>
                QuantumStock turns market data, technical signals, company context, and risk discipline into a
                repeatable research workflow. The first product is a premium AI investment terminal; the larger
                opportunity is a licensed intelligence layer for advisors, publishers, fintech platforms, and boutique
                institutions.
              </p>
              <div className="investorActions">
                <a href="#summary">Investor Summary</a>
                <a href="#revenue">Revenue Model</a>
              </div>
            </div>

            <aside className="investorBrief" aria-label="Investment thesis">
              <span>Investment Thesis</span>
              <strong>From stock scanner to institutional research OS</strong>
              <p>
                The product begins with high-frequency research pain: finding quality opportunities, understanding risk,
                and explaining the setup quickly. That wedge can expand into saved workflows, team seats, APIs, and
                white-label research infrastructure.
              </p>
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
            <h2>Target raise: $500K - $1.5M pre-seed / seed.</h2>
            <p>
              Capital would be used to move from impressive prototype to commercial product: paid accounts, better data,
              retention loops, customer acquisition, and B2B sales preparation.
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
            <h2>From MVP terminal to licensed investment intelligence platform.</h2>
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
