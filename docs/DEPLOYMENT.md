# Deployment Guide

Guide for deploying the Data Centers mapping platform to production.

## Overview

The application consists of three main components:
1. **Frontend** - React SPA
2. **Backend** - Node.js API
3. **Scraper** - Python scripts (scheduled jobs)

## Prerequisites

- VPS or cloud hosting (AWS, DigitalOcean, etc.)
- Domain name (optional but recommended)
- SSL certificate
- PostgreSQL database

## Recommended Stack

### Option 1: Traditional VPS

- **Frontend**: Nginx serving static files
- **Backend**: PM2 running Node.js
- **Database**: PostgreSQL on same server or managed service
- **Scraper**: Cron jobs or systemd timers

### Option 2: Modern Cloud

- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Backend**: Railway, Render, or Fly.io
- **Database**: Supabase, Neon, or AWS RDS
- **Scraper**: GitHub Actions or cloud functions

## Option 1: VPS Deployment (Ubuntu)

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL with PostGIS
sudo apt install -y postgresql postgresql-contrib postgis

# Install Python
sudo apt install -y python3 python3-pip python3-venv

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2
```

### 2. Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell:
CREATE DATABASE datacenter_map;
CREATE USER dcuser WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE datacenter_map TO dcuser;
\c datacenter_map
CREATE EXTENSION postgis;
\q
```

### 3. Clone and Setup Application

```bash
# Create app directory
sudo mkdir -p /var/www/datacenter_map
sudo chown $USER:$USER /var/www/datacenter_map

# Clone repository
cd /var/www/datacenter_map
git clone https://github.com/YOUR_REPO/data_centers_mapping.git .

# Install dependencies
npm run install:all
cd scraper && pip3 install -r requirements.txt && cd ..
```

### 4. Configure Environment

**Backend (.env)**
```bash
cd /var/www/datacenter_map/backend
cat > .env << EOF
DATABASE_URL=postgresql://dcuser:your_secure_password@localhost:5432/datacenter_map
PORT=3001
NODE_ENV=production
EOF
```

**Frontend (.env)**
```bash
cd /var/www/datacenter_map/frontend
cat > .env << EOF
VITE_API_URL=https://api.yourdomain.com
VITE_MAPBOX_TOKEN=your_mapbox_token
EOF
```

### 5. Build Applications

```bash
# Build frontend
cd /var/www/datacenter_map/frontend
npm run build

# Build backend
cd /var/www/datacenter_map/backend
npm run build

# Setup database
npm run db:setup
npm run db:seed
```

### 6. Configure PM2 for Backend

```bash
cd /var/www/datacenter_map/backend

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'datacenter-api',
    script: 'dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 7. Configure Nginx

```bash
# Create Nginx config for frontend
sudo nano /etc/nginx/sites-available/datacenter-map

# Add this configuration:
```

```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    root /var/www/datacenter_map/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}

# API
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/datacenter-map /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 9. Setup Scraper Cron Job

```bash
# Create scraper script
cat > /var/www/datacenter_map/scraper/run.sh << 'EOF'
#!/bin/bash
cd /var/www/datacenter_map/scraper
/usr/bin/python3 main.py >> /var/log/datacenter_scraper.log 2>&1
EOF

chmod +x /var/www/datacenter_map/scraper/run.sh

# Add to crontab
crontab -e
```

Add this line:
```cron
# Run scraper every Monday at 2 AM
0 2 * * 1 /var/www/datacenter_map/scraper/run.sh
```

### 10. Monitoring and Logs

```bash
# PM2 logs
pm2 logs datacenter-api

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Scraper logs
tail -f /var/log/datacenter_scraper.log

# PM2 monitoring
pm2 monit
```

## Option 2: Cloud Deployment

### Frontend on Vercel

1. **Push to GitHub**
```bash
git remote add origin https://github.com/YOUR_USERNAME/data_centers_mapping.git
git push -u origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import GitHub repository
- Set root directory to `frontend`
- Add environment variables:
  - `VITE_API_URL`: Your API URL
  - `VITE_MAPBOX_TOKEN`: Your Mapbox token
- Deploy

### Backend on Railway

1. **Create Railway Project**
- Go to [railway.app](https://railway.app)
- New Project → Deploy from GitHub
- Select your repository

2. **Configure**
- Set root directory to `backend`
- Add PostgreSQL plugin
- Add environment variables:
  - `DATABASE_URL`: Automatically set by Railway
  - `PORT`: Automatically set by Railway
  - `NODE_ENV`: production

3. **Deploy**
- Railway will auto-deploy on push

### Scraper on GitHub Actions

Create `.github/workflows/scraper.yml`:

```yaml
name: Run Scraper

on:
  schedule:
    # Run every Monday at 2 AM UTC
    - cron: '0 2 * * 1'
  workflow_dispatch: # Manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: |
          cd scraper
          pip install -r requirements.txt
      
      - name: Run scraper
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          cd scraper
          python main.py
```

Add `DATABASE_URL` to GitHub Secrets.

## Post-Deployment

### 1. Verify Deployment

```bash
# Check frontend
curl https://yourdomain.com

# Check API
curl https://api.yourdomain.com/health
curl https://api.yourdomain.com/api/datacenters

# Check database
psql -U dcuser -d datacenter_map -c "SELECT COUNT(*) FROM data_centers;"
```

### 2. Performance Optimization

**Frontend:**
- Enable Cloudflare CDN
- Configure caching headers
- Optimize images

**Backend:**
- Add Redis caching
- Enable connection pooling
- Set up database indexes

**Database:**
```sql
-- Add indexes
CREATE INDEX idx_dc_location ON data_centers USING GIST(location);
CREATE INDEX idx_dc_status ON data_centers(status);

-- Analyze tables
ANALYZE data_centers;
ANALYZE sources;
```

### 3. Monitoring

**Application Monitoring:**
- Use PM2 Plus for backend
- Use Sentry for error tracking
- Use Uptime Robot for uptime monitoring

**Database Monitoring:**
```bash
# Install pg_stat_statements
sudo -u postgres psql datacenter_map
CREATE EXTENSION pg_stat_statements;
```

### 4. Backup Strategy

**Database Backups:**
```bash
# Create backup script
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/datacenter_map"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U dcuser datacenter_map | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
# Keep last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-db.sh

# Add to crontab
0 3 * * * /usr/local/bin/backup-db.sh
```

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or cloud load balancer
2. **Multiple Backend Instances**: PM2 cluster mode or multiple servers
3. **Database Replication**: PostgreSQL streaming replication
4. **CDN**: Cloudflare or AWS CloudFront

### Vertical Scaling

- Upgrade server resources
- Optimize database queries
- Add caching layer (Redis)

## Troubleshooting

### Frontend Not Loading
- Check Nginx configuration
- Verify build files exist
- Check browser console for errors

### API Errors
- Check PM2 logs: `pm2 logs`
- Verify database connection
- Check environment variables

### Database Connection Issues
- Verify PostgreSQL is running
- Check connection string
- Verify firewall rules

## Security Checklist

- [ ] SSL/TLS enabled
- [ ] Environment variables secured
- [ ] Database password strong
- [ ] Firewall configured
- [ ] Regular updates enabled
- [ ] Backups automated
- [ ] Monitoring setup
- [ ] Rate limiting enabled
- [ ] CORS properly configured

## Support

For deployment issues:
- GitHub Issues: [Link]
- Documentation: [Link]
- Community: [Link]

