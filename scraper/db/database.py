"""
Database handler for storing scraped data
"""

from __future__ import annotations

import os
import hashlib
from typing import Dict, Any, List, Optional

import psycopg2
from psycopg2.extras import RealDictCursor, Json
from dotenv import load_dotenv

load_dotenv()


def _fingerprint_source_item(source_system: str, item: Dict[str, Any]) -> str:
    payload = f"{source_system}|{item.get('name', '')}|{item.get('city', '')}|{item.get('address', '')}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:40]


class Database:
    def __init__(self):
        self.conn = psycopg2.connect(
            os.getenv("DATABASE_URL", "postgresql://localhost:5432/datacenter_map")
        )
        self.conn.autocommit = False
        self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)

    def start_scrape_log(self, source_name: str) -> str:
        self.cursor.execute(
            """
            INSERT INTO scrape_logs (source_name, started_at, status)
            VALUES (%s, NOW(), 'running')
            RETURNING id
        """,
            (source_name,),
        )
        rid = self.cursor.fetchone()["id"]
        self.conn.commit()
        return str(rid)

    def complete_scrape_log(
        self,
        log_id: str,
        status: str,
        records_found: int,
        records_new: int,
        records_updated: int,
        error_message: Optional[str] = None,
    ) -> None:
        self.cursor.execute(
            """
            UPDATE scrape_logs SET
                completed_at = NOW(),
                status = %s,
                records_found = %s,
                records_new = %s,
                records_updated = %s,
                error_message = %s
            WHERE id = %s::uuid
        """,
            (status, records_found, records_new, records_updated, error_message, log_id),
        )
        self.conn.commit()

    def upsert_curated(self, data: Dict[str, Any]) -> bool:
        """
        Tier A Kenya catalogue: upsert published row (verified facility + verified sources).
        Returns True if a new data center row was inserted.
        """
        return self._upsert_datacenter(data, facility_verified=True, sources_verified=True)

    def _upsert_datacenter(
        self,
        data: Dict[str, Any],
        *,
        facility_verified: bool,
        sources_verified: bool,
    ) -> bool:
        self.cursor.execute(
            """
            SELECT id FROM data_centers
            WHERE LOWER(name) = LOWER(%s) AND LOWER(city) = LOWER(%s)
        """,
            (data["name"], data["city"]),
        )

        existing = self.cursor.fetchone()
        capacity = data.get("capacity") or {}
        metadata = data.get("metadata") or {}

        if existing:
            dc_id = existing["id"]
            self.cursor.execute(
                """
                UPDATE data_centers SET
                    operator = %s,
                    address = %s,
                    country = %s,
                    latitude = %s,
                    longitude = %s,
                    status = %s,
                    ownership_type = %s,
                    power_capacity_mw = %s,
                    floor_space_sqm = %s,
                    rack_count = %s,
                    year_established = %s,
                    verified = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """,
                (
                    data.get("operator"),
                    data.get("address"),
                    data.get("country"),
                    data.get("latitude"),
                    data.get("longitude"),
                    data.get("status", "operational"),
                    data.get("ownership_type", "foreign"),
                    capacity.get("power_mw"),
                    capacity.get("floor_space_sqm"),
                    capacity.get("racks"),
                    data.get("year_established"),
                    facility_verified,
                    dc_id,
                ),
            )
            is_new = False
        else:
            self.cursor.execute(
                """
                INSERT INTO data_centers (
                    name, operator, address, city, country,
                    latitude, longitude,
                    status, ownership_type,
                    power_capacity_mw, floor_space_sqm, rack_count,
                    year_established, tier_rating,
                    verified
                ) VALUES (
                    %s, %s, %s, %s, %s,
                    %s, %s,
                    %s, %s,
                    %s, %s, %s,
                    %s, %s,
                    %s
                )
                RETURNING id
            """,
                (
                    data.get("name"),
                    data.get("operator"),
                    data.get("address"),
                    data.get("city"),
                    data.get("country"),
                    data.get("latitude"),
                    data.get("longitude"),
                    data.get("status", "operational"),
                    data.get("ownership_type", "foreign"),
                    capacity.get("power_mw"),
                    capacity.get("floor_space_sqm"),
                    capacity.get("racks"),
                    data.get("year_established"),
                    metadata.get("tier"),
                    facility_verified,
                ),
            )
            dc_id = self.cursor.fetchone()["id"]
            is_new = True

        for source in data.get("sources", []):
            self.cursor.execute(
                """
                INSERT INTO sources (data_center_id, url, name, scraped_at, verified)
                SELECT %s, %s, %s, %s::timestamptz, %s
                WHERE NOT EXISTS (
                    SELECT 1 FROM sources WHERE data_center_id = %s AND url = %s
                )
            """,
                (
                    dc_id,
                    source["url"],
                    source["name"],
                    source["scraped_at"],
                    sources_verified,
                    dc_id,
                    source["url"],
                ),
            )

        self.conn.commit()
        return is_new

    def insert_candidate(
        self,
        item: Dict[str, Any],
        source_system: str,
        *,
        country_scope: str = "Kenya",
        confidence: int = 55,
        raw_payload: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Tier B/C: stage a harvested row for admin review.
        Returns candidate id (uuid str). Upserts pending rows by (source_system, external_id).
        """
        ext = _fingerprint_source_item(source_system, item)
        clean = {k: v for k, v in item.items() if not str(k).startswith("_")}
        urls: List[str] = []
        for s in item.get("sources") or []:
            u = s.get("url") if isinstance(s, dict) else None
            if u:
                urls.append(u)

        self.cursor.execute(
            """
            SELECT id, status FROM ingestion_candidates
            WHERE source_system = %s AND external_id = %s
        """,
            (source_system, ext),
        )
        existing = self.cursor.fetchone()

        if existing and existing["status"] != "pending":
            return str(existing["id"])

        if existing:
            self.cursor.execute(
                """
                UPDATE ingestion_candidates SET
                    candidate_payload = %s,
                    raw_payload = %s,
                    source_urls = %s,
                    confidence = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """,
                (Json(clean), Json(raw_payload) if raw_payload is not None else None, urls, confidence, existing["id"]),
            )
            self.conn.commit()
            return str(existing["id"])

        self.cursor.execute(
            """
            INSERT INTO ingestion_candidates (
                status, source_system, external_id, country_scope,
                candidate_payload, raw_payload, source_urls, confidence
            ) VALUES (
                'pending', %s, %s, %s,
                %s, %s, %s, %s
            )
            RETURNING id
        """,
            (
                source_system,
                ext,
                country_scope,
                Json(clean),
                Json(raw_payload) if raw_payload is not None else None,
                urls,
                confidence,
            ),
        )
        row = self.cursor.fetchone()
        self.conn.commit()
        return str(row["id"])

    def close(self):
        """Close database connection"""
        self.cursor.close()
        self.conn.close()
