# Data Architecture - How Data Flows


### **Tiered ingestion (Kenya)**

- **Tier A — Curated catalogue:** `scraper/data/kenya_curated.json` (preferred) or the inline fallback in `manual_data_scraper.py`. The pipeline **upserts published** `data_centers` rows (`verified = true`) and trusted sources.
- **Tier B/C — Harvesters:** `DataCenterMap.com`, `Datacenters.com`, and `osm_kenya` (stub) produce **candidates only** in `ingestion_candidates` until an admin approves them in the dashboard (or via `/api/ingestion/*`).
- **Public API / map:** Without an admin JWT, list/geojson/export/statistics only include **published** facilities.

See `docs/API.md` (authentication) and `npm run db:migrate` in `docs/SETUP.md` for the `ingestion_candidates` table.

### **seed.ts** - Bootstrap Data (3 DCs)
**Purpose:** Minimal data to show the app works  
**When to run:** Once, during initial setup  
**Contents:** 3 well-known Kenyan data centers
- Africa Data Centres Nairobi
- iXAfrica Nairobi
- Safaricom M-PESA

**Command:** `npm run db:seed` (in backend/)

**Why minimal?**
- Just proves the database works
- Users see something immediately
- Real data comes from scraper

### **manual_data_scraper.py** - Production Data (15+ DCs)
**Purpose:** THE source of truth for all curated data  
**When to run:** Anytime you want to update data  
**Contents:** All researched Kenya data centers (currently 15)

**Command:** `python main.py` (in scraper/)

**Why this is the main source?**
- Aligns with "automated scraping" vision
- Goes through same pipeline (deduplication, geocoding)
- Easily expandable (just add to the list)
- Sources are tracked properly

### **sources-data.ts** - Source Citations for Seed Only
**Purpose:** Track sources for the 3 bootstrap DCs  
**Used by:** seed.ts and update-sources.ts  
**Contents:** Just 3 entries

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────┐
│         INITIAL SETUP (Once)            │
├─────────────────────────────────────────┤
│  1. npm run db:setup                    │
│     └─> Creates tables                  │
│                                         │
│  2. npm run db:seed                     │
│     └─> Adds 3 bootstrap DCs            │
│         (from seed.ts)                  │
└─────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│      PRODUCTION DATA (Repeatable)       │
├─────────────────────────────────────────┤
│  3. python scraper/main.py              │
│     └─> Runs ManualDataScraper          │
│         ├─> Returns 15 DCs              │
│         ├─> Deduplicates                │
│         ├─> Geocodes                    │
│         └─> Saves to database           │
│                                         │
│  Result: 3 + 15 = 18 total DCs         │
└─────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│           USER SEES IN APP              │
├─────────────────────────────────────────┤
│  • 18 markers on map                    │
│  • All with proper sources              │
│  • Mix of seed + scraped data           │
│  • Deduplicated automatically           │
└─────────────────────────────────────────┘
```

## 🔄 Updating Data

### To Add New Data Centers

**DON'T edit seed.ts** - it's minimal by design

**DO edit manual_data_scraper.py:**

```python
# Open: scraper/scrapers/manual_data_scraper.py
# Add at the end of the data_centers list:

{
    'name': 'Your New Data Center',
    'operator': 'Company Name',
    'address': 'Address',
    'city': 'Nairobi',
    'country': 'Kenya',
    'latitude': -1.2345,
    'longitude': 36.1234,
    'status': 'operational',
    'ownership_type': 'local',
    'capacity': {'power_mw': 5},
    'year_established': 2024,
    'sources': [self.create_source(
        'https://company-website.com',
        'Company Official'
    )]
},
```

Then run:
```bash
cd scraper
python main.py
```

### To Update Existing Data

Same file - just edit the entry and re-run the scraper.

The deduplicator will merge updates automatically!

## 🎓 Why This Architecture?

### Benefits:
1. **Single Source of Truth** - All real data in one place (manual_data_scraper.py)
2. **Scalable** - Easy to add more data
3. **Testable** - Can test scraper independently
4. **Aligns with Vision** - Everything goes through scraper pipeline
5. **No Redundancy** - Each DC defined once
6. **Proper Citations** - Sources embedded with data

### Trade-offs:
- seed.ts is minimal (not comprehensive)
- Users must run scraper to get full data
- But this is how automated systems work!

## 📁 File Responsibilities

| File | Responsibility | Data Count | When to Edit |
|------|----------------|------------|--------------|
| `backend/src/db/schema.sql` | Database structure | N/A | Rarely |
| `backend/src/db/seed.ts` | Bootstrap data | 3 DCs | Never (minimal by design) |
| `backend/src/db/sources-data.ts` | Sources for bootstrap | 3 entries | When seed changes |
| `scraper/scrapers/manual_data_scraper.py` | **Production data** | **15 DCs** | **Add new DCs here!** |
| `scraper/scrapers/datacentermap_scraper.py` | Web scraping | 0 (needs work) | When updating selectors |

## 🚀 Workflow for You

### First Time Setup:
```bash
# 1. Create database
npm run db:setup

# 2. Add bootstrap data (3 DCs)
npm run db:seed

# 3. Get production data (15 DCs)
cd ../scraper
python main.py
```

**Result:** 18 data centers total

### Adding More Data:
```bash
# 1. Edit: scraper/scrapers/manual_data_scraper.py
# 2. Add your new data center to the list
# 3. Run:
python main.py
```

Done! ✅

## 📝 Summary

**Before (Confusing):**
- seed.ts: 13 DCs
- manual_data_scraper.py: 9 DCs  
- **Problem:** Duplication! Where to add new ones?

**After (Clean):**
- seed.ts: 3 DCs (minimal, never touch)
- manual_data_scraper.py: 15 DCs (**THE source of truth**)
- **Solution:** One clear place to add data!

---

**This is much cleaner architecture, Victor!** 👏

Your instinct was spot-on. This is how professional systems are built.

