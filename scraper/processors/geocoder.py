"""
Geocoding processor using geopy
"""

from typing import Dict, Any, Optional
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import time

class Geocoder:
    def __init__(self):
        self.geolocator = Nominatim(user_agent="datacenter_mapper")
        self.cache = {}
    
    def geocode(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Add latitude and longitude to data center record
        """
        # Return if already has coordinates
        if data.get('latitude') and data.get('longitude'):
            return data
        
        # Build search query
        address = data.get('address', '')
        city = data.get('city', '')
        country = data.get('country', '')
        
        query = f"{address}, {city}, {country}".strip(', ')
        
        if not query:
            return None
        
        # Check cache
        if query in self.cache:
            lat, lon = self.cache[query]
            data['latitude'] = lat
            data['longitude'] = lon
            return data
        
        # Geocode
        try:
            time.sleep(1)  # Rate limiting
            location = self.geolocator.geocode(query, timeout=10)
            
            if location:
                data['latitude'] = location.latitude
                data['longitude'] = location.longitude
                self.cache[query] = (location.latitude, location.longitude)
                return data
            else:
                # Try with just city and country
                fallback_query = f"{city}, {country}"
                time.sleep(1)
                location = self.geolocator.geocode(fallback_query, timeout=10)
                
                if location:
                    data['latitude'] = location.latitude
                    data['longitude'] = location.longitude
                    self.cache[query] = (location.latitude, location.longitude)
                    return data
        
        except (GeocoderTimedOut, GeocoderServiceError) as e:
            print(f"⚠️  Geocoding error for {query}: {e}")
        
        return None

