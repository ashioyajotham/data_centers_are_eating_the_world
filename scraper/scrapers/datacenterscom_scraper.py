"""
Scraper for Datacenters.com
"""

from bs4 import BeautifulSoup
from typing import List, Dict, Any
from .base_scraper import BaseScraper

class DataCentersComScraper(BaseScraper):
    def __init__(self):
        super().__init__("Datacenters.com")
        self.base_url = "https://www.datacenters.com"
    
    def scrape(self) -> List[Dict[str, Any]]:
        """Scrape data centers from Datacenters.com"""
        data_centers = []
        
        # Kenya page
        kenya_url = f"{self.base_url}/locations/kenya"
        
        try:
            html = self.get_page(kenya_url)
            soup = BeautifulSoup(html, 'html.parser')
            
            # Find data center listings
            # NOTE: This is a simplified example
            listings = soup.find_all('div', class_='facility-card')
            
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
        
        name = listing.find('h3')
        name = name.text.strip() if name else 'Unknown'
        
        operator = listing.find('div', class_='operator')
        operator = operator.text.strip() if operator else 'Unknown'
        
        location = listing.find('div', class_='location')
        location_text = location.text.strip() if location else ''
        
        city = 'Nairobi'
        country = 'Kenya'
        
        if location_text:
            parts = location_text.split(',')
            if len(parts) >= 1:
                city = parts[0].strip()
        
        # Extract capacity if available
        capacity_div = listing.find('div', class_='specs')
        capacity = None
        if capacity_div:
            capacity = self.extract_capacity(capacity_div.text)
        
        return {
            'name': name,
            'operator': operator,
            'address': location_text or f'{city}, {country}',
            'city': city,
            'country': country,
            'status': 'operational',
            'ownership_type': self.normalize_ownership(operator),
            'capacity': capacity,
            'sources': [self.create_source(source_url, self.name)]
        }

