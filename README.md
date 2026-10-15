# Investment Simulation Game

An interactive, high-fidelity Indian stock market investment simulation built with React, Vite, Tailwind CSS, Lucide Icons, and Chart.js.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/AaronG-092/dalal-street-alpha)

## Overview

**Dalal Street Alpha** simulates an 8-week (40-day) trading cycle on the Indian stock market (NIFTY 50 / SENSEX). Players manage a virtual capital of ₹5,00,000, trade blue-chip Indian equities across diverse sectors, establish automated risk management rules (stop-loss / take-profit), track trade journals, and review a comprehensive performance audit upon cycle completion.

## Key Features

- **Realistic Market Simulation**:
  - 8-Week (40 trading days) cycle with realistic price action, volatility, and volume modeling.
  - Indian equity universe including Reliance Industries, HDFC Bank, Infosys, Tata Motors, TCS, and ITC.
  - Dynamic macroeconomic and company news events influencing stock movements.
- **Interactive Charting**:
  - Responsive price history charts with 5-Day Simple Moving Average (SMA) overlays.
  - Average buy price, Stop-Loss, and Take-Profit guideline lines plotted directly on charts.
  - Interactive volume indicator sub-chart.
- **Risk Management & Order Execution**:
  - Market BUY and SELL orders with quick quantity presets (`+10`, `+25`, `+50`, `+100`, Max).
  - Configurable Stop-Loss (SL) and Take-Profit (TP) triggers with percentage offset helpers (`-2%`, `-5%`, `+5%`, `+10%`).
  - Synchronous trigger monitoring that automatically liquidates protected positions when price limits hit.
  - Ability to adjust active position limits directly from the holdings table.
- **Portfolio & Ledger**:
  - Live Net Worth, Liquid Cash, Invested Capital, Unrealized P&L, Realized P&L, and ROI metrics.
  - Automated Trade Journal documenting every market entry, exit, and stop-trigger reason.
  - One-click CSV export of trade logs using Blob API.
- **Performance Report**:
  - Comprehensive end-of-cycle analytics: Win Rate, Profit Factor, Realized vs Unrealized P&L, Sector Capital Allocation, and Max Drawdown.
  - Tailored Trader Persona archetype rating based on investment strategy.
- **Standalone Export**:
  - Single-file self-contained HTML export capability for offline simulations.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite 8 + Bun / Node.js
- **Styling**: Tailwind CSS v4
- **Visualization**: Chart.js
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended) or [Bun](https://bun.sh/) (v1.1+)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/<your-username>/dalal-street-alpha.git
cd dalal-street-alpha
```

Using Bun:
```bash
bun install
bun run dev
```

Or using npm:
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` / `bun run dev` - Launch local Vite development server
- `npm run build` / `bun run build` - Build production assets to `dist/`
- `npm run lint` / `bun run lint` - Run TypeScript type check (`tsc --noEmit`)
- `npm run clean` / `bun run clean` - Remove built artifacts (`dist/`)
- `npm run preview` / `bun run preview` - Preview production build locally
