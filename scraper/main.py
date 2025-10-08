#!/usr/bin/env python3
"""
Main scraper orchestrator for Data Centers mapping project
"""

import sys
import time
from datetime import datetime
from scrapers.datacentermap_scraper import DataCenterMapScraper
from scrapers.datacenterscom_scraper import DataCentersComScraper
from processors.deduplicator import Deduplicator
from processors.geocoder import Geocoder
from db.database import Database

def main():
    print("🚀 Starting data center scraping pipeline...")
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    db = Database()
    
    try:
        # Initialize scrapers
        scrapers = [
            DataCenterMapScraper(),
            DataCentersComScraper(),
        ]
        
        all_data = []
        
        # Run each scraper
        for scraper in scrapers:
            print(f"\n📊 Running {scraper.name}...")
            try:
                data = scraper.scrape()
                print(f"✅ {scraper.name}: Found {len(data)} data centers")
                all_data.extend(data)
            except Exception as e:
                print(f"❌ {scraper.name} failed: {str(e)}")
                continue
        
        print(f"\n📦 Total records collected: {len(all_data)}")
        
        # Deduplicate
        print("\n🔄 Deduplicating data...")
        deduplicator = Deduplicator()
        unique_data = deduplicator.deduplicate(all_data)
        print(f"✅ Unique records: {len(unique_data)}")
        
        # Geocode
        print("\n🗺️  Geocoding addresses...")
        geocoder = Geocoder()
        geocoded_data = []
        for item in unique_data:
            try:
                geocoded = geocoder.geocode(item)
                if geocoded:
                    geocoded_data.append(geocoded)
            except Exception as e:
                print(f"⚠️  Geocoding failed for {item.get('name', 'unknown')}: {e}")
                continue
        
        print(f"✅ Successfully geocoded: {len(geocoded_data)}")
        
        # Save to database
        print("\n💾 Saving to database...")
        new_count = 0
        updated_count = 0
        
        for item in geocoded_data:
            try:
                is_new = db.upsert_datacenter(item)
                if is_new:
                    new_count += 1
                else:
                    updated_count += 1
            except Exception as e:
                print(f"⚠️  Failed to save {item.get('name', 'unknown')}: {e}")
                continue
        
        print(f"✅ New records: {new_count}")
        print(f"✅ Updated records: {updated_count}")
        
        print(f"\n🎉 Scraping completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
    except Exception as e:
        print(f"\n❌ Pipeline failed: {str(e)}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()

