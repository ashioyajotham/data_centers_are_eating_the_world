"""
Manual/Research-based data scraper
Curated data from research and public sources

Tier A (Kenya): prefer ``data/kenya_curated.json`` when present so the catalogue
can be edited without changing Python. Otherwise the inline list below is used.
"""

import json
from pathlib import Path
from typing import List, Dict, Any
from .base_scraper import BaseScraper

CURATED_REL_PATH = Path(__file__).resolve().parent.parent / "data" / "kenya_curated.json"


class ManualDataScraper(BaseScraper):
    def __init__(self):
        super().__init__("Manual Research Data")

    def _hydrate_sources(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        out: List[Dict[str, Any]] = []
        for rec in records:
            r = dict(rec)
            sources = []
            for s in r.get("sources") or []:
                if isinstance(s, dict) and "scraped_at" in s:
                    sources.append(s)
                elif isinstance(s, dict) and s.get("url"):
                    sources.append(self.create_source(s["url"], s.get("name") or "Source"))
                else:
                    continue
            r["sources"] = sources
            out.append(r)
        return out

    def scrape(self) -> List[Dict[str, Any]]:
        """
        Return Tier A curated Kenya facilities.

        TO ADD MORE DATA:
        1. Edit ``scraper/data/kenya_curated.json`` (preferred), or the fallback list below
        2. Run: python main.py
        """
        if CURATED_REL_PATH.is_file():
            bundle = json.loads(CURATED_REL_PATH.read_text(encoding="utf-8"))
            records = bundle.get("data_centers") or []
            return self._hydrate_sources(records)

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
                'sources': [
                    self.create_source(
                        'https://news.microsoft.com/source/2024/05/22/microsoft-and-g42-announce-1-billion-comprehensive-digital-ecosystem-initiative-for-kenya/',
                        'Microsoft Newsroom — Kenya geothermal data center & Azure East Africa region (May 2024)',
                    ),
                    self.create_source(
                        'https://www.reuters.com/technology/microsoft-g42-invest-1-billion-kenya-build-data-center-2024-05-22/',
                        'Reuters — Microsoft & G42 $1B Kenya investment',
                    ),
                ]
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
                'sources': [
                    self.create_source(
                        'https://www.wtl.co.ke/service/data-centers/',
                        'Wananchi Telecom — Data center & colocation services',
                    )
                ]
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
                'sources': [
                    self.create_source(
                        'https://www.wingu.africa/services',
                        'Wingu Africa — Tier-3 colocation services (regional)',
                    )
                ]
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
                'sources': [
                    self.create_source(
                        'https://liquid.tech/about-us/news/east_africa_data_centre_receives_tier_iii_certification/',
                        'Liquid — East Africa Data Centre Tier III certification',
                    ),
                    self.create_source(
                        'https://www.liquid.tech/data-centres',
                        'Liquid — Data centres overview',
                    ),
                ]
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
                'sources': [
                    self.create_source(
                        'https://techweez.com/2011/09/07/kdn-data-centre-now-complete-and-open',
                        'Techweez — KDN data centre opening (Sameer Business Park)',
                    ),
                    self.create_source(
                        'https://www.capitalfm.co.ke/business/2011/09/kdn-opens-high-tech-data-centre/',
                        'Capital FM — KDN opens high-tech data centre',
                    ),
                ]
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
                'sources': [
                    self.create_source(
                        'https://telkom.co.ke/business/wholesale-content/data-centre/',
                        'Telkom Kenya — Data centre service description',
                    ),
                    self.create_source(
                        'https://techweez.com/2018/07/31/telkom-kenya-data-centre-launch',
                        'Techweez — Nairobi data centre launch (2018)',
                    ),
                ]
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
                'sources': [
                    self.create_source(
                        'https://www.bcs-ea.com/colocation-services.html',
                        'BCS — Colocation services (Westlands / Citadel)',
                    ),
                    self.create_source(
                        'https://www.africadatacentres.com/marketplace/bandwidth-cloud-services-group/',
                        'Africa Data Centres marketplace — BCS Group',
                    ),
                ]
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
                'sources': [
                    self.create_source(
                        'https://techcrunch.com/2024/01/31/googles-first-africa-cloud-region-now-operational/',
                        'TechCrunch — Google Cloud Africa region; mentions Nairobi interconnect',
                    ),
                    self.create_source(
                        'https://cloud.google.com/blog/products/infrastructure/heita-south-africa-new-cloud-region',
                        'Google Cloud Blog — Johannesburg region (first in Africa)',
                    ),
                ]
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
                'sources': [
                    self.create_source(
                        'https://www.africadatacentres.com/building-africas-first-interconnected-carrier-neutral-data-centres/',
                        'Africa Data Centres — Pan-African footprint incl. Mombasa (operator narrative, Dec 2019)',
                    ),
                    self.create_source(
                        'https://www.africadatacentres.com/marketplace/asteroid/',
                        'Africa Data Centres marketplace — Asteroid IXP (Nairobi & Mombasa)',
                    ),
                ]
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
                'sources': [
                    self.create_source(
                        'https://seacom.com/digital-infrastructure/colocation',
                        'SEACOM — Colocation & digital infrastructure',
                    ),
                    self.create_source(
                        'https://www.africadatacentres.com/marketplace/seacom/',
                        'Africa Data Centres — SEACOM at NBO1 marketplace page',
                    ),
                ]
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
                'sources': [
                    self.create_source(
                        'https://ixafrica.co.ke/marketplace/jamii-telecommunications-limited-jtl/',
                        'iXAfrica marketplace — Jamii Telecommunications (JTL / FAIBA)',
                    ),
                    self.create_source(
                        'https://www.jtl.co.ke/',
                        'Jamii Telecommunications — JTL official site',
                    ),
                ]
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
                'sources': [
                    self.create_source(
                        'https://www.raxiogroup.com/data-centres/',
                        'Raxio Group — Data centres (incl. Kenya)',
                    )
                ]
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
                'sources': [
                    self.create_source(
                        'https://mainone.net/data-center-colocation/',
                        'MainOne — Data center & colocation',
                    )
                ]
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
                'sources': [
                    self.create_source(
                        'https://csquared.com/data-center-connectivity/',
                        'CSquared — Data center connectivity',
                    )
                ]
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
                'sources': [
                    self.create_source(
                        'https://www.peeringdb.com/asn/328331',
                        'PeeringDB — Poa Internet AS328331 (facilities / interconnection)',
                    )
                ]
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
                'sources': [
                    self.create_source(
                        'https://mawingu.co/news-and-updates/mawingu-strengthens-its-network-to-drive-digital-inclusion-and-economic-growth/',
                        'Mawingu — Network expansion press update',
                    ),
                    self.create_source(
                        'https://mawingu.co/about/',
                        'Mawingu — About (infrastructure context)',
                    ),
                ]
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
                'sources': [
                    self.create_source(
                        'https://www.tespok.co.ke/',
                        'TESPOK — KIXP & Kenya ISP association',
                    ),
                    self.create_source(
                        'https://portal.kixp.or.ke/',
                        'Kenya Internet Exchange Point (KIXP) portal',
                    ),
                ]
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
                'sources': [
                    self.create_source(
                        'https://www.capitalfm.co.ke/business/2025/09/airtel-starts-construction-of-44mw-data-center-at-tatu-city/',
                        'Capital FM — Airtel breaks ground on 44MW DC at Tatu City (2025)',
                    ),
                    self.create_source(
                        'https://itweb.africa/article/airtel-kenya-breaks-ground-on-150m-nairobi-datacentre/KWEBb7yLVzLvmRjO',
                        'ITWeb Africa — Airtel Nxtra Nairobi data centre',
                    ),
                ]
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
                'sources': [
                    self.create_source(
                        'https://www.teams.co.ke/dedicated-lease-lines/',
                        'TEAMS (Kenya) Ltd — official cable system services',
                    ),
                    self.create_source(
                        'https://telkom.co.ke/business/wholesale-content/submarine-cable-activity/',
                        'Telkom Kenya — Submarine cable landing (TEAMS context)',
                    ),
                ]
            },
            # Latest addition - November 2025
            {
                'name': 'Servernah AI Factory at iXAfrica NBOX1',
                'operator': 'Atlancis Technologies (Servernah Cloud) / Everse Technology / iXAfrica',
                'address': 'iXAfrica NBOX1 Campus, Mombasa Road, Nairobi',
                'city': 'Nairobi',
                'country': 'Kenya',
                'latitude': -1.3205,  # Same as iXAfrica campus
                'longitude': 36.8831,
                'status': 'operational',
                'ownership_type': 'joint-venture',
                'capacity': {},  # 50kW per rack, total capacity TBD; omit power_mw until known
                'year_established': 2025,
                'sources': [
                    self.create_source(
                        'https://www.citizen.digital/article/kenya-unveils-regions-first-gpu-powered-ai-infrastructure-n372958',
                        'Citizen Digital - Kenya GPU AI Infrastructure Launch'
                    ),
                    self.create_source(
                        'https://www.ixafrica.com/',
                        'iXAfrica — NBOX1 campus'
                    )
                ]
            },
        ]
        
        return data_centers

