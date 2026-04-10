# Polymarket Wallets Analytics

A comprehensive wallet and market analytics dashboard for Polymarket, featuring wallet tracking, position analysis, and smart money insights. Now powered by the [Surf API](https://agents.asksurf.ai) for reliable, open-source data access.

## 🎯 Features

- **Wallet Analysis**: Deep dive into any Polymarket wallet's trading history
- **Position Tracking**: Real-time positions and P&L analysis
- **Smart Money Signals**: Identify and track high-performing wallets
- **Market Explorer**: Browse active markets with advanced filtering
- **AI Chat Interface**: Ask questions about wallets and market data
- **Dual Data Sources**: Switch between Surf CLI and ClickHouse

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- [Surf CLI](https://github.com/asksurf-ai/surf-cli) (recommended)
- Surf API key from [agents.asksurf.ai](https://agents.asksurf.ai)

### Setup

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd polymarket-wallets
   npm install
   ```

2. **Configure for Surf CLI (Recommended):**
   ```bash
   # Run the automated setup
   ./scripts/setup-surf.sh
   ```

   **Or manually:**
   ```bash
   cp .env.example .env.local
   # Add your credentials to .env.local
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000)

## ⚙️ Data Source Configuration

This app supports two data sources:

### 🌟 Surf CLI (Recommended)
- **Open Source**: Public API, no database dependencies
- **Reliable**: Built-in rate limiting and error handling
- **Current**: Real-time market and wallet data

**Setup:**
```env
SURF_API_KEY=sk-your_api_key_here
USE_SURF_API=true
```

### 🗄️ ClickHouse (Legacy)
- **Direct Database**: Faster queries for large datasets
- **Internal**: Requires database credentials

**Setup:**
```env
USE_SURF_API=false
CLICKHOUSE_HOST=your_host
CLICKHOUSE_USER=your_user
CLICKHOUSE_PASSWORD=your_password
CLICKHOUSE_DB=polymarket_polygon
```

## 📊 Features by Data Source

| Feature | Surf CLI | ClickHouse |
|---------|----------|------------|
| Market Data | ✅ Real-time | ✅ Cached |
| Wallet Positions | ✅ Live API | ✅ Database |
| Market Search | ✅ Full-text | ✅ SQL |
| Historical Data | ✅ 30+ days | ✅ Full history |
| Rate Limits | ✅ Managed | ✅ None |
| Setup Complexity | ✅ Simple | ❌ Complex |

## 🛠️ Available Pages

- **`/`** - Market explorer with category filtering
- **`/wallet-filter`** - Advanced wallet filtering and search
- **`/wallet/[address]`** - Individual wallet analysis
- **`/signals`** - Smart money signals and top performers

## 🔧 Environment Variables

```env
# Surf API (Recommended)
SURF_API_KEY=sk-your_surf_api_key_here
USE_SURF_API=true

# ClickHouse (Legacy)
CLICKHOUSE_HOST=clickhouse.ask.surf
CLICKHOUSE_USER=bot_ro
CLICKHOUSE_PASSWORD=your_password
CLICKHOUSE_DB=polymarket_polygon

# AI Features
XAI_API_KEY=xai-your_xai_api_key_here
```

## 🎨 Architecture

- **Frontend**: Next.js 15 with App Router
- **Data Layer**: Dual-source (Surf CLI + ClickHouse)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **AI Chat**: XAI integration
- **Type Safety**: TypeScript

## 🔄 Migration Guide

### From ClickHouse to Surf CLI

1. **Get Surf API key** from [agents.asksurf.ai](https://agents.asksurf.ai)

2. **Run migration script:**
   ```bash
   ./scripts/setup-surf.sh
   ```

3. **Test the switch:**
   ```bash
   # Enable Surf CLI
   echo "USE_SURF_API=true" >> .env.local
   npm run dev

   # Revert to ClickHouse if needed
   echo "USE_SURF_API=false" >> .env.local
   ```

### Benefits of Migration:
- ✅ **No database setup** required
- ✅ **Open source** ready
- ✅ **Better rate limiting**
- ✅ **Easier deployment**
- ✅ **Real-time data**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test with both data sources:
   ```bash
   # Test with Surf CLI
   USE_SURF_API=true npm run dev

   # Test with ClickHouse (if available)
   USE_SURF_API=false npm run dev
   ```
5. Commit: `git commit -m 'feat: description'`
6. Push and open a Pull Request

## 📝 API Routes

| Route | Purpose | Data Source |
|-------|---------|-------------|
| `/api/markets` | Market data | Surf CLI / ClickHouse |
| `/api/wallets` | Wallet search | Surf CLI / ClickHouse |
| `/api/signals` | Smart money | Surf CLI / ClickHouse |
| `/api/analyze` | AI wallet analysis | XAI + Data Source |

## 🔗 Useful Commands

```bash
# Setup Surf CLI
./scripts/setup-surf.sh

# Test Surf connection
surf search-prediction-market --limit 1

# Check wallet positions
surf polymarket-positions --wallet-address 0x...

# Get market data
surf polymarket-markets --market-slug <slug>

# Switch data sources
echo "USE_SURF_API=true" >> .env.local   # Enable Surf
echo "USE_SURF_API=false" >> .env.local  # Enable ClickHouse
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- [Surf CLI Documentation](https://docs.asksurf.ai/cli)
- [Surf API Reference](https://docs.asksurf.ai/api)
- [Polymarket](https://polymarket.com)
- [XAI API](https://docs.x.ai)