# N8N Instagram Auto-Post Workflow

## 🎯 What This Does

Automatically post to Instagram with a single command or API call. The workflow handles:
- Image posting via Zapier webhook
- Caption generation with hashtags
- Slack notifications
- Error handling and retries

---

## 📦 Files Created

1. **`n8n-instagram-workflow.json`** - Complete N8N workflow (import-ready)
2. **`post-to-instagram.js`** - Command-line posting script
3. **`N8N_INSTAGRAM_SETUP.md`** - This guide

---

## 🚀 Quick Start (3 Steps)

### Step 1: Import Workflow into N8N

1. Open your N8N interface:
   ```bash
   # If running locally
   open http://localhost:5678
   ```

2. Click **"Workflows"** → **"Import from File"**

3. Select: `n8n-instagram-workflow.json`

4. Click **"Save"** and **"Activate"** (toggle switch at top)

### Step 2: Configure Slack (Optional)

If you want Slack notifications:
1. In N8N, click the **"Notify Slack"** node
2. Add Slack credentials
3. Select channel: `#social`
4. Save workflow

### Step 3: Test Post

```bash
node post-to-instagram.js weekendSpecial
```

---

## 📸 How It Works

### Workflow Flow

```
Webhook Trigger
    ↓
Process Post Data
(Generate caption + hashtags)
    ↓
Post to Instagram
(via Zapier webhook)
    ↓
Format Response
    ↓
    ├── Check Success
    └── Notify Slack
```

### Key Features

- **Auto-Caption Generation**: Adds store info and hashtags automatically
- **Multiple Templates**: Weekend specials, new arrivals, daily deals, cocktails
- **Slack Integration**: Team notifications on every post
- **Error Handling**: Falls back to direct Zapier if N8N unavailable
- **Scheduled Posts**: Can be triggered by N8N Schedule node

---

## 💻 Usage Examples

### Command Line

```bash
# Post weekend special
node post-to-instagram.js weekendSpecial

# Post new arrival
node post-to-instagram.js newArrival

# Post daily deal
node post-to-instagram.js dailyDeal

# Post with custom caption
node post-to-instagram.js weekendSpecial "Flash Sale! Everything 50% OFF!"

# Post cocktail recipe
node post-to-instagram.js cocktailRecipe
```

### Via N8N Webhook

```bash
curl -X POST http://localhost:5678/webhook/instagram-post \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Weekend Wine Special",
    "description": "Premium wines at amazing prices!",
    "imageUrl": "https://example.com/wine.jpg",
    "hashtags": "#Wine #SanfordFL"
  }'
```

### From JavaScript

```javascript
import { quickPost } from './post-to-instagram.js';

// Post weekend special
await quickPost('weekendSpecial');

// Post with custom message
await quickPost('dailyDeal', 'Happy Hour! 2-for-1 all drinks!');
```

---

## 📝 Post Templates

### 1. Weekend Special
```
🍷 Weekend Wine Spectacular

Premium wines at unbeatable prices this weekend only!

🎯 30% OFF premium red wines
🍾 25% OFF champagne & sparkling
🍺 Buy 2 Get 1 FREE craft beers

📍 Legacy Wine & Liquor
200 S French Ave, Sanford, FL
📞 (407) 915-7812

#WineWeekend #LegacyWine #SanfordFL
```

### 2. New Arrival
```
🍷 New Arrival Alert

Just arrived! Premium selection of rare wines.

Limited quantities available.
First come, first served!

📍 Legacy Wine & Liquor
#NewArrival #RareWine #WineLovers
```

### 3. Daily Deal
```
🍷 Daily Deal

Today's special offer!
Ask our staff for details.

📞 (407) 915-7812

#DailyDeal #WineSpecial #LocalBusiness
```

### 4. Cocktail Recipe
```
🍸 Cocktail of the Week

Try this amazing cocktail recipe!
Get all ingredients at Legacy Wine & Liquor.

#CocktailRecipe #Mixology #DrinkIdeas
```

---

## ⚙️ Advanced Configuration

### Scheduled Posts

Add a **Schedule Trigger** node in N8N:

1. Click **"+"** to add node
2. Select **"Schedule Trigger"**
3. Set cron expression:
   - `0 10 * * FRI` - Every Friday at 10 AM
   - `0 17 * * *` - Every day at 5 PM
   - `0 12 * * 1,3,5` - Mon/Wed/Fri at noon

4. Connect to "Process Post Data" node

### A/B Testing

Add an **IF** node to test different captions:

```javascript
// In Function node
const random = Math.random();
if (random < 0.5) {
  return [{ json: { caption: "Version A caption" } }];
} else {
  return [{ json: { caption: "Version B caption" } }];
}
```

### Multiple Instagram Accounts

Duplicate the "Post to Instagram" node and use different Zapier webhooks for each account.

---

## 🔧 Customization

### Edit Caption Template

In `post-to-instagram.js`, modify the `generateCaption()` function:

