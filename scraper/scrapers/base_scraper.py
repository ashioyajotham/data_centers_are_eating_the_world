"""
Base scraper class with common functionality
"""

import requests
import time
from typing import List, Dict, Any
from datetime import datetime
import os

class BaseScraper:
    def __init__(self, name: str):
        self.name = name
        self.user_agent = os.getenv('USER_AGENT', 'Mozilla/5.0')
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': self.user_agent
        })
    
    def scrape(self) -> List[Dict[str, Any]]:
        """Override this method in child classes"""
        raise NotImplementedError
    
    def get_page(self, url: str, delay: float = 1.0) -> str:
        """Fetch a page with rate limiting"""
        time.sleep(delay)
        response = self.session.get(url, timeout=30)
        response.raise_for_status()
        return response.text
    
    def normalize_status(self, status_str: str) -> str:
        """Normalize status strings to standard values"""
        status_lower = status_str.lower().strip()
        
        if 'operational' in status_lower or 'active' in status_lower or 'live' in status_lower:
            return 'operational'
        elif 'construction' in status_lower or 'building' in status_lower:
            return 'under-construction'
        elif 'planned' in status_lower or 'future' in status_lower:
            return 'planned'
        elif 'closed' in status_lower or 'decommissioned' in status_lower:
            return 'decommissioned'
        else:
            return 'operational'  # Default
    
    def normalize_ownership(self, operator: str) -> str:
        """Determine ownership type from operator name"""
        operator_lower = operator.lower()
        
        # Foreign operators (common international companies)
        foreign_keywords = [
            'microsoft', 'google', 'amazon', 'facebook', 'meta',
            'equinix', 'digital realty', 'global switch',
            'colt', 'teraco', 'mainone', 'liquid'
        ]
        
        # Local operators (Kenya-specific)
        local_keywords = [
            'safaricom', 'kenya data', 'wananchi', 'jamii'
        ]
        
        for keyword in foreign_keywords:
            if keyword in operator_lower:
                return 'foreign'
        
        for keyword in local_keywords:
            if keyword in operator_lower:
                return 'local'
        
        # Check for joint ventures
        if 'joint' in operator_lower or '&' in operator or '-' in operator:
            return 'joint-venture'
        
        return 'foreign'  # Default for unknown
    
    def extract_capacity(self, text: str) -> Dict[str, Any]:
        """Extract capacity information from text"""
        import re
        
        capacity = {}
        
        # Extract MW
        mw_match = re.search(r'(\d+(?:\.\d+)?)\s*MW', text, re.IGNORECASE)
        if mw_match:
            capacity['power_mw'] = float(mw_match.group(1))
        
        # Extract square meters or feet
        sqm_match = re.search(r'(\d+(?:,\d+)?)\s*(?:sqm|m²|square\s+meters?)', text, re.IGNORECASE)
        if sqm_match:
            capacity['floor_space_sqm'] = float(sqm_match.group(1).replace(',', ''))
        
        sqft_match = re.search(r'(\d+(?:,\d+)?)\s*(?:sqft|sq\s*ft|square\s+feet)', text, re.IGNORECASE)
        if sqft_match:
            sqft = float(sqft_match.group(1).replace(',', ''))
            capacity['floor_space_sqm'] = sqft * 0.092903  # Convert to sqm
        
        # Extract racks
        rack_match = re.search(r'(\d+)\s*racks?', text, re.IGNORECASE)
        if rack_match:
            capacity['racks'] = int(rack_match.group(1))
        
        return capacity if capacity else None
    
    def create_source(self, url: str, name: str) -> Dict[str, Any]:
        """Create a source object"""
        return {
            'url': url,
            'name': name,
            'scraped_at': datetime.now().isoformat(),
            'verified': False
        }

