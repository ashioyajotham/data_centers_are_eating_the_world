# API Documentation

RESTful API for the Data Centers mapping platform.

## Base URL

```
http://localhost:3001/api
```

## Authentication

**Published-only reads:** `GET /datacenters`, `/datacenters/geojson`, `/datacenters/export/*`, and `GET /statistics` return only **published** facilities (`data_centers.verified = true`) when called **without** an admin JWT (typical map and public dashboards).

With `Authorization: Bearer <jwt>` (valid admin token), those same endpoints include **unpublished** rows as well, so the admin UI can see the full database state.

**Admin-only reads:** `GET /ingestion/candidates` requires a JWT.

**Mutating endpoints** require a JWT:

```http
Authorization: Bearer <jwt>
```

**Mutation routes:**

- `POST /datacenters`
- `PUT /datacenters/:id`
- `DELETE /datacenters/:id`
- `PATCH /datacenters/:id/sources/verify`
- `PATCH /ingestion/candidates/:id/approve`
- `PATCH /ingestion/candidates/:id/reject`
- `PATCH /ingestion/candidates/:id/duplicate`

**Admin read routes:**

- `GET /ingestion/candidates`

### Ingestion queue (admin, Kenya harvest pipeline)

Harvested rows are staged in Postgres until approved:

```http
GET /ingestion/candidates?status=pending
Authorization: Bearer <jwt>
```

```http
PATCH /ingestion/candidates/:id/approve
Authorization: Bearer <jwt>
Content-Type: application/json

{"note":"optional"}
```

```http
PATCH /ingestion/candidates/:id/reject
Authorization: Bearer <jwt>
Content-Type: application/json

{"note":"optional reason"}
```

```http
PATCH /ingestion/candidates/:id/duplicate
Authorization: Bearer <jwt>
Content-Type: application/json

{"existingDataCenterId":"<uuid>","note":"optional"}
```

### Public suggestion (Tier E, no auth)

Rate-limited. Queues `ingestion_candidates` with `source_system` = `public_submission`. Optional email to admins when Resend env vars are set.

```http
POST /ingestion/suggest
Content-Type: application/json

{
  "name": "Example DC",
  "operator": "Example Ltd",
  "address": "Industrial Rd",
  "city": "Nairobi",
  "country": "Kenya",
  "latitude": -1.29,
  "longitude": 36.82,
  "status": "operational",
  "ownershipType": "local",
  "sourceUrl": "https://example.com/press-release",
  "sourceName": "Optional label",
  "submitterEmail": "optional@example.com",
  "notes": "optional"
}
```

Honeypot: include hidden field `website`; if non-empty, request is discarded silently (anti-spam).

### Status (no auth)

```http
GET /auth/status
```

Returns `jwtConfigured`, `needsPasswordSetup`, `legacyEnvLoginAvailable`, `googleEnabled`, `setupRequiresToken`, and `migrationRequired` (true if the `admin_auth` table is missing in Postgres).

### Initial password (database bcrypt hash)

When `needsPasswordSetup` is true, create the admin password once (stored hashed in Postgres):

```http
POST /auth/setup-password
Content-Type: application/json

{"password":"<12+ chars>","passwordConfirm":"<same>","setupToken":"<optional if ADMIN_SETUP_TOKEN set>"}
```

**Response:** `{ "token": "<jwt>" }`

### Password login

```http
POST /auth/login
Content-Type: application/json

{"password":"<password>"}
```

Uses the bcrypt hash in the database when configured. If the database password is not set yet, the server may still accept `ADMIN_PASSWORD` from the environment (legacy bootstrap only).

### Google sign-in

```http
POST /auth/google
Content-Type: application/json

{"credential":"<Google ID token from GIS>"}
```

Requires `GOOGLE_CLIENT_ID` and `ADMIN_GOOGLE_EMAILS` (comma-separated allowlist) on the server. The frontend must use the same OAuth Web Client ID (e.g. `VITE_GOOGLE_CLIENT_ID`).

### Session check

```http
GET /auth/me
Authorization: Bearer <jwt>
```

Returns `{ "ok": true }` if the token is valid.

Configure `JWT_SECRET` and optionally `FRONTEND_ORIGIN`, Google vars, `ADMIN_SETUP_TOKEN`, and legacy `ADMIN_PASSWORD` — see `backend/.env.example`.

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

#### Verify all sources (admin)

Marks every source row for this data center as verified.

```http
PATCH /datacenters/:id/sources/verify
Authorization: Bearer <jwt>
```

**Response:** Data center object (same shape as GET by ID).

**Status codes:** `200`, `401`, `404`, `503` (if auth env is not configured).

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
| `401` | Unauthorized |
| `404` | Not Found |
| `500` | Internal Server Error |
| `503` | Service unavailable (e.g. admin auth not configured) |

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

Allowed origins come from the `FRONTEND_ORIGIN` environment variable (comma-separated). If unset, defaults to `http://localhost:5173` and `http://127.0.0.1:5173`.

## Future Enhancements

- [ ] Pagination for large datasets
- [ ] Advanced filtering
- [ ] Real-time updates via WebSockets
- [ ] GraphQL endpoint
- [ ] API versioning

## Support

For API issues or questions:
- GitHub Issues: [Link]
- Email: [Your email]

