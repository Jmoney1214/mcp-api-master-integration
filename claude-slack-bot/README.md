# 🤖 Claude 24/7 Slack Bot - Render Deployment

Always-on Claude assistant accessible via Slack, with full MCP integration for sales and customer analytics.

## 🚀 Features

- **24/7 Availability**: Runs continuously on Render
- **Slack Integration**: Mention @claude or DM directly
- **MCP Access**: Real-time sales data and customer intelligence
- **Conversation History**: Maintains context across messages
- **Analytics Commands**: Ask about sales, customers, and reports

## 📋 Prerequisites

1. **Slack App** with:
   - Bot Token (`xoxb-...`)
   - App Token (`xapp-...`)
   - Signing Secret
   - Socket Mode enabled
   - Required scopes:
     - `app_mentions:read`
     - `chat:write`
     - `im:read`
     - `im:write`
     - `channels:history`

2. **Anthropic API Key** from console.anthropic.com

3. **Render Account** (free tier works!)

## 🔧 Setup Instructions

### Step 1: Slack App Configuration

1. Go to https://api.slack.com/apps
2. Create new app "Claude Assistant"
3. Enable **Socket Mode**:
   - Go to Settings → Socket Mode
   - Enable Socket Mode
   - Generate App Token: `xapp-...`
   - Add scope: `connections:write`

4. Add **Bot Scopes**:
   - Go to OAuth & Permissions
   - Add bot scopes:
     - `app_mentions:read`
     - `chat:write`
     - `im:read`
     - `im:write`
     - `channels:history`
     - `channels:read`

5. **Install to Workspace**:
   - Click "Install to Workspace"
   - Copy Bot Token: `xoxb-...`

6. **Subscribe to Events**:
   - Go to Event Subscriptions
   - Subscribe to:
     - `app_mention`
     - `message.im`

7. **Add Slash Command** (optional):
   - Go to Slash Commands
   - Create `/claude` command
   - Description: "Ask Claude anything"

### Step 2: Deploy to Render

1. **Push code to GitHub**:
```bash
cd /Users/justinetwaru/Desktop/MCP_API_MASTER_INTEGRATION
git init
git add .
git commit -m "Claude Slack Bot deployment"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. **Create Render Service**:
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Select `claude-slack-bot` directory
   - Or use the blueprint: `render.yaml`

3. **Set Environment Variables** in Render dashboard:
```
SLACK_BOT_TOKEN=xoxb-8592279508421-...
SLACK_SIGNING_SECRET=ee18ec4bf0a3f82e...
SLACK_APP_TOKEN=xapp-1-A09MX0MRY4Q-...
ANTHROPIC_API_KEY=sk-ant-api03-...
NODE_ENV=production
PORT=10000
```

4. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically build and deploy

### Step 3: Using the Render API (Automated Deployment)

You can also deploy programmatically:

```javascript
import RenderAPI from '../04-render-mcp/connect-render.js';

const render = new RenderAPI();

await render.createWebService({
  name: 'claude-slack-bot',
  repo: 'https://github.com/YOUR_USERNAME/YOUR_REPO',
  branch: 'main',
  runtime: 'node',
  region: 'oregon',
  plan: 'starter',
  buildCommand: 'cd claude-slack-bot && npm install',
  startCommand: 'cd claude-slack-bot && npm start',
  envVars: [
    { key: 'SLACK_BOT_TOKEN', value: process.env.SLACK_BOT_TOKEN },
    { key: 'SLACK_APP_TOKEN', value: process.env.SLACK_APP_TOKEN },
    { key: 'SLACK_SIGNING_SECRET', value: process.env.SLACK_SIGNING_SECRET },
    { key: 'ANTHROPIC_API_KEY', value: process.env.ANTHROPIC_API_KEY },
    { key: 'NODE_ENV', value: 'production' }
  ]
});
```

## 💬 Usage

### Mention in Channel
```
@claude What are today's sales?
@claude Show me repeat customers
@claude Any at-risk customers?
```

### Direct Message
```
Hey Claude! Can you give me a sales summary?
```

### Slash Command
```
/claude What's our revenue today?
```

## 📊 Available Analytics Commands

The bot has access to Phyc Analyzer MCP and can answer:

- **Sales**: "What are today's sales?"
- **Customers**: "Show me repeat customers"
- **At-Risk**: "Any customers at risk?"
- **VIPs**: "Who are our VIP customers?"
- **Dashboard**: "Show me the dashboard"
- **Reports**: "Generate a customer report"

## 🔍 Monitoring

### Health Check
```bash
curl https://claude-slack-bot.onrender.com/health
```

### Logs
View real-time logs in Render dashboard or via CLI:
```bash
render logs -s claude-slack-bot
```

## 🛠️ Troubleshooting

### Bot Not Responding
1. Check Render service is running
2. Verify Socket Mode is enabled in Slack
3. Check environment variables are set
4. View logs for errors

### Authentication Errors
1. Regenerate Slack tokens
2. Update environment variables in Render
3. Restart service

### Analytics Not Working
1. Verify Phyc Analyzer path is correct
2. Check Lightspeed token is valid
3. Ensure reports directory exists

## 🔄 Updates

To update the bot:
```bash
git add .
git commit -m "Update bot"
git push
```

Render will automatically redeploy!

## 💰 Cost

- **Render Starter Plan**: Free (750 hours/month)
- **Anthropic API**: ~$0.003 per message
- **Slack**: Free

Estimated cost: **$3-10/month** depending on usage

## 🎯 Next Steps

1. **Add More MCPs**: Connect additional data sources
2. **Custom Commands**: Create specialized workflows
3. **Scheduled Reports**: Daily sales summaries
4. **Multi-Channel**: Deploy to multiple Slack workspaces

## 📞 Support

- **Slack**: #claude channel
- **Render**: dashboard.render.com
- **Anthropic**: console.anthropic.com

---

**Status**: 🟢 Ready to Deploy
**Version**: 1.0.0
**Last Updated**: November 1, 2025
