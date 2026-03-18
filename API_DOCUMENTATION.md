# Perfomax API Dashboard - Complete API Reference

A professional FastAPI server for maritime autonomous vessel data management with authentication, API key management, and optimized data access.

## 🚀 Quick Start

### Installation & Setup

1. **Clone and Setup Environment**

   ```bash
   cd API_DASHBOARD

   # Install dependencies
   pip install -r requirements.txt
   ```

   **Required Dependencies:**

   ```
   fastapi==0.104.1
   uvicorn[standard]==0.24.0
   sqlalchemy==2.0.23
   asyncpg==0.29.0
   alembic==1.12.1
   pydantic[email]==2.4.2
   pydantic-settings==2.1.0
   python-jose[cryptography]==3.3.0
   passlib[bcrypt]==1.7.4
   argon2-cffi==23.1.0
   python-multipart==0.0.6
   python-decouple==3.8
   python-dotenv==1.0.0
   redis==5.0.1
   slowapi==0.1.9
   prometheus-client==0.19.0
   cryptography==42.0.8
   psycopg2-binary==2.9.9
   ```

2. **Database Setup**

   The application uses an existing PostgreSQL database with the following tables:

   - `users` - User authentication and management
   - `api_keys` - API key management
   - `vessels` - Vessel information with IMO numbers
   - `autonomuss_data` - Vessel autonomous data

3. **Environment Configuration**

   Create a `.env` file with the following configuration:

   ```env
   # Database Configuration
   DATABASE_URL=postgresql+asyncpg://username:password@host:port/database
   DATABASE_POOL_SIZE=2
   DATABASE_MAX_OVERFLOW=3
   DATABASE_POOL_TIMEOUT=30
   DATABASE_POOL_RECYCLE=3600

   # Security
   SECRET_KEY=your-super-secret-key-min-32-characters
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7

   # API Configuration
   API_V1_STR=/api/v1
   PROJECT_NAME=Perfomax API Dashboard
   VERSION=1.0.0
   DEBUG=True

   # Rate Limiting
   RATE_LIMIT_PER_MINUTE=100

   # Redis Configuration (optional, for caching)
   REDIS_URL=redis://localhost:6379/0

   # Pagination
   DEFAULT_PAGE_SIZE=50
   MAX_PAGE_SIZE=1000

   # CORS
   ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:3001", "http://localhost:8000", "https://yourfrontend.com"]

   # API Key Settings
   API_KEY_LENGTH=32
   API_KEY_PREFIX=pk_
   ```

4. **Setup Database Tables and Data**

   ```bash
   # Run the setup script to create tables and populate sample data
   python setup_database.py
   ```

   This will:

   - Create the `autonomuss_data` table
   - Add a vessel with IMO 999999
   - Populate CSV data into the database

5. **Start the Server**

   ```bash
   # Development (Recommended)
   python start_dev.py

   # Alternative development start
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

   # Production
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

   The `start_dev.py` script will:

   - Check database connectivity
   - Validate dependencies
   - Start the server with automatic reload
   - Display helpful startup information

The API will be available at: `http://localhost:8000`
Interactive API documentation: `http://localhost:8000/docs`

## 📋 Table of Contents

