# MyPharma Admin API Contract (Initial)

This document defines the APIs needed by the React admin app and sample payloads.

## How the app should work (frontend ↔ backend)

1. **Login**  
   The user opens `/login` and submits email + password. The app calls **`POST /auth/login`** (see below).  
   On success it stores `token` + `user` in `localStorage` and sends the user to the dashboard.

2. **Authenticated requests**  
   Every other API call must send:  
   `Authorization: Bearer <token>` and `Content-Type: application/json`.  
   If the server returns **401**, the app should clear the session and send the user back to `/login`.

3. **Environment**  
   - **Demo mode** (default): no backend. The UI uses mock data; login accepts only the demo credentials shown on the login page.  
   - **Live API**: set `VITE_API_BASE_URL` to your API root (e.g. `https://api.example.com/api/v1` or `http://localhost:4000/api/v1`). The app will `POST` to `{VITE_API_BASE_URL}/auth/login`.

4. **Screen → API mapping (when you wire real data)**  
   | Screen      | Purpose | Primary APIs |
   |------------|---------|----------------|
   | Dashboard  | KPIs + snippets | `GET /dashboard/summary`, optional lists from `GET /medicines` and `GET /orders` |
   | Inventory  | Full medicine list, filters | `GET /medicines?page&limit&search&category&status`, `POST /medicines`, `PATCH /medicines/:id` |
   | Orders     | Order queue, status | `GET /orders`, `PATCH /orders/:id/status` |
   | Suppliers  | Directory | `GET /suppliers` |
   | Customers  | Accounts | `GET /customers` |
   | Analytics  | Charts | `GET /analytics/sales-trend?from&to&groupBy` |
   | Settings   | Profile / prefs | Your choice: e.g. `GET/PATCH /settings` or split by domain (not in this doc yet) |

5. **Suggested next endpoints** (optional but useful)  
   - `POST /auth/logout` — invalidate server-side session / refresh token.  
   - `GET /auth/me` — refresh current user from token.  
   - `POST /auth/refresh` — if using short-lived access tokens.

## Base

- Base URL: `/api/v1` (or full origin via `VITE_API_BASE_URL`)
- Auth: `Authorization: Bearer <jwt-token>`
- Content-Type: `application/json`

## 1) Auth

### POST `/auth/login`
Request:
```json
{
  "email": "admin@mypharma.com",
  "password": "StrongPassword123"
}
```

Response:
```json
{
  "token": "jwt-token-string",
  "user": {
    "id": "usr_001",
    "name": "Admin User",
    "email": "admin@mypharma.com",
    "role": "SUPER_ADMIN"
  }
}
```

## 2) Dashboard

### GET `/dashboard/summary`
Response:
```json
{
  "totalRevenue": 1248300,
  "totalOrders": 2184,
  "lowStockAlerts": 19,
  "pendingDeliveries": 84,
  "revenueDeltaPct": 12.6,
  "ordersDeltaPct": 7.2,
  "stockDeltaPct": -3.1,
  "deliveryDeltaPct": 4.8
}
```

## 3) Medicines / Inventory

### GET `/medicines`
Query params:
- `page`: number
- `limit`: number
- `search`: string
- `category`: string
- `status`: `ACTIVE | LOW_STOCK | OUT_OF_STOCK`

Response:
```json
{
  "items": [
    {
      "id": "MED-001",
      "name": "Paracetamol 650",
      "sku": "PCM-650",
      "category": "Pain Relief",
      "stock": 1200,
      "price": 32,
      "status": "ACTIVE"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 253
}
```

### POST `/medicines`
Request:
```json
{
  "name": "Azithromycin 500",
  "sku": "AZI-500",
  "category": "Antibiotic",
  "description": "Strip of 10 tablets",
  "price": 145,
  "mrp": 160,
  "stock": 450,
  "reorderLevel": 100,
  "supplierId": "SUP-002",
  "batchNumber": "BCH-2026-04-01",
  "expiryDate": "2028-06-30"
}
```

Response:
```json
{
  "id": "MED-130",
  "message": "Medicine created successfully"
}
```

### PATCH `/medicines/:id`
Request:
```json
{
  "price": 149,
  "stock": 420,
  "reorderLevel": 120
}
```

## 4) Orders

### GET `/orders`
Query params:
- `page`, `limit`
- `paymentStatus`: `PAID | PENDING | FAILED`
- `fulfillmentStatus`: `PROCESSING | PACKED | SHIPPED | DELIVERED`

Response:
```json
{
  "items": [
    {
      "id": "ORD-12018",
      "customerId": "CUS-009",
      "customerName": "City Care Hospital",
      "amount": 24700,
      "paymentStatus": "PAID",
      "fulfillmentStatus": "SHIPPED",
      "createdAt": "2026-04-08T09:30:00Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 902
}
```

### PATCH `/orders/:id/status`
Request:
```json
{
  "paymentStatus": "PAID",
  "fulfillmentStatus": "DELIVERED"
}
```

## 5) Suppliers

### GET `/suppliers`
Response:
```json
{
  "items": [
    {
      "id": "SUP-002",
      "name": "LifeCare Distributors",
      "contactName": "Ravi Gupta",
      "phone": "+91-9876543210",
      "email": "sales@lifecare.com",
      "address": "Mumbai, India"
    }
  ]
}
```

## 6) Customers

### GET `/customers`
Response:
```json
{
  "items": [
    {
      "id": "CUS-009",
      "name": "City Care Hospital",
      "type": "B2B",
      "phone": "+91-9811111111",
      "email": "procurement@citycare.com",
      "creditLimit": 500000
    }
  ]
}
```

## 7) Analytics

### GET `/analytics/sales-trend`
Query params:
- `from`: `YYYY-MM-DD`
- `to`: `YYYY-MM-DD`
- `groupBy`: `day | week | month`

Response:
```json
{
  "series": [
    { "label": "2026-04-01", "revenue": 48200, "orders": 61 },
    { "label": "2026-04-02", "revenue": 50100, "orders": 67 }
  ]
}
```

## Validation Notes

- Price, MRP, stock, reorderLevel must be non-negative.
- Expiry date must be greater than current date.
- SKU must be unique.
- State transitions for fulfillment should follow: `PROCESSING -> PACKED -> SHIPPED -> DELIVERED`.
