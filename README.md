# polymarket-wallets

A Polymarket trader analytics app powered entirely by the [Surf API](https://docs.asksurf.ai/llms.txt). Browse markets, rank traders by realized PnL, drill into individual wallet positions, and surface smart-money signals — all from one API key.

## What you can build with Surf API

This repo demonstrates a real prediction-market analytics app composed from these public Surf endpoints:

- **`polymarket-leaderboard`** — top traders ranked by realized PnL, volume, or trade count.
- **`polymarket-smart-money`** — aggregate smart-wallet signals per market (positioning view) and individual $10K+ trades (trades view).
- **`polymarket-positions`** — single-wallet open positions with realized PnL and current value.
- **`polymarket-trades`** — full trade history filtered by wallet, market, outcome, or size.
- **`polymarket-markets`** — market metadata.
- **`polymarket-prices`** — latest and historical prices.
- **`wallet-labels-batch`** — entity labels (whale, fund, exchange) for any address.

The whole integration lives in one file — [`src/lib/surfClient.ts`](src/lib/surfClient.ts) — about 270 lines of hand-written, dependency-free TypeScript hitting `https://api.asksurf.ai/gateway/v1`.

## Screenshots

> _Add screenshots here once you've cloned and run locally._

## Quickstart

```bash
git clone https://github.com/<your-account>/polymarket-wallets
cd polymarket-wallets
cp .env.example .env.local
# Open .env.local and paste your SURF_API_KEY (get one at https://agents.asksurf.ai)
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

```
┌──────────────────┐
│   Next.js App    │
│  ─────────────   │
│  /  (markets)    │
│  /wallet-filter  │ ─── all data calls go through ──┐
│  /signals        │                                 ▼
│  /wallet/[addr]  │                  ┌──────────────────────┐
│  /api/analyze    │                  │  src/lib/surfClient  │
└──────────────────┘                  │  (raw HTTP, ~270 LOC)│
                                      └──────────┬───────────┘
                                                 │
                                                 ▼
                                  https://api.asksurf.ai/gateway/v1
                                       Auth: Bearer ${SURF_API_KEY}
```

`src/lib/queries/*.ts` modules call `SurfClient` and shape responses for the page components. There is no database. There is no ORM. There is no caching layer beyond what Surf returns. The whole thing is intentionally readable end-to-end.

## Endpoints used

| Feature | Surf endpoint(s) | Docs |
|---|---|---|
| Markets list (`/`) | `polymarket-markets` + `polymarket-prices` | [llms.txt](https://docs.asksurf.ai/llms.txt) |
| Wallet filter (`/wallet-filter`) | `polymarket-leaderboard` | [llms.txt](https://docs.asksurf.ai/llms.txt) |
| Signals (`/signals`) | `polymarket-smart-money` + `polymarket-leaderboard` + `polymarket-prices` | [llms.txt](https://docs.asksurf.ai/llms.txt) |
| Wallet detail (`/wallet/[address]`) | `polymarket-positions` + `polymarket-trades` + `polymarket-leaderboard` | [llms.txt](https://docs.asksurf.ai/llms.txt) |
| AI chat (`/api/analyze`) | xAI Grok (separate API) | [x.ai docs](https://docs.x.ai) |

Other useful endpoints worth exploring (not currently wired): `prediction-market-analytics`, `prediction-market-correlations`, `matching-market-pairs` (Polymarket↔Kalshi), `polymarket-volume-split`, `polymarket-orderbooks`.

## Tech stack

Next.js 16 · React 19 · TypeScript 5 · TailwindCSS 4 · Vitest

## Tests

```bash
pnpm test
```

Five smoke tests cover the SurfClient wrapper (env-var validation, URL construction, auth headers, retry on 5xx, throw on 4xx). The page components are not unit-tested — verify them by running `pnpm run dev` and clicking through.

## License

MIT — see [LICENSE](LICENSE).

## Acknowledgments

- [Surf API](https://docs.asksurf.ai/llms.txt) — the data layer that makes this whole app possible.
- [Surf CLI](https://github.com/asksurf-ai/surf-cli) — the public CLI used to discover endpoints during development (`surf <command> --help`).