- [🔐 Authentication](#-authentication)
- [🔑 API Key Management](#-api-key-management)
- [📊 Data Access](#-data-access)
- [🚢 Vessel Management](#-vessel-management)
- [📈 Statistics](#-statistics)
- [⚡ Rate Limiting](#-rate-limiting)
- [🛠 Error Handling](#-error-handling)

## 🔐 Authentication

The API supports JWT-based authentication for user management and API keys for data access.

### Register User

Create a new user account.

**POST** `/api/v1/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "admin",
  "company_id": "default-company",
  "password": "strongpassword123"
}
```

**Response:**

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "admin",
  "company_id": "default-company",
  "is_deleted": false,
  "created_at": "2026-02-16T10:00:00Z",
  "updated_at": null
}
```

### User Login

Authenticate and receive JWT tokens.

**POST** `/api/v1/auth/login/json`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "strongpassword123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Refresh Token

Refresh your access token using a valid refresh token.

**POST** `/api/v1/auth/refresh`

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Change Password

Change the current user's password.

**POST** `/api/v1/auth/change-password`

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**

```json
{
  "current_password": "oldpassword123",
  "new_password": "newstrongpassword456"
}
```

**Response:**

```json
{
  "message": "Password changed successfully"
}
```

### Logout

Invalidate the current user session.

**POST** `/api/v1/auth/logout`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```json
{
  "message": "Successfully logged out"
}
```

### Get Current User

Get information about the currently authenticated user.

**GET** `/api/v1/auth/me`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "admin",
  "company_id": "default-company",
  "is_deleted": false,
  "created_at": "2026-02-16T10:00:00Z",
  "updated_at": null
}
```

## 🔑 API Key Management

Manage API keys for secure data access.

### Create API Key

Create a new API key for data access.

**POST** `/api/v1/api-keys/`

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**

```json
{
  "name": "Production API Key"
}
```

**Response:**

```json
{
  "id": "api-key-uuid",
  "name": "Production API Key",
  "key": "pk_abc123...",
  "user_id": "user-uuid",
  "is_active": true,
  "last_used": null,
  "created_at": "2026-02-16T10:00:00Z",
  "updated_at": null
}
```

### List API Keys

Get all API keys for the current user.

**GET** `/api/v1/api-keys/`

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**

- `page` (integer, default: 1) - Page number
- `size` (integer, default: 50) - Items per page
- `include_inactive` (boolean, default: false) - Include deactivated keys

**Response:**

```json
{
  "items": [
    {
      "id": "api-key-uuid",
      "name": "Production API Key",
      "user_id": "user-uuid",
      "is_active": true,
      "last_used": "2026-02-16T09:30:00Z",
      "created_at": "2026-02-16T10:00:00Z",
      "updated_at": null
    }
  ],
  "total": 1,
  "page": 1,
  "size": 50,
  "pages": 1
}
```

### Get API Key Details

Get detailed information about a specific API key.

**GET** `/api/v1/api-keys/{key_id}`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```json
{
  "id": "api-key-uuid",
  "name": "Production API Key",
  "user_id": "user-uuid",
  "is_active": true,
  "last_used": "2026-02-16T09:30:00Z",
  "created_at": "2026-02-16T10:00:00Z",
  "updated_at": null,
  "usage_stats": {
    "total_requests": 1250,
    "last_24h_requests": 45,
    "avg_daily_requests": 83
  }
}
```

### Update API Key

Update an API key's properties (name, status).

**PUT** `/api/v1/api-keys/{key_id}`

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**

```json
{
  "name": "Updated API Key Name",
  "is_active": true
}
```

**Response:**

```json
{
  "id": "api-key-uuid",
  "name": "Updated API Key Name",
  "user_id": "user-uuid",
  "is_active": true,
  "last_used": "2026-02-16T09:30:00Z",
  "created_at": "2026-02-16T10:00:00Z",
  "updated_at": "2026-02-17T10:00:00Z"
}
```

### Delete API Key

Permanently delete an API key.

**DELETE** `/api/v1/api-keys/{key_id}`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```json
{
  "message": "API key deleted successfully"
}
```

### Get API Key Usage Statistics

Get detailed usage statistics for an API key.

**GET** `/api/v1/api-keys/{key_id}/usage`

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**

- `start_date` (date, optional) - Start date for statistics (ISO 8601)
- `end_date` (date, optional) - End date for statistics (ISO 8601)
- `granularity` (string, default: "daily") - Data granularity: "hourly", "daily", "weekly"

**Response:**

```json
{
  "key_id": "api-key-uuid",
  "key_name": "Production API Key",
  "period": {
    "start": "2026-02-10T00:00:00Z",
    "end": "2026-02-17T23:59:59Z"
  },
  "total_requests": 1250,
  "successful_requests": 1200,
  "failed_requests": 50,
  "avg_response_time_ms": 145,
  "daily_breakdown": [
    {
      "date": "2026-02-17",
      "requests": 45,
      "success_rate": 0.96,
      "avg_response_time_ms": 142
    }
  ]
}
```

## 📊 Data Access

Access vessel autonomous data using IMO-based queries.

### Get Vessel Data

Retrieve autonomous data for a specific vessel by IMO.

**GET** `/api/v1/data`

**Headers:** `X-API-Key: <api_key>`

**Query Parameters:**

- `imo` (string, **required**) - IMO number of the vessel (e.g., "999999")
- `start_time` (datetime, optional) - Filter from this time (ISO 8601)
- `end_time` (datetime, optional) - Filter to this time (ISO 8601)
- `sort_order` (string, default: "desc") - Sort order: "asc" or "desc"
- `limit` (integer, default: 100, max: 1000) - Maximum records to return
- `offset` (integer, default: 0) - Number of records to skip

**Example:**

```
GET /api/v1/data?imo=999999&limit=10&sort_order=desc
```

**Response:**

```json
{
  "items": [
    {
      "id": 1,
      "vessel_id": "vessel-uuid",
      "local_time": "2026-11-01T10:12:00Z",
      "longitude": 103.1301105,
      "latitude": 5.3367801,
      "average_speed_gps": 0.0,
      "course": null,
      "me1_run_hours": 971.05,
      "me1_consumption": null,
      "me1_fuel_type": 1,
      "me1_power_at_shaft": null,
      "me2_run_hours": 1901.8,
      "me2_consumption": 0.0,
      "me2_fuel_type": 1,
      "speed_through_water": "12:34.8",
      "wind_direction": null,
      "ballast_water": null,
      "destination_port": null,
      "created_at": "2026-02-16T10:00:00Z",
      "updated_at": null
    }
  ],
  "total": 59,
  "limit": 10,
  "offset": 0,
  "vessel_info": {
    "id": "vessel-uuid",
    "name": "Perfomax Test Vessel",
    "imo": "999999",
    "company_id": "default-company",
    "created_at": "2026-02-16T10:00:00Z",
    "updated_at": null
  }
}
```

### Get Data Statistics

Get statistics for a vessel's autonomous data.

**GET** `/api/v1/data/stats`

**Headers:** `X-API-Key: <api_key>`

**Query Parameters:**

- `imo` (string, **required**) - IMO number of the vessel
- `start_time` (datetime, optional) - Start time for statistics
- `end_time` (datetime, optional) - End time for statistics

**Response:**

```json
{
  "vessel_imo": "999999",
  "vessel_name": "Perfomax Test Vessel",
  "total_records": 59,
  "date_range": {
    "start": "2026-11-01T10:12:00Z",
    "end": "2026-11-01T11:10:00Z"
  },
  "latest_position": {
    "latitude": 5.2754923,
    "longitude": 103.2630077,
    "timestamp": "2026-11-01T11:10:00Z"
  },
  "avg_speed": 8.45,
  "total_fuel_consumption": 125.8
}
```

## 🚢 Vessel Management

Get information about available vessels.

### List Vessels

Get all vessels with their data availability.

**GET** `/api/v1/vessels`

**Headers:** `X-API-Key: <api_key>`

**Query Parameters:**

- `search` (string, optional) - Search vessels by name or IMO
- `limit` (integer, default: 100) - Maximum vessels to return

**Response:**

```json
{
  "vessels": [
    {
      "id": "vessel-uuid",
      "imo": "999999",
      "name": "Perfomax Test Vessel",
      "company_id": "default-company",
      "record_count": 59,
      "latest_data": "2026-11-01T11:10:00Z",
      "created_at": "2026-02-16T10:00:00Z"
    }
  ],
  "total": 1,
  "search": null,
  "limit": 100
}
```

## 📈 Statistics

Additional statistical endpoints for data analysis.

### Get Single Record

Get a specific data record by ID.

**GET** `/api/v1/data/{record_id}`

**Headers:** `X-API-Key: <api_key>`

**Response:**

```json
{
  "id": 1,
  "vessel_id": "vessel-uuid",
  "local_time": "2026-11-01T10:12:00Z",
  "longitude": 103.1301105,
  "latitude": 5.3367801,
  "average_speed_gps": 0.0,
  "course": null,
  "me1_run_hours": 971.05,
  "me1_consumption": null,
  "me1_fuel_type": 1,
  "me1_power_at_shaft": null,
  "me2_run_hours": 1901.8,
  "me2_consumption": 0.0,
  "me2_fuel_type": 1,
  "speed_through_water": "12:34.8",
  "wind_direction": null,
  "ballast_water": null,
  "destination_port": null,
  "created_at": "2026-02-16T10:00:00Z",
  "updated_at": null
}
```

## ⚡ Rate Limiting

API keys are subject to rate limiting:

- **Default Limit:** 100 requests per minute per API key
- **Headers:** Rate limit information is included in response headers
  - `X-RateLimit-Limit` - Maximum requests allowed per minute
  - `X-RateLimit-Remaining` - Requests remaining in current window
  - `X-RateLimit-Reset` - Time when the rate limit resets
- **Exceeded:** Returns `429 Too Many Requests` when exceeded

## 📊 Monitoring & Metrics

The API includes comprehensive monitoring:

### Prometheus Metrics

Access Prometheus-compatible metrics at:

**GET** `/metrics`

**Available Metrics:**

- Request count per endpoint and status code
- Request duration histograms
- Active connections
- Database connection pool status
- API key usage statistics

### Health Check

Monitor API health and database connectivity:

**GET** `/health`

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2026-02-17T10:00:00Z",
  "version": "1.0.0",
  "database": "connected",
  "uptime_seconds": 3600
}
```

## 🛠 Error Handling

### HTTP Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request parameters
- **401 Unauthorized** - Invalid or missing authentication
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **422 Unprocessable Entity** - Validation errors
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server error

### Error Response Format

```json
{
  "detail": "Error description",
  "type": "error_type"
}
```

### Common Error Examples

**Missing API Key:**

```json
{
  "detail": "Invalid or missing API key"
}
```

**Vessel Not Found:**

```json
{
  "detail": "Vessel with IMO 12345 not found"
}
```

**Rate Limit Exceeded:**

```json
{
  "detail": "Rate limit exceeded"
}
```

## 📝 Data Model Reference

### Autonomous Data Fields

The CSV data contains the following fields mapped to the database:

- **Navigation:** `latitude`, `longitude`, `average_speed_gps`, `course`, `speed_through_water`
- **Main Engines (ME1-3):** `run_hours`, `consumption`, `fuel_type`, `power_at_shaft`
- **Auxiliary Engines (AE1-4):** `run_hours`, `consumption`, `fuel_type`, `energy_produced`
- **Environmental:** `wind_direction`, `wind_strength`, `sea_state`, `current_direction`
- **Vessel:** `ballast_water`, `cargo_tonns`, `draft_forward`, `draft_aft`, `draft_middle`
- **Voyage:** `destination_port`, `departure_port`, `eta_next_port`, `charter_speed_order`
- **Boiler:** `boiler_consumption`, `boiler_fuel_type`
- **Reporting:** `reporting_period`, `update_datetime`

### Sample Usage Workflow

1. **Register** a user account
2. **Login** to get JWT tokens
3. **Create API key** using JWT token
4. **Query data** using the API key and vessel IMO
5. **Monitor usage** through API key statistics
6. **Refresh tokens** when needed
7. **Manage API keys** (update, deactivate, delete)

### Example API Call

```bash
# Get recent data for vessel IMO 999999
curl -X GET "http://localhost:8000/api/v1/data?imo=999999&limit=5" \
     -H "X-API-Key: pk_abc123..."

# Create new API key
curl -X POST "http://localhost:8000/api/v1/api-keys/" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
     -d '{"name": "My Production Key"}'

# Get API key usage statistics
curl -X GET "http://localhost:8000/api/v1/api-keys/{key_id}/usage?granularity=daily" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

## 🚀 Getting Started Example

Complete workflow to get vessel data:

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# 1. Register user
response = requests.post(f"{BASE_URL}/auth/register", json={
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "role": "admin",
    "company_id": "default-company",
    "password": "password123"
})
print(f"User registered: {response.status_code}")

# 2. Login
response = requests.post(f"{BASE_URL}/auth/login/json", json={
    "email": "test@example.com",
    "password": "password123"
})
tokens = response.json()
print(f"Logged in successfully: {tokens['token_type']}")

# 3. Create API key
response = requests.post(f"{BASE_URL}/api-keys/",
    json={"name": "My API Key"},
    headers={"Authorization": f"Bearer {tokens['access_token']}"})
api_key_data = response.json()
api_key = api_key_data["key"]
print(f"API key created: {api_key[:15]}...")

# 4. Get vessel data
response = requests.get(f"{BASE_URL}/data?imo=999999&limit=10",
    headers={"X-API-Key": api_key})

if response.status_code == 200:
    data = response.json()
    print(f"Found {data['total']} records for vessel {data['vessel_info']['name']}")

    # Display first record
    if data['items']:
        first_record = data['items'][0]
        print(f"Latest position: {first_record['latitude']}, {first_record['longitude']}")
        print(f"Speed: {first_record['average_speed_gps']} knots")
else:
    print(f"Error: {response.status_code} - {response.text}")

# 5. Check API key usage
response = requests.get(f"{BASE_URL}/api-keys/{api_key_data['id']}/usage",
    headers={"Authorization": f"Bearer {tokens['access_token']}"})
usage_stats = response.json()
print(f"API key used {usage_stats['total_requests']} times")
```

## 🔒 Security Features

The API implements comprehensive security measures:

### Security Headers

All responses include security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (production only)

### Password Security

- Argon2 hashing for password storage
- Minimum password complexity requirements
- Secure password change workflow

### Token Security

- Short-lived access tokens (30 minutes default)
- Longer-lived refresh tokens (7 days default)
- Secure token invalidation on logout

### API Key Security

- Cryptographically secure key generation
- Key prefixing for identification (`pk_`)
- Usage tracking and monitoring
- Easy deactivation and rotation

### Database Security

- Connection pooling with limits
- SQL injection prevention through SQLAlchemy ORM
- Connection recycling and timeout management

This completes the updated API reference for the Perfomax Maritime Data API. The system provides secure, scalable access to vessel autonomous data with comprehensive authentication, monitoring, and management capabilities.
