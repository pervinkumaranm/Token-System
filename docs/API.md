# College Token Management System — API Documentation

Base URL: `http://localhost:5000/api` (Development)

---

## 1. Student / Public Endpoints

### 1.1 Register Student & Generate Token
- **Method:** `POST`
- **Path:** `/student/register`
- **Rate Limit:** 10 requests / minute / IP
- **Request Body:**
```json
{
  "studentName": "Rahul Kumar",
  "registerNumber": "820721114001",
  "department": "Computer Science Engineering",
  "parentNumber": "9876543210",
  "studentWhatsApp": "9123456789"
}
```
- **Responses:**
  - `201 Created`:
  ```json
  {
    "success": true,
    "message": "Token generated successfully!",
    "tokenId": "SSEC-2026-00001",
    "token": {
      "tokenId": "SSEC-2026-00001",
      "studentName": "Rahul Kumar",
      "registerNumber": "820721114001",
      "department": "Computer Science Engineering",
      "generatedDate": "28-08-2026",
      "generatedTime": "10:15:30",
      "status": "ACTIVE"
    }
  }
  ```
  - `400 Bad Request`: Validation error
  - `409 Conflict`: Token already exists for this register number

---

### 1.2 Get Token Details
- **Method:** `GET`
- **Path:** `/token/:tokenId`
- **Response:**
  - `200 OK`:
  ```json
  {
    "success": true,
    "token": {
      "tokenId": "SSEC-2026-00001",
      "studentName": "Rahul Kumar",
      "registerNumber": "820721114001",
      "department": "Computer Science Engineering",
      "parentNumber": "9876543210",
      "studentWhatsApp": "9123456789",
      "generatedDate": "28-08-2026",
      "generatedTime": "10:15:30",
      "status": "ACTIVE",
      "whatsappStatus": "SENT"
    }
  }
  ```

---

### 1.3 Download Token PDF
- **Method:** `GET`
- **Path:** `/token/:tokenId/pdf`
- **Response:** Binary PDF stream (`Content-Type: application/pdf`, `Content-Disposition: attachment; filename="SSEC-2026-00001_token.pdf"`)

---

### 1.4 QR Code Verification
- **Method:** `GET`
- **Path:** `/verify/:tokenId`
- **Response:**
  - `200 OK`:
  ```json
  {
    "success": true,
    "valid": true,
    "alreadyUsed": false,
    "cancelled": false,
    "message": "TOKEN VALID",
    "token": {
      "tokenId": "SSEC-2026-00001",
      "studentName": "Rahul Kumar",
      "registerNumber": "820721114001",
      "department": "Computer Science Engineering",
      "generatedDate": "28-08-2026",
      "generatedTime": "10:15:30",
      "status": "ACTIVE"
    }
  }
  ```

---

### 1.5 Mark Token as Used (Staff/Admin)
- **Method:** `PATCH`
- **Path:** `/verify/:tokenId/use`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Response:**
  - `200 OK`:
  ```json
  {
    "success": true,
    "message": "Token marked as USED."
  }
  ```

---

## 2. Admin Authentication Endpoints

### 2.1 Admin Login
- **Method:** `POST`
- **Path:** `/admin/login`
- **Rate Limit:** 10 attempts / 15 minutes / IP
- **Request Body:**
```json
{
  "username": "admin",
  "password": "changeme123"
}
```
- **Response:**
  - `200 OK`:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "token": "eyJhbGciOi...",
    "admin": {
      "username": "admin",
      "role": "ADMIN"
    }
  }
  ```

---

### 2.2 Admin Logout
- **Method:** `POST`
- **Path:** `/admin/logout`
- **Headers:** `Authorization: Bearer <jwt_token>`

---

## 3. Admin Management Endpoints (All require JWT)

### 3.1 Dashboard Statistics
- **Method:** `GET`
- **Path:** `/admin/dashboard`
- **Response:**
```json
{
  "success": true,
  "stats": {
    "total": 120,
    "active": 95,
    "used": 20,
    "cancelled": 5,
    "expired": 0,
    "whatsappSent": 110,
    "whatsappFailed": 8,
    "whatsappPending": 2,
    "recent": [...]
  }
}
```

---

### 3.2 List & Search Students / Tokens
- **Method:** `GET`
- **Path:** `/admin/students`
- **Query Params:**
  - `query`: Text search (name, register number, token ID, phone)
  - `department`: Filter by department
  - `status`: `ACTIVE` | `USED` | `CANCELLED` | `EXPIRED`
  - `whatsappStatus`: `SENT` | `PENDING` | `FAILED`
  - `page`: Page number (default: 1)
  - `limit`: Page limit (default: 50)

---

### 3.3 Update Token Status
- **Method:** `PATCH`
- **Path:** `/admin/token/:tokenId/status`
- **Request Body:**
```json
{
  "status": "CANCELLED",
  "reason": "Student requested cancellation"
}
```

---

### 3.4 Resend WhatsApp Message
- **Method:** `POST`
- **Path:** `/admin/token/:tokenId/resend-whatsapp`
- **Response:**
```json
{
  "success": true,
  "message": "WhatsApp message resent successfully.",
  "whatsappStatus": "SENT"
}
```

---

### 3.5 Export Tokens to Excel
- **Method:** `GET`
- **Path:** `/admin/export`
- **Query Params:** Same as list students (supports filtered exports)
- **Response:** Excel workbook stream (`.xlsx`)

---

### 3.6 Audit Logs
- **Method:** `GET`
- **Path:** `/admin/audit-logs?limit=100&offset=0`
- **Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "uuid",
      "timestamp": "2026-08-28T10:20:00.000Z",
      "adminUsername": "admin",
      "action": "STATUS_CHANGE_CANCELLED",
      "targetTokenId": "SSEC-2026-00001",
      "oldValue": { "status": "ACTIVE" },
      "newValue": { "status": "CANCELLED" },
      "ipAddress": "::1"
    }
  ]
}
```
