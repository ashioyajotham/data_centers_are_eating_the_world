# Quick Start Guide

Get the Data Centers mapping platform running in 5 minutes!

## Prerequisites Check

Make sure you have:
- ✅ Node.js 18+ (`node --version`)
- ✅ Python 3.9+ (`python3 --version`)
- ✅ PostgreSQL 14+ (`psql --version`)

## 5-Minute Setup

### 1. Clone and Install (2 minutes)

```bash
# Clone the project
cd data_centers_mapping

# Install all dependencies
npm install
cd frontend && npm install
cd ../backend && npm install
cd ../scraper && pip install -r requirements.txt
cd ..
```

### 2. Setup Database (1 minute)

```bash
# Create database with PostGIS
createdb datacenter_map
psql datacenter_map -c "CREATE EXTENSION postgis;"

# Setup schema and seed data
cd backend
npm run db:setup
npm run db:seed
cd ..
```

### 3. Configure Environment (30 seconds)

**Create `backend/.env`:**
```env
DATABASE_URL=postgresql://localhost:5432/datacenter_map
PORT=3001
NODE_ENV=development
```

**Create `frontend/.env`:**
```env
VITE_API_URL=http://localhost:3001
VITE_MAPBOX_TOKEN=pk.your_token_here
```

> 💡 Get a free Mapbox token at [mapbox.com](https://www.mapbox.com)

### 4. Run the Application (30 seconds)

```bash
# From project root
npm run dev
```

### 5. Open in Browser (1 second)

🎉 **You're done!** Open http://localhost:5173

## What You'll See

- 🗺️ **Interactive Map** - Showing Kenya data centers
- 📊 **Dashboard** - Statistics and visualizations  
- 🔍 **Data Explorer** - Browse all facilities
- ℹ️ **About Page** - Project information
- 👨‍💼 **Admin Panel** - Data verification (http://localhost:5173/admin)

## Sample Data Included

The seed script adds 6 sample data centers in Kenya:
- Africa Data Centres Nairobi
- iXAfrica Nairobi Data Center
- Microsoft Azure East Africa Region (planned)
- Safaricom M-PESA Data Center
- Wananchi Online Data Center
- East Africa Data Centre

## Next Steps

### Run the Scraper

Collect real data from public sources:

```bash
cd scraper
python main.py
```

This will:
- Scrape data from DataCenterMap.com and Datacenters.com
- Deduplicate entries
- Geocode locations
- Save to database

### Schedule Automated Scraping

```bash
cd scraper
python scheduler.py
```

Runs:
- Weekly full scrape (Mondays at 2 AM)
- Daily updates (every day at 8 AM)

### Explore the API

```bash
# Get all data centers
curl http://localhost:3001/api/datacenters

# Get statistics
curl http://localhost:3001/api/statistics

# Export as GeoJSON
curl http://localhost:3001/api/datacenters/geojson > map.geojson

# Health check
curl http://localhost:3001/health
```

## Common Tasks

### Add a New Data Center Manually

1. Go to http://localhost:5173/admin
2. Use the admin interface (or API)
3. Or insert directly into PostgreSQL:

```sql
psql datacenter_map

INSERT INTO data_centers (
  name, operator, address, city, country,
  latitude, longitude, location,
  status, ownership_type, power_capacity_mw
) VALUES (
  'New Data Center',
  'Operator Name',
  'Full Address',
  'Nairobi',
  'Kenya',
  -1.2921,
  36.8219,
  ST_SetSRID(ST_MakePoint(36.8219, -1.2921), 4326),
  'operational',
  'local',
  5.0
);
```

### View Database

```bash
# Connect to database
psql datacenter_map

# View all data centers
SELECT name, city, status FROM data_centers;

# Count by status
SELECT status, COUNT(*) FROM data_centers GROUP BY status;

# View sources
SELECT dc.name, s.name, s.url 
FROM data_centers dc 
JOIN sources s ON dc.id = s.data_center_id;
```

### Reset Database

```bash
cd backend
dropdb datacenter_map
createdb datacenter_map
psql datacenter_map -c "CREATE EXTENSION postgis;"
npm run db:setup
npm run db:seed
```

## Troubleshooting

### "Port 3001 already in use"

```bash
# Find and kill the process
lsof -i :3001
kill -9 <PID>

# Or change the port in backend/.env
PORT=3002
```

### Map not loading

1. Check Mapbox token in `frontend/.env`
2. Make sure token is public (not secret)
3. Restart frontend: `cd frontend && npm run dev`

### Database connection error

```bash
# Check PostgreSQL is running
pg_isready

# Start PostgreSQL
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
# Windows: Start PostgreSQL service
```

### Python packages fail to install

```bash
# Upgrade pip first
pip install --upgrade pip

# Install in virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Project Structure

```
data_centers_mapping/
├── frontend/          # React app (http://localhost:5173)
├── backend/           # API server (http://localhost:3001)
├── scraper/           # Python scrapers
├── docs/              # Documentation
└── .github/           # CI/CD workflows
```

## Learn More

- 📖 [Full Setup Guide](docs/SETUP.md)
- 🚀 [Deployment Guide](docs/DEPLOYMENT.md)
- 🔌 [API Documentation](docs/API.md)
- 🤝 [Contributing Guide](CONTRIBUTING.md)

## Need Help?

- 🐛 [Report Issues](https://github.com/YOUR_REPO/issues)
- 💬 [Ask Questions](https://github.com/YOUR_REPO/discussions)
- 📧 Email: [Your email]

---

**Happy mapping! 🌍**

Built with ❤️ to make digital infrastructure visible.

