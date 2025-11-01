#!/usr/bin/env node
/**
 * REQUEST INSTAGRAM APPROVAL
 * Sends post preview to Slack for approval before posting to Instagram
 */

import axios from 'axios';

const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL || 'YOUR_SLACK_WEBHOOK_URL';
const APPROVAL_CHANNEL = 'C09J5PYTACV'; // #social-media-approvals

// Instagram Post Templates (same as post-to-instagram.js)
const POST_TEMPLATES = {
  weekendSpecial: {
    title: 'Weekend Wine Spectacular',
    description: `Premium wines at unbeatable prices this weekend only!\n\n🎯 30% OFF premium red wines\n🍾 25% OFF champagne & sparkling\n🍺 Buy 2 Get 1 FREE craft beers\n\nVisit us today!`,
    imageUrl: 'https://images.pexels.com/photos/1123260/pexels-photo-1123260.jpeg',
    hashtags: '#WineWeekend #LegacyWine #SanfordFL'
  },

  newArrival: {
    title: 'New Arrival Alert',
    description: `Just arrived! Premium selection of rare wines.\n\nLimited quantities available.\nFirst come, first served! 🍷`,
    imageUrl: 'https://images.pexels.com/photos/1189256/pexels-photo-1189256.jpeg',
    hashtags: '#NewArrival #RareWine #WineLovers'
  },

  dailyDeal: {
    title: 'Daily Deal',
    description: `Today's special offer!\n\nAsk our staff for details.\n📞 (407) 915-7812`,
    imageUrl: 'https://images.pexels.com/photos/774455/pexels-photo-774455.jpeg',
    hashtags: '#DailyDeal #WineSpecial #LocalBusiness'
  },

  cocktailRecipe: {
    title: 'Cocktail of the Week',
    description: `Try this amazing cocktail recipe!\n\nGet all ingredients at Legacy Wine & Liquor. 🍸`,
    imageUrl: 'https://images.pexels.com/photos/2788792/pexels-photo-2788792.jpeg',
    hashtags: '#CocktailRecipe #Mixology #DrinkIdeas'
  }
};

// Generate full caption
function generateCaption(template, customText) {
  const baseCaption = `🍷 ${template.title}\n\n${template.description}`;
  const storeInfo = `\n\n📍 Legacy Wine & Liquor\n200 S French Ave, Sanford, FL 32771\n📞 (407) 915-7812\n⏰ Open Daily`;
  const hashtags = `\n\n${template.hashtags}`;

  return customText || (baseCaption + storeInfo + hashtags);
}

// Send approval request to Slack
async function requestApproval(postData) {
  console.log('📤 Sending approval request to Slack...\n');

  const caption = generateCaption(postData, postData.customCaption);

  // Slack message with blocks for better formatting
  const slackMessage = {
    channel: APPROVAL_CHANNEL,
    text: `📸 Instagram Post Approval Request: ${postData.title}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "📸 Instagram Post Approval Request",
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Campaign:*\n${postData.title}`
          },
          {
            type: "mrkdwn",
            text: `*Template:*\n${postData.templateName}`
          }
        ]
      },
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Caption Preview:*\n\`\`\`${caption.substring(0, 500)}${caption.length > 500 ? '...' : ''}\`\`\``
        }
      },
      {
        type: "image",
        image_url: postData.imageUrl,
        alt_text: postData.title
      },
      {
        type: "divider"
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "✅ React with :white_check_mark: to approve and post\n❌ React with :x: to reject"
          }
        ]
      }
    ],
    metadata: {
      event_type: "instagram_approval_request",
      event_payload: {
        template: postData.templateName,
        imageUrl: postData.imageUrl,
        caption: caption,
        campaignName: postData.title,
        hashtags: postData.hashtags
      }
    }
  };

  try {
    // Use Slack MCP to send message
    const response = await axios.post('http://localhost:3000/slack/send', slackMessage);

    console.log('✅ Approval request sent!');
    console.log(`   Channel: #social-media-approvals`);
    console.log(`   Template: ${postData.templateName}`);
    console.log(`\n👀 Waiting for approval...`);
    console.log(`   ✅ React with white checkmark to approve`);
    console.log(`   ❌ React with X to reject\n`);

    return response.data;
  } catch (error) {
    console.error('❌ Failed to send approval request');
    console.error('   Error:', error.message);
    return null;
  }
}

// Main execution
async function main() {
  console.log('🚀 INSTAGRAM APPROVAL REQUEST\n');
  console.log('='.repeat(60));

  // Get template name from command line args
  const templateName = process.argv[2] || 'weekendSpecial';
  const customCaption = process.argv[3];

  // Select template
  const template = POST_TEMPLATES[templateName];

  if (!template) {
    console.log('❌ Invalid template name');
    console.log('\nAvailable templates:');
    Object.keys(POST_TEMPLATES).forEach(key => {
      console.log(`  - ${key}: ${POST_TEMPLATES[key].title}`);
    });
    return;
  }

  // Prepare post data
  const postData = {
    ...template,
    templateName: templateName,
    customCaption: customCaption,
    campaignName: template.title
  };

  console.log(`\n📝 Template: ${templateName}`);
  console.log(`   Title: ${template.title}`);
  console.log(`   Image: ${template.imageUrl}`);
  console.log('-'.repeat(60));

  // Send approval request
  const result = await requestApproval(postData);

  // Summary
  console.log('='.repeat(60));
  if (result) {
    console.log('✅ Approval request sent successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Check Slack: #social-media-approvals');
    console.log('2. React with ✅ to approve');
    console.log('3. N8N workflow will auto-post to Instagram');
  } else {
    console.log('❌ Failed to send approval request');
  }
  console.log('='.repeat(60));
}

// Export for use in other scripts
export { POST_TEMPLATES, generateCaption, requestApproval };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

/*
USAGE:

# Request approval for weekend special
node request-instagram-approval.js weekendSpecial

# Request approval for new arrival
node request-instagram-approval.js newArrival

# Request with custom caption
node request-instagram-approval.js dailyDeal "Flash sale! Everything 50% off!"

Then react with ✅ in Slack to auto-post to Instagram!
*/