```javascript
function generateCaption(template, customText) {
  const baseCaption = `🍷 ${template.title}\n\n${template.description}`;

  // Customize store info
  const storeInfo = `\n\n📍 YOUR STORE NAME\nYOUR ADDRESS\n📞 YOUR PHONE`;

  // Customize hashtags
  const hashtags = `\n\n#YourHashtag1 #YourHashtag2`;

  return customText || (baseCaption + storeInfo + hashtags);
}
```

### Add New Template

```javascript
const POST_TEMPLATES = {
  // ... existing templates

  happyHour: {
    title: 'Happy Hour Special',
    description: '2-for-1 on all draft beers!\n4 PM - 7 PM daily',
    imageUrl: 'https://example.com/happy-hour.jpg',
    hashtags: '#HappyHour #BeerTime #Cheers'
  }
};
```

### Change Image Sources

Replace `imageUrl` with:
- Your own hosted images
- Pexels/Unsplash URLs
- Product photos from your inventory
- AI-generated images (DALL-E, Midjourney)

---

## 📊 Workflow Nodes Explained

### 1. Webhook Trigger
- **Purpose**: Receive post data via HTTP
- **URL**: `http://localhost:5678/webhook/instagram-post`
- **Method**: POST
- **Config**: Response mode = Last Node

### 2. Process Post Data
- **Purpose**: Generate caption with store info and hashtags
- **Type**: Function node
- **Code**: JavaScript to format post data

### 3. Post to Instagram (Zapier)
- **Purpose**: Send data to Zapier webhook
- **Type**: HTTP Request node
- **URL**: Your Zapier webhook
- **Method**: POST
- **Body**: `image_url`, `caption`, `campaign`

### 4. Format Response
- **Purpose**: Clean up response for output
- **Type**: Function node
- **Returns**: Success message and post details

### 5. Notify Slack
- **Purpose**: Send notification to team
- **Type**: Slack node
- **Channel**: #social
- **Message**: Post confirmation with preview

### 6. Check Success
- **Purpose**: Conditional logic for error handling
- **Type**: IF node
- **Condition**: Check if success === true

---

## 🛠️ Troubleshooting

### N8N Not Responding

```bash
# Check if N8N is running
lsof -i :5678

# Start N8N
n8n start

# Or using Docker
docker start n8n
```

### Workflow Not Triggering

1. Check workflow is **Active** (toggle at top of N8N)
2. Verify webhook URL matches in script
3. Test webhook manually:
   ```bash
   curl http://localhost:5678/webhook-test/instagram-post
   ```

### Instagram Not Posting

1. **Check Zapier webhook**:
   - Log into Zapier dashboard
   - Go to Zaps → Check Instagram zap status
   - View task history for errors

2. **Verify image URL**:
   - Must be publicly accessible
   - HTTPS required
   - Supported formats: JPG, PNG

3. **Check Instagram API limits**:
   - Max 25 posts per day
   - No duplicate content within 24 hours

### Slack Not Notifying

1. Click "Notify Slack" node in N8N
2. Add Slack credentials:
   - Go to Slack App settings
   - Get OAuth token
   - Add to N8N credentials

3. Verify channel exists: `#social`

---

## 📈 Best Practices

### Posting Schedule

- **Best times**: 11 AM - 1 PM, 7 PM - 9 PM
- **Frequency**: 1-3 posts per day maximum
- **Avoid**: Late night (after 11 PM)

### Caption Tips

- **Length**: 125-150 characters for optimal engagement
- **Hashtags**: 5-10 relevant hashtags
- **Call-to-action**: "Visit us", "Call now", "DM for details"
- **Emojis**: 2-3 per post (don't overuse)

### Image Guidelines

- **Resolution**: Minimum 1080x1080px (square)
- **Format**: JPG or PNG
- **Size**: Under 8MB
- **Quality**: High-res, well-lit photos

### Content Mix

- **70%** Product/promotion posts
- **20%** Behind-the-scenes/team
- **10%** Repost customer content

---

## 🎨 Integration with Other Services

### Add Email Notification

Add **Send Email** node after "Format Response":
```
From: noreply@legacywine.com
To: manager@legacywine.com
Subject: Instagram Post Published
Body: {{$json.message}}
```

### Log to Google Sheets

Add **Google Sheets** node:
- Sheet: "Instagram Posts"
- Columns: Date, Caption, Image URL, Campaign

### Send to Facebook

Duplicate the "Post to Instagram" node and change webhook to Facebook API endpoint.

---

## 📚 Additional Resources

- **N8N Docs**: https://docs.n8n.io
- **Zapier Instagram**: https://zapier.com/apps/instagram
- **Instagram API**: https://developers.facebook.com/docs/instagram-api

---

## ✅ Setup Checklist

- [ ] N8N installed and running
- [ ] Workflow imported and activated
- [ ] Zapier webhook configured
- [ ] Slack credentials added (optional)
- [ ] Test post successful
- [ ] Scheduled posts configured (optional)
- [ ] Team trained on usage

---

## 🚀 You're Ready!

Post to Instagram with a single command:

```bash
node post-to-instagram.js weekendSpecial
```

Your Instagram automation is live! 📸🍷

---

`★ Insight ─────────────────────────────────────`
**Why this workflow is powerful:**

1. **Consistency**: Automated formatting ensures every post looks professional
2. **Speed**: Post in 5 seconds vs 5 minutes manually
3. **Scheduling**: Set it and forget it with N8N Schedule nodes
4. **Multi-channel**: Easy to extend to Facebook, Twitter, etc.
5. **Analytics**: N8N execution logs track every post
6. **Team coordination**: Slack notifications keep everyone informed

This workflow can handle 10 posts or 1000 posts with zero code changes!
`─────────────────────────────────────────────────`