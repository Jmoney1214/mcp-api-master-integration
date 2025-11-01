#!/usr/bin/env node
/**
 * POST TO INSTAGRAM - N8N Workflow Trigger
 * Automatically post to Instagram via N8N workflow
 */

import axios from 'axios';

// N8N Configuration
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/instagram-post';

// Instagram Post Templates
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

// Post to Instagram via N8N workflow
async function postToInstagram(postData) {
  console.log('📸 Posting to Instagram via N8N...\n');
  console.log('Title:', postData.title);
  console.log('Image:', postData.imageUrl);

  try {
    const response = await axios.post(N8N_WEBHOOK_URL, {
      title: postData.title,
      description: postData.description,
      caption: postData.caption,
      imageUrl: postData.imageUrl,
      hashtags: postData.hashtags,
      campaignName: postData.campaignName || 'Auto Post',
      timestamp: new Date().toISOString()
    });

    console.log('\n✅ Posted successfully!');
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ Cannot connect to N8N');
      console.error('   Is N8N running? Check: http://localhost:5678');
      console.error('\n💡 Alternative: Post directly to Zapier webhook:');
      return await postViaZapier(postData);
    } else {
      console.error('\n❌ Failed to post');
      console.error('   Error:', error.message);
      return null;
    }
  }
}

// Direct Zapier webhook posting (fallback)
async function postViaZapier(postData) {
  const ZAPIER_WEBHOOK = 'https://hooks.zapier.com/hooks/catch/23493233/urrpmdj/';

  console.log('\n🔄 Using Zapier webhook directly...');

  try {
    const response = await axios.post(ZAPIER_WEBHOOK, {
      image_url: postData.imageUrl,
      caption: `${postData.title}\n\n${postData.description}\n\n${postData.hashtags}`,
      campaign: postData.campaignName || 'Auto Post'
    });

    console.log('✅ Posted via Zapier!');
    console.log('Status:', response.status);
    return response.data;
  } catch (error) {
    console.error('❌ Zapier failed:', error.message);
    return null;
  }
}

// Generate custom Instagram caption
function generateCaption(template, customText) {
  const baseCaption = `🍷 ${template.title}\n\n${template.description}`;
  const storeInfo = `\n\n📍 Legacy Wine & Liquor\n200 S French Ave, Sanford, FL 32771\n📞 (407) 915-7812\n⏰ Open Daily`;
  const hashtags = `\n\n${template.hashtags}`;

  return customText || (baseCaption + storeInfo + hashtags);
}

// Main execution
async function main() {
  console.log('🚀 INSTAGRAM AUTO-POST\n');
  console.log('=' .repeat(60));

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
    caption: generateCaption(template, customCaption),
    campaignName: template.title
  };

  console.log('\n📝 Post Preview:');
  console.log('-'.repeat(60));
  console.log(postData.caption.substring(0, 300) + '...');
  console.log('-'.repeat(60));

  // Post to Instagram
  const result = await postToInstagram(postData);

  // Summary
  console.log('\n' + '=' .repeat(60));
  if (result) {
    console.log('✅ Instagram post published successfully!');
    console.log('\nNext steps:');
    console.log('1. Check Instagram: @legacywineandliquor');
    console.log('2. Monitor engagement in Slack #social');
    console.log('3. Respond to comments');
  } else {
    console.log('❌ Post failed');
    console.log('\nTroubleshooting:');
    console.log('1. Check if N8N is running: http://localhost:5678');
    console.log('2. Verify Zapier webhook is active');
    console.log('3. Check Instagram API credentials');
  }
  console.log('=' .repeat(60));
}

// Quick post functions for easy use
export async function quickPost(type = 'weekendSpecial', customMessage = null) {
  const template = POST_TEMPLATES[type];
  return await postToInstagram({
    ...template,
    caption: generateCaption(template, customMessage)
  });
}

export async function schedulePost(type, time) {
  console.log(`📅 Post scheduled for ${time}`);
  console.log('   Template:', type);
  // Implement scheduling logic here or use N8N Schedule node
}

// Export templates for other scripts
export { POST_TEMPLATES };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

/*
USAGE EXAMPLES:

# Post weekend special
node post-to-instagram.js weekendSpecial

# Post new arrival
node post-to-instagram.js newArrival

# Post with custom caption
node post-to-instagram.js dailyDeal "Flash sale! 50% OFF everything!"

# All templates:
- weekendSpecial
- newArrival
- dailyDeal
- cocktailRecipe
*/