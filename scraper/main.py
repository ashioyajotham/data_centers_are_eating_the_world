#!/usr/bin/env python3
"""
Main scraper orchestrator for Data Centers mapping project

Tier A (Kenya curated JSON / manual fallback): upserts verified rows directly.
Tier B/C (web/OSM harvesters): inserts ingestion_candidates for admin review only.
"""

import os
import sys
import time
import argparse
import requests
from datetime import datetime

from source_link_enricher import enrich_facility_sources
from scrapers.datacentermap_scraper import DataCenterMapScraper
from scrapers.datacenterscom_scraper import DataCentersComScraper
from scrapers.osm_kenya_scraper import OsmKenyaScraper
from scrapers.manual_data_scraper import ManualDataScraper
from scrapers.news_monitor_scraper import NewsMonitorScraper
from processors.deduplicator import Deduplicator
from processors.geocoder import Geocoder
from db.database import Database


def _run_geocode(geocoder: Geocoder, items: list) -> list:
    out = []
    for item in items:
        try:
            geocoded = geocoder.geocode(item)
            if geocoded:
                out.append(geocoded)
        except Exception as e:
            print(f"⚠️  Geocoding failed for {item.get('name', 'unknown')}: {e}")
            continue
    return out


def main():
    parser = argparse.ArgumentParser(description='Data Center Scraper Pipeline')
    parser.add_argument('--news-only', action='store_true',
                        help='Only run news monitor (no database updates)')
    parser.add_argument('--include-news', action='store_true',
                        help='Include news monitor in main pipeline')
    parser.add_argument(
        '--no-fetch-source-pages',
        action='store_true',
        help='Skip HTTP requests for curated sources (use JSON URLs/names as-is; faster/offline)',
    )
    args = parser.parse_args()

    if args.news_only:
        print("📰 Running News Monitor Only...")
        monitor = NewsMonitorScraper()
        articles = monitor.scrape()
        report = monitor.generate_review_report(articles)
        print(report)

        report_file = f"news_review_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"💾 Report saved to: {report_file}")
        return 0

    print("🚀 Starting data center scraping pipeline (Kenya-focused)...")
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    db = Database()
    log_id = db.start_scrape_log('full_pipeline Kenya')
    records_found = 0
    new_dc = 0
    updated_dc = 0
    candidates_upserted = 0

    try:
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
            print()

        geocoder = Geocoder()
        deduplicator = Deduplicator()

        # —— Tier A: curated Kenya catalogue → published DCs ——
        print("\n📚 Tier A — Manual / kenya_curated.json ...")
        curated = ManualDataScraper().scrape()
        print(f"   Loaded {len(curated)} curated records")
        records_found += len(curated)

        geocoded_curated = _run_geocode(geocoder, curated)
        print(f"   Geocoded curated: {len(geocoded_curated)}")

        skip_source_fetch = args.no_fetch_source_pages or os.getenv(
            "SKIP_SOURCE_PAGE_FETCH", ""
        ).lower() in ("1", "true", "yes")
        if not skip_source_fetch:
            print("   Fetching curated source pages (redirects + titles)...")
            src_session = requests.Session()
            src_session.headers.update(
                {"User-Agent": os.getenv("USER_AGENT", "Mozilla/5.0")}
            )
            for item in geocoded_curated:
                enrich_facility_sources(src_session, item)
        else:
            print("   Skipping curated source page fetch (--no-fetch-source-pages or SKIP_SOURCE_PAGE_FETCH)")

        for item in geocoded_curated:
            try:
                if db.upsert_curated(item):
                    new_dc += 1
                else:
                    updated_dc += 1
            except Exception as e:
                print(f"⚠️  Failed curated upsert {item.get('name', 'unknown')}: {e}")

        # —— Tier B/C: harvesters → ingestion_candidates ——
        harvesters = [
            DataCenterMapScraper(),
            DataCentersComScraper(),
            OsmKenyaScraper(),
        ]

        for scraper in harvesters:
            print(f"\n📊 Tier B/C — {scraper.name} ({scraper.source_system})...")
            try:
                raw = scraper.scrape()
                print(f"   Raw rows: {len(raw)}")
                records_found += len(raw)
                if not raw:
                    continue

                deduped = deduplicator.deduplicate(raw)
                geocoded_h = _run_geocode(geocoder, deduped)
                print(f"   Unique + geocoded: {len(geocoded_h)}")

                for item in geocoded_h:
                    try:
                        db.insert_candidate(
                            item,
                            scraper.source_system,
                            country_scope='Kenya',
                            confidence=45 if scraper.source_system == 'osm_kenya' else 50,
                        )
                        candidates_upserted += 1
                    except Exception as e:
                        print(f"⚠️  Candidate insert failed {item.get('name', 'unknown')}: {e}")
            except Exception as e:
                print(f"❌ {scraper.name} failed: {str(e)}")
                continue
            time.sleep(0.5)

        db.complete_scrape_log(
            log_id,
            'completed',
            records_found,
            new_dc,
            updated_dc + candidates_upserted,
            None,
        )

        print(f"\n✅ New published DC rows: {new_dc}")
        print(f"✅ Updated published DC rows: {updated_dc}")
        print(f"✅ Harvest candidate writes (insert/update pending): {candidates_upserted}")
        print(f"\n🎉 Scraping completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("💡 Approve harvest queue in Admin → Ingestion (API /api/ingestion/candidates).")

        return 0

    except Exception as e:
        print(f"\n❌ Pipeline failed: {str(e)}")
        import traceback
        traceback.print_exc()
        try:
            db.complete_scrape_log(
                log_id,
                'failed',
                records_found,
                new_dc,
                updated_dc + candidates_upserted,
                str(e),
            )
        except Exception:
            pass
        return 1
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
