"""
Scraper for DataCenterMap.com
"""

from bs4 import BeautifulSoup
from typing import List, Dict, Any
from .base_scraper import BaseScraper

class DataCenterMapScraper(BaseScraper):
    def __init__(self):
        super().__init__("DataCenterMap.com")
        self.base_url = "https://www.datacentermap.com"
    
    def scrape(self) -> List[Dict[str, Any]]:
        """Scrape data centers from DataCenterMap.com"""
        data_centers = []
        
        # Kenya page
        kenya_url = f"{self.base_url}/kenya/"
        
        try:
            html = self.get_page(kenya_url)
            soup = BeautifulSoup(html, 'html.parser')
            
            # Find data center listings
            # NOTE: This is a simplified example - actual implementation
            # would need to inspect the real HTML structure
            listings = soup.find_all('div', class_='data-center-item')
            
            for listing in listings:
                try:
                    dc = self.parse_listing(listing, kenya_url)
                    if dc:
                        data_centers.append(dc)
                except Exception as e:
                    print(f"⚠️  Failed to parse listing: {e}")
                    continue
            
        except Exception as e:
            print(f"❌ Failed to scrape Kenya page: {e}")
        
        return data_centers
    
    def parse_listing(self, listing, source_url: str) -> Dict[str, Any]:
        """Parse a single data center listing"""
        
        # Extract basic info (adjust selectors based on actual HTML)
        name = listing.find('h3', class_='dc-name')
        name = name.text.strip() if name else 'Unknown'
        
        operator = listing.find('div', class_='dc-operator')
        operator = operator.text.strip() if operator else 'Unknown'
        
        address = listing.find('div', class_='dc-address')
        address_text = address.text.strip() if address else ''
        
        # Parse address components
        city = 'Nairobi'  # Default
        country = 'Kenya'
        
        if address_text:
            parts = address_text.split(',')
            if len(parts) >= 2:
                city = parts[-2].strip()
                country = parts[-1].strip()
        
        return {
            'name': name,
            'operator': operator,
            'address': address_text or f'{city}, {country}',
            'city': city,
            'country': country,
            'status': self.normalize_status('operational'),
            'ownership_type': self.normalize_ownership(operator),
            'sources': [self.create_source(source_url, self.name)]
        }

