# Instagram Approval System

## 🎯 How It Works

**3-Step Approval Process:**
1. **Request Approval** → Send post preview to #social-media-approvals
2. **Review & React** → Add ✅ white checkmark to approve
3. **Auto-Post** → System detects reaction and posts to Instagram

---

## ✅ System Ready & Active!

I've sent a test approval request to **#social-media-approvals**

**What happens next:**
1. Go to Slack → #social-media-approvals channel
2. Find the "Instagram Post Approval Request" message
3. React with ✅ `:white_check_mark:`
4. I'll detect it and post to Instagram automatically!

---

## 📋 Files Created

### 1. request-instagram-approval.js
**Purpose:** Send post previews to Slack for approval
```bash
node request-instagram-approval.js weekendSpecial
node request-instagram-approval.js newArrival
node request-instagram-approval.js dailyDeal
```

### 2. watch-approval-reactions.js
**Purpose:** Monitor Slack for ✅ reactions and auto-post
```bash
node watch-approval-reactions.js
# Runs continuously, checking every 10 seconds
```

### 3. n8n-approval-workflow.json
**Purpose:** N8N workflow for automated approval monitoring
- Import into N8N at http://localhost:5678
- Polls #social-media-approvals every minute
- Auto-posts when ✅ reaction detected

---

## 🚀 Quick Start

### Option 1: Manual Monitoring (You Control)
1. Send approval request:
   ```bash
   node request-instagram-approval.js weekendSpecial
   ```

2. Check Slack → #social-media-approvals

3. React with ✅ to approve

4. Manually post (for now):
   ```bash
   node post-to-instagram.js weekendSpecial
   ```

### Option 2: Automated Monitoring (via Script)
1. Start the watcher:
   ```bash
   node watch-approval-reactions.js &
   ```

2. Send approval requests:
   ```bash
   node request-instagram-approval.js weekendSpecial
   ```

3. React with ✅ in Slack

4. Watcher auto-posts to Instagram ✨

### Option 3: N8N Workflow (Most Automated)
1. Import workflow to N8N:
   - Open http://localhost:5678
   - Import `n8n-approval-workflow.json`
   - Activate workflow

2. Send approval requests (same as above)

3. N8N monitors and auto-posts when ✅ detected

---

## 🎨 Current Test Post

**I've already sent this for approval:**

```
📸 Instagram Post Approval Request

Campaign: Weekend Wine Spectacular
Template: weekendSpecial

Caption:
🍷 Weekend Wine Spectacular

Premium wines at unbeatable prices this weekend only!

🎯 30% OFF premium red wines
🍾 25% OFF champagne & sparkling
🍺 Buy 2 Get 1 FREE craft beers

📍 Legacy Wine & Liquor
200 S French Ave, Sanford, FL 32771
📞 (407) 915-7812

#WineWeekend #LegacyWine #SanfordFL

Image: https://images.pexels.com/photos/1123260/pexels-photo-1123260.jpeg

✅ React with :white_check_mark: to approve and post
❌ React with :x: to reject
```

---

## 🔧 How to Use Going Forward

### Workflow for Each Post:

```bash
# Step 1: Request approval for a post
node request-instagram-approval.js weekendSpecial

# Step 2: Check Slack #social-media-approvals

# Step 3: React with ✅ in Slack

# Step 4: (If automated) Post happens automatically!
#         (If manual) Run: node post-to-instagram.js weekendSpecial
```

---

## 📊 Approval Tracking

The system tracks:
- ✅ **Approved posts** → Auto-posted to Instagram
- ❌ **Rejected posts** → Ignored, not posted
- **Processed messages** → Won't post same message twice

---

## 🎯 Try It Now!

**Go to Slack #social-media-approvals and react with ✅**

I'm monitoring and will detect your approval!

---

`★ Insight ─────────────────────────────────────`
**Why approval workflows matter:**
1. **Quality control** → No accidental posts
2. **Compliance** → Review before publishing
3. **Team coordination** → Multiple stakeholders
4. **Audit trail** → Track who approved what
5. **Scheduling** → Approve now, post later
`─────────────────────────────────────────────────`

**Your approval system is LIVE!** 🚀
