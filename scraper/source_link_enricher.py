"""
Resolve curated source URLs at pipeline runtime: final URL after redirects + page title.

JSON / Python fallbacks stay the source of *which* links to cite; this module records
what was actually retrievable when the scraper ran.
"""

from __future__ import annotations

import os
import time
from datetime import datetime
from typing import Any, Dict, List, Optional

import requests
from bs4 import BeautifulSoup

MAX_HTML_BYTES = 512_000
MAX_NAME_LEN = 250
DEFAULT_DELAY_S = float(os.getenv("SOURCE_FETCH_DELAY_S", "0.65"))
DEFAULT_TIMEOUT_S = int(os.getenv("SOURCE_FETCH_TIMEOUT_S", "22"))


def _extract_title(html: str) -> Optional[str]:
    soup = BeautifulSoup(html, "html.parser")
    tag = soup.find("title")
    if not tag:
        return None
    text = tag.get_text(separator=" ", strip=True)
    if not text:
        return None
    return text[:220] if len(text) > 220 else text


def enrich_one_source(
    session: requests.Session,
    source: Dict[str, Any],
    *,
    delay_s: float,
    timeout: int,
    facility_name: str,
) -> Dict[str, Any]:
    url = str(source.get("url") or "").strip()
    base_name = str(source.get("name") or "Source").strip() or "Source"
    if not url:
        return source

    time.sleep(delay_s)
    scraped_at = datetime.now().isoformat()
    try:
        resp = session.get(url, timeout=timeout, allow_redirects=True, stream=True)
        final_url = (resp.url or url).strip()

        chunks: List[bytes] = []
        total = 0
        for chunk in resp.iter_content(chunk_size=32768):
            if not chunk:
                continue
            chunks.append(chunk)
            total += len(chunk)
            joined = b"".join(chunks)
            if total >= MAX_HTML_BYTES or b"</title>" in joined.lower():
                break
        resp.close()

        raw = b"".join(chunks).decode(resp.encoding or "utf-8", errors="replace")
        title = _extract_title(raw)
        display_name = base_name
        if title:
            display_name = f"{base_name} — {title}"
        if len(display_name) > MAX_NAME_LEN:
            display_name = display_name[: MAX_NAME_LEN - 1] + "…"

        return {
            "url": final_url,
            "name": display_name,
            "scraped_at": scraped_at,
            "verified": bool(source.get("verified", False)),
        }
    except Exception as exc:  # noqa: BLE001 — best-effort enrichment
        print(
            f"⚠️  Source fetch failed [{facility_name}] {url[:72]}"
            f"{'…' if len(url) > 72 else ''}: {exc}"
        )
        return {
            "url": url,
            "name": base_name,
            "scraped_at": scraped_at,
            "verified": bool(source.get("verified", False)),
        }


def enrich_facility_sources(
    session: requests.Session,
    facility: Dict[str, Any],
    *,
    delay_s: float = DEFAULT_DELAY_S,
    timeout: int = DEFAULT_TIMEOUT_S,
) -> None:
    name = str(facility.get("name") or "unknown")
    sources: List[Dict[str, Any]] = list(facility.get("sources") or [])
    if not sources:
        return
    out: List[Dict[str, Any]] = []
    for src in sources:
        if not isinstance(src, dict):
            continue
        out.append(enrich_one_source(session, src, delay_s=delay_s, timeout=timeout, facility_name=name))
    facility["sources"] = out
