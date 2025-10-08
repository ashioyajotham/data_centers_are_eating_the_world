# API Documentation

RESTful API for the Data Centers mapping platform.

## Base URL

```
http://localhost:3001/api
```

## Authentication

Currently no authentication required (public API).

## Endpoints

### Data Centers

#### Get All Data Centers

```http
GET /datacenters
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Africa Data Centres Nairobi",
    "operator": "Africa Data Centres",
    "address": "Sameer Business Park, Mombasa Road, Nairobi",
    "city": "Nairobi",
    "country": "Kenya",
    "latitude": -1.3144,
    "longitude": 36.8822,
    "status": "operational",
    "ownershipType": "foreign",
    "capacity": {
      "power_mw": 10,
      "floor_space_sqm": null,
      "racks": null
    },
    "yearEstablished": 2017,
    "lastUpdated": "2025-01-15T10:30:00Z",
    "sources": [
      {
        "url": "https://example.com",
        "name": "Source Name",
        "scrapedAt": "2025-01-15T10:00:00Z",
        "verified": true
      }
    ],
    "metadata": {
      "tier": null,
      "certifications": null,
      "connectivity": null
    }
  }
]
```

#### Get Data Center by ID

```http
GET /datacenters/:id
```

**Parameters:**
- `id` (string, required) - Data center UUID

**Response:** Same as single item from Get All

**Status Codes:**
- `200` - Success
- `404` - Data center not found

#### Get GeoJSON

```http
GET /datacenters/geojson
```

**Response:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [36.8822, -1.3144]
      },
      "properties": {
        "id": "uuid",
        "name": "Africa Data Centres Nairobi",
        ...
      }
    }
  ]
}
```

#### Export Data

```http
GET /datacenters/export/:format
```

**Parameters:**
- `format` (string, required) - Export format: `json`, `csv`, or `geojson`

**Response:**
- **JSON**: Same as Get All
- **CSV**: Flattened data in CSV format
- **GeoJSON**: Same as Get GeoJSON

**Headers:**
```
Content-Type: application/json | text/csv | application/geo+json
Content-Disposition: attachment; filename=datacenters.{format}
```

### Statistics

#### Get Statistics

```http
GET /statistics
```

**Response:**
```json
{
  "totalDataCenters": 15,
  "byStatus": {
    "operational": 12,
    "planned": 2,
    "under-construction": 1
  },
  "byOwnership": {
    "local": 6,
    "foreign": 8,
    "joint-venture": 1
  },
  "byCountry": {
    "Kenya": 15
  },
  "totalCapacityMW": 150.5,
  "averageCapacity": 10.03,
  "growthByYear": [
    {
      "year": 2013,
      "count": 1
    },
    {
      "year": 2014,
      "count": 1
    },
    {
      "year": 2015,
      "count": 2
    }
  ]
}
```

## Data Models

### DataCenter

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `name` | string | Data center name |
| `operator` | string | Operating company |
| `address` | string | Full address |
| `city` | string | City |
| `country` | string | Country |
| `latitude` | number | Latitude coordinate |
| `longitude` | number | Longitude coordinate |
| `status` | enum | `operational`, `planned`, `under-construction`, `decommissioned` |
| `ownershipType` | enum | `local`, `foreign`, `joint-venture` |
| `capacity` | object | Capacity details (nullable) |
| `yearEstablished` | number | Year established (nullable) |
| `lastUpdated` | datetime | Last update timestamp |
| `sources` | array | Array of source objects |
| `metadata` | object | Additional metadata (nullable) |

### Capacity

| Field | Type | Description |
|-------|------|-------------|
| `power_mw` | number | Power capacity in megawatts |
| `floor_space_sqm` | number | Floor space in square meters |
| `racks` | number | Number of server racks |

### Source

| Field | Type | Description |
|-------|------|-------------|
| `url` | string | Source URL |
| `name` | string | Source name |
| `scrapedAt` | datetime | When data was scraped |
| `verified` | boolean | Manual verification status |

## Error Responses

### Error Format

```json
{
  "error": "Error message"
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `204` | No Content |
| `400` | Bad Request |
| `404` | Not Found |
| `500` | Internal Server Error |

## Examples

### Using cURL

```bash
# Get all data centers
curl http://localhost:3001/api/datacenters

# Get statistics
curl http://localhost:3001/api/statistics

# Export as CSV
curl http://localhost:3001/api/datacenters/export/csv -o datacenters.csv

# Get GeoJSON
curl http://localhost:3001/api/datacenters/geojson
```

### Using JavaScript (Fetch)

```javascript
// Get all data centers
const response = await fetch('http://localhost:3001/api/datacenters')
const dataCenters = await response.json()

// Get statistics
const statsResponse = await fetch('http://localhost:3001/api/statistics')
const stats = await statsResponse.json()

// Download CSV
const csvResponse = await fetch('http://localhost:3001/api/datacenters/export/csv')
const blob = await csvResponse.blob()
const url = window.URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'datacenters.csv'
a.click()
```

### Using Python

```python
import requests

# Get all data centers
response = requests.get('http://localhost:3001/api/datacenters')
data_centers = response.json()

# Get statistics
stats = requests.get('http://localhost:3001/api/statistics').json()
print(f"Total: {stats['totalDataCenters']}")

# Download GeoJSON
geojson_response = requests.get('http://localhost:3001/api/datacenters/geojson')
with open('datacenters.geojson', 'w') as f:
    f.write(geojson_response.text)
```

## Rate Limiting

Currently no rate limiting implemented. In production:
- Rate limit: 100 requests/minute per IP
- Burst: 20 requests/second

## CORS

CORS is enabled for all origins in development. In production, configure allowed origins.

## Future Enhancements

- [ ] Authentication for write operations
- [ ] Pagination for large datasets
- [ ] Advanced filtering
- [ ] Real-time updates via WebSockets
- [ ] GraphQL endpoint
- [ ] API versioning

## Support

For API issues or questions:
- GitHub Issues: [Link]
- Email: [Your email]

