import {
  Activity,
  BarChart3,
  BrainCircuit,
  ChevronDown,
  LineChart,
  LockKeyhole,
  Radar,
  Search,
  ShieldAlert,
  Sigma,
  SlidersHorizontal,
  WalletCards,
  type LucideIcon
} from "lucide-react";
import type { ReactNode } from "react";
import {
  backtestBars,
  marketCards,
  marketOverview,
  quantSignals,
  riskMetrics,
  scoreDiagnostics,
  watchlist
} from "@/lib/market-data";

function SignalBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-7 items-center border border-amber-400/30 bg-amber-400/10 px-2.5 text-xs font-medium text-amber-200">
      {children}
    </span>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  eyebrow
}: {
  icon: LucideIcon;
  title: string;
  eyebrow: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300">
          <Icon className="h-3.5 w-3.5" />
          {eyebrow}
        </div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      <button
        aria-label={`${title} settings`}
        className="grid h-8 w-8 place-items-center border border-white/10 bg-white/[0.03] text-zinc-400 transition hover:border-amber-300/40 hover:text-amber-200"
        type="button"
      >
        <SlidersHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Dashboard() {
  return (
    <main className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-20 border-r border-white/10 bg-black/30 backdrop-blur-xl lg:block">
        <div className="flex h-full flex-col items-center py-6">
          <div className="grid h-10 w-10 place-items-center border border-amber-300/40 bg-amber-300/10 text-sm font-bold text-amber-200">
            QS
          </div>
          <nav className="mt-10 flex flex-1 flex-col gap-3 text-zinc-500">
            {[BarChart3, BrainCircuit, Sigma, ShieldAlert, LineChart, WalletCards].map((Icon, index) => (
              <button
                aria-label={`Dashboard module ${index + 1}`}
                className="grid h-10 w-10 place-items-center border border-transparent transition hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                key={index}
                type="button"
              >
                <Icon className="h-[18px] w-[18px]" />
              </button>
            ))}
          </nav>
          <LockKeyhole className="h-4 w-4 text-zinc-600" />
        </div>
      </aside>

      <div className="lg:pl-20">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                QuantumStock Research Terminal
              </p>
              <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                AI Quantitative Equity Dashboard
              </h1>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <div className="flex h-10 w-72 items-center gap-2 border border-white/10 bg-white/[0.03] px-3 text-sm text-zinc-500">
                <Search className="h-4 w-4" />
                Search ticker, factor, thesis
              </div>
              <button className="flex h-10 items-center gap-2 border border-white/10 bg-white/[0.03] px-3 text-sm text-zinc-300" type="button">
                US Equities
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="border border-white/10 bg-panel/90 p-5 shadow-terminal">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div>
                  <SignalBadge>Institutional Research Mode</SignalBadge>
                  <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
                    Multi-factor AI scoring for serious equity analysis.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                    A focused command center for market context, signal quality, portfolio risk,
                    and forward test assumptions. Built for data APIs and FastAPI services to plug in later.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:w-[31rem]">
                  {marketCards.map((item) => (
                    <div className="border border-white/10 bg-black/20 p-3" key={item.label}>
                      <p className="text-xs text-zinc-500">{item.label}</p>
                      <p className="mt-2 font-mono text-lg text-white">{item.value}</p>
                      <p className="mt-1 text-xs text-emerald-300">{item.change}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border border-white/10 bg-panel/90 p-5">
              <SectionHeader eyebrow="AI Stock Score" icon={BrainCircuit} title="NVDA Composite Score" />
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="font-mono text-6xl font-semibold text-white">92</p>
                  <p className="mt-2 text-sm text-zinc-400">High conviction, elevated valuation risk</p>
                </div>
                <div className="h-24 w-24 rounded-full border-[10px] border-amber-300/80 border-l-white/10 border-t-white/10" />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs">
                {scoreDiagnostics.map((item) => {
                  return (
                    <div className="border border-white/10 bg-white/[0.03] p-3" key={item.label}>
                      <p className="text-zinc-500">{item.label}</p>
                      <p className="mt-1 font-mono text-white">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <section className="border border-white/10 bg-panel/90 p-5">
              <SectionHeader eyebrow="Market Overview" icon={BarChart3} title="Macro & Breadth" />
              <div className="mt-5 space-y-4">
                {marketOverview.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-zinc-400">{item.label}</span>
                      <span className="font-mono text-zinc-100">{item.value}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10">
                      <div className="h-full bg-amber-300" style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-white/10 bg-panel/90 p-5">
              <SectionHeader eyebrow="Quant Signals" icon={Sigma} title="Factor Model" />
              <div className="mt-5 divide-y divide-white/10">
                {quantSignals.map((signal) => (
                  <div className="flex items-center justify-between py-3" key={signal.factor}>
                    <div>
                      <p className="text-sm font-medium text-white">{signal.factor}</p>
                      <p className="mt-1 text-xs text-zinc-500">{signal.state}</p>
                    </div>
                    <p className="font-mono text-lg text-amber-200">{signal.score}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-white/10 bg-panel/90 p-5">
              <SectionHeader eyebrow="Risk Metrics" icon={ShieldAlert} title="Exposure Profile" />
              <div className="mt-5 grid grid-cols-2 gap-3">
                {riskMetrics.map((metric) => (
                  <div className="border border-white/10 bg-black/20 p-4" key={metric.label}>
                    <p className="text-xs text-zinc-500">{metric.label}</p>
                    <p className="mt-2 font-mono text-xl text-white">{metric.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 border border-red-400/20 bg-red-400/10 p-3 text-xs leading-5 text-red-100">
                Concentration alert: AI semiconductor exposure is above model target.
              </div>
            </section>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.1fr]">
            <section className="border border-white/10 bg-panel/90 p-5">
              <SectionHeader eyebrow="Backtesting Preview" icon={LineChart} title="Strategy Simulation" />
              <div className="mt-5 h-56 border border-white/10 bg-black/25 p-4">
                <div className="flex h-full items-end gap-2">
                  {backtestBars.map((height, index) => (
                    <div className="flex flex-1 items-end" key={`${height}-${index}`}>
                      <div className="w-full bg-amber-300/80" style={{ height: `${height}%` }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-zinc-500">CAGR</p>
                  <p className="mt-1 font-mono text-white">18.4%</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Win Rate</p>
                  <p className="mt-1 font-mono text-white">61%</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Horizon</p>
                  <p className="mt-1 font-mono text-white">5Y</p>
                </div>
              </div>
            </section>

            <section className="border border-white/10 bg-panel/90 p-5">
              <SectionHeader eyebrow="Portfolio Watchlist" icon={WalletCards} title="AI Ranked Equities" />
              <div className="mt-5 overflow-x-auto border border-white/10">
                <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                  <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.12em] text-zinc-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Ticker</th>
                      <th className="px-4 py-3 font-medium">Thesis</th>
                      <th className="px-4 py-3 font-medium">Score</th>
                      <th className="px-4 py-3 font-medium">Day</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {watchlist.map((item) => (
                      <tr className="bg-black/10" key={item.ticker}>
                        <td className="px-4 py-3 font-mono text-white">{item.ticker}</td>
                        <td className="px-4 py-3 text-zinc-400">{item.thesis}</td>
                        <td className="px-4 py-3 font-mono text-amber-200">{item.score}</td>
                        <td className={item.day.startsWith("+") ? "px-4 py-3 font-mono text-emerald-300" : "px-4 py-3 font-mono text-red-300"}>
                          {item.day}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <footer className="flex flex-col justify-between gap-3 py-6 text-xs text-zinc-600 sm:flex-row">
            <span>QuantumStock prototype dashboard. Static sample data until backend integration.</span>
            <span className="flex items-center gap-2">
              <Radar className="h-3.5 w-3.5" />
              Research environment secured
            </span>
          </footer>
        </section>
      </div>
    </main>
  );
}
