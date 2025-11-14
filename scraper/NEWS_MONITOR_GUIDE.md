# News Monitor Guide

## Overview

The News Monitor automatically scans news sources for data center announcements and flags them for **manual review**. It does NOT automatically add data centers to the database - you review and add them manually to maintain data quality.

## Quick Start

### Check for New Articles

```bash
cd scraper
python news_monitor.py
```

Or use the main scraper with news-only mode:

```bash
python main.py --news-only
```

### Include News Monitor in Main Pipeline

```bash
python main.py --include-news
```

This runs the news monitor first (for review), then continues with the normal scraping pipeline.

## How It Works

1. **Scans RSS Feeds**: Monitors RSS feeds from:
   - Citizen Digital (Kenya)
   - TechCrunch
   - Business Daily Kenya
   - More sources can be added

2. **Keyword Matching**: Looks for articles mentioning:
   - "data center", "datacenter", "data centre"
   - "AI infrastructure", "GPU facility"
   - "hyperscale", "colocation"
   - Company names: "iXAfrica", "Africa Data Centres", etc.

3. **Generates Review Report**: Creates a timestamped report file with:
   - Article titles and URLs
   - Publication dates
   - Matched keywords
   - Summaries

4. **Manual Review**: You review the articles and add new data centers to `manual_data_scraper.py`

## Example Output

```
📰 Data Center News Monitor
================================================================================
This tool scans news sources for data center announcements.
Articles are flagged for MANUAL REVIEW - not auto-added to database.

📰 Monitoring 4 news sources...
  Checking Citizen Digital...
  Checking TechCrunch...
  Checking TechCrunch Africa...
  Checking Business Daily Kenya...
✅ Found 3 relevant articles for review

📋 NEWS MONITOR REPORT - 2025-01-09 14:30:00
================================================================================
Found 3 potentially relevant articles for review:

1. Kenya unveils region's first GPU-Powered AI infrastructure
   Source: Citizen Digital
   URL: https://www.citizen.digital/article/kenya-unveils-regions-first-gpu-powered-ai-infrastructure-n372958
   Published: 2025-11-13T11:48:00
   Keywords: data center, ai infrastructure, gpu facility, ixafrica
   Summary: Kenya is now home to East and Central Africa's first GPU-powered...

💡 NEXT STEPS:
1. Review each article above
2. If a new data center is mentioned, add it to manual_data_scraper.py
3. Run: python main.py to update the database
================================================================================

💾 Report saved to: news_review_20250109_143000.txt
```

## Adding a New Data Center from News

1. **Review the Article**: Open the URL and read the full article
2. **Extract Information**:
   - Data center name
   - Operator/company
   - Location (city, country)
   - Status (operational, planned, under-construction)
   - Capacity (if mentioned)
   - Year established

3. **Find Coordinates**: Use Google Maps to get latitude/longitude

4. **Add to Manual Scraper**: Edit `scraper/scrapers/manual_data_scraper.py`:

```python
{
    'name': 'Servernah AI Factory at iXAfrica NBOX1',
    'operator': 'Atlancis Technologies (Servernah Cloud) / Everse Technology / iXAfrica',
    'address': 'iXAfrica NBOX1 Campus, Mombasa Road, Nairobi',
    'city': 'Nairobi',
    'country': 'Kenya',
    'latitude': -1.3205,
    'longitude': 36.8831,
    'status': 'operational',
    'ownership_type': 'joint-venture',
    'capacity': {'power_mw': None},
    'year_established': 2025,
    'sources': [
        self.create_source(
            'https://www.citizen.digital/article/...',
            'Citizen Digital - Article Title'
        )
    ]
},
```

5. **Run Scraper**: `python main.py` to add to database

## Adding News Sources

Edit `scraper/scrapers/news_monitor_scraper.py`:

```python
self.news_sources = [
    {
        'name': 'Your News Source',
        'rss_url': 'https://example.com/rss',  # RSS feed URL
        'search_url': 'https://example.com/search?q={query}',  # Optional
        'base_url': 'https://example.com'
    },
    # ... more sources
]
```

## Scheduling (Future)

You can schedule the news monitor to run automatically:

```python
# Using schedule library (already in requirements.txt)
import schedule
import time

def run_news_monitor():
    # Run news monitor
    pass

schedule.every().day.at("09:00").do(run_news_monitor)

while True:
    schedule.run_pending()
    time.sleep(3600)  # Check every hour
```

Or use cron (Linux/Mac) or Task Scheduler (Windows).

## Troubleshooting

### "feedparser not installed"
```bash
pip install feedparser
```

### No articles found
- Check if RSS feeds are accessible
- Verify keywords match your region
- Try adding more news sources

### Articles not relevant
- Adjust keywords in `news_monitor_scraper.py`
- Improve filtering logic in `_filter_relevant()`

## Architecture

```
News Monitor
    │
    ├─> RSS Feeds ──> Parse Articles
    │
    ├─> Keyword Matching ──> Filter Relevant
    │
    └─> Generate Report ──> Manual Review ──> Add to manual_data_scraper.py
```

**Key Principle**: News Monitor = Discovery Tool, Manual Scraper = Source of Truth

