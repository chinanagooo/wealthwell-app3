# Finora — Wealth Wellness Hub

> Your complete financial command centre. Track every asset, stress-test every scenario, and take action on what matters.

---

## Getting Started

### Option A — Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/chinanagooo/finora.git
cd finora

# Build the Docker image
docker build -t finora .

# Run the container (host port 8080 → container port 80)
docker run -p 8080:80 -d --name finora finora

# Open in browser
# http://localhost:8080
```

### Option B — Local Development

```bash
# Clone the repository
git clone https://github.com/chinanagooo/finora.git
cd finora

# Install dependencies
npm install

# Start the Vite development server
npm run dev

# Open in browser
# http://localhost:5173
```

---

## Available Scripts

```bash
npm run dev      # Vite dev server with HMR at localhost:5173
npm run build    # Production build → /dist (used inside Docker)
npm run preview  # Preview the production /dist build locally
npm run lint     # ESLint check across all source files
```

---

## Docker Reference

```bash
# Build
docker build -t finora .

# Run (detached, named)
docker run -p 8080:80 -d --name finora finora

# List running containers
docker ps

# Stop the container
docker stop finora

# Remove the container
docker rm finora

# Rebuild after a code change
docker stop finora
docker rm finora
docker rmi finora
docker build -t finora .
docker run -p 8080:80 -d --name finora finora
```

---

## Authentication Flow

Finora uses a lightweight browser-side auth layer:

```
App loads → checks localStorage
  ├─ Account exists, not signed in → Login Screen (email + password)
  │     ├─ Correct credentials → Main Application
  │     └─ "Create Account" → clears data → Onboarding Wizard
  ├─ No account → Onboarding Wizard
  └─ New account created → Onboarding Wizard
