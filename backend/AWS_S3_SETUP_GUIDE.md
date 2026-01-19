# AWS S3 Free Tier Setup Guide

Complete guide to set up AWS S3 for your car health platform.

## Prerequisites

- Email address (for AWS account)
- Credit card (required for account verification, but won't be charged if you stay within free tier)

## Step 1: Create AWS Account

1. Go to [AWS Sign Up](https://aws.amazon.com/free/)
2. Click "Create a Free Account"
3. Enter your email and choose a password
4. Complete the account verification (phone verification required)
5. Add payment method (required but won't be charged if you stay within free tier limits)
6. Choose "Basic Support - Free" plan

**Note:** AWS requires a credit card for verification, but you won't be charged if you stay within the free tier limits.

## Step 2: Create S3 Bucket

1. **Sign in to AWS Console**
   - Go to [AWS Console](https://console.aws.amazon.com/)
   - Sign in with your credentials

2. **Navigate to S3**
   - Search for "S3" in the top search bar
   - Click on "S3" service

3. **Create Bucket**
   - Click "Create bucket" button
   - **Bucket name**: `car-health-media` (or your preferred name)
   - **AWS Region**: `us-east-1` (N. Virginia) - recommended for free tier
   - **Object Ownership**: Select "ACLs disabled (recommended)"
   - **Block Public Access settings**: 
     - Uncheck "Block all public access" (we need public read access for images)
     - Check the acknowledgment checkbox
   - **Bucket Versioning**: Disable (to save costs)
   - **Default encryption**: Enable (SSE-S3 is free)
   - Click "Create bucket"

## Step 3: Configure CORS

1. **Open Your Bucket**
   - Click on your bucket name (`car-health-media`)

2. **Go to Permissions Tab**
   - Click on "Permissions" tab
   - Scroll down to "Cross-origin resource sharing (CORS)"

3. **Edit CORS Configuration**
   - Click "Edit"
   - Paste this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-production-domain.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

   - Replace `https://your-production-domain.com` with your actual production domain
   - For development only, you can use `["*"]` but this is less secure
   - Click "Save changes"

## Step 4: Create IAM User for Programmatic Access

1. **Navigate to IAM**
   - Search for "IAM" in AWS Console
   - Click on "IAM" service

2. **Create User**
   - Click "Users" in the left sidebar
   - Click "Create user"
   - **User name**: `car-health-platform-s3-user`
   - Click "Next"

3. **Set Permissions**
   - Select "Attach policies directly"
   - Search for and select: `AmazonS3FullAccess` (or create a custom policy with only necessary permissions)
   - Click "Next"
   - Review and click "Create user"

4. **Create Access Keys**
   - Click on the user you just created
   - Go to "Security credentials" tab
   - Click "Create access key"
   - Select "Application running outside AWS"
   - Click "Next"
   - Add description: "Car Health Platform S3 Access"
   - Click "Create access key"
   - **IMPORTANT**: Copy both:
     - **Access key ID**
     - **Secret access key** (only shown once!)

## Step 5: Configure Your Application

Add these to your `.env` file in the backend directory:

```bash
AWS_REGION=us-east-1
AWS_S3_BUCKET=car-health-media
AWS_ACCESS_KEY_ID=your-access-key-id-here
AWS_SECRET_ACCESS_KEY=your-secret-access-key-here
```

**Security Note:** Never commit `.env` file to git! It's already in `.gitignore`.

## Step 6: Set Bucket Policy (Optional - for Public Read Access)

If you want images to be publicly accessible:

1. Go to your S3 bucket → Permissions tab
2. Scroll to "Bucket policy"
3. Click "Edit"
4. Paste this policy (replace `car-health-media` with your bucket name):

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

5. Click "Save changes"

## Step 7: Test Your Setup

1. **Restart your backend server**
   ```bash
   # If using Docker
   docker-compose -f docker-compose.dev.yml restart backend
   
   # If running locally
   npm run start:dev
   ```

2. **Try uploading a file** from your frontend
   - The upload should work now!
   - Check your S3 bucket to see the uploaded file

## Free Tier Limits & Monitoring

### Free Tier Includes (First 12 Months):
- **5 GB** of standard storage
- **20,000 GET** requests
- **2,000 PUT** requests  
- **15 GB** of data transfer out

### Monitor Your Usage:
1. Go to AWS Console → Billing & Cost Management
2. Click "Cost Explorer" to track usage
3. Set up billing alerts:
   - Go to Billing → Preferences
   - Enable "Receive Billing Alerts"
   - Set up CloudWatch alarm for $1 threshold

### Cost Estimation:
For a car marketplace:
- **1,000 cars** × 6 photos × 2MB = ~12 GB storage
- **Cost**: ~$0.28/month (after free tier)
- **Very affordable!**

## Troubleshooting

### "Access Denied" Error
- Check IAM user has `AmazonS3FullAccess` policy
- Verify access keys are correct in `.env`
- Ensure bucket name matches `AWS_S3_BUCKET`

### CORS Errors
- Verify CORS configuration includes your frontend URL
- Check browser console for specific CORS error
- Use backend proxy endpoint as fallback (already implemented)

### "Bucket Already Exists" Error
- S3 bucket names are globally unique
- Try: `car-health-media-yourname` or `car-health-media-12345`

## Security Best Practices

1. **Never commit credentials** to git
2. **Use IAM roles** in production (instead of access keys)
3. **Limit IAM permissions** to only what's needed
4. **Enable MFA** on your AWS root account
5. **Set up billing alerts** to avoid surprises
6. **Use bucket policies** to control access

## Next Steps

1. ✅ Create AWS account
2. ✅ Create S3 bucket
3. ✅ Configure CORS
4. ✅ Create IAM user and access keys
5. ✅ Add credentials to `.env`
6. ✅ Restart backend
7. ✅ Test upload!

## Additional Resources

- [AWS S3 Free Tier Details](https://aws.amazon.com/free/?all-free-tier.sort-by=item.additionalFields.SortRank&all-free-tier.sort-order=asc&awsf.Free%20Tier%20Types=*all&awsf.Free%20Tier%20Categories=*all)
- [AWS S3 Pricing Calculator](https://calculator.aws/#/createCalculator/S3)
- [S3 CORS Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)
