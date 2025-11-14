#!/usr/bin/env python3
"""
Main scraper orchestrator for Data Centers mapping project
"""

import sys
import time
import argparse
from datetime import datetime
from scrapers.datacentermap_scraper import DataCenterMapScraper
from scrapers.datacenterscom_scraper import DataCentersComScraper
from scrapers.manual_data_scraper import ManualDataScraper
from scrapers.news_monitor_scraper import NewsMonitorScraper
from processors.deduplicator import Deduplicator
from processors.geocoder import Geocoder
from db.database import Database

def main():
    parser = argparse.ArgumentParser(description='Data Center Scraper Pipeline')
    parser.add_argument('--news-only', action='store_true', 
                       help='Only run news monitor (no database updates)')
    parser.add_argument('--include-news', action='store_true',
                       help='Include news monitor in main pipeline')
    args = parser.parse_args()
    
    # If news-only mode, run news monitor and exit
    if args.news_only:
        print("📰 Running News Monitor Only...")
        monitor = NewsMonitorScraper()
        articles = monitor.scrape()
        report = monitor.generate_review_report(articles)
        print(report)
        
        # Save report
        report_file = f"news_review_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"💾 Report saved to: {report_file}")
        return 0
    
    print("🚀 Starting data center scraping pipeline...")
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    db = Database()
    
    try:
        # Initialize scrapers
        scrapers = [
            ManualDataScraper(),  # Curated research data (works now!)
            DataCenterMapScraper(),  # Need to update HTML selectors
            DataCentersComScraper(),  # Need to update HTML selectors
        ]
        
        # Optionally include news monitor (runs but doesn't add to DB)
        if args.include_news:
            print("\n📰 Running News Monitor (for review only)...")
            monitor = NewsMonitorScraper()
            try:
                articles = monitor.scrape()
                if articles:
                    report = monitor.generate_review_report(articles)
                    print(report)
                    report_file = f"news_review_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
                    with open(report_file, 'w', encoding='utf-8') as f:
                        f.write(report)
                    print(f"💾 News report saved to: {report_file}")
            except Exception as e:
                print(f"⚠️  News monitor warning: {e}")
            print()  # Blank line before main scrapers
        
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
        print("\n💡 TIP: Run 'python news_monitor.py' to check for new data center news articles")
        
        return 0
        
    except Exception as e:
        print(f"\n❌ Pipeline failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        db.close()

if __name__ == "__main__":
    sys.exit(main())

