# AfriFund API Documentation

## Base URL
```
Development: http://localhost:3001/api/v1
Production: https://api.afrifund.com/api/v1
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Request successful"
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": { /* validation errors if any */ },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Rate Limiting

- **Default**: 10 requests per 60 seconds per IP
- **Authenticated**: Higher limits based on user role

## API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+234 123 456 7890",
  "role": "CREATOR" // CREATOR, BACKER, or MENTOR
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cuid_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CREATOR",
    "isVerified": false
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Campaigns

#### List Campaigns
```http
GET /campaigns?status=ACTIVE&category=Technology&search=AI
```

**Query Parameters:**
- `status`: DRAFT | PENDING_APPROVAL | ACTIVE | FUNDED | CLOSED | REJECTED
- `category`: Campaign category
- `country`: Filter by country
- `search`: Search in title and description

#### Create Campaign
```http
POST /campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "AI for African Agriculture",
  "description": "Full description here...",
  "shortDescription": "Brief description",
  "category": "Technology",
  "location": "Lagos, Nigeria",
  "country": "Nigeria",
  "targetAmount": 50000,
  "currency": "USD",
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",
  "featuredImage": "https://example.com/image.jpg",
  "videoUrl": "https://youtube.com/watch?v=..."
}
```

### Pledges

#### Create Pledge
```http
POST /pledges
Authorization: Bearer <token>
Content-Type: application/json

{
  "campaignId": "campaign_id",
  "amount": 100,
  "currency": "USD",
  "message": "Great project!",
  "isAnonymous": false,
  "paymentProvider": "FLUTTERWAVE" // or PAYSTACK, MPESA, MOCK
}
```

**Response:**
```json
{
  "pledge": {
    "id": "pledge_id",
    "amount": 100,
    "platformFee": 3,
    "netAmount": 97,
    "status": "PENDING"
  },
  "payment": {
    "transactionId": "tx_id",
    "paymentUrl": "https://payment-gateway.com/pay/...",
    "reference": "ref_123"
  }
}
```

### KYC

#### Submit KYC
```http
POST /kyc/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Doe",
  "dateOfBirth": "1990-01-01",
  "idType": "NATIONAL_ID",
  "idNumber": "12345678",
  "idDocument": "https://storage.com/id.jpg",
  "address": "123 Main St",
  "city": "Lagos",
  "country": "Nigeria",
  "postalCode": "100001"
}
```

### Mentors

#### Create Mentor Profile
```http
POST /mentors/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Dr.",
  "expertise": ["Business Strategy", "Marketing", "Tech"],
  "bio": "Experienced entrepreneur with 15 years...",
  "company": "Acme Corp",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "yearsExperience": 15,
  "hourlyRate": 150,
  "availableHours": 10
}
```

## Payment Webhook Integration

### Flutterwave Webhook
```http
POST /payments/webhook/flutterwave
Content-Type: application/json
verif-hash: <signature>

{
  "event": "charge.completed",
  "data": {
    "tx_ref": "transaction_id",
    "amount": 100,
    "currency": "USD",
    "status": "successful"
  }
}
```

### Paystack Webhook
```http
POST /payments/webhook/paystack
Content-Type: application/json
x-paystack-signature: <signature>

{
  "event": "charge.success",
  "data": {
    "reference": "transaction_id",
    "amount": 10000,
    "currency": "NGN",
    "status": "success"
  }
}
```

## Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Platform Fees

- **Pledge Fee**: 3% of total amount
- **Automatic Deduction**: Fee is calculated and deducted automatically
- **Transparency**: Both gross and net amounts are shown

## Certificate Levels

Based on contribution amount:
- **Bronze**: < $1,000
- **Silver**: $1,000 - $4,999
- **Gold**: $5,000 - $9,999
- **Platinum**: $10,000+

All certificates are **FREE** and automatically generated.
