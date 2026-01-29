# Construction Service Hub - Backend API Documentation

## Overview

This document outlines the required API endpoints for the Construction Service Hub (Барилгын Үйлчилгээний Хаб) mobile application. The backend should support authentication, stores, products, orders, services, chat, and delivery management.

---

## Base Configuration

```
Base URL: https://your-api-domain.com/api/v1
Content-Type: application/json
Authorization: Bearer <access_token>
```

---

## Authentication APIs

### POST `/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "email": "string",
  "password": "string",
  "full_name": "string",
  "phone": "string",
  "role": "user" | "owner" | "driver" | "worker"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "full_name": "string",
    "role": "string",
    "created_at": "timestamp"
  },
  "access_token": "string",
  "refresh_token": "string"
}
```

### POST `/auth/login`

Authenticate user and get tokens.

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

### POST `/auth/logout`

Invalidate current session.

### POST `/auth/refresh`

Refresh access token using refresh token.

### POST `/auth/forgot-password`

Send password reset email.

### POST `/auth/reset-password`

Reset password with token.

---

## User Profile APIs

### GET `/users/me`

Get current user profile.

### PUT `/users/me`

Update current user profile.

**Request Body:**

```json
{
  "full_name": "string",
  "phone": "string",
  "avatar_url": "string",
  "address": "string",
  "vehicle_type": "bike" | "car" | "truck" | null,
  "vehicle_number": "string | null"
}
```

### POST `/users/me/avatar`

Upload user avatar image.

**Request:** `multipart/form-data`

- `file`: Image file (JPEG, PNG, WebP)

---

## Stores APIs

### GET `/stores`

Get list of all stores with filtering.

**Query Parameters:**

- `category`: Filter by category
- `search`: Search by name
- `lat`, `lng`: User location for distance sorting
- `page`, `limit`: Pagination

**Response:**

```json
{
  "stores": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "image_url": "string",
      "rating": "number",
      "review_count": "number",
      "address": "string",
      "lat": "number",
      "lng": "number",
      "phone": "string",
      "is_open": "boolean",
      "opening_hours": "string",
      "category": "string"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

### GET `/stores/:id`

Get single store details.

### POST `/stores` (Owner only)

Create a new store.

### PUT `/stores/:id` (Owner only)

Update store details.

### DELETE `/stores/:id` (Owner only)

Delete a store.

### POST `/stores/:id/image`

Upload store image.

---

## Products APIs

### GET `/stores/:storeId/products`

Get products for a store.

**Query Parameters:**

- `category`: Filter by category
- `search`: Search by name
- `in_stock`: Filter by availability
- `min_price`, `max_price`: Price range
- `page`, `limit`: Pagination

### GET `/products/:id`

Get single product details.

**Response:**

```json
{
  "id": "uuid",
  "store_id": "uuid",
  "name": "string",
  "description": "string",
  "price": "number",
  "original_price": "number | null",
  "images": ["string"],
  "category": "string",
  "in_stock": "boolean",
  "stock_quantity": "number",
  "unit": "string",
  "specifications": {
    "key": "value"
  },
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### POST `/stores/:storeId/products` (Owner only)

Create a new product.

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "price": "number",
  "original_price": "number | null",
  "category": "string",
  "in_stock": "boolean",
  "stock_quantity": "number",
  "unit": "string",
  "specifications": {}
}
```

### PUT `/products/:id` (Owner only)

Update product details.

### DELETE `/products/:id` (Owner only)

Delete a product.

### POST `/products/:id/images`

Upload product images (multiple).

**Request:** `multipart/form-data`

- `files[]`: Image files (max 5)

### DELETE `/products/:id/images/:imageId`

Delete a product image.

---

## Orders APIs

### GET `/orders`

Get orders for current user (filtered by role).

**Query Parameters:**

- `status`: Filter by status
- `date_from`, `date_to`: Date range
- `page`, `limit`: Pagination

### GET `/orders/:id`

Get single order details.

**Response:**

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "store_id": "uuid",
  "driver_id": "uuid | null",
  "status": "pending" | "confirmed" | "preparing" | "ready" | "picked_up" | "delivering" | "delivered" | "cancelled",
  "items": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "product_name": "string",
      "product_image": "string",
      "quantity": "number",
      "unit_price": "number",
      "total_price": "number"
    }
  ],
  "subtotal": "number",
  "delivery_fee": "number",
  "total": "number",
  "delivery_address": "string",
  "delivery_lat": "number",
  "delivery_lng": "number",
  "customer_name": "string",
  "customer_phone": "string",
  "notes": "string | null",
  "estimated_delivery": "timestamp | null",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### POST `/orders`