```

**Login Screen** — users enter their registered email address and password. The email is matched against the stored profile; the password is validated against a base64 hash stored in `localStorage`. Incorrect credentials show an inline error without revealing which field failed.

**Sign Out** — the bottom-left of the sidebar contains a Sign Out button. Clicking it returns the user to the login screen without clearing any data. All portfolio, scenario, and profile data is preserved for the next login.

**Account Deletion** — accessible from the Trust Centre. Clicking "Delete Account" expands an inline password confirmation panel. The correct password is required before all `localStorage` data is wiped and the app returns to onboarding. An incorrect password shows an error in place with no data loss.

Passwords are stored as `btoa(unescape(encodeURIComponent(password)))`. There is no external authentication service — all credential checks happen in the browser.

---

## Live Features

### Onboarding Wizard

A six-step guided setup covering personal identity, salary and expenses, assets, liabilities, and connected accounts. Styled with a blue-and-white theme throughout.

| Step | Content |
|---|---|
| 1 | Personal details — name, date of birth, nationality, email, phone |
| 2 | Financial profile — annual income, monthly expenses, risk tolerance |
| 3 | Asset entry — cash, stocks, crypto, real estate, CPF, bonds, and others |
| 4 | Liability entry — mortgage, credit cards, loans |
| 5 | Connected accounts — Singpass, DBS, IBKR, Coinbase, CPF Board |
| 6 | Password creation and completion — "Welcome to Finora" confirmation |

Progress is saved to `localStorage` so the wizard can be resumed at any step. On completion the user lands directly in the main application.

### Home Screen

The entry point to the main application. A blue-to-white gradient background runs behind the content, flowing from deep sky blue at the top through mid-blue and soft azure into pure white. The screen contains:

- **Net Worth hero card** — total assets, total liabilities, and net worth with animated number counters
- **Wellness Score ring** — an animated SVG donut displaying the current score (0–99) with a colour-coded band (green / amber / red) and its label (Excellent / Good / Fair / Needs Work)
- **Portfolio composition donut** — an interactive `EDonut` chart breaking down assets and liabilities by category; hover a segment to expand its detail slice
- **Wealth history sparkline** — a 12-month trend line of net worth
- **Top metric cards** — key figures pulled from the wellness engine (liquidity buffer, debt ratio, monthly surplus, and others)

### Portfolio Screen

A full balance sheet with inline CRUD. Assets and liabilities are organised into named categories:

**Asset categories:** Cash & Deposits, Stocks & ETFs, Cryptocurrency, Real Estate, Retirement (CPF), Bonds & Fixed Income, Commodities, Others

**Liability categories:** Mortgage, Personal Loan, Credit Card, Car Loan, Business Loan, Student Loan, Other

Adding items opens a smooth panel built with uncontrolled refs to prevent input focus loss on keypress. Enabling edit mode allows inline deletion of any line item.

### Wellness Score Engine

A dynamic six-dimension score computed synchronously on every state change:

| Dimension | What it measures |
|---|---|
| Liquidity Buffer | Months of expenses covered by liquid cash (target: 6 months) |
| Sector Diversification | Number of distinct asset categories held out of 7 |
| Debt-to-Asset Ratio | Total liabilities as a percentage of total assets (target: below 15%) |
| Drawdown Resilience | Composite of liquidity, diversification, and debt |
| Insurance Coverage Gap | Estimated protection relative to financial obligations |
| Emotional Trading Control | Behavioural pattern baseline |

The overall score is a weighted average (0–99) displayed as an animated SVG ring on the Home screen and referenced in the Scenario Lab.

### Scenario Lab

Five stress-test scenarios with interactive parameter sliders. Each scenario runs real-time portfolio maths and surfaces MAS-referenced guidance:

| Scenario | Slider Parameters | Bloomberg Ticker |
|---|---|---|
| Market Crash | Equity drop %, Crypto drop % | SGX STI |
| Job Loss | Months without income | CPF-OA |
| Rate Hike | SORA increase % | MAS SORA |
| Retirement | Years to retirement, Monthly savings | CPF LIFE |
| 2nd Property | Property price | ABSD 17% |

Each scenario displays:
- **Portfolio Impact** — absolute change in net worth
- **Wellness Score gauge** — animated ring showing score before and after the scenario
- **Breakdown panel** — line-by-line impact detail
- **Finora Analysis Engine panel** — a Bloomberg terminal-style dark analysis panel with three unique insight columns per scenario, a live indicator, and a direct link to that scenario's five actions in the Action Centre

### Action Centre

A Flashcard carousel of prioritised financial actions. When a scenario is active, the Action Centre surfaces that scenario's five dedicated actions — 25 unique actions in total across all scenarios. Each flashcard contains:

- **Situation** — the specific problem identified in the user's portfolio
- **Why It Matters** — the finance fundamental explained in plain English
- **Action Steps** — precise, executable instructions
- **Expected Outcome** — quantified result where possible
- **MAS Reference** — the specific Act, Notice, or Scheme governing the recommendation (e.g., *MAS Notice 632 · TDSR Financial Institutions Rules 2013*)

Actions reference the CPF Act, MediShield Life Act, Stamp Duties Act, Banking Act, Mental Capacity Act, SkillsFuture Singapore, and the Employment Act. A History tab tracks completed actions.

### Insights Screen

Six wellness metric cards with score bars and contextual tips. A **Pro** toggle in the top-right unlocks two additional panels:

**Advanced Analytics Panel** — twelve Bloomberg-style risk metrics in a dark crimson terminal theme with hover tooltips:

| Metric | Description |
|---|---|
| Sharpe Ratio | Risk-adjusted return above the risk-free rate |
| Sortino Ratio | Downside-risk-adjusted return |
| Max Drawdown | Largest peak-to-trough decline |
| Beta | Portfolio sensitivity to market movements |
| Alpha | Excess return above benchmark |
| VaR 95% | Value at Risk at 95% confidence |
| CVaR / ES | Conditional Value at Risk (Expected Shortfall) |
| Treynor Ratio | Return per unit of systematic risk |
| Information Ratio | Active return per unit of active risk |
| Calmar Ratio | Return relative to maximum drawdown |
| R-Squared | Correlation with the benchmark |
| Tracking Error | Volatility of active returns |

**Balance Sheet Generator** — a formal Statement of Financial Position with assets and liabilities by category, net worth reconciliation, monthly cash flow summary, and a "Generated by Finora Pro" footer with date.

### Trust Centre

Manages account security and data:

- **Connected Accounts** — status indicators for Singpass, DBS/POSB, Interactive Brokers, Coinbase, and CPF Board (simulated; read-only access only)
- **Security Architecture** — AES-256 encryption, OAuth 2.0, zero-knowledge design, full audit logs, and right-to-delete information
- **Delete Account** — password-authenticated deletion flow. Clicking "Delete Account" expands an inline panel requiring the user's password before permanently wiping all `localStorage` data and returning to the onboarding wizard

### Multi-Currency Support

Seven currencies with real-time conversion. All values are stored in SGD and converted at render time:

| Currency | Code |
|---|---|
| Singapore Dollar | SGD (default) |
| US Dollar | USD |
| Euro | EUR |
| British Pound | GBP |
| Japanese Yen | JPY |
| Australian Dollar | AUD |
| Hong Kong Dollar | HKD |

The currency picker lives in the sidebar above the profile area. Switching currency updates every displayed value instantly.

---

## Tech Stack

### Frontend

| Technology | Version | Role |
|---|---|---|
| React | 18 | Component model, hooks, state management |
| Vite | 5 | Build tooling, HMR, production bundler |
| JavaScript (JSX) | ES2022+ | Application language |

### UI & Visualisation

| Technology | Role |
|---|---|
| Inline React styles | All component styling — zero external CSS library |
| Custom SVG | Wellness score rings, sparklines, scenario gauge |
| EDonut component | Interactive portfolio donut chart with hover-drill detail |
| Sora (Google Fonts) | Application-wide typeface |
| Courier New (monospace) | Bloomberg terminal aesthetic for metric values and tickers |

### State & Storage

| Technology | Role |
|---|---|
| React `useState` / `useEffect` | All application state |
| `localStorage` | Single-key persistence (`wealthwell_v1`) — profile, assets, liabilities, expenses, scenario params, completed actions |
| `useRef` (uncontrolled inputs) | Asset and liability panels — eliminates re-render focus loss on keypress |

There is no backend, no database, no API calls, and no external authentication service. All data lives in the user's browser.

### DevOps & Deployment

| Technology | Role |
|---|---|
| Docker | Multi-stage containerisation |
| Node 20 (build stage) | Runs `npm run build` to produce `/dist` |
| nginx:alpine (serve stage) | Serves the static `/dist` bundle on port 80 |
| GitHub Actions | CI/CD pipeline (`.github/workflows/`) |
| ESLint | Code quality linting (`eslint.config.js`) |

---

## Repository Structure

```
finora/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD pipeline
├── public/                 # Static assets
├── src/
│   ├── App.jsx             # Entire application — auth, onboarding wizard,
│   │                       # all screens, all components, all logic
│   ├── main.jsx            # Vite/React entry point
│   └── index.css           # Global reset, body background, overflow
├── index.html              # HTML shell with Sora font preload
├── package.json            # npm dependencies and scripts
├── package-lock.json       # Locked dependency tree
├── vite.config.js          # Vite build configuration
├── eslint.config.js        # ESLint rules
├── Dockerfile              # Multi-stage Docker build
├── .dockerignore           # Docker build exclusions
├── .gitignore              # Git exclusions
└── README.md               # This file
```

`App.jsx` is intentionally a single file. The architecture follows a **monolithic SPA pattern**: all constants, utility functions, shared components, auth screens, the onboarding wizard, standalone input panels, and all screen renderers live together. This keeps the deployment surface minimal and eliminates module-bundling complexity.

---

## Key Architectural Decisions

**Wellness computed on every render.** `computeWellness(assets, liabs, profile)` runs synchronously on every state change. With typical portfolio sizes (under 50 items), this is negligible in cost and ensures the score is always live.

**Standalone input panels prevent focus loss.** `AddAssetPanel` and `AddLiabPanel` are defined at module scope — outside `App`. This prevents React from unmounting and remounting them on every parent re-render, which was the root cause of inputs losing focus with each character typed when they were defined as inline JSX functions.

**Scenario actions are fully unique per scenario.** `SCENARIO_ACTIONS` is a static map of 25 actions (5 per scenario, 5 scenarios). `buildActionsForScenario()` returns only the dedicated set for the selected scenario — never mixing with another scenario's actions. Zero repetition is guaranteed by design.

**No routing library.** Screen navigation uses a single `screen` state string. The sidebar updates this string; the main panel conditionally renders the matching screen. This keeps bundle size minimal.

**Sign out without data loss.** `setLoggedIn(false)` returns the user to the login screen while leaving all `localStorage` data intact. Account deletion is a separate, password-gated action in the Trust Centre.

## Application Screens

| Screen | State value | Description |
|---|---|---|
| Login | — | Email + password authentication before entering the app |
| Onboarding | — | Six-step guided setup; shown once on first use or after account creation |
| Home | `home` | Net worth hero, wellness ring, portfolio donut, sparkline history, top metric cards |
| Portfolio | `portfolio` | Full balance sheet — add, edit, and delete assets and liabilities |
| Insights | `insights` | Six wellness dimension scores; Pro mode adds 12-metric analytics and Balance Sheet Generator |
| Scenario Lab | `scenarios` | Five stress-test scenarios with sliders, impact calculator, and Bloomberg analysis panel |
| Action Centre | `actions` | Flashcard carousel of prioritised MAS-referenced actions; History tab for completed items |
| Trust Centre | `trust` | Connected accounts, security information, password-authenticated account deletion |

---

## Privacy

All data is stored locally in your browser via `localStorage` under the key `wealthwell_v1`. No data is transmitted to any server at any time.

To sign out without losing data, use the **Sign Out** button at the bottom of the sidebar.

To permanently erase all data, use **Delete Account** in the Trust Centre (password required). This action is irreversible.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with a descriptive message: `git commit -m "feat: describe your change"`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request against `master`

---

## About

Built by the **TechTitans** team for the NTU Fintech Innovators' Hackathon.

**Pursue your financial freedom.**
