# 🎯 MCP & API MASTER INTEGRATION HUB

## Complete Line-by-Line Connection Guide for 24 APIs & MCP Servers

This repository contains **detailed, line-by-line implementation guides** for connecting to all MCPs and APIs in your system. Each script is thoroughly commented with step-by-step explanations.

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Available Integrations](#available-integrations)
3. [Master Control Dashboard](#master-control-dashboard)
4. [API Connection Scripts](#api-connection-scripts)
5. [Environment Configuration](#environment-configuration)
6. [Usage Examples](#usage-examples)
7. [Architecture](#architecture)

## 🚀 Quick Start

### Install Dependencies
```bash
cd ~/Desktop/MCP_API_MASTER_INTEGRATION
npm install
```

### Configure Environment
```bash
cp configs/.env.example configs/.env
# Edit .env with your API keys
```

### Run Master Dashboard
```bash
node MASTER_CONTROL_DASHBOARD.js
```

### Test All Connections
```bash
npm run test-all
```

## 📋 Available Integrations

### ✅ MCP Servers (6)
| MCP Server | Status | Location | Key Features |
|------------|--------|----------|--------------|
| **Slack** | ✅ Ready | `01-slack-integration/` | Messages, reactions, threads, files |
| **Cloudflare** | ✅ Ready | `02-cloudflare-mcp/` | DNS, SSL, caching, firewall |
| **Notion** | ✅ Ready | `03-notion-mcp/` | Pages, databases, blocks, search |
| **Render** | ✅ Ready | `04-render-mcp/` | Deploy, monitor, databases |
| **Phyc Analyzer** | 🔄 Pending | `05-phyc-analyzer/` | Sales data, analytics |
| **Zapier** | 🔄 Pending | `06-zapier-mcp/` | Webhooks, automation |

### 🔌 APIs (18)
| API | Status | Location | Purpose |
|-----|--------|----------|---------|
| **OpenAI GPT-4** | ✅ Ready | `05-openai-gpt4/` | Text generation, DALL-E, Whisper |
| **Instagram** | ✅ Ready | `06-instagram-api/` | Posts, stories, analytics |
| **Anthropic Claude** | 🔄 Pending | `07-anthropic-claude/` | AI assistant |
| **Google Vertex AI** | 🔄 Pending | `08-vertex-ai/` | Gemini, vision, NLP |
| **Lightspeed POS** | 🔄 Pending | `09-lightspeed-pos/` | Inventory, sales |
| **Airtable** | 🔄 Pending | `10-airtable/` | Database operations |
| **GitHub** | 🔄 Pending | `11-github/` | Repos, issues, PRs |
| **Google Gemini** | 🔄 Pending | `12-google-gemini/` | Multimodal AI |
| **Perplexity** | 🔄 Pending | `13-perplexity/` | Search AI |
| **11Labs** | 🔄 Pending | `14-elevenlabs/` | Voice synthesis |
| **Assembly AI** | 🔄 Pending | `15-assembly-ai/` | Transcription |
| **Qdrant** | 🔄 Pending | `16-qdrant/` | Vector database |
| **Pinecone** | 🔄 Pending | `17-pinecone/` | Vector search |
| **Shopify** | 🔄 Pending | `18-shopify/` | E-commerce |
| **Playwright** | 🔄 Pending | `19-playwright/` | Browser automation |
| **BlackBox AI** | 🔄 Pending | `20-blackbox-ai/` | Code generation |

## 🎛️ Master Control Dashboard

The **MASTER_CONTROL_DASHBOARD.js** provides a unified interface to manage all APIs:

### Features
- **Real-time Status Monitoring** - Check all API connections
- **Interactive Menu System** - Navigate all operations easily
- **Batch Operations** - Execute across multiple APIs
- **Automated Workflows** - Daily social media, reports
- **Performance Tracking** - Request counts, success rates
- **Error Handling** - Automatic retry and fallback

### Dashboard Commands
```bash
# Run interactive dashboard
node MASTER_CONTROL_DASHBOARD.js

# Test specific API
node 01-slack-integration/connect-slack.js

# Run automation workflow
npm run daily-workflow
```

## 📝 API Connection Scripts

Each connection script follows this structure:

### Standard Pattern
```javascript
// STEP 1: Import packages
// STEP 2: Load environment
// STEP 3: Configuration
// STEP 4: Initialize client
// STEP 5-20: API operations
// STEP 21: MCP configuration
// STEP 22: Main execution
// STEP 23: Exports
```

### Example: Slack Connection
```javascript
// 01-slack-integration/connect-slack.js
import { WebClient } from '@slack/web-api';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// Test connection
async function testConnection() {
  const result = await slack.auth.test();
  console.log('Connected:', result.user);
}

// Send message
async function sendMessage(channel, text) {
  await slack.chat.postMessage({ channel, text });
}
```

## 🔐 Environment Configuration

### Required API Keys
Create `configs/.env` with:

```env
# Slack
SLACK_BOT_TOKEN=xoxb-8592279508421-...
SLACK_APP_TOKEN=xapp-1-A09MX0MRY4Q-...
SLACK_SIGNING_SECRET=ee18ec4bf0a3f82e...
SLACK_CHANNEL=C09M2PHPRJ6

# Cloudflare
CLOUDFLARE_API_KEY=*************************
CLOUDFLARE_EMAIL=legacywineandliquor@gmail.com
CLOUDFLARE_ZONE_ID=71641cf7234bde112acd9c5eb8ab2ec2

# Notion
NOTION_API_KEY=your_notion_api_key_here

# Render
RENDER_API_KEY=rnd_pWnGEJi9M0lWvlQuWCdwl4bG2IHA

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Instagram
INSTAGRAM_ACCESS_TOKEN=EAAOgrhO0oCoBO2kQkA9WoUzP1K5uMQ6sZA6c7MmddZCj8UyEVpFKYHo6DJiFZCCLCvGQQa9c9lXvNnwvs0p7LwS3XhRO6hmuJ4Jn6YzUvPLLIY5BZBq8ZCh3l03pZBLZCBykJnUfL8MRLiKoAZBoZCZBXBjbZBnIzqnVLUL6EwGm9TdFiZAmN1EMTB9cAbgCT4LsL5aUJ
INSTAGRAM_PAGE_ID=17841463539272316

# Zapier
ZAPIER_INSTAGRAM_WEBHOOK=https://hooks.zapier.com/hooks/catch/23493233/urrpmdj/
```

## 💡 Usage Examples

### Post to Instagram with AI
```javascript
import OpenAIAPI from './05-openai-gpt4/connect-openai.js';
import InstagramAPI from './06-instagram-api/connect-instagram.js';

const ai = new OpenAIAPI();
const ig = new InstagramAPI();

// Generate content
const content = await ai.generateInstagramPost('weekend specials');

// Create image
const images = await ai.generateImage(content.imageDescription);

// Post to Instagram
await ig.createImagePost(images[0].url, content.caption);
```

### Monitor Slack and Auto-Post
```javascript
import SlackAPI from './01-slack-integration/connect-slack.js';

const slack = new SlackAPI();

// Monitor for reactions
const messages = await slack.readChannelHistory('C09M2PHPRJ6');
for (const msg of messages) {
  if (msg.reactions?.find(r => r.name === 'white_check_mark')) {
    // Trigger Instagram post
    await triggerInstagramPost(msg);
  }
}
```

### Deploy to Render
```javascript
import RenderAPI from './04-render-mcp/connect-render.js';

const render = new RenderAPI();

// Deploy full stack
await render.deployFullStack('my-project');
```

## 🏗️ Architecture

### Directory Structure
```
MCP_API_MASTER_INTEGRATION/
├── MASTER_CONTROL_DASHBOARD.js    # Central control interface
├── configs/
│   └── .env                       # API keys and tokens
├── 01-slack-integration/
│   └── connect-slack.js           # 20 Slack operations
├── 02-cloudflare-mcp/
│   └── connect-cloudflare.js      # 26 Cloudflare operations
├── 03-notion-mcp/
│   └── connect-notion.js          # 20 Notion operations
├── 04-render-mcp/
│   └── connect-render.js          # 22 Render operations
├── 05-openai-gpt4/
│   └── connect-openai.js          # 23 OpenAI operations
├── 06-instagram-api/
│   └── connect-instagram.js       # 20 Instagram operations
└── [Additional APIs...]
```

### Design Principles
1. **Line-by-Line Documentation** - Every step explained
2. **Consistent Structure** - Same pattern across all APIs
3. **Error Handling** - Try-catch blocks with helpful messages
4. **Modular Design** - Each API is independent
5. **Export/Import Ready** - Use in other projects
6. **MCP Configuration** - Ready for Claude desktop

## 🔄 Automated Workflows

### Daily Social Media
```bash
npm run daily-social
```
- Generate content with AI
- Create images with DALL-E
- Post to Instagram
- Notify in Slack
- Log in Notion

### Hourly Monitoring
```bash
npm run monitor
```
- Check all API connections
- Gather analytics
- Alert on issues
- Generate reports

## 📊 Performance Metrics

The dashboard tracks:
- **API Response Times**
- **Success/Failure Rates**
- **Request Volumes**
- **Error Patterns**
- **Cost Tracking** (for paid APIs)

## 🛠️ Troubleshooting

### Connection Issues
```bash
# Test individual API
node 01-slack-integration/connect-slack.js

# Check environment variables
npm run check-env

# View logs
npm run logs
```

### Common Errors
- **401 Unauthorized** - Check API keys in .env
- **Rate Limited** - Implement exponential backoff
- **Network Error** - Check internet/firewall
- **Module Not Found** - Run `npm install`

## 📈 Next Steps

1. **Complete Remaining APIs** - 14 more to implement
2. **Add Monitoring** - Prometheus/Grafana integration
3. **Create UI** - Web dashboard with real-time updates
4. **Add Testing** - Jest test suites for each API
5. **Docker Support** - Containerize the entire system

## 🤝 Contributing

To add a new API:
1. Create folder: `XX-api-name/`
2. Copy template: `connect-template.js`
3. Implement operations following the pattern
4. Update this README
5. Test with dashboard

## 📄 License

Private - Legacy Wine & Liquor

## 📞 Support

- **Slack**: #claude channel
- **Email**: legacywineandliquor@gmail.com
- **Dashboard**: Run `node MASTER_CONTROL_DASHBOARD.js`

---

**Created**: October 24, 2025
**Version**: 1.0.0
**Status**: 🚀 6/24 APIs Implemented