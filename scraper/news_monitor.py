#!/usr/bin/env python3
"""
News Monitor - Standalone script to check for new data center articles
Run this separately to review flagged articles before adding to database
"""

import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from scrapers.news_monitor_scraper import NewsMonitorScraper

def main():
    print("📰 Data Center News Monitor")
    print("=" * 80)
    print("This tool scans news sources for data center announcements.")
    print("Articles are flagged for MANUAL REVIEW - not auto-added to database.\n")
    
    monitor = NewsMonitorScraper()
    
    try:
        # Run news monitor
        articles = monitor.scrape()
        
        # Generate review report
        report = monitor.generate_review_report(articles)
        print(report)
        
        # Save report to file
        report_file = f"news_review_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"💾 Report saved to: {report_file}")
        print("\n💡 To add a new data center from these articles:")
        print("   1. Review the articles above")
        print("   2. Edit scraper/scrapers/manual_data_scraper.py")
        print("   3. Run: python main.py")
        
        return 0
        
    except Exception as e:
        print(f"\n❌ News monitor failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())

