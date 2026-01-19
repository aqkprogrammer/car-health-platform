# Authentication & User Management API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication APIs

### 1. Register User
**POST** `/auth/register`

Register a new user with email or phone.

**Request Body:**
```json
{
  "email": "user@example.com",  // Optional if phone provided
  "password": "password123",      // Required if email provided
  "phone": "+1234567890",        // Optional if email provided
  "role": "buyer"                // Optional, defaults to "buyer"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "phone": "+1234567890",
    "role": "buyer",
    "firstName": null,
    "lastName": null
  }
}
```

---

### 2. Email Login
**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "buyer"
  }
}
```

---

### 3. Request OTP
**POST** `/auth/login/phone`

Request OTP for phone number login.

**Request Body:**
```json
{
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "expiresIn": 600
}
```

**Note:** In development, check server logs for the OTP code.

---

### 4. Verify OTP
**POST** `/auth/login/verify-otp`

Verify OTP and complete login.

**Request Body:**
```json
{
  "phone": "+1234567890",
  "otp": "123456"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "phone": "+1234567890",
    "role": "buyer"
  }
}
```

---

### 5. Logout
**POST** `/auth/logout`

Logout user and invalidate session token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```
204 No Content
```

---

### 6. Get Current User Profile (Auth)
**GET** `/auth/profile`

Get current authenticated user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "buyer"
}
```

---

## 👤 User Management APIs

### 1. Get User Profile
**GET** `/users/profile`

Get current user's full profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "phone": "+1234567890",
  "role": "buyer",
  "firstName": "John",
  "lastName": "Doe",
  "avatar": "https://...",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "zipCode": "400001",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Update User Profile
**PUT** `/users/profile`

Update user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "newemail@example.com",  // Optional
  "phone": "+9876543210",            // Optional
  "avatar": "https://...",            // Optional
  "address": "123 Main St",           // Optional
  "city": "Mumbai",                   // Optional
  "state": "Maharashtra",            // Optional
  "country": "India",                 // Optional
  "zipCode": "400001"                 // Optional
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "newemail@example.com",
  "firstName": "John",
  "lastName": "Doe",
  ...
}
```

---

### 3. Update User Role
**PUT** `/users/role`

Update user's role (buyer, seller, dealer).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "role": "dealer"
}
```

**Response:**
```json
{
  "id": "uuid",
  "role": "dealer",
  ...
}
```

---

### 4. Change Password
**PUT** `/users/password`

Change user password.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response:**
```
204 No Content
```

---

### 5. Soft Delete User Account
**DELETE** `/users/profile`

Soft delete user account (marks as deleted, can be restored).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```
204 No Content
```

---

## 📝 User Roles

Available roles:
- `buyer` - Regular buyer (default)
- `seller` - Individual seller
- `dealer` - Dealer with subscription

---

## 🔒 Security Features

1. **JWT Authentication**: All protected endpoints require valid JWT token
2. **Password Hashing**: Passwords are hashed using bcrypt
3. **OTP Validation**: OTPs expire after 10 minutes
4. **Token Blacklist**: Logout invalidates tokens
5. **Soft Delete**: User accounts are soft deleted (can be restored)
6. **Input Validation**: All inputs are validated using class-validator

---

## 🧪 Testing

### Development OTP
In development mode, OTPs are logged to console:
```
[MOCK OTP] Phone: +1234567890, OTP: 123456, Expires: 2024-01-01T00:10:00.000Z
```

### Example cURL Commands

**Register:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "buyer"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Profile:**
```bash
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer <token>"
```

---

---

## 👤 User Profile & History APIs

### 1. Get User Profile
**GET** `/users/profile`

Get current user's full profile with all details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "phone": "+1234567890",
  "role": "buyer",
  "firstName": "John",
  "lastName": "Doe",
  "avatar": "https://...",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "zipCode": "400001",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Get Uploaded Cars
**GET** `/users/uploaded-cars`

Get all car health reports created by the user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "trustScore": 78.5,
    "verdict": "good",
    "status": "completed",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 3. Get Purchased Reports
**GET** `/users/purchased-reports`

Get all reports purchased by the user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "reportId": "report-uuid",
    "report": {
      "id": "report-uuid",
      "make": "Honda",
      "model": "Civic",
      "year": 2019,
      "trustScore": 85.0
    },
    "amountPaid": 999,
    "currency": "INR",
    "purchasedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 4. Get Saved Cars
**GET** `/users/saved-cars`

Get all cars saved by the user (favorites).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "listingId": "listing-uuid",
    "listing": {
      "id": "listing-uuid",
      "price": 1500000,
      "currency": "INR",
      "city": "Mumbai",
      "report": {
        "make": "Toyota",
        "model": "Camry",
        "year": 2020
      }
    },
    "notes": "Interested in this car",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 5. Save Car
