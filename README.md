# Data Centers Are Eating The World 🌍

An open-source, automated mapping project that makes the invisible infrastructure powering our digital lives visible—starting with Kenya, expanding globally.

![Project Status](https://img.shields.io/badge/status-alpha-orange)
![License](https://img.shields.io/badge/license-MIT-blue)
![Data License](https://img.shields.io/badge/data-CC%20BY%204.0-green)

## 🎯 What is This?

An interactive, real-time mapping platform that:
- **Makes Infrastructure Visible** - Interactive maps showing every data center
- **Tracks Growth Over Time** - Timeline showing infrastructure expansion
- **Reveals Impact** - Visualize power consumption and economic investment
- **Stays Current** - Automated scrapers pull data from multiple sources

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL 14+ with PostGIS extension

### Installation

```bash
# Clone the repository
git clone [your-repo-url]
cd data_centers_mapping

# Install all dependencies
npm run install:all

# Install Python dependencies
cd scraper && pip install -r requirements.txt
```

### Setup Database

```bash
# Create PostgreSQL database with PostGIS
createdb datacenter_map
psql datacenter_map -c "CREATE EXTENSION postgis;"

# Run migrations
npm run db:setup
npm run db:migrate
```

### Configuration

Create `.env` files in both `backend/` and `frontend/`:

**backend/.env** (see `backend/.env.example`)

```env
DATABASE_URL=postgresql://localhost:5432/datacenter_map
PORT=3001
NODE_ENV=development
# Admin UI + mutating API (POST/PUT/PATCH/DELETE on datacenters)
ADMIN_PASSWORD=your-strong-password
JWT_SECRET=your-32plus-char-random-secret
# Optional CORS allowlist (comma-separated); defaults to localhost:5173
# FRONTEND_ORIGIN=http://localhost:5173
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:3001
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

### Run the Application

```bash
# Start both frontend and backend
npm run dev

# Or start separately:
npm run dev:frontend  # Frontend at http://localhost:5173
npm run dev:backend   # Backend at http://localhost:3001
```

### Run Data Scrapers

```bash
npm run scrape
```

### News Monitor (New! 🎉)

Automatically monitors news sources for data center announcements and flags them for manual review:

```bash
cd scraper
python news_monitor.py
```

Or integrate into main scraper:
```bash
python main.py --include-news  # Run news monitor + normal scraping
python main.py --news-only      # Only check news (no DB updates)
```

**How it works:**
1. Scans RSS feeds from Citizen Digital, TechCrunch, Business Daily Kenya
2. Finds articles mentioning data centers, AI infrastructure, etc.
3. Generates a review report with article links
4. You manually review and add new data centers to `scraper/scrapers/manual_data_scraper.py`

See [NEWS_MONITOR_GUIDE.md](scraper/NEWS_MONITOR_GUIDE.md) for details.

## 🏗️ Project Structure

```
data_centers_mapping/
├── frontend/          # React + TypeScript UI
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   └── types/        # TypeScript types
│   └── public/
├── backend/           # Node.js/Express API
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Database models
│   │   ├── middleware/   # Express middleware
│   │   └── utils/        # Utilities
│   └── db/
│       └── migrations/   # Database migrations
├── scraper/           # Python web scrapers
│   ├── scrapers/         # Individual scrapers
│   ├── processors/       # Data processing
│   └── data/             # Scraped data output
└── docs/              # Documentation
```

## 🛠️ Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** - Fast build tool
- **Mapbox GL JS** - Interactive maps
- **D3.js** - Data visualizations
- **Tailwind CSS** - Styling
- **React Query** - Data fetching

### Backend
- **Node.js** + Express
- **PostgreSQL** + PostGIS - Geospatial database
- **pg** (node-postgres) - Database client
- **Node-cron** - Scheduled tasks

### Data Pipeline
- **Python 3.9+**
- **BeautifulSoup4** - HTML parsing
- **Selenium** - Dynamic scraping
- **FuzzyWuzzy** - Deduplication
- **Geopy** - Geocoding

## 📊 Features

### MVP (Kenya Launch)
- ✅ Interactive map with data center locations
- ✅ Filter by status, capacity, ownership type
- ✅ Detail panel for each facility
- ✅ Basic statistics dashboard
- ✅ Mobile-responsive design
- ✅ Export data (JSON, CSV, GeoJSON)

### Planned Features
- Timeline slider (2010-2025)
- Layer system (power grid, fiber, cables)
- Impact calculator
- Community submissions
- Public API
- Alert system

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ways to Contribute
- Submit data center information
- Improve scrapers
- Enhance visualizations
- Write documentation
- Report bugs

## 📄 License

- **Code**: MIT License
- **Data**: CC BY 4.0 (attribution required)

## 👨‍💻 Author & Attribution

**Created by:** [Victor Jotham Ashioya](https://github.com/ashioyajotham)

### How to Attribute This Project

If you use this project or its data, please provide attribution:

**For Code (MIT License):**
```
Data Centers Mapping Platform by Victor Jotham Ashioya
https://github.com/ashioyajotham/data_centers_mapping
```

**For Data (CC BY 4.0):**
```
Data sourced from "Data Centers Are Eating The World" by Victor Jotham Ashioya
Licensed under CC BY 4.0
https://github.com/ashioyajotham/data_centers_mapping
```

**In Academic Papers:**
```
Ashioya, V. J. (2025). Data Centers Are Eating The World: 
An Open-Source Mapping Platform for Global Data Center Infrastructure. 
GitHub. https://github.com/ashioyajotham/data_centers_mapping
```

## 🙏 Acknowledgments

Inspired by:
- [This video by High Yield (highly recommended) on AI data centers, which actually inspired the name and the project generally](https://youtu.be/dhqoTku-HAA?si=yJXug7yQvd06VYhk)
- [Dylan Patel and SemiAnalysis team](https://semianalysis.com)
- [Business Insider's data journalism](https://www.businessinsider.com/data-center-locations-us-map-ai-boom-2025-9)
- [Open source mapping community](https://www.openstreetmap.org)