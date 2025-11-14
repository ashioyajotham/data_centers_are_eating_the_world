"""
News Monitor Scraper
Finds data center-related news articles for manual review
Does NOT automatically add to database - flags for review instead
"""

import re
import time
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from .base_scraper import BaseScraper

try:
    import feedparser
    RSS_AVAILABLE = True
except ImportError:
    RSS_AVAILABLE = False
    # Note: feedparser not installed - RSS feeds will be skipped


class NewsMonitorScraper(BaseScraper):
    """
    Monitors news sources for data center announcements.
    Flags articles for manual review instead of auto-adding to database.
    """
    
    def __init__(self):
        super().__init__("News Monitor")
        self.keywords = [
            'data center', 'datacenter', 'data centre',
            'ai infrastructure', 'gpu facility', 'cloud infrastructure',
            'hyperscale', 'colocation', 'server farm',
            'nvidia', 'microsoft azure', 'google cloud', 'aws',
            'ixafrica', 'africa data centres', 'raxiogroup'
        ]
        
        # News sources to monitor (RSS feeds and search pages)
        self.news_sources = [
            {
                'name': 'Citizen Digital',
                'rss_url': 'https://www.citizen.digital/rss',
                'search_url': 'https://www.citizen.digital/search?q={query}',
                'base_url': 'https://www.citizen.digital'
            },
            {
                'name': 'TechCrunch',
                'rss_url': 'https://techcrunch.com/feed/',
                'search_url': 'https://techcrunch.com/search/{query}',
                'base_url': 'https://techcrunch.com'
            },
            {
                'name': 'TechCrunch Africa',
                'rss_url': None,  # No dedicated RSS, will search
                'search_url': 'https://techcrunch.com/tag/africa/',
                'base_url': 'https://techcrunch.com'
            },
            {
                'name': 'Business Daily Kenya',
                'rss_url': 'https://www.businessdailyafrica.com/rss',
                'search_url': 'https://www.businessdailyafrica.com/search?q={query}',
                'base_url': 'https://www.businessdailyafrica.com'
            },
        ]
    
    def scrape(self) -> List[Dict[str, Any]]:
        """
        Scans news sources for data center articles.
        Returns list of flagged articles for review (NOT data centers).
        """
        flagged_articles = []
        
        print(f"\n📰 Monitoring {len(self.news_sources)} news sources...")
        
        for source in self.news_sources:
            try:
                print(f"  Checking {source['name']}...")
                
                # Try RSS feed first
                if RSS_AVAILABLE and source.get('rss_url'):
                    articles = self._check_rss_feed(source)
                else:
                    # Fallback to web search
                    articles = self._check_web_search(source)
                
                # Filter for data center relevance
                relevant = self._filter_relevant(articles)
                flagged_articles.extend(relevant)
                
                time.sleep(2)  # Rate limiting
                
            except Exception as e:
                print(f"  ⚠️  Error checking {source['name']}: {e}")
                continue
        
        print(f"✅ Found {len(flagged_articles)} relevant articles for review")
        return flagged_articles
    
    def _check_rss_feed(self, source: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Check RSS feed for recent articles"""
        if not RSS_AVAILABLE:
            print(f"    Note: RSS feeds require feedparser. Install with: pip install feedparser")
            return []
        
        articles = []
        try:
            feed = feedparser.parse(source['rss_url'])
            
            # Check last 7 days of articles
            cutoff_date = datetime.now() - timedelta(days=7)
            
            for entry in feed.entries[:20]:  # Check last 20 entries
                try:
                    pub_date = datetime(*entry.published_parsed[:6])
                    if pub_date < cutoff_date:
                        continue
                    
                    articles.append({
                        'title': entry.get('title', ''),
                        'url': entry.get('link', ''),
                        'published': pub_date.isoformat(),
                        'summary': entry.get('summary', ''),
                        'source': source['name']
                    })
                except:
                    continue
                    
        except Exception as e:
            print(f"    ⚠️  RSS feed error: {e}")
        
        return articles
    
    def _check_web_search(self, source: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Fallback: search web page for articles"""
        articles = []
        
        # For now, return empty - web search requires more complex parsing
        # Could implement site-specific scrapers if needed
        return articles
    
    def _filter_relevant(self, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Filter articles that mention data centers"""
        relevant = []
        
        for article in articles:
            text = f"{article.get('title', '')} {article.get('summary', '')}".lower()
            
            # Check if article mentions any keywords
            matches = []
            for keyword in self.keywords:
                if keyword.lower() in text:
                    matches.append(keyword)
            
            if matches:
                article['matched_keywords'] = matches
                article['relevance_score'] = len(matches)
                relevant.append(article)
        
        # Sort by relevance (most matches first)
        relevant.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
        
        return relevant
    
    def generate_review_report(self, articles: List[Dict[str, Any]]) -> str:
        """Generate a human-readable report for review"""
        if not articles:
            return "✅ No new data center articles found in the last 7 days.\n"
        
        report = f"\n📋 NEWS MONITOR REPORT - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        report += "=" * 80 + "\n"
        report += f"Found {len(articles)} potentially relevant articles for review:\n\n"
        
        for i, article in enumerate(articles, 1):
            report += f"{i}. {article['title']}\n"
            report += f"   Source: {article['source']}\n"
            report += f"   URL: {article['url']}\n"
            report += f"   Published: {article.get('published', 'Unknown')}\n"
            report += f"   Keywords: {', '.join(article.get('matched_keywords', []))}\n"
            if article.get('summary'):
                summary = article['summary'][:200] + "..." if len(article['summary']) > 200 else article['summary']
                report += f"   Summary: {summary}\n"
            report += "\n"
        
        report += "\n" + "=" * 80 + "\n"
        report += "💡 NEXT STEPS:\n"
        report += "1. Review each article above\n"
        report += "2. If a new data center is mentioned, add it to manual_data_scraper.py\n"
        report += "3. Run: python main.py to update the database\n"
        report += "=" * 80 + "\n"
        
        return report

