import Head from "next/head";

const revenueStreams = [
  {
    title: "Retail Pro Subscription",
    price: "$29 - $99 / month",
    text: "Advanced opportunity scans, AI analyst memos, watchlists, market regime context, and model trade plans for active investors.",
  },
  {
    title: "Professional Research Seat",
    price: "$199 - $499 / month",
    text: "Higher scan limits, saved portfolios, deeper risk analytics, exportable reports, alerts, and institutional research workflows.",
  },
  {
    title: "B2B / Advisor License",
    price: "$1,500+ / month",
    text: "Team dashboards for advisory firms, family offices, educators, boutique funds, and market research businesses.",
  },
  {
    title: "API / White Label",
    price: "Usage-based",
    text: "Opportunity scoring, trade-plan levels, market regime intelligence, and AI explanations embedded into partner products.",
  },
];

const roadmap = [
  "MVP: live stock analysis, NASDAQ opportunity scan, risk system, analyst memo",
  "Phase 2: accounts, saved watchlists, alerts, improved data providers, report export",
  "Phase 3: portfolio engine, sector exposure, correlation, drawdown, allocation simulator",
  "Phase 4: AI chat copilot, institutional workflows, API licensing, white-label dashboards",
];

const marketSegments = [
  "Active retail investors seeking disciplined research",
  "Financial educators and market research publishers",
  "Independent advisors and boutique wealth teams",
  "Small funds and family offices needing lightweight research infrastructure",
];

export default function InvestorPage() {
  return (
    <>
      <Head>
        <title>QuantumStock | Investor Overview</title>
        <meta
          name="description"
          content="QuantumStock investor overview, business model, revenue streams, and product roadmap."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="investorShell">
        <header className="investorHero">
          <nav>
            <a href="/">Terminal</a>
            <span>Investor Overview</span>
          </nav>
          <div>
            <p className="kicker">QuantumStock</p>
            <h1>Institutional AI Investment OS for Equity Opportunity Discovery</h1>
            <p>
              QuantumStock helps investors scan equity markets, identify high-quality setups, understand risk, and
              generate analyst-style reasoning before capital is deployed.
            </p>
          </div>
          <section className="investorStats">
            <div>
              <span>Core Product</span>
              <strong>AI Research Terminal</strong>
            </div>
            <div>
              <span>Initial Universe</span>
              <strong>NASDAQ-100</strong>
            </div>
            <div>
              <span>Business Model</span>
              <strong>SaaS + B2B</strong>
            </div>
          </section>
        </header>

        <section className="investorGrid">
          <article className="investorPanel large">
            <p className="eyebrow">Problem</p>
            <h2>Most investors have data, but not an operating system for decisions.</h2>
            <p>
              Retail and professional users are surrounded by charts, news, social sentiment, and raw market data. The
              gap is synthesis: which opportunities matter, what risk should be respected, and what should be monitored
              before acting.
            </p>
          </article>

          <article className="investorPanel">
            <p className="eyebrow">Solution</p>
            <h2>Opportunity engine plus explainable AI research.</h2>
            <p>
              QuantumStock ranks equities, produces model trade plans, evaluates market regime, and explains the setup
              through a structured analyst memo.
            </p>
          </article>

          <article className="investorPanel">
            <p className="eyebrow">Differentiation</p>
            <h2>Not a dashboard. A research workflow.</h2>
            <p>
              The product combines opportunity scoring, entry discipline, risk/reward, catalyst context, and portfolio
              posture instead of showing isolated charts.
            </p>
          </article>
        </section>

        <section className="investorSection">
          <div className="sectionHead">
            <p className="eyebrow">Revenue Model</p>
            <h2>Multiple monetization paths from individual users to institutional licensing.</h2>
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

        <section className="investorGrid">
          <article className="investorPanel">
            <p className="eyebrow">Target Customers</p>
            <h2>Built for research-heavy investors.</h2>
            <ul>
              {marketSegments.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="investorPanel">
            <p className="eyebrow">Why Now</p>
            <h2>AI is moving from content generation into decision infrastructure.</h2>
            <p>
              Investors need tools that combine market data, risk controls, and explainable AI. QuantumStock positions
              itself as the intelligence layer between raw data and disciplined research output.
            </p>
          </article>

          <article className="investorPanel large">
            <p className="eyebrow">Roadmap</p>
            <h2>From MVP terminal to institutional research platform.</h2>
            <ol>
              {roadmap.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
        </section>

        <section className="investorSection">
          <div className="sectionHead">
            <p className="eyebrow">Investor Summary</p>
            <h2>QuantumStock is building an AI-native equity research operating system.</h2>
            <p>
              The near-term opportunity is a subscription research terminal for active investors. The larger opportunity
              is B2B licensing: advisors, research publishers, fintech platforms, and boutique institutions can use
              QuantumStock scoring and explanation infrastructure inside their own workflows.
            </p>
          </div>
          <div className="summaryBand">
            <strong>QuantumStock</strong>
            <span>Find better opportunities. Understand the risk.</span>
          </div>
        </section>
      </main>
    </>
  );
}
