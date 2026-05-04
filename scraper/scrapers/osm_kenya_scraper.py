"""
OpenStreetMap Kenya harvester (Tier B/C stub).

Extend with Overpass queries filtered to Kenya (ISO-3166-1: KE) when you need
live POI discovery. Staged rows always go through ``ingestion_candidates``.
"""

from typing import List, Dict, Any
from .base_scraper import BaseScraper


class OsmKenyaScraper(BaseScraper):
    source_system = "osm_kenya"

    def __init__(self):
        super().__init__("OpenStreetMap Kenya (stub)")

    def scrape(self) -> List[Dict[str, Any]]:
        # Placeholder: add Overpass API call + parsing; keep Kenya bbox / area:KE filter.
        return []
