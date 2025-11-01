#!/usr/bin/env node
/**
 * INSTAGRAM APPROVAL WATCHER
 * Monitors #social-media-approvals for ✅ reactions and auto-posts to Instagram
 */

import axios from 'axios';

const APPROVAL_CHANNEL = 'C09J5PYTACV'; // #social-media-approvals
const ZAPIER_WEBHOOK = 'https://hooks.zapier.com/hooks/catch/23493233/urrpmdj/';
const CHECK_INTERVAL = 10000; // Check every 10 seconds

// Store processed messages to avoid duplicate posts
const processedMessages = new Set();

console.log('👀 Instagram Approval Watcher Started\n');
console.log('📺 Monitoring: #social-media-approvals');
console.log('⏱️  Check interval: 10 seconds');
console.log('✅ Waiting for white checkmark reactions...\n');
console.log('='.repeat(60));

// Read Slack channel history
async function checkForApprovals() {
  try {
    // Use Slack MCP to read channel history
    const response = await axios.get('http://localhost:3000/slack/history', {
      params: {
        channel: APPROVAL_CHANNEL,
        limit: 20
      }
    });

    const messages = response.data.messages || [];

    for (const message of messages) {
      // Skip if already processed
      if (processedMessages.has(message.ts)) {
        continue;
      }

      // Check for white_check_mark reaction
      const reactions = message.reactions || [];
      const hasApproval = reactions.some(r =>
        r.name === 'white_check_mark' && r.count > 0
      );

      if (hasApproval && message.text && message.text.includes('Instagram Post Approval')) {
        console.log(`\n✅ APPROVAL DETECTED!`);
        console.log(`   Message: ${message.ts}`);
        console.log(`   Time: ${new Date(message.ts * 1000).toLocaleString()}`);

        // Extract post data from message
        const postData = extractPostData(message.text);

        if (postData) {
          await postToInstagram(postData, message.ts);
          processedMessages.add(message.ts);
        }
      }
    }
  } catch (error) {
    // Silent fail - just keep monitoring
    if (error.message.includes('ECONNREFUSED')) {
      console.log('⚠️  Slack API temporarily unavailable, retrying...');
    }
  }
}

// Extract post data from approval message
function extractPostData(messageText) {
  try {
    // Extract campaign name
    const campaignMatch = messageText.match(/\*\*Campaign:\*\* (.+)/);
    const campaign = campaignMatch ? campaignMatch[1].trim() : 'Unknown Campaign';

    // Extract caption
    const captionMatch = messageText.match(/```([\s\S]+?)```/);
    const caption = captionMatch ? captionMatch[1].trim() : '';

    // Extract image URL
    const imageMatch = messageText.match(/\*\*Image:\*\* (.+)/);
    const imageUrl = imageMatch ? imageMatch[1].trim() : '';

    if (!caption || !imageUrl) {
      console.log('   ⚠️  Could not extract post data');
      return null;
    }

    return {
      campaign,
      caption,
      imageUrl
    };
  } catch (error) {
    console.log('   ❌ Error extracting post data:', error.message);
    return null;
  }
}

// Post to Instagram via Zapier
async function postToInstagram(postData, messageTs) {
  console.log(`\n📸 Posting to Instagram...`);
  console.log(`   Campaign: ${postData.campaign}`);

  try {
    const response = await axios.post(ZAPIER_WEBHOOK, {
      image_url: postData.imageUrl,
      caption: postData.caption,
      campaign: postData.campaign
    });

    if (response.data.status === 'success') {
      console.log('   ✅ Posted successfully!');
      console.log(`   Zapier ID: ${response.data.id}`);

      // Notify success in Slack
      await notifySuccess(postData, messageTs);
    }
  } catch (error) {
    console.log('   ❌ Failed to post:', error.message);
  }
}

// Send success notification
async function notifySuccess(postData, originalMessageTs) {
  try {
    await axios.post('http://localhost:3000/slack/send', {
      channel: 'C08HE87MCP7', // #social
      text: `✅ **Instagram Post Published!**\n\nCampaign: ${postData.campaign}\nAuto-posted from approval in #social-media-approvals\n\n🔗 Check: https://instagram.com/legacywineandliquor`
    });

    // Also update the original approval message
    await axios.post('http://localhost:3000/slack/update', {
      channel: APPROVAL_CHANNEL,
      ts: originalMessageTs,
      text: `✅ **APPROVED & POSTED**\n\nThis post has been automatically published to Instagram.\nPosted at: ${new Date().toLocaleString()}`
    });

    console.log('   📢 Notifications sent');
  } catch (error) {
    // Silent fail for notifications
  }
}

// Start monitoring
console.log('🚀 Watcher is now running...\n');

// Initial check
checkForApprovals();

// Set interval to check every 10 seconds
setInterval(checkForApprovals, CHECK_INTERVAL);

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Approval watcher stopped');
  process.exit(0);
});
