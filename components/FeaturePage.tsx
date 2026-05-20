import Head from "next/head";
import { featurePages, navItems, newsData } from "../lib/product-data";

type FeaturePageProps = {
  pageKey: string;
};

export default function FeaturePage({ pageKey }: FeaturePageProps) {
  const page = featurePages[pageKey] ?? featurePages.overview;
  const isNews = pageKey === "news";

  return (
    <>
      <Head>
        <title>{`${page.title} | QuantumStock`}</title>
        <meta name="description" content={page.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="qsTerminal featureTerminal">
        <aside className="qsSidebar">
          <a className="qsBrand" href="/">
            <span>Q</span>
            Quantum<strong>Stock</strong>
          </a>
          <nav className="qsNav" aria-label="Product navigation">
            {navItems.map((item) => (
              <a className={item.href === `/${pageKey}` ? "active" : ""} href={item.href} key={item.href}>
                <i aria-hidden="true">{item.label.slice(0, 1)}</i>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="premiumCard">
            <b>Pro Model</b>
            <p>Upgrade to unlock live institutional signals, portfolio stress tests, and advanced AI analyst mode.</p>
            <a href="/settings">Upgrade Now</a>
          </div>
          <div className="userCard">
            <span>Quantum User</span>
            <strong>Pro Preview</strong>
          </div>
        </aside>

        <section className="qsWorkspace">
          <header className="featureTopbar">
            <a className="featureBack" href="/">Terminal</a>
            <div>
              <a href="/settings">Settings</a>
            </div>
          </header>

          <section className="featureHero">
            <p className="kicker">{page.eyebrow}</p>
            <h1>{page.title}</h1>
            <p>{page.description}</p>
            <div className="featureStatus">
              <span>Prototype workspace</span>
              <b>{page.status}</b>
            </div>
          </section>

          <section className="featureGrid">
            {page.cards.map((card) => (
              <article className="qsCard featureCard" key={`${card.label}-${card.value}`}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <p>{card.text}</p>
              </article>
            ))}
          </section>

          {page.table ? (
            <section className="qsCard featureTableCard">
              <div className="qsCardHead">
                <span>{isNews ? "View All News" : "Workspace Preview"}</span>
                <em>Sample data</em>
              </div>
              <div className="featureTable">
                <div className="featureTableRow head">
                  {page.table.headers.map((header) => (
                    <span key={header}>{header}</span>
                  ))}
                </div>
                {page.table.rows.map((row) => (
                  <div className="featureTableRow" key={row.join("-")}>
                    {row.map((cell, index) => (
                      <span className={index === 0 ? "tickerCell" : ""} key={`${cell}-${index}`}>
                        {cell}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {isNews ? (
            <section className="qsCard fullNewsCard">
              <div className="qsCardHead">
                <span>News & Insights Feed</span>
                <em>Sample news</em>
              </div>
              <div className="fullNewsList">
                {newsData.map((item) => (
                  <article key={item.title}>
                    <div>
                      <b>{item.ticker}</b>
                      <em>{item.sentiment}</em>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.category} · {item.source} · {item.time}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="qsCard proGateCard">
            <span>Roadmap</span>
            <strong>Live data integration in progress</strong>
            <p>
              This workspace is structured for yfinance/FastAPI today and can later connect Finnhub, Polygon,
              Alpha Vantage, OpenAI analyst reasoning, and institutional news feeds.
            </p>
          </section>

          <footer className="qsFooter">
            <span><i /> Product Preview</span>
            <span>Sample data shown. Live data integration in progress.</span>
            <em>For research and educational purposes only. Not financial advice.</em>
          </footer>
        </section>
      </main>
    </>
  );
}
