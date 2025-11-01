# Quick Deploy to Render - Manual GitHub Setup

## Step 1: Create GitHub Repository (2 minutes)

1. Go to https://github.com/new
2. Repository name: `mcp-api-master-integration` (or any name you prefer)
3. Keep it **PUBLIC** (required for Render free tier)
4. **Do NOT** initialize with README, .gitignore, or license
5. Click "Create repository"
6. Copy the repository URL (e.g., `https://github.com/YOUR_USERNAME/mcp-api-master-integration`)

## Step 2: Push Code to GitHub (1 minute)

Run these commands in terminal:

```bash
cd /Users/justinetwaru/Desktop/MCP_API_MASTER_INTEGRATION

# Add your GitHub repo as remote (replace with your actual URL)
git remote add origin https://github.com/YOUR_USERNAME/mcp-api-master-integration.git

# Push code
git push -u origin main
```

## Step 3: Deploy to Render (2 minutes)

Once code is pushed, provide me with your GitHub repository URL and I'll:
- Automatically create the Render web service
- Configure all environment variables
- Deploy the bot

Just say: "GitHub repo is https://github.com/YOUR_USERNAME/mcp-api-master-integration"

---

## Alternative: Deploy via Render Dashboard (Manual)

If you prefer manual deployment:

1. **Push to GitHub** (steps above)

2. **Create Render Service**:
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Root directory: `claude-slack-bot`
   - Build command: `npm install`
   - Start command: `npm start`
   - Plan: Starter ($7/month) or Free (with limitations)

3. **Set Environment Variables** in Render:
   ```
   SLACK_BOT_TOKEN=your_slack_bot_token_here
   SLACK_APP_TOKEN=your_slack_app_token_here
   SLACK_SIGNING_SECRET=your_slack_signing_secret_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   NODE_ENV=production
   PORT=10000
   ```

4. **Deploy**: Click "Create Web Service"

---

## Option 3: Update GitHub Token

If you want to use automated deployment, update your GitHub token:

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `workflow`
4. Copy the new token
5. Update `/Users/justinetwaru/Desktop/MCP_API_MASTER_INTEGRATION/configs/.env`:
   ```
   GITHUB_TOKEN=your_new_token_here
   ```
6. Tell me "GitHub token updated" and I'll retry automated deployment

---

## What Happens After Deployment

Once deployed, your Claude bot will be live at:
- **URL**: `https://claude-slack-bot.onrender.com`
- **Health check**: `https://claude-slack-bot.onrender.com/health`
- **Slack**: Mention `@claude` in any channel or DM directly

### Testing Commands:
```
@claude What are today's sales?
@claude Show me repeat customers
@claude Any at-risk customers?
@claude Who are our VIP customers?
```

The bot has full access to your Phyc Analyzer data and can:
- Fetch real-time sales data
- Analyze repeat customers
- Identify at-risk accounts
- Generate customer intelligence reports
- Export reengagement lists

---

**Current working directory contains all files ready to deploy.**
**Choose whichever option works best for you!**