**POST** `/users/saved-cars`

Save a car to user's favorites.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "listingId": "listing-uuid",
  "notes": "Interested in this car" // Optional
}
```

**Response:**
```json
{
  "id": "uuid",
  "listingId": "listing-uuid",
  "notes": "Interested in this car",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 6. Unsave Car
**DELETE** `/users/saved-cars/:listingId`

Remove a car from saved cars.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```
204 No Content
```

---

### 7. Get Activity History
**GET** `/users/activity`

Get user activity history with pagination.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of activities to return (default: 50)
- `offset` (optional): Number of activities to skip (default: 0)

**Response:**
```json
{
  "activities": [
    {
      "id": "uuid",
      "type": "report_created",
      "entityType": "report",
      "entityId": "report-uuid",
      "description": "Created health report for Toyota Camry 2020",
      "metadata": {
        "make": "Toyota",
        "model": "Camry",
        "year": 2020
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid",
      "type": "car_saved",
      "entityType": "listing",
      "entityId": "listing-uuid",
      "description": null,
      "metadata": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 25
}
```

**Activity Types:**
- `report_created` - User created a health report
- `report_purchased` - User purchased a report
- `listing_created` - User created a marketplace listing
- `listing_viewed` - User viewed a listing
- `car_saved` - User saved a car
- `car_unsaved` - User unsaved a car
- `profile_updated` - User updated their profile
- `login` - User logged in
- `logout` - User logged out

---

## 🚗 Car CRUD APIs

### 1. Create Car
**POST** `/cars`

Create a new car with basic metadata.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "fuelType": "petrol",
  "transmission": "automatic",
  "kilometersDriven": 50000,
  "ownershipCount": 1,
  "vin": "ABC1234567890XYZ",
  "registrationNumber": "MH-01-AB-1234",
  "color": "White",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "additionalDetails": {}
}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "user-uuid",
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "fuelType": "petrol",
  "transmission": "automatic",
  "kilometersDriven": 50000,
  "ownershipCount": 1,
  "vin": "ABC1234567890XYZ",
  "registrationNumber": "MH-01-AB-1234",
  "color": "White",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Get All Cars
**GET** `/cars`

Get all cars (optionally filtered by user).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `userId` (optional): Filter cars by user ID

**Response:**
```json
[
  {
    "id": "uuid",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "user": {
      "id": "user-uuid",
      "email": "user@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 3. Get My Cars
**GET** `/cars/my-cars`

Get all cars owned by the current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "kilometersDriven": 50000,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 4. Get Car by ID
**GET** `/cars/:id`

Get a specific car by its ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "user-uuid",
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "fuelType": "petrol",
  "transmission": "automatic",
  "kilometersDriven": 50000,
  "ownershipCount": 1,
  "vin": "ABC1234567890XYZ",
  "registrationNumber": "MH-01-AB-1234",
  "color": "White",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John"
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 5. Update Car
**PUT** `/cars/:id`

Update car details. Only the car owner can update.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "kilometersDriven": 55000,
  "color": "Silver",
  "city": "Pune",
  "additionalDetails": {
    "lastServiceDate": "2024-01-15",
    "insuranceExpiry": "2024-12-31"
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "kilometersDriven": 55000,
  "color": "Silver",
  "city": "Pune",
  "updatedAt": "2024-01-20T00:00:00.000Z"
}
```

**Error Responses:**
- `403 Forbidden`: User is not the car owner
- `404 Not Found`: Car not found

---

### 6. Delete Car (Soft Delete)
**DELETE** `/cars/:id`

Soft delete a car. Only the car owner can delete.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```
204 No Content
```

**Error Responses:**
- `403 Forbidden`: User is not the car owner
- `404 Not Found`: Car not found

---

### 7. Update Car Status
**PUT** `/cars/:id/status`

Update car status. Only the car owner can update status.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "media_uploaded",
  "note": "All photos uploaded successfully" // Optional
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "media_uploaded",
  "make": "Toyota",
  "model": "Camry",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid status transition
- `403 Forbidden`: User is not the car owner
- `404 Not Found`: Car not found

**Status Transition Rules:**
- `draft` → `media_uploaded` → `submitted` → `analyzing` → `report_ready`
- Can go back to previous states (except from `report_ready`)
- `report_ready` is a final state and cannot be changed

---

### 8. Get Cars by Status
**GET** `/cars?status=<status>`

Get all cars filtered by status. Can be combined with `userId` filter.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by car status
- `userId` (optional): Filter by user ID

**Example:**
```
GET /cars?status=submitted&userId=user-uuid
```

