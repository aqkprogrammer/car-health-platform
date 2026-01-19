# S3 CORS Configuration Guide

## Problem
When uploading files directly from the browser to S3 using presigned URLs, you may encounter CORS errors:
```
Access to XMLHttpRequest at 'https://bucket.s3.amazonaws.com/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution: Configure S3 Bucket CORS

You need to configure CORS on your S3 bucket to allow direct browser uploads.

### Steps:

1. **Go to AWS S3 Console**
   - Navigate to your S3 bucket (e.g., `car-health-media`)
   - Click on the bucket name

2. **Open Permissions Tab**
   - Click on the "Permissions" tab
   - Scroll down to "Cross-origin resource sharing (CORS)"

3. **Add CORS Configuration**
   Click "Edit" and paste the following CORS configuration:

```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-production-domain.com"
    ],
    "ExposeHeaders": [
      "ETag",
      "x-amz-server-side-encryption",
      "x-amz-request-id",
      "x-amz-id-2"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

**Important:** Replace `https://your-production-domain.com` with your actual production domain.

### For Development:
If you're only testing locally, you can use:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

**Warning:** Using `"AllowedOrigins": ["*"]` allows any origin. Only use this for development/testing.

### For Production:
Use specific origins:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "https://yourdomain.com",
      "https://www.yourdomain.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## Environment Variables

Make sure your backend has the following environment variables configured:

```bash
AWS_REGION=us-east-1
AWS_S3_BUCKET=car-health-media
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

### For Docker:
Add these to your `docker-compose.yml` or `docker-compose.dev.yml`:

```yaml
environment:
  AWS_REGION: us-east-1
  AWS_S3_BUCKET: car-health-media
  AWS_ACCESS_KEY_ID: your-access-key-id
  AWS_SECRET_ACCESS_KEY: your-secret-access-key
```

## Testing

After configuring CORS:

1. Restart your backend server
2. Try uploading a file from the frontend
3. Check browser console for any CORS errors

## Troubleshooting

### Still getting CORS errors?

1. **Verify CORS configuration is saved** - Check the S3 bucket CORS settings
2. **Check bucket policy** - Ensure your bucket policy allows the operations
3. **Verify presigned URL** - Make sure the backend is generating proper presigned URLs (check network tab)
4. **Clear browser cache** - CORS headers might be cached
5. **Check allowed origins** - Make sure your frontend URL matches exactly (including http vs https, port numbers)

### Common Issues:

- **Port mismatch**: `http://localhost:3000` vs `http://localhost:3001` - make sure they match
- **Protocol mismatch**: `http://` vs `https://` - make sure they match
- **Trailing slash**: `http://localhost:3000` vs `http://localhost:3000/` - usually doesn't matter but check

## Additional S3 Bucket Policy (Optional)

You may also want to add a bucket policy to allow public read access (if needed):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::car-health-media/*"
    }
  ]
}
```

**Note:** This makes all objects publicly readable. Adjust based on your security requirements.
