# Setup Guide

Complete setup instructions for the Data Centers mapping platform.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **Python** 3.9 or higher ([Download](https://www.python.org/))
- **PostgreSQL** 14 or higher with PostGIS ([Download](https://www.postgresql.org/))
- **Git** ([Download](https://git-scm.com/))

### Optional
- **Mapbox Account** for maps ([Sign up](https://www.mapbox.com/))

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/data_centers_mapping.git
cd data_centers_mapping
```

### 2. Install Node Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

cd ..
```

### 3. Install Python Dependencies

```bash
cd scraper
pip install -r requirements.txt
# OR use virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Set Up PostgreSQL Database

#### Create Database

```bash
# Create database
createdb datacenter_map

# Connect and enable PostGIS
psql datacenter_map
```

In the PostgreSQL shell:
```sql
CREATE EXTENSION postgis;
\q
```

#### Run Migrations

```bash
cd backend
npm run db:setup
```

### 5. Configure Environment Variables

#### Backend Configuration

Create `backend/.env`:
```env
DATABASE_URL=postgresql://localhost:5432/datacenter_map
PORT=3001
NODE_ENV=development
```

Adjust the database URL if you have custom PostgreSQL settings:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/datacenter_map
```

#### Frontend Configuration

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here
```

**Getting a Mapbox Token:**
1. Sign up at [mapbox.com](https://www.mapbox.com/)
2. Go to Account → Tokens
3. Copy your default public token
4. Paste it in the `.env` file

#### Scraper Configuration

Create `scraper/.env`:
```env
DATABASE_URL=postgresql://localhost:5432/datacenter_map
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
```

### 6. Seed the Database

Load initial data centers:

```bash
cd backend
npm run db:seed
```

This will add 13 verified data centers from Kenya.

## Running the Application

### Development Mode

**Option 1: Run everything together**
```bash
# From project root
npm run dev
```

**Option 2: Run separately**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

## Running the Scrapers

### Manual Run

```bash
cd scraper
python main.py
```

### Scheduled Run

```bash
cd scraper
python scheduler.py
```

This will:
- Run an initial scrape immediately
- Schedule weekly scrapes (Mondays at 2 AM)
- Schedule daily updates (every day at 8 AM)

## Verification

### Test Backend API

```bash
curl http://localhost:3001/api/datacenters
curl http://localhost:3001/api/statistics
```

### Test Frontend

1. Open http://localhost:5173
2. You should see:
   - Interactive map
   - Data center markers
   - Filter panel
   - Navigation menu

### Test Database

```bash
psql datacenter_map

SELECT COUNT(*) FROM data_centers;
SELECT name, city FROM data_centers;
\q
```

## Common Issues

### PostgreSQL Connection Error

**Error**: `connection refused` or `role does not exist`

**Solution**:
```bash
# Check PostgreSQL is running
pg_isready

# Start PostgreSQL (varies by OS)
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Use Services app to start PostgreSQL service
```

### Mapbox Token Not Working

**Error**: Map tiles not loading

**Solutions**:
1. Verify token in `frontend/.env`
2. Check token is public (not secret)
3. Clear browser cache
4. Restart development server

### Python Dependencies Failed

**Error**: Package installation errors

**Solution**:
```bash
# Upgrade pip
pip install --upgrade pip

# Install with verbose output
pip install -r requirements.txt -v

# On Windows, you might need Visual C++ build tools
# Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

### Port Already in Use

**Error**: `EADDRINUSE: port 3001 already in use`

**Solution**:
```bash
# Find process using port
# macOS/Linux
lsof -i :3001
kill -9 <PID>

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=3002
```

## Production Build

### Build Frontend

```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

### Build Backend

```bash
cd backend
npm run build
```

Output will be in `backend/dist/`

### Run Production

```bash
# Backend
cd backend
NODE_ENV=production npm start

# Frontend (serve with static server)
cd frontend
npx serve -s dist -p 5173
```

## Database Backup

```bash
# Backup
pg_dump datacenter_map > backup.sql

# Restore
psql datacenter_map < backup.sql
```

## Next Steps

- Read [CONTRIBUTING.md](../CONTRIBUTING.md) to learn how to contribute
- Check [API Documentation](API.md) for API details
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/YOUR_REPO/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_REPO/discussions)

Happy mapping! 🌍