Create a new order.

**Request Body:**

```json
{
  "store_id": "uuid",
  "items": [
    {
      "product_id": "uuid",
      "quantity": "number"
    }
  ],
  "delivery_address": "string",
  "delivery_lat": "number",
  "delivery_lng": "number",
  "customer_name": "string",
  "customer_phone": "string",
  "notes": "string | null"
}
```

### PUT `/orders/:id/status` (Owner/Driver)

Update order status.

**Request Body:**

```json
{
  "status": "string",
  "notes": "string | null"
}
```

### POST `/orders/:id/cancel`

Cancel an order.

### POST `/orders/:id/assign-driver` (Owner)

Assign driver to order.

---

## Service Workers APIs

### GET `/workers`

Get list of service workers.

**Query Parameters:**

- `specialty`: Filter by specialty
- `available`: Filter by availability
- `rating_min`: Minimum rating
- `lat`, `lng`: User location
- `page`, `limit`: Pagination

**Response:**

```json
{
  "workers": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "string",
      "avatar_url": "string",
      "specialty": "string",
      "description": "string",
      "rating": "number",
      "review_count": "number",
      "hourly_rate": "number",
      "is_available": "boolean",
      "completed_jobs": "number",
      "skills": ["string"]
    }
  ]
}
```

### GET `/workers/:id`

Get worker profile details.

### PUT `/workers/me` (Worker only)

Update worker profile.

---

## Service Jobs APIs

### GET `/jobs`

Get jobs (filtered by role - user sees their jobs, worker sees available/assigned).

**Query Parameters:**

- `status`: Filter by status
- `page`, `limit`: Pagination

### GET `/jobs/:id`

Get job details.

