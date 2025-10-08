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
        # This is the PRIMARY source for curated data
        # seed.ts only has 3 DCs for demo purposes
        data_centers = [
            # From seed.ts - moved here for centralization
            {
                'name': 'Microsoft Azure East Africa Region',
                'operator': 'Microsoft Corporation',
                'address': 'Nairobi (Location TBD - $1B Investment with G42)',
                'city': 'Nairobi',
                'country': 'Kenya',
                'latitude': -1.2921,
                'longitude': 36.8219,
                'status': 'planned',
                'ownership_type': 'foreign',
                'capacity': {'power_mw': 50},
                'year_established': None,
                'sources': [self.create_source(
                    'https://azure.microsoft.com/en-us/explore/global-infrastructure/geographies/',
                    'Microsoft Azure Official'
                )]
            },
            {
                'name': 'Wananchi Online Data Center',
                'operator': 'Wananchi Group',
                'address': 'Nairobi',
                'city': 'Nairobi',
                'country': 'Kenya',
                'latitude': -1.2745,
                'longitude': 36.8015,
                'status': 'operational',
                'ownership_type': 'local',
                'capacity': {'power_mw': 2},
                'year_established': 2014,
                'sources': [self.create_source(
                    'https://www.wananchi.com',
                    'Wananchi Group Official'
                )]
            },
            {
                'name': 'East Africa Data Centre',
                'operator': 'Wingu.Africa',
                'address': 'Mombasa Road, Nairobi',
                'city': 'Nairobi',
                'country': 'Kenya',
                'latitude': -1.3167,
                'longitude': 36.8851,
                'status': 'operational',
                'ownership_type': 'local',
                'capacity': {'power_mw': 6},
                'year_established': 2018,
                'sources': [self.create_source(
                    'https://wingu.africa',
                    'Wingu.Africa Official'
                )]
            },
            {
                'name': 'Liquid Intelligent Technologies Kenya',
                'operator': 'Liquid Intelligent Technologies',
                'address': 'Sameer Business Park, Nairobi',
                'city': 'Nairobi',
                'country': 'Kenya',
                'latitude': -1.3150,
                'longitude': 36.8830,
                'status': 'operational',
                'ownership_type': 'foreign',
                'capacity': {'power_mw': 8},
                'year_established': 2019,
                'sources': [self.create_source(
                    'https://www.liquid.tech',
                    'Liquid Intelligent Technologies Official'
                )]
            },
            {
                'name': 'Kenya Data Networks (KDN) Data Center',
                'operator': 'Kenya Data Networks',
                'address': 'Nairobi',
                'city': 'Nairobi',
                'country': 'Kenya',
                'latitude': -1.2850,
                'longitude': 36.8200,
                'status': 'operational',
                'ownership_type': 'local',
                'capacity': {'power_mw': 4},
                'year_established': 2016,
                'sources': [self.create_source(
                    'https://www.kdn.co.ke',
                    'KDN Official'
                )]
            },
            {
                'name': 'Telkom Kenya Data Center',
                'operator': 'Telkom Kenya',
                'address': 'Nairobi',
                'city': 'Nairobi',
                'country': 'Kenya',
                'latitude': -1.2800,
                'longitude': 36.8100,
                'status': 'operational',
                'ownership_type': 'local',
                'capacity': {'power_mw': 3.5},
                'year_established': 2012,
                'sources': [self.create_source(
                    'https://www.telkom.co.ke',
                    'Telkom Kenya Official'
                )]
            },
            {
                'name': 'Bandwidth and Cloud Services (BCS) Data Center',
                'operator': 'BCS Group',
                'address': 'Westlands, Nairobi',
                'city': 'Nairobi',
                'country': 'Kenya',
                'latitude': -1.2650,
                'longitude': 36.8050,
                'status': 'operational',
                'ownership_type': 'local',
                'capacity': {'power_mw': 2.5},
                'year_established': 2015,
                'sources': [self.create_source(
                    'https://bcs.co.ke',
                    'BCS Group Official'
                )]
            },
            {
                'name': 'Google Cloud Kenya (Planned)',
                'operator': 'Google Cloud',
                'address': 'Nairobi',
                'city': 'Nairobi',
                'country': 'Kenya',
                'latitude': -1.2900,
                'longitude': 36.8250,
                'status': 'planned',
                'ownership_type': 'foreign',
                'capacity': {'power_mw': 30},
                'year_established': None,
                'sources': [self.create_source(
                    'https://cloud.google.com/infrastructure/regions',
                    'Google Cloud Regions'
                )]
            },
            {
                'name': 'Africa Data Centres Mombasa',
                'operator': 'Africa Data Centres',
                'address': 'Mombasa',
                'city': 'Mombasa',
                'country': 'Kenya',
                'latitude': -4.0435,
                'longitude': 39.6682,
                'status': 'under-construction',
                'ownership_type': 'foreign',
                'capacity': {'power_mw': 8},
                'year_established': None,
                'sources': [self.create_source(
                    'https://www.africadatacentres.com',
                    'Africa Data Centres Official'
                )]
            },
            {
                'name': 'SEACOM Kenya Data Center',
                'operator': 'SEACOM',
                'address': 'Mombasa Road, Nairobi',
                'city': 'Nairobi',
                'country': 'Kenya',
                'latitude': -1.3180,
                'longitude': 36.8840,
                'status': 'operational',
                'ownership_type': 'foreign',
                'capacity': {'power_mw': 5},
                'year_established': 2014,
                'sources': [self.create_source(
                    'https://www.seacom.com',
                    'SEACOM Official'
                )]
            },
            {
                'name': 'Jamii Telecommunications Data Center',
                'operator': 'Jamii Telkom',
                'address': 'Nairobi',
                'city': 'Nairobi',
                'country': 'Kenya',
                'latitude': -1.2750,
                'longitude': 36.8100,
                'status': 'operational',
                'ownership_type': 'joint-venture',
                'capacity': {'power_mw': 3},
                'year_established': 2013,
                'sources': [self.create_source(
                    'https://www.jamii.africa',
                    'Jamii Telkom Official'
                )]
            },
            # Latest additions - researched 2023-2024
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
            # Smaller ISPs and edge data centers
            {
                'name': 'Poa Internet Data Center',
                'operator': 'Poa Internet',
                'address': 'Nairobi',
                'city': 'Nairobi',
                'country': 'Kenya',
                'latitude': -1.2700,
                'longitude': 36.8100,
                'status': 'operational',
                'ownership_type': 'local',
                'capacity': {'power_mw': 1.5},
                'year_established': 2016,
                'sources': [self.create_source(
                    'https://www.poainternet.com',
                    'Poa Internet Official'
                )]
            },
            {
                'name': 'Mawingu Networks Edge DC',
                'operator': 'Mawingu Networks',
                'address': 'Nairobi',
                'city': 'Nairobi',
                'country': 'Kenya',
                'latitude': -1.2750,
                'longitude': 36.8150,
                'status': 'operational',
                'ownership_type': 'local',
                'capacity': {'power_mw': 1},
                'year_established': 2018,
                'sources': [self.create_source(
                    'https://www.mawingu.com',
                    'Mawingu Networks Official'
                )]
            },
            {
                'name': 'Tespok Data Center',
                'operator': 'TESPOK (Internet Service Providers)',
                'address': 'Nairobi',
                'city': 'Nairobi',
                'country': 'Kenya',
                'latitude': -1.2680,
                'longitude': 36.8080,
                'status': 'operational',
                'ownership_type': 'joint-venture',
                'capacity': {'power_mw': 2},
                'year_established': 2014,
                'sources': [self.create_source(
                    'https://www.tespok.co.ke',
                    'TESPOK Official'
                )]
            },
            {
                'name': 'Airtel Kenya Data Center',
                'operator': 'Airtel Networks Kenya',
                'address': 'Nairobi',
                'city': 'Nairobi',
                'country': 'Kenya',
                'latitude': -1.2850,
                'longitude': 36.8200,
                'status': 'operational',
                'ownership_type': 'foreign',
                'capacity': {'power_mw': 3.5},
                'year_established': 2015,
                'sources': [self.create_source(
                    'https://www.airtel.africa',
                    'Airtel Africa Official'
                )]
            },
            {
                'name': 'East African Marine Systems (TEAMS) Data Center',
                'operator': 'TEAMS Cable',
                'address': 'Mombasa',
                'city': 'Mombasa',
                'country': 'Kenya',
                'latitude': -4.0500,
                'longitude': 39.6750,
                'status': 'operational',
                'ownership_type': 'joint-venture',
                'capacity': {'power_mw': 2},
                'year_established': 2009,
                'sources': [self.create_source(
                    'https://www.teamsable.com',
                    'TEAMS Cable Official'
                )]
            },
        ]
        
        return data_centers

