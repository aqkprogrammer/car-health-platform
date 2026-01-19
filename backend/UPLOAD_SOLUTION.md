# Media Upload Solution - CORS Fix

## Problem
Uploading files directly to S3 from the browser was failing with CORS errors:
```
Access to XMLHttpRequest at 'https://bucket.s3.amazonaws.com/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

## Solution Implemented

We've implemented a **dual-upload strategy** that automatically handles CORS issues:

### 1. Primary Method: Presigned URL (Direct Upload)
- Frontend requests a presigned URL from the backend
- Frontend uploads directly to S3 using the presigned URL
- **Fastest method** - no backend proxy overhead
- **Requires S3 CORS configuration** (see `S3_CORS_SETUP.md`)

### 2. Fallback Method: Backend Proxy (Automatic)
- If presigned URL upload fails (CORS error), automatically falls back to backend proxy
- Frontend uploads to backend endpoint: `POST /cars/:carId/media/:mediaId/upload`
- Backend uploads to S3 server-side
- **No CORS issues** - backend-to-S3 doesn't have CORS restrictions
- **Slightly slower** - adds backend hop

## How It Works

The upload flow automatically tries presigned URL first, then falls back to proxy:

```typescript
1. Request upload authorization → Get presigned URL
2. Try uploading to presigned URL
3. If CORS error → Automatically use backend proxy endpoint
4. Register media metadata (if using presigned URL)
```

## New Backend Endpoint

**POST** `/cars/:carId/media/:mediaId/upload`

Uploads file directly through backend (bypasses CORS).

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: FormData with `file` field
- Headers: `Authorization: Bearer <token>`

**Response:**
```json
{
  "storageKey": "cars/car-id/photos/file.jpg",
  "storageUrl": "https://bucket.s3.amazonaws.com/cars/car-id/photos/file.jpg"
}
```

## Configuration

### Required Environment Variables

Add these to your backend `.env` or `docker-compose.yml`:

```bash
AWS_REGION=us-east-1
AWS_S3_BUCKET=car-health-media
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

### For Docker Compose

Add to `docker-compose.dev.yml` or `docker-compose.yml`:

```yaml
environment:
  AWS_REGION: us-east-1
  AWS_S3_BUCKET: car-health-media
  AWS_ACCESS_KEY_ID: your-access-key-id
  AWS_SECRET_ACCESS_KEY: your-secret-access-key
```

## Testing

1. **Without S3 CORS configured:**
   - Uploads will automatically use backend proxy
   - No CORS errors
   - Slightly slower but works perfectly

2. **With S3 CORS configured:**
   - Uploads use presigned URL (faster)
   - Direct browser-to-S3 upload
   - See `S3_CORS_SETUP.md` for CORS configuration

## Performance Notes

- **Presigned URL (direct):** ~100-200ms overhead
- **Backend Proxy:** ~200-400ms overhead (adds backend processing)

For production, configure S3 CORS to use the faster direct upload method.

## Troubleshooting

### Still getting CORS errors?
- Check browser console for specific error
- Verify AWS credentials are configured
- Check backend logs for S3 upload errors
- The fallback should work automatically, but check network tab to see which method is being used

### Uploads are slow?
- Configure S3 CORS to enable direct uploads
- Check network latency
- Consider using a CDN for file delivery

### Backend proxy not working?
- Verify AWS credentials are correct
- Check S3 bucket name matches `AWS_S3_BUCKET`
- Check backend logs for detailed error messages
- Ensure file size is within limits (10MB photos, 50MB videos)
