# Scraper Development Guide

## 🎯 How to Update Scrapers to Get Real Data

The scrapers currently return 0 results because the HTML selectors are placeholders. Here's how to fix them:

## 📝 Step-by-Step Guide

### 1. Inspect the Website

**For DataCenterMap.com:**

1. Visit https://www.datacentermap.com/kenya/
2. Right-click on any data center listing → "Inspect" (or press F12)
3. In the DevTools, hover over the HTML to highlight elements
4. Find the structure that contains data center information

**Example of what you're looking for:**
```html
<div class="datacenter-item">
    <h3 class="datacenter-name">Africa Data Centres Nairobi</h3>
    <div class="company-name">Africa Data Centres</div>
    <div class="address">Mombasa Road, Nairobi, Kenya</div>
</div>
```

### 2. Update the Scraper Code

Open `scraper/scrapers/datacentermap_scraper.py` and update line 24:

**Current (placeholder):**
```python
listings = soup.find_all('div', class_='data-center-item')
```

**Update to actual selector:**
```python
# Replace 'datacenter-item' with the actual class name you found
listings = soup.find_all('div', class_='actual-class-name')
```

### 3. Update the Parser Function

In the same file, update the `parse_listing` method (starting around line 44):

**Example update:**
```python
def parse_listing(self, listing, source_url: str) -> Dict[str, Any]:
    # Use the actual selectors from the website
    name_elem = listing.find('h3', class_='datacenter-name')  # Update this
    name = name_elem.text.strip() if name_elem else 'Unknown'
    
    operator_elem = listing.find('div', class_='company-name')  # Update this
    operator = operator_elem.text.strip() if operator_elem else 'Unknown'
    
    address_elem = listing.find('div', class_='address')  # Update this
    address_text = address_elem.text.strip() if address_elem else ''
    
    # ... rest of the code stays the same
```

## 🔍 Finding the Right Selectors

### Method 1: Chrome DevTools

1. Open the website
2. Press F12 to open DevTools
3. Click the "Select element" tool (top-left of DevTools)
4. Click on a data center name
5. Look at the highlighted HTML in the Elements tab
6. Note the tag name and class

### Method 2: View Page Source

1. Right-click → "View Page Source"
2. Search for a data center name you see on the page
3. Find the surrounding HTML structure
4. Note the classes and tags used

## 📊 Common Selector Patterns

### Finding All Listings
```python
# Try these patterns (one at a time):
soup.find_all('div', class_='datacenter')
soup.find_all('article', class_='facility')
soup.find_all('li', class_='location-item')
soup.find_all('div', class_='listing')

# Or by ID:
soup.find('div', id='datacenter-list').find_all('div', class_='item')
```

### Finding Specific Fields
```python
# Name (try these):
listing.find('h2')
listing.find('h3')
listing.find('a', class_='title')
listing.find('div', class_='name')

# Operator/Company:
listing.find('div', class_='company')
listing.find('span', class_='operator')
listing.find('p', class_='provider')

# Address:
listing.find('div', class_='address')
listing.find('p', class_='location')
listing.find('span', class_='city')
```

## 🧪 Testing Your Scraper

### Quick Test Script

Create a test file `scraper/test_scraper.py`:

```python
from scrapers.datacentermap_scraper import DataCenterMapScraper

# Test the scraper
scraper = DataCenterMapScraper()
data = scraper.scrape()

print(f"Found {len(data)} data centers")
for dc in data[:3]:  # Show first 3
    print(f"- {dc.get('name')} by {dc.get('operator')}")
```

Run it:
```bash
cd scraper
python test_scraper.py
```

### Expected Output
```
Found 18 data centers
- Africa Data Centres Nairobi by Africa Data Centres
- iXAfrica Data Center by iXAfrica
- Wananchi Group Data Center by Wananchi
```

## 🐛 Debugging Tips

### Print the HTML
```python
def scrape(self):
    html = self.get_page(kenya_url)
    soup = BeautifulSoup(html, 'html.parser')
    
    # DEBUG: Print first 1000 characters
    print(soup.prettify()[:1000])
    
    # Find listings...
```

### Check What You Found
```python
listings = soup.find_all('div', class_='datacenter')
print(f"Found {len(listings)} listings")

if listings:
    print("First listing HTML:")
    print(listings[0].prettify())
```

### Inspect Individual Fields
```python
for listing in listings:
    name = listing.find('h3')
    print(f"Name element: {name}")
    print(f"Name text: {name.text if name else 'NOT FOUND'}")
    break  # Just check the first one
```

## 🌐 Alternative: Use Browser Network Tab

If the website loads data dynamically with JavaScript:

1. Open DevTools → Network tab
2. Reload the page
3. Look for XHR/Fetch requests
4. Find API calls that return JSON data
5. Use that API endpoint directly instead of parsing HTML

Example:
```python
import requests

def scrape(self):
    # If you find an API endpoint
    api_url = "https://www.datacentermap.com/api/locations/kenya"
    response = requests.get(api_url)
    data = response.json()
    
    # Parse the JSON instead of HTML
    return [self.parse_json_item(item) for item in data]
```

## 📚 Resources

- **BeautifulSoup Documentation**: https://www.crummy.com/software/BeautifulSoup/bs4/doc/
- **CSS Selectors**: https://www.w3schools.com/cssref/css_selectors.php
- **Selenium for Dynamic Sites**: https://selenium-python.readthedocs.io/

## ⚠️ Important Notes

### Respect robots.txt
```python
# Check before scraping
# Visit: https://www.datacentermap.com/robots.txt
```

### Rate Limiting
The base scraper includes automatic delays:
```python
time.sleep(delay)  # Default 1 second between requests
```

### User Agent
Already configured in `.env`:
```
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
```

## 🎉 Once Updated

After updating the scrapers:

1. Test them individually
2. Run the full pipeline:
   ```bash
   cd scraper
   python main.py
   ```
3. Check the database for new entries
4. Refresh the frontend to see new data!

---

**Questions?** Check the [CONTRIBUTING.md](../CONTRIBUTING.md) or open an issue!