**Response:**

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "worker_id": "uuid | null",
  "title": "string",
  "description": "string",
  "status": "pending" | "quoted" | "accepted" | "in_progress" | "completed" | "cancelled",
  "location": "string",
  "lat": "number",
  "lng": "number",
  "budget_min": "number | null",
  "budget_max": "number | null",
  "quoted_price": "number | null",
  "final_price": "number | null",
  "milestones": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "is_completed": "boolean",
      "completed_at": "timestamp | null"
    }
  ],
  "images": ["string"],
  "created_at": "timestamp"
}
```

### POST `/jobs`

Create a new service job request.

### PUT `/jobs/:id` (User/Worker)

Update job details.

### POST `/jobs/:id/quote` (Worker)

Submit a quote for a job.

**Request Body:**

```json
{
  "quoted_price": "number",
  "estimated_duration": "string",
  "notes": "string"
}
```

### POST `/jobs/:id/accept` (User)

Accept worker's quote.

### POST `/jobs/:id/milestones/:milestoneId/complete` (Worker)

Mark milestone as complete.

---

## Chat APIs

### GET `/chats`

Get all chats for current user.

**Response:**

```json
{
  "chats": [
    {
      "id": "uuid",
      "type": "order" | "service" | "support",
      "order_id": "uuid | null",
      "job_id": "uuid | null",
      "participants": [
        {
          "user_id": "uuid",
          "name": "string",
          "avatar_url": "string"
        }
      ],
      "last_message": {
        "content": "string",
        "sender_id": "uuid",
        "created_at": "timestamp"
      },
      "unread_count": "number",
      "created_at": "timestamp"
    }
  ]
}
```

### GET `/chats/:id`

Get chat with messages.

### GET `/chats/:id/messages`

Get paginated messages for a chat.

**Query Parameters:**

- `before`: Cursor for pagination (message ID)
- `limit`: Number of messages

**Response:**

```json
{
  "messages": [
    {
      "id": "uuid",
      "chat_id": "uuid",
      "sender_id": "uuid",
      "sender_name": "string",
      "sender_avatar": "string",
      "content": "string",
      "type": "text" | "image" | "price_proposal" | "deal_confirmed" | "system",
      "metadata": {},
      "created_at": "timestamp"
    }
  ],
  "has_more": "boolean"
}
```

### POST `/chats/:id/messages`

Send a message.

**Request Body:**

```json
{
  "content": "string",
  "type": "text" | "image" | "price_proposal",
  "metadata": {}
}
```

### POST `/chats/:id/messages/image`

Send an image message.

**Request:** `multipart/form-data`

### POST `/chats/:id/read`

Mark chat as read.

---

## Delivery Tasks APIs (Driver)

### GET `/delivery-tasks`

Get available and assigned delivery tasks.

**Query Parameters:**

- `status`: Filter by status
- `lat`, `lng`: Driver location

### GET `/delivery-tasks/:id`

Get task details.

**Response:**

```json
{
  "id": "uuid",
  "order_id": "uuid",
  "driver_id": "uuid | null",
  "status": "pending" | "assigned" | "picked_up" | "delivering" | "delivered",
  "pickup_address": "string",
  "pickup_lat": "number",
  "pickup_lng": "number",
  "delivery_address": "string",
  "delivery_lat": "number",
  "delivery_lng": "number",
  "distance_km": "number",
  "earnings": "number",
  "picked_up_at": "timestamp | null",
  "delivered_at": "timestamp | null"
}
```

### POST `/delivery-tasks/:id/accept`

Accept a delivery task.

### POST `/delivery-tasks/:id/pickup`

Mark as picked up.

### POST `/delivery-tasks/:id/deliver`

Mark as delivered.

**Request Body:**

```json
{
  "delivery_photo": "string | null",
  "signature": "string | null",
  "notes": "string | null"
}
```

### PUT `/delivery-tasks/:id/location`

Update driver location during delivery.

**Request Body:**

```json
{
  "lat": "number",
  "lng": "number"
}
```

---

## Driver Earnings APIs

### GET `/driver/earnings`

Get earnings summary.

**Query Parameters:**

- `period`: "today" | "week" | "month" | "all"

**Response:**

```json
{
  "total_earnings": "number",
  "completed_deliveries": "number",
  "average_per_delivery": "number",
  "earnings_by_day": [
    {
      "date": "string",
      "amount": "number",
      "deliveries": "number"
    }
  ]
}
```

---

## File Upload APIs

### POST `/upload/image`

General image upload endpoint.

**Request:** `multipart/form-data`

- `file`: Image file
- `folder`: Target folder (products, avatars, chats, etc.)

**Response:**

```json
{
  "url": "string",
  "thumbnail_url": "string",
  "file_id": "uuid"
}
```

### DELETE `/upload/:fileId`

Delete an uploaded file.

---

## Notifications APIs

### GET `/notifications`

Get user notifications.

### PUT `/notifications/:id/read`

Mark notification as read.

### PUT `/notifications/read-all`

Mark all notifications as read.

---

## WebSocket Events

For real-time updates, implement WebSocket connections:

### Connection

```
wss://your-api-domain.com/ws?token=<access_token>
```

### Events to Listen

| Event                      | Description                     |
| -------------------------- | ------------------------------- |
| `order:status_updated`     | Order status changed            |
| `order:new`                | New order received (for owners) |
| `chat:new_message`         | New chat message                |
| `delivery:location_update` | Driver location updated         |
| `delivery:new_task`        | New delivery task available     |
| `job:quote_received`       | Worker submitted quote          |
| `job:status_updated`       | Job status changed              |

### Event Payload Format

```json
{
  "event": "string",
  "data": {},
  "timestamp": "ISO timestamp"
}
```

---

## Error Response Format

All errors should follow this format:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {} | null
  }
}
```

### Common Error Codes

| Code               | HTTP Status | Description              |
| ------------------ | ----------- | ------------------------ |
| `UNAUTHORIZED`     | 401         | Invalid or expired token |
| `FORBIDDEN`        | 403         | Insufficient permissions |
| `NOT_FOUND`        | 404         | Resource not found       |
| `VALIDATION_ERROR` | 400         | Invalid request data     |
| `CONFLICT`         | 409         | Resource conflict        |
| `INTERNAL_ERROR`   | 500         | Server error             |

---

## Rate Limiting

- **Standard endpoints**: 100 requests/minute
- **Auth endpoints**: 10 requests/minute
- **File uploads**: 20 requests/minute

Response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# File Storage (S3 compatible)
STORAGE_ENDPOINT=https://...
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...
STORAGE_BUCKET=construction-hub

# Push Notifications (Optional)
FCM_SERVER_KEY=...

# SMS Service (Optional)
SMS_API_KEY=...
SMS_SENDER_ID=...
```

---

## Database Schema

See `docs/supabase-schema.sql` for the complete database schema including:

- Tables structure
- Row Level Security policies
- Indexes
- Storage bucket configuration

---

## Getting Started

1. Clone the repository
2. Set up environment variables
3. Run database migrations using the schema in `docs/supabase-schema.sql`
4. Start the server
5. API will be available at `http://localhost:3000/api/v1`
