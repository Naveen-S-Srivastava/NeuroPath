# Vercel Deployment Guide for NeuroPath Frontend

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub repository with your frontend code

## Deployment Steps

### 1. Connect Repository to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project settings:

### 2. Project Configuration
- **Framework Preset**: Vite
- **Root Directory**: `frontend` (if your frontend is in a subfolder)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Environment Variables
Add these environment variables in Vercel:

```
VITE_API_URL=https://neuropath-kxy6.onrender.com
```

### 4. Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Your site will be live at `https://your-project-name.vercel.app`

## Files Created/Modified

### `.env` (Frontend)
```
VITE_API_URL=https://neuropath-kxy6.onrender.com
```

### `vercel.json` (Frontend)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://neuropath-kxy6.onrender.com/api/$1"
    }
  ]
}
```

## API Calls Updated
All hardcoded `localhost:5000` calls have been replaced with environment variable `VITE_API_URL` to work with your production backend.

## Testing
- Build completed successfully ✅
- All API calls now use production URLs ✅
- Vercel configuration ready ✅

Your NeuroPath frontend is ready for Vercel deployment! 🚀