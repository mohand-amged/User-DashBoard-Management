# 🚀 Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Mini Dashboard application to various platforms and environments. The application is built with Vite and can be deployed to any static hosting platform.

---

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (or yarn/pnpm equivalent)
- **Git**: For version control and CI/CD

### Build Requirements
- Modern browser support (ES2020+)
- Minimum 512MB RAM for build process
- 2GB disk space for dependencies and build output

---

## 🏗️ Build Process

### Production Build

```bash
# Install dependencies
npm ci --production=false

# Run type checking
npm run lint

# Build for production
npm run build

# Preview production build locally (optional)
npm run preview
```

### Build Output Structure

```
dist/
├── assets/
│   ├── index-[hash].js      # Main application bundle
│   ├── vendor-[hash].js     # Third-party dependencies
│   └── index-[hash].css     # Compiled stylesheets
├── index.html               # Entry point
└── vite.svg                 # Favicon and assets
```

### Build Optimization

The production build includes:
- **Code Splitting**: Automatic chunking for better caching
- **Tree Shaking**: Dead code elimination
- **Asset Optimization**: Minified CSS/JS, optimized images
- **Source Maps**: For debugging (can be disabled in production)

---

## ☁️ Platform Deployments

### 1. Vercel (Recommended)

Vercel offers zero-configuration deployment with excellent performance.

#### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/mini-dashboard)

#### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Production deployment
vercel --prod
```

#### Configuration

Create `vercel.json` in project root:

```json
{
  "build": {
    "env": {
      "VITE_NODE_ENV": "production"
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. Netlify

Netlify provides continuous deployment from Git repositories.

#### Deploy from Git

1. Connect your repository to Netlify
2. Configure build settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Node Version**: 18

#### Configuration

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  VITE_NODE_ENV = "production"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 3. GitHub Pages

Deploy directly from your GitHub repository.

#### Configuration

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_NODE_ENV: production
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

2. Configure `vite.config.ts` for GitHub Pages:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mini-dashboard/', // Your repository name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
```

### 4. Firebase Hosting

Google Firebase provides fast global CDN hosting.

#### Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init hosting
```

#### Configuration

`firebase.json`:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/assets/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

#### Deploy

```bash
# Build and deploy
npm run build
firebase deploy
```

### 5. AWS S3 + CloudFront

Scalable deployment with AWS services.

#### S3 Setup

```bash
# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure

# Create S3 bucket
aws s3 mb s3://mini-dashboard-app

# Enable static website hosting
aws s3 website s3://mini-dashboard-app \
  --index-document index.html \
  --error-document index.html
```

#### Deploy Script

Create `scripts/deploy-aws.sh`:

```bash
#!/bin/bash
set -e

echo "Building application..."
npm run build

echo "Uploading to S3..."
aws s3 sync dist/ s3://mini-dashboard-app \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "index.html"

# Upload index.html with short cache
aws s3 cp dist/index.html s3://mini-dashboard-app/index.html \
  --cache-control "public,max-age=0,must-revalidate"

echo "Invalidating CloudFront..."
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"

echo "Deployment complete!"
```

### 6. Docker Deployment

Containerized deployment for consistent environments.

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production=false

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # Cache static assets
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

#### Build and Run

```bash
# Build Docker image
docker build -t mini-dashboard .

# Run container
docker run -p 3000:80 mini-dashboard

# Docker Compose (docker-compose.yml)
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
```

---

## 🔧 Environment Configuration

### Environment Variables

Create environment-specific files:

#### Production (.env.production)

```bash
VITE_NODE_ENV=production
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=Mini Dashboard
VITE_ANALYTICS_ID=UA-XXXXXXXXX-X
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

#### Staging (.env.staging)

```bash
VITE_NODE_ENV=staging
VITE_API_URL=https://staging-api.yourdomain.com
VITE_APP_NAME=Mini Dashboard (Staging)
VITE_DEBUG=true
```

### Build Configuration

Update `vite.config.ts` for production optimizations:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          charts: ['recharts'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true, // Allow external connections
  },
})
```

---

## 📊 Performance Monitoring

### Analytics Integration

Add Google Analytics or similar:

```typescript
// src/lib/analytics.ts
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const trackEvent = (action: string, category: string, label?: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
};

// Usage in components
trackEvent('user_created', 'user_management', 'dashboard');
```

### Error Monitoring

Integrate with Sentry or similar service:

```typescript
// src/lib/monitoring.ts
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_NODE_ENV,
    tracesSampleRate: 0.1,
  });
}

export const captureError = (error: Error, context?: any) => {
  console.error(error);
  if (import.meta.env.PROD) {
    Sentry.captureException(error, { extra: context });
  }
};
```

### Lighthouse Performance

Optimize for Core Web Vitals:

1. **Largest Contentful Paint (LCP)**: < 2.5s
2. **First Input Delay (FID)**: < 100ms
3. **Cumulative Layout Shift (CLS)**: < 0.1

### Bundle Analysis

Analyze bundle size:

```bash
# Install analyzer
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
    }),
  ],
});
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Complete Workflow

`.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npx tsc --noEmit
      
      - name: Run tests
        run: npm test
        
      - name: Build application
        run: npm run build
        env:
          VITE_NODE_ENV: production

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build for staging
        run: npm run build
        env:
          VITE_NODE_ENV: staging
          VITE_API_URL: ${{ secrets.STAGING_API_URL }}
      
      - name: Deploy to staging
        run: |
          # Your staging deployment command
          npx vercel --token ${{ secrets.VERCEL_TOKEN }}

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build for production
        run: npm run build
        env:
          VITE_NODE_ENV: production
          VITE_API_URL: ${{ secrets.PRODUCTION_API_URL }}
          VITE_ANALYTICS_ID: ${{ secrets.ANALYTICS_ID }}
      
      - name: Deploy to production
        run: |
          # Your production deployment command
          npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
      
      - name: Notify deployment
        run: |
          # Send notification (Slack, Discord, etc.)
          echo "Deployment successful!"
```

---

## 🛡️ Security Considerations

### Content Security Policy

Add CSP headers to `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-eval' https://www.googletagmanager.com; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://api.yourdomain.com;">
```

### Environment Security

1. **Never commit secrets** to version control
2. **Use environment variables** for sensitive data
3. **Rotate API keys** regularly
4. **Implement HTTPS** for all environments
5. **Set up proper CORS** policies

### Deployment Security

```bash
# Security headers in nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

---

## 🔍 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

#### Memory Issues

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### Routing Issues in Production

Ensure your hosting platform redirects all routes to `index.html`:

```javascript
// vite.config.ts - Add for SPA routing
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
});
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Build passes without errors
- [ ] All routes work correctly (SPA routing)
- [ ] Assets load properly (check paths)
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Analytics tracking works
- [ ] Error monitoring active
- [ ] Performance metrics acceptable
- [ ] Backup and rollback plan ready

---

## 📈 Scaling Considerations

### CDN Configuration

- Use CDN for static assets
- Configure proper cache headers
- Enable gzip/brotli compression
- Set up geographic distribution

### Performance Optimization

- Implement service workers for offline support
- Use resource hints (preload, prefetch)
- Optimize images and fonts
- Monitor bundle size growth

### Monitoring Setup

- Set up uptime monitoring
- Configure performance alerts
- Track user analytics
- Monitor error rates

---

This deployment guide provides comprehensive instructions for deploying the Mini Dashboard to various platforms while maintaining security, performance, and reliability standards.
