"""
Database handler for storing scraped data
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        self.conn = psycopg2.connect(
            os.getenv('DATABASE_URL', 'postgresql://localhost:5432/datacenter_map')
        )
        self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)
    
    def upsert_datacenter(self, data: Dict[str, Any]) -> bool:
        """
        Insert or update a data center record
        Returns True if new record, False if updated
        """
        # Check if exists (by name and city)
        self.cursor.execute("""
            SELECT id FROM data_centers
            WHERE LOWER(name) = LOWER(%s) AND LOWER(city) = LOWER(%s)
        """, (data['name'], data['city']))
        
        existing = self.cursor.fetchone()
        
        capacity = data.get('capacity', {})
        metadata = data.get('metadata', {})
        
        if existing:
            # Update existing
            dc_id = existing['id']
            self.cursor.execute("""
                UPDATE data_centers SET
                    operator = %s,
                    address = %s,
                    country = %s,
                    latitude = %s,
                    longitude = %s,
                    location = ST_SetSRID(ST_MakePoint(%s, %s), 4326),
                    status = %s,
                    ownership_type = %s,
                    power_capacity_mw = %s,
                    floor_space_sqm = %s,
                    rack_count = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (
                data.get('operator'),
                data.get('address'),
                data.get('country'),
                data.get('latitude'),
                data.get('longitude'),
                data.get('longitude'),
                data.get('latitude'),
                data.get('status', 'operational'),
                data.get('ownership_type', 'foreign'),
                capacity.get('power_mw'),
                capacity.get('floor_space_sqm'),
                capacity.get('racks'),
                dc_id
            ))
            is_new = False
        else:
            # Insert new
            self.cursor.execute("""
                INSERT INTO data_centers (
                    name, operator, address, city, country,
                    latitude, longitude, location,
                    status, ownership_type,
                    power_capacity_mw, floor_space_sqm, rack_count,
                    year_established, tier_rating
                ) VALUES (
                    %s, %s, %s, %s, %s,
                    %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326),
                    %s, %s,
                    %s, %s, %s,
                    %s, %s
                )
                RETURNING id
            """, (
                data.get('name'),
                data.get('operator'),
                data.get('address'),
                data.get('city'),
                data.get('country'),
                data.get('latitude'),
                data.get('longitude'),
                data.get('longitude'),
                data.get('latitude'),
                data.get('status', 'operational'),
                data.get('ownership_type', 'foreign'),
                capacity.get('power_mw'),
                capacity.get('floor_space_sqm'),
                capacity.get('racks'),
                data.get('year_established'),
                metadata.get('tier')
            ))
            dc_id = self.cursor.fetchone()['id']
            is_new = True
        
        # Add sources
        for source in data.get('sources', []):
            self.cursor.execute("""
                INSERT INTO sources (data_center_id, url, name, scraped_at, verified)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (
                dc_id,
                source['url'],
                source['name'],
                source['scraped_at'],
                source.get('verified', False)
            ))
        
        self.conn.commit()
        return is_new
    
    def close(self):
        """Close database connection"""
        self.cursor.close()
        self.conn.close()

