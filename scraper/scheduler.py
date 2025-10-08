#!/usr/bin/env python3
"""
Scheduled scraping jobs for data center mapping
"""

import schedule
import time
from datetime import datetime
from main import main as run_scraper

def job():
    """Run the scraping job"""
    print(f"\n{'='*60}")
    print(f"🕐 Scheduled scrape started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")
    
    try:
        run_scraper()
    except Exception as e:
        print(f"❌ Scheduled job failed: {e}")
    
    print(f"\n{'='*60}")
    print(f"✅ Scheduled scrape completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

def main():
    """Set up and run scheduled jobs"""
    print("🤖 Starting Data Center Scraper Scheduler")
    print("=" * 60)
    
    # Schedule jobs
    # Weekly scrape on Monday at 2 AM
    schedule.every().monday.at("02:00").do(job)
    
    # Daily check for news/announcements at 8 AM
    schedule.every().day.at("08:00").do(job)
    
    print("📅 Scheduled jobs:")
    print("  - Weekly full scrape: Mondays at 2:00 AM")
    print("  - Daily updates: Every day at 8:00 AM")
    print("\n⏳ Waiting for scheduled jobs...")
    print("   (Press Ctrl+C to exit)\n")
    
    # Run immediately on start
    print("🚀 Running initial scrape...")
    job()
    
    # Keep running
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Scheduler stopped by user")