**Response:**
```json
[
  {
    "id": "uuid",
    "status": "submitted",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020
  }
]
```

---

### Car Field Reference

**Car Statuses:**
- `draft` - Initial state when car is created
- `media_uploaded` - User has uploaded photos/videos
- `submitted` - Car details and media submitted for analysis
- `analyzing` - AI is analyzing the car
- `report_ready` - Analysis complete, report is ready (final state)

**Fuel Types:**
- `petrol`
- `diesel`
- `electric`
- `hybrid`
- `cng`
- `lpg`

**Transmission Types:**
- `manual`
- `automatic`
- `cvt`
- `amt`

---

## 📸 Media APIs

### 1. Request Upload Authorization (Presigned URL)
**POST** `/cars/:carId/media/upload-request`

Request authorization to upload media. Returns a presigned URL for direct upload to storage.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "photo",
  "photoType": "front",
  "fileName": "car-front.jpg",
  "mimeType": "image/jpeg",
  "fileSize": 5242880,
  "width": 1920,
  "height": 1080
}
```

**For Video:**
```json
{
  "type": "video",
  "fileName": "engine-sound.mp4",
  "mimeType": "video/mp4",
  "fileSize": 10485760,
  "width": 1920,
  "height": 1080,
  "duration": 15
}
```

**Response:**
```json
{
  "mediaId": "uuid",
  "uploadUrl": "https://bucket.s3.amazonaws.com/...?presigned=true&expires=3600",
  "expiresIn": 3600
}
```

**Photo Types:**
- `front` - Front view
- `rear` - Rear view
- `left` - Left side
- `right` - Right side
- `interior` - Interior
- `engineBay` - Engine bay

**File Limits:**
- Photos: Max 10MB (JPEG, PNG)
- Videos: Max 50MB (MP4), 10-20 seconds duration

---

### 2. Register Media Metadata
**PUT** `/cars/:carId/media/:mediaId/register`

Register media metadata after successful upload to storage.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "storageKey": "s3://bucket/cars/car-id/photos/media-id.jpg",
  "storageUrl": "https://bucket.s3.amazonaws.com/cars/car-id/photos/media-id.jpg",
  "thumbnailUrl": "https://bucket.s3.amazonaws.com/cars/car-id/photos/thumb-media-id.jpg",
  "metadata": {
    "exif": {},
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "carId": "car-uuid",
  "type": "photo",
  "photoType": "front",
  "fileName": "media-id.jpg",
  "storageUrl": "https://bucket.s3.amazonaws.com/...",
  "isUploaded": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Note:** After registering all required media, car status automatically updates to `media_uploaded`.

---

### 3. Validate Required Media Presence
**GET** `/cars/:carId/media/validate`

Check if all required media types are present for a car.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "isValid": false,
  "missingPhotos": ["rear", "interior"],
  "hasVideo": true
}
```

**Required Media:**
- 6 photos: front, rear, left, right, interior, engineBay
- 1 video: engine sound (optional but recommended)

---

### 4. Fetch Media List for a Car
**GET** `/cars/:carId/media`

Get all media files for a car.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "carId": "car-uuid",
    "type": "photo",
    "photoType": "front",
    "fileName": "media-id.jpg",
    "originalFileName": "car-front.jpg",
    "mimeType": "image/jpeg",
    "fileSize": 5242880,
    "storageKey": "cars/car-id/photos/media-id.jpg",
    "storageUrl": "https://bucket.s3.amazonaws.com/...",
    "thumbnailUrl": "https://bucket.s3.amazonaws.com/...thumb.jpg",
    "width": 1920,
    "height": 1080,
    "isUploaded": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "uuid",
    "type": "video",
    "photoType": null,
    "fileName": "engine-sound.mp4",
    "duration": 15,
    "isUploaded": true
  }
]
```

---

### 5. Delete Media
**DELETE** `/cars/:carId/media/:mediaId`

Delete a media file (soft delete).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```
204 No Content
```

**Note:** This soft deletes the media record. Actual file deletion from storage should be handled separately (e.g., via S3 lifecycle policies or cleanup job).

---

### 6. Replace Media
**POST** `/cars/:carId/media/:mediaId/replace`

Replace existing media (deletes old and requests new upload authorization).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "photo",
  "photoType": "front",
  "fileName": "new-car-front.jpg",
  "mimeType": "image/jpeg",
  "fileSize": 5242880
}
```

**Response:**
```json
{
  "mediaId": "new-uuid",
  "uploadUrl": "https://bucket.s3.amazonaws.com/...?presigned=true",
  "expiresIn": 3600
}
```

---

## 📚 Swagger Documentation

Once the server is running, visit:
```
http://localhost:3001/api/docs
```

This provides interactive API documentation with the ability to test endpoints directly.
