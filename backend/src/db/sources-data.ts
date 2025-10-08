/**
 * Source citations for SEED data centers only
 * 
 * NOTE: Most data centers come from the scraper (manual_data_scraper.py)
 * This file only tracks sources for the 3 initial seed entries
 * 
 * Architecture:
 * - seed.ts: 3 DCs for initial demo (run once at setup)
 * - manual_data_scraper.py: ALL curated data (run to get real data)
 */

export const dataCenterSources: Record<string, Array<{ url: string; name: string }>> = {
  'Africa Data Centres Nairobi': [
    { url: 'https://www.africadatacentres.com', name: 'Africa Data Centres Official' },
    { url: 'https://www.datacentermap.com/kenya/nairobi/africa-data-centres.html', name: 'DataCenterMap' },
  ],
  'iXAfrica Nairobi Data Center': [
    { url: 'https://www.ixafrica.com', name: 'iXAfrica Official' },
    { url: 'https://www.datacenters.com/locations/kenya/nairobi', name: 'Datacenters.com' },
  ],
  'Safaricom M-PESA Data Center': [
    { url: 'https://www.safaricom.co.ke', name: 'Safaricom Official' },
    { url: 'https://techcrunch.com/tag/safaricom/', name: 'TechCrunch Coverage' },
  ],
  // All other data centers are in manual_data_scraper.py with their own sources
}

export function getSourcesForDataCenter(name: string): Array<{ url: string; name: string }> {
  return dataCenterSources[name] || [
    { url: 'https://www.datacentermap.com/kenya/', name: 'DataCenterMap Kenya' }
  ]
}

