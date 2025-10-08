# How to Run the Scraper

## Quick Command

```bash
cd C:\Users\HomePC\data_centers_mapping\scraper
python main.py
```

## What It Does

The scraper will:
1. ✅ Run **ManualDataScraper** (research-based data - works immediately!)
2. ⚠️ Run DataCenterMapScraper (needs HTML selectors updated)
3. ⚠️ Run DataCentersComScraper (needs HTML selectors updated)
4. ✅ Deduplicate all data using fuzzy matching
5. ✅ Geocode any addresses without coordinates
6. ✅ Save to PostgreSQL database

## Expected Output

```
🚀 Starting data center scraping pipeline...
⏰ Started at: 2025-10-08 12:30:00

📊 Running Manual Research Data...
✅ Manual Research Data: Found 4 data centers

📊 Running DataCenterMap.com...
✅ DataCenterMap.com: Found 0 data centers

📊 Running Datacenters.com...
✅ Datacenters.com: Found 0 data centers

📦 Total records collected: 4

🔄 Deduplicating data...
✅ Unique records: 4

🗺️  Geocoding addresses...
✅ Successfully geocoded: 4

💾 Saving to database...
✅ New records: 4
✅ Updated records: 0

🎉 Scraping completed at: 2025-10-08 12:30:15
```

## What Gets Added

The **ManualDataScraper** will add 4 new data centers:
- Raxio Data Center Nairobi (2023)
- MainOne MDXi Data Center Nairobi (2020)
- CSquared Fibre Data Center (2021)
- TeleGeography Kenya Hub in Mombasa (2019)

## 📝 Adding Your Own Data

### Option 1: Edit ManualDataScraper (Easiest)

Open `scraper/scrapers/manual_data_scraper.py` and add new entries:

```python
{
    'name': 'Your Data Center Name',
    'operator': 'Operator Name',
    'address': 'Full Address',
    'city': 'Nairobi',
    'country': 'Kenya',
    'latitude': -1.2345,  # Get from Google Maps
    'longitude': 36.1234,
    'status': 'operational',  # or 'planned', 'under-construction'
    'ownership_type': 'local',  # or 'foreign', 'joint-venture'
    'capacity': {'power_mw': 5},
    'year_established': 2020,
    'sources': [self.create_source(
        'https://source-url.com',
        'Source Name'
    )]
},
```

Then run: `python main.py`

### Option 2: Update Real Web Scrapers

To get DataCenterMap.com and Datacenters.com working:

1. Read `docs/SCRAPER_GUIDE.md`
2. Visit the websites and inspect HTML
3. Update selectors in the scraper files
4. Test and run

## 🎯 After Running

1. Check the terminal output for how many were added
2. Refresh your browser at http://localhost:5173
3. You should see new markers on the map!
4. Dashboard stats will update automatically

## 🔄 Re-running the Scraper

The scraper is smart - it won't create duplicates! You can run `python main.py` as many times as you want.

- **New data centers** → Added to database
- **Existing data centers** → Updated if info changed
- **Duplicates** → Merged using fuzzy matching

## 📅 Scheduled Scraping

To run automatically:

```bash
python scheduler.py
```

This will:
- Run immediately
- Then run every Monday at 2 AM
- And every day at 8 AM

Press Ctrl+C to stop.

---

**Ready to try?** Make sure you:
1. ✅ Update `scraper/.env` with your PostgreSQL password
2. ✅ Run `python main.py`
3. ✅ Refresh browser to see new data!

