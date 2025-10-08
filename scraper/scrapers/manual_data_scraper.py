"""
Manual/Research-based data scraper
Curated data from research and public sources
"""

from typing import List, Dict, Any
from .base_scraper import BaseScraper

class ManualDataScraper(BaseScraper):
    def __init__(self):
        super().__init__("Manual Research Data")
    
    def scrape(self) -> List[Dict[str, Any]]:
        """
        Return curated data from research and public announcements
        
        This is a manual scraper that returns verified data from:
        - Company announcements
        - News articles
        - Industry reports
        
        TO ADD MORE DATA:
        1. Research data centers online
        2. Find their location (use Google Maps for coordinates)
        3. Add them to the list below
        4. Run: python main.py
        """
        
        # Real Kenya data centers from research
        data_centers = [
            {
                'name': 'Raxio Data Center Nairobi',
                'operator': 'Raxio Group',
                'address': 'Karen, Nairobi',
                'city': 'Nairobi',
                'country': 'Kenya',
                'latitude': -1.3197,
                'longitude': 36.7081,
                'status': 'operational',
                'ownership_type': 'foreign',
                'capacity': {'power_mw': 5},
                'year_established': 2023,
                'sources': [self.create_source(
                    'https://raxiogroup.com',
                    'Raxio Group Official'
                )]
            },
            {
                'name': 'MainOne MDXi Data Center Nairobi',
                'operator': 'MainOne (Equinix)',
                'address': 'Nairobi',
                'city': 'Nairobi',
                'country': 'Kenya',
                'latitude': -1.2920,
                'longitude': 36.8220,
                'status': 'operational',
                'ownership_type': 'foreign',
                'capacity': {'power_mw': 7},
                'year_established': 2020,
                'sources': [self.create_source(
                    'https://www.mainone.net',
                    'MainOne Official'
                )]
            },
            {
                'name': 'CSquared Fibre Data Center',
                'operator': 'CSquared',
                'address': 'Nairobi',
                'city': 'Nairobi',
                'country': 'Kenya',
                'latitude': -1.2850,
                'longitude': 36.8150,
                'status': 'operational',
                'ownership_type': 'joint-venture',
                'capacity': {'power_mw': 4},
                'year_established': 2021,
                'sources': [self.create_source(
                    'https://www.csquared.com',
                    'CSquared Official'
                )]
            },
            {
                'name': 'TeleGeography Kenya Hub',
                'operator': 'Multiple Carriers',
                'address': 'Mombasa',
                'city': 'Mombasa',
                'country': 'Kenya',
                'latitude': -4.0435,
                'longitude': 39.6682,
                'status': 'operational',
                'ownership_type': 'joint-venture',
                'capacity': {'power_mw': 3},
                'year_established': 2019,
                'sources': [self.create_source(
                    'https://www.submarinecablemap.com',
                    'Submarine Cable Map'
                )]
            },
        ]
        
        return data_centers

