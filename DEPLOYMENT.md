# Vercel Deployment Guide for Secure Loot Pass

This guide provides step-by-step instructions for deploying the Secure Loot Pass application to Vercel.

## Prerequisites

- GitHub account with access to the repository
- Vercel account (free tier available)
- Node.js 18+ installed locally (for testing)

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" and choose "Continue with GitHub"
3. Authorize Vercel to access your GitHub repositories

### 3. Import Project

1. In your Vercel dashboard, click "New Project"
2. Find and select your `secure-loot-pass` repository
3. Click "Import"

### 4. Configure Build Settings

Vercel should automatically detect this as a Vite project. Verify these settings:

- **Framework Preset**: Vite
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. Set Environment Variables

In the Vercel project settings, add these environment variables:

#### Required Environment Variables

```
VITE_CHAIN_ID=11155111
VITE_RPC_URL=your_sepolia_rpc_url_here
VITE_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id_here
VITE_INFURA_API_KEY=your_infura_api_key_here
VITE_RPC_URL_ALT=your_alternative_rpc_url_here
```

#### How to Add Environment Variables:

1. Go to your project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar
4. Add each variable with the following settings:
   - **Name**: The variable name (e.g., `VITE_CHAIN_ID`)
   - **Value**: The variable value (e.g., `11155111`)
   - **Environment**: Select "Production", "Preview", and "Development"

### 6. Deploy

1. Click "Deploy" button
2. Wait for the build process to complete (usually 2-3 minutes)
3. Your app will be available at the provided Vercel URL

### 7. Custom Domain (Optional)

To set up a custom domain:

1. Go to "Settings" → "Domains"
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions
4. Wait for DNS propagation (up to 24 hours)

## Post-Deployment Configuration

### 1. Update Contract Address

After deploying your smart contracts to Sepolia:

1. Update the contract address in `src/hooks/useContract.ts`
2. Commit and push the changes
3. Vercel will automatically redeploy

### 2. Verify Deployment

Test your deployed application:

1. Visit your Vercel URL
2. Connect a wallet (MetaMask, Rainbow, etc.)
3. Switch to Sepolia testnet
4. Test the battle pass functionality

## Troubleshooting

### Common Issues

#### Build Failures

**Error**: `Module not found` or dependency issues
**Solution**: 
- Ensure all dependencies are in `package.json`
- Check that `package-lock.json` is committed
- Try deleting `node_modules` and running `npm install` locally

#### Environment Variables Not Working

**Error**: Environment variables not accessible in the app
**Solution**:
- Ensure variables start with `VITE_` prefix
- Check that variables are set for all environments
- Redeploy after adding new variables

#### Wallet Connection Issues

**Error**: Wallet not connecting on production
**Solution**:
- Verify WalletConnect Project ID is correct
- Check that RPC URLs are accessible
- Ensure the app is served over HTTPS

#### Smart Contract Issues

**Error**: Contract calls failing
**Solution**:
- Verify contract is deployed to Sepolia
- Check contract address is correct
- Ensure user has Sepolia ETH for gas

### Performance Optimization

1. **Enable Vercel Analytics**:
   - Go to "Settings" → "Analytics"
   - Enable Web Analytics

2. **Configure Caching**:
   - Add `vercel.json` for custom caching rules
   - Optimize images and assets

3. **Monitor Performance**:
   - Use Vercel's built-in performance monitoring
   - Check Core Web Vitals

## Security Considerations

1. **Environment Variables**:
   - Never commit sensitive keys to the repository
   - Use Vercel's environment variable system
   - Rotate keys regularly

2. **HTTPS**:
   - Vercel automatically provides HTTPS
   - Ensure all external API calls use HTTPS

3. **Content Security Policy**:
   - Consider adding CSP headers
   - Configure in `vercel.json`

## Monitoring and Maintenance

### 1. Set Up Monitoring

- Enable Vercel Analytics
- Set up error tracking (Sentry, LogRocket)
- Monitor wallet connection success rates

### 2. Regular Updates

- Keep dependencies updated
- Monitor for security vulnerabilities
- Update smart contract addresses as needed

### 3. Backup Strategy

- Repository is automatically backed up on GitHub
- Consider backing up environment variables
- Document deployment procedures

## Advanced Configuration

### Custom Vercel Configuration

Create a `vercel.json` file in your project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### Preview Deployments

- Every pull request automatically creates a preview deployment
- Test changes before merging to main
- Share preview URLs for testing

## Support

If you encounter issues:

1. Check Vercel's documentation
2. Review build logs in the Vercel dashboard
3. Test locally with `npm run build && npm run preview`
4. Contact Vercel support for platform-specific issues

---

**Deployment URL**: Your app will be available at `https://secure-loot-pass-[random].vercel.app`

**Custom Domain**: Configure in Vercel dashboard under Settings → Domains
