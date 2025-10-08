"""
Deduplication processor using fuzzy matching
"""

from typing import List, Dict, Any
from fuzzywuzzy import fuzz

class Deduplicator:
    def __init__(self, threshold: int = 85):
        self.threshold = threshold
    
    def deduplicate(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Deduplicate data centers using fuzzy matching on name and location
        """
        if not data:
            return []
        
        unique = []
        seen = []
        
        for item in data:
            is_duplicate = False
            
            for existing in unique:
                if self.is_duplicate(item, existing):
                    # Merge sources
                    existing['sources'].extend(item.get('sources', []))
                    # Update with more complete data
                    existing = self.merge_data(existing, item)
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                unique.append(item)
        
        return unique
    
    def is_duplicate(self, item1: Dict[str, Any], item2: Dict[str, Any]) -> bool:
        """
        Check if two data centers are duplicates
        """
        # Compare names
        name_score = fuzz.ratio(
            item1.get('name', '').lower(),
            item2.get('name', '').lower()
        )
        
        # Compare addresses/cities
        location1 = f"{item1.get('city', '')} {item1.get('address', '')}".lower()
        location2 = f"{item2.get('city', '')} {item2.get('address', '')}".lower()
        location_score = fuzz.partial_ratio(location1, location2)
        
        # Compare operators
        operator_score = fuzz.ratio(
            item1.get('operator', '').lower(),
            item2.get('operator', '').lower()
        )
        
        # Consider duplicate if name is very similar AND location matches
        if name_score >= self.threshold and location_score >= 70:
            return True
        
        # Or if all three are reasonably similar
        if name_score >= 70 and location_score >= 70 and operator_score >= 70:
            return True
        
        return False
    
    def merge_data(self, existing: Dict[str, Any], new: Dict[str, Any]) -> Dict[str, Any]:
        """
        Merge two data center records, preferring more complete data
        """
        # Update fields if new data is more complete
        for key, value in new.items():
            if key == 'sources':
                continue  # Already merged above
            
            if not existing.get(key) and value:
                existing[key] = value
            elif key == 'capacity' and value:
                # Merge capacity data
                if not existing.get('capacity'):
                    existing['capacity'] = value
                else:
                    for cap_key, cap_value in value.items():
                        if not existing['capacity'].get(cap_key):
                            existing['capacity'][cap_key] = cap_value
        
        return existing

