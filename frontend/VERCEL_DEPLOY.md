# Deploying to Vercel

This guide explains how to deploy the frontend to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. The [Vercel CLI](https://vercel.com/cli) (optional)

## Environment Variables

Set these in your Vercel project settings:

- `NEXT_PUBLIC_API_URL`: Your deployed backend URL (e.g., https://your-backend.railway.app)
- `NEXT_PUBLIC_SENDER_ACCOUNT_ID`: Your Hedera account ID

## Deployment Steps

### Option 1: Deploy from Vercel Dashboard

1. Import your repository in the Vercel dashboard
2. Select the `frontend` directory as the root directory
3. Set the environment variables
4. Deploy!

### Option 2: Deploy using Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (run this from the frontend directory)
vercel

# For production deployment
vercel --prod
```

## Build Settings

The following are automatically configured:
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Node.js Version: 18.x (specified in package.json)

## Development

1. Copy `.env.example` to `.env.local`
2. Fill in the environment variables
3. Run `npm install`
4. Run `npm run dev`

## Troubleshooting

1. If build fails, check:
   - Node.js version (should be >=18.17.0)
   - All dependencies are properly listed in package.json
   - Environment variables are set in Vercel

2. If runtime errors occur:
   - Verify API_URL is correct and backend is running
   - Check browser console for CORS issues
   - Verify environment variables are set in Vercel dashboard