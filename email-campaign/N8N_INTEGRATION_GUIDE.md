# N8N Integration for Email Campaigns

## 🎯 Overview

You've provided an N8N JWT token, which allows us to automate email campaigns through N8N workflows. This is actually a **better solution** than direct Mailgun API calls because N8N provides:

- Visual workflow editor
- Built-in error handling and retries
- Multi-step automation
- Integration with 300+ services
- Scheduled workflows
- Conditional logic

## 🔑 Your N8N Credentials

```
JWT Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Token Details:
- Subject ID: c60ef2d2-1194-4493-bab4-b28e645e3b01
- Issuer: n8n
- Issued: 2024-10-24
- Expires: 2025-11-23
```

## 📍 Setup Steps

### 1. Find Your N8N Instance URL

Your N8N instance could be at:
- **Local**: `http://localhost:5678`
- **Cloud**: `https://app.n8n.cloud`
- **Self-hosted**: `https://n8n.yourdomain.com`

To check if N8N is running locally:
```bash
lsof -i :5678
# or
curl http://localhost:5678
```

### 2. Update Configuration

Edit `n8n-campaign-trigger.js` line 11:
```javascript
baseUrl: 'http://localhost:5678/api/v1'  // Update with your N8N URL
```

### 3. Create Email Campaign Workflow in N8N

#### Option A: Via N8N UI (Recommended)

1. Open N8N interface
2. Create new workflow named "Legacy Wine Email Campaign"
3. Add nodes:

**Node 1: Webhook Trigger**
- URL Path: `campaign-trigger`
- Method: POST
- Response Mode: Last Node

**Node 2: Function (Process Data)**
```javascript
const data = items[0].json;

return [{
  json: {
    to: data.recipient.email,
    subject: data.emailContent.subject,
    from: data.emailContent.from,
    campaignData: data
  }
}];
```

**Node 3: Gmail / Mailgun / SMTP**
- Configure your email service
- Map fields:
  - To: `{{$json.to}}`
  - From: `{{$json.from}}`
  - Subject: `{{$json.subject}}`
  - HTML: Use the template below

**Node 4: Slack (Optional)**
- Send confirmation to #social channel

#### Option B: Import Workflow JSON

Save this as `email-campaign-workflow.json` and import:

```json
{
  "name": "Legacy Wine Email Campaign",
  "nodes": [
    {
      "parameters": {
        "path": "campaign-trigger",
        "responseMode": "lastNode",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    }
  ],
  "connections": {},
  "active": true
}
```

## 🚀 Trigger Campaign

### Method 1: Via Webhook (Easiest)

```bash
curl -X POST http://localhost:5678/webhook/campaign-trigger \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": {
      "email": "justin.etwaru@icloud.com",
      "name": "Justin Etwaru"
    },
    "emailContent": {
      "subject": "🍷 Weekend Wine Campaign",
      "from": "Legacy Wine <campaigns@mail.legacywineandliquor.com>"
    }
  }'
```

### Method 2: Via Node.js Script

```bash
node n8n-campaign-trigger.js
```

### Method 3: Via N8N API

```javascript
import axios from 'axios';

await axios.post('http://localhost:5678/api/v1/workflows/WORKFLOW_ID/execute',
  {
    data: { /* campaign data */ }
  },
  {
    headers: {
      'Authorization': 'Bearer YOUR_JWT_TOKEN'
    }
  }
);
```

## 📧 Email Template for N8N

Add this HTML in your email node:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
    h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .success { background: #10B981; color: white; padding: 15px 20px; border-radius: 8px; margin: 20px 0; }
    .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .metric-card { background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #764ba2; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍷 Campaign Successfully Launched!</h1>
      <p>Weekend Wine Spectacular is LIVE</p>
    </div>
    <div class="content">
      <div class="success">
        ✅ <strong>SUCCESS!</strong> Your weekend wine campaign is now live!
      </div>
      <div class="metrics">
        <div class="metric-card">
          <h3>Instagram</h3>
          <p>✅ Posted</p>
        </div>
        <div class="metric-card">
          <h3>Expected Revenue</h3>
          <p>$5,000+</p>
        </div>
      </div>
      <h3>Weekend Offers:</h3>
      <ul>
        <li>30% OFF premium red wines ($50+)</li>
        <li>25% OFF all champagne & sparkling wines</li>
        <li>Buy 2 Get 1 FREE on selected craft beers</li>
      </ul>
      <p><strong>Legacy Wine & Liquor</strong><br>
      200 S French Ave, Sanford, FL 32771<br>
      📞 (407) 915-7812</p>
    </div>
  </div>
</body>
</html>
```

## 🔗 Connect with Existing Integrations

Your N8N workflow can integrate with:
- ✅ Mailgun (for email sending)
- ✅ Slack (already integrated)
- ✅ Instagram (via Zapier or direct API)
- ✅ SMS providers (Twilio, etc.)
- ✅ Google Sheets (for tracking)
- ✅ Airtable (for CRM)

## 📊 Campaign Workflow Example

```
Webhook Trigger
    ↓
Extract Campaign Data
    ↓
[Split into parallel branches]
    ↓                    ↓                    ↓
Send Email          Send Slack        Log to Database
(Mailgun)         Notification       (Google Sheets)
    ↓                    ↓                    ↓
[Merge branches]
    ↓
Send Success Confirmation
    ↓
End
```

## 🎨 Advanced Features

### Conditional Logic
```javascript
// In Function node
if (data.recipient.segment === 'vip') {
  return [{json: {subject: 'VIP Exclusive Wine Event'}}];
} else {
  return [{json: {subject: 'Weekend Wine Special'}}];
}
```

### Scheduled Campaigns
Add **Schedule Trigger** node:
- Cron: `0 10 * * FRI` (Every Friday at 10 AM)
- Then trigger email workflow

### A/B Testing
Split workflow and send different email versions to test

## 🛠️ Files Created

- `n8n-campaign-trigger.js` - N8N workflow trigger script
- `N8N_INTEGRATION_GUIDE.md` - This guide
- Campaign data templates included

## 🚨 Troubleshooting

### "Unauthorized" Error
- Check JWT token hasn't expired (expires 2025-11-23)
- Verify N8N instance URL is correct
- Ensure API is enabled in N8N settings

### Webhook Not Responding
- Check workflow is **Active** (toggle in N8N)
- Verify webhook path matches: `/webhook/campaign-trigger`
- Test with curl command first

### Email Not Sending
- Verify email credentials in N8N email node
- Check N8N execution logs for errors
- Test email service separately

## 📚 Resources

- N8N Docs: https://docs.n8n.io
- Workflow Library: https://n8n.io/workflows
- Community: https://community.n8n.io

---

*Ready to automate your marketing! 🚀*