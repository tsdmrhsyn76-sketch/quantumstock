# QuantumStock Project Memory

## Product Vision
QuantumStock is an AI-powered institutional equity research terminal. The goal is to evolve from a prototype dashboard into an Institutional AI Investment OS inspired by Bloomberg Terminal, BlackRock Aladdin, Palantir-style intelligence systems, and quantitative research workflows.

This is for research and educational purposes only. It is not financial advice.

## Live Links
- Frontend: https://quantumstock.vercel.app
- Backend API: https://quantumstock-api.onrender.com
- GitHub repository: https://github.com/tsdmrhsyn76-sketch/quantumstock.git

## Local Paths
- Codex workspace: `/Users/huseyintasdemir/Documents/Codex/2026-05-17/we-are-building-quantumstock-an-ai`
- GitHub Desktop repo: `/Users/huseyintasdemir/Documents/GitHub/quantumstock`

## Stack
- Frontend: Next.js, React, TypeScript, CSS
- Backend: Python FastAPI
- Market data MVP: yfinance plus Yahoo fallbacks
- Deployment: Vercel frontend, Render backend

## Current Frontend Features
- Main institutional terminal at `/`
- NASDAQ-100 opportunity scanner
- Popular tech watchlist with AI, semiconductor, software, and cyber-security names
- Watchlist Intelligence: Best Setup, Momentum Leader, Highest Risk, Pullback Watch
- Opportunity Engine with trend, momentum, volatility, and volume scores
- Auto Opportunity Ranking from the scanned NASDAQ universe
- Universe Scanner showing scanned universe and output count
- Portfolio Risk System showing posture, average quality, average risk/reward, and risk distribution
- Market Regime Engine using SPY, QQQ, and VIX context
- Weekly Opportunities table with entry, stop, TP1, TP2, upside, and risk/reward
- Model Trade Plan for selected ticker
- Quant Analyst Memo / Analyst Reasoning panel
- Company Intelligence and catalyst/news context

## Current Backend Features
- `GET /health`
- `GET /api/analyze?ticker=NVDA`
- `GET /api/watchlist?tickers=...`
- `GET /api/news?ticker=NVDA`
- `GET /api/company-profile?ticker=NVDA`
- `GET /api/research-memo?ticker=NVDA`
- `GET /api/opportunities`
- `GET /api/weekly-report`
- `GET /api/investment-committee-report`

## Performance Notes
- Backend has a simple in-memory cache for analysis, news, rankings, and market regime.
- First request can still be slower on Render free plan because the service may sleep.
- Current default scan limit is 30 names for stable MVP performance.

## Deployment Workflow
1. Edit files in the Codex workspace.
2. Copy changed files to `/Users/huseyintasdemir/Documents/GitHub/quantumstock`.
3. Open GitHub Desktop.
4. Commit to `main`.
5. Push origin.
6. Vercel updates frontend automatically.
7. If backend changed, deploy backend manually on Render.

## Completed Product Direction
The main terminal should remain clean and operational. Avoid overloading it with investor/business content. Investor materials should live on a separate page, starting with `/investor`.

## Investor Page Updates
- `/investor` now has a premium investor overview layout.
- Added professional investment thesis, problem, solution, differentiation, revenue model, subscription packages, market opportunity, roadmap, and investor summary.
- Added a five-year illustrative growth model with year-by-year paid subscribers, estimated ARR, growth rate, and operating focus.
- Added current project stage, target investment need, and use-of-funds allocation.
- Current investor page target raise is positioned as `$2M - $5M seed round` for 18-24 months of runway.
- Added investor conviction layer: expanded Why Now, competitive positioning, early MVP signals, five-phase roadmap, founder story, and sharper positioning language.
- Main terminal at `/` should remain untouched when improving investor/business content.

## Next Planned Page
Investor / Business Model page:
- What QuantumStock is
- Problem
- Solution
- Target customers
- Revenue model
- Subscription packages
- B2B licensing
- API / white-label opportunity
- Market opportunity
- Roadmap
- Why now
- Investor summary
