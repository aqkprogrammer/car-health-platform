# Local File Storage Setup (No AWS Required)

Perfect for testing and development without setting up AWS S3!

## How It Works

The system now supports **two storage types**:
1. **Local Storage** (default) - Files stored on server filesystem
2. **S3 Storage** - Files stored on AWS S3 (when configured)

## Quick Start (Local Storage)

### 1. No Configuration Needed!

The system **automatically uses local storage** if AWS credentials are not configured.

### 2. Files Are Stored In:

```
backend/uploads/
  └── {carId}/
      ├── photos/
      │   └── {filename}.jpg
      └── videos/
          └── {filename}.mp4
```

### 3. Files Are Served At:

```
http://localhost:3001/api/media/files/{carId}/photos/{filename}.jpg
http://localhost:3001/api/media/files/{carId}/videos/{filename}.mp4
```

## Configuration

### Use Local Storage (Default)

**Option 1: Don't set AWS credentials** (recommended for testing)
- Just don't add AWS credentials to `.env`
- System automatically uses local storage

**Option 2: Explicitly set storage type**
```bash
STORAGE_TYPE=local
```

### Switch to S3 Later

When you're ready to use S3:

1. **Add AWS credentials to `.env`:**
```bash
STORAGE_TYPE=s3
AWS_REGION=us-east-1
AWS_S3_BUCKET=car-health-media
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

2. **Restart backend** - Files will now upload to S3

## Environment Variables

### For Local Storage (Testing):
```bash
# No AWS credentials needed!
# Just make sure STORAGE_TYPE is not set or set to 'local'
STORAGE_TYPE=local  # Optional, this is the default
```

### For S3 Storage (Production):
```bash
STORAGE_TYPE=s3
AWS_REGION=us-east-1
AWS_S3_BUCKET=car-health-media
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

## Testing

1. **Start your backend:**
   ```bash
   npm run start:dev
   # or
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Upload a file** from your frontend
   - Files will be saved to `backend/uploads/` directory
   - Check the directory to see uploaded files

3. **View uploaded files:**
   - Files are accessible via the API endpoint
   - Frontend will display them automatically

## File Structure

```
backend/
├── uploads/              # Created automatically
│   └── {carId}/
│       ├── photos/
│       │   ├── uuid1.jpg
│       │   └── uuid2.jpg
│       └── videos/
│           └── uuid3.mp4
└── src/
    └── media/
        └── media.service.ts
```

## Advantages of Local Storage

✅ **No setup required** - Works immediately  
✅ **No costs** - Completely free  
✅ **Fast** - No network latency  
✅ **Perfect for testing** - Test uploads without AWS  
✅ **Easy migration** - Switch to S3 anytime  

## Limitations of Local Storage

⚠️ **Not for production** - Files lost if server restarts (unless persisted)  
⚠️ **No scaling** - Won't work with multiple servers  
⚠️ **Storage limits** - Limited by server disk space  
⚠️ **No CDN** - Slower for global users  

## Migration to S3

When ready to switch to S3:

1. **Set up AWS S3** (see `AWS_S3_SETUP_GUIDE.md`)
2. **Add credentials** to `.env`
3. **Set `STORAGE_TYPE=s3`**
4. **Restart backend**
5. **Existing local files** won't migrate automatically (you'll need to re-upload or write a migration script)

## Troubleshooting

### Files not uploading?
- Check `backend/uploads/` directory exists
- Check file permissions
- Check backend logs for errors

### Files not displaying?
- Verify the URL format: `/api/media/files/{carId}/{type}/{fileName}`
- Check browser console for 404 errors
- Ensure backend is running on correct port

### Want to clear uploaded files?
```bash
# Delete all uploaded files
rm -rf backend/uploads/*
```

## Production Recommendation

For production, use **S3 storage**:
- Scalable
- Reliable
- CDN support
- Cost-effective
- See `AWS_S3_SETUP_GUIDE.md` for setup

For development/testing, **local storage** is perfect!
