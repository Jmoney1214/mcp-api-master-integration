#!/usr/bin/env node
/**
 * SIMPLE MANUAL INSTAGRAM POSTING
 *
 * Dead simple workflow:
 * 1. You describe what you want
 * 2. I create the post and show preview in Slack
 * 3. You say "post it"
 * 4. I post to Instagram
 *
 * No automation. No complexity. Just works.
 */

import axios from 'axios';
import readline from 'readline';

const ZAPIER_WEBHOOK = 'https://hooks.zapier.com/hooks/catch/23493233/urrpmdj/';
const SLACK_APPROVAL_CHANNEL = 'C09J5PYTACV'; // #social-media-approvals
const SLACK_SOCIAL_CHANNEL = 'C08HE87MCP7'; // #social

// Store info for all posts
const STORE_INFO = {
  name: 'Legacy Wine & Liquor',
  address: '200 S French Ave, Sanford, FL 32771',
  phone: '(407) 915-7812',
  hours: 'Open Daily',
  instagram: '@legacywineandliquor'
};

// Simple image library by category
const IMAGES = {
  wine: [
    'https://images.pexels.com/photos/1123260/pexels-photo-1123260.jpeg',
    'https://images.pexels.com/photos/1189256/pexels-photo-1189256.jpeg',
    'https://images.pexels.com/photos/2702805/pexels-photo-2702805.jpeg'
  ],
  beer: [
    'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg',
    'https://images.pexels.com/photos/1089932/pexels-photo-1089932.jpeg'
  ],
  liquor: [
    'https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg',
    'https://images.pexels.com/photos/5947068/pexels-photo-5947068.jpeg'
  ],
  cocktail: [
    'https://images.pexels.com/photos/2788792/pexels-photo-2788792.jpeg',
    'https://images.pexels.com/photos/1089930/pexels-photo-1089930.jpeg'
  ],
  store: [
    'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg',
    'https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg'
  ]
};

// Create post from description
function createPost(description) {
  console.log('\n📝 Creating post from your description...\n');

  // Detect category from keywords
  let category = 'wine'; // default
  const desc = description.toLowerCase();
  if (desc.includes('beer') || desc.includes('craft')) category = 'beer';
  else if (desc.includes('liquor') || desc.includes('vodka') || desc.includes('whiskey')) category = 'liquor';
  else if (desc.includes('cocktail') || desc.includes('drink') || desc.includes('mix')) category = 'cocktail';
  else if (desc.includes('store') || desc.includes('shop') || desc.includes('visit')) category = 'store';

  // Pick random image from category
  const imageUrl = IMAGES[category][Math.floor(Math.random() * IMAGES[category].length)];

  // Generate hashtags based on content
  const hashtags = [
    '#LegacyWine',
    '#SanfordFL',
    category === 'wine' ? '#WineLovers' : null,
    category === 'beer' ? '#CraftBeer' : null,
    category === 'cocktail' ? '#Cocktails' : null,
    desc.includes('weekend') ? '#Weekend' : null,
    desc.includes('special') || desc.includes('deal') ? '#SpecialOffer' : null,
    desc.includes('new') ? '#NewArrival' : null
  ].filter(Boolean).join(' ');

  // Build caption
  const emoji = category === 'wine' ? '🍷' : category === 'beer' ? '🍺' : category === 'cocktail' ? '🍸' : '🛍️';
  const caption = `${emoji} ${description}

📍 ${STORE_INFO.name}
${STORE_INFO.address}
📞 ${STORE_INFO.phone}
⏰ ${STORE_INFO.hours}

${hashtags}`;

  return {
    caption,
    imageUrl,
    category,
    description
  };
}

// Send preview to Slack
async function sendPreview(post) {
  console.log('📤 Sending preview to Slack #social-media-approvals...\n');

  try {
    const message = `📸 **Instagram Post Preview**

**Description:** ${post.description}
**Category:** ${post.category}

**Caption:**
\`\`\`
${post.caption}
\`\`\`

**Image:** ${post.imageUrl}

✅ Type "post it" when ready to publish`;

    await axios.post('http://localhost:3000/mcp/slack/send_slack_message', {
      channel: SLACK_APPROVAL_CHANNEL,
      message: message
    });

    console.log('✅ Preview sent to #social-media-approvals');
    return true;
  } catch (error) {
    console.error('❌ Failed to send Slack preview:', error.message);
    return false;
  }
}

// Post to Instagram via Zapier
async function postToInstagram(post) {
  console.log('\n📸 Posting to Instagram...\n');

  try {
    const response = await axios.post(ZAPIER_WEBHOOK, {
      image_url: post.imageUrl,
      caption: post.caption,
      campaign: post.description.substring(0, 50)
    }, {
      timeout: 30000
    });

    console.log('✅ Successfully posted to Instagram!');
    console.log(`   Zapier Request ID: ${response.data.id || 'N/A'}`);

    // Notify in Slack #social
    await axios.post('http://localhost:3000/mcp/slack/send_slack_message', {
      channel: SLACK_SOCIAL_CHANNEL,
      message: `✅ **Posted to Instagram!**

${post.description}

🔗 Check: https://instagram.com/legacywineandliquor`
    }).catch(() => {}); // Silent fail

    return true;
  } catch (error) {
    console.error('❌ Failed to post to Instagram:', error.message);
    return false;
  }
}

// Interactive mode
async function interactive() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

  console.log('🍷 MANUAL INSTAGRAM POSTING');
  console.log('='.repeat(60));
  console.log('\nDescribe what you want to post (or "exit" to quit):\n');

  while (true) {
    const description = await question('> ');

    if (!description || description.toLowerCase() === 'exit') {
      console.log('\n👋 Goodbye!');
      rl.close();
      break;
    }

    // Create post
    const post = createPost(description);

    // Show preview
    console.log('\n📋 POST PREVIEW:');
    console.log('='.repeat(60));
    console.log(post.caption);
    console.log('='.repeat(60));
    console.log(`Image: ${post.imageUrl}`);
    console.log('='.repeat(60));

    // Send to Slack
    await sendPreview(post);

    // Wait for confirmation
    const confirm = await question('\nType "post it" to publish (or anything else to cancel): ');

    if (confirm.toLowerCase().includes('post')) {
      await postToInstagram(post);
    } else {
      console.log('❌ Cancelled - not posted');
    }

    console.log('\n' + '='.repeat(60));
    console.log('Describe your next post (or "exit"):\n');
  }
}

// Command line mode
async function commandLine() {
  const description = process.argv.slice(2).join(' ');

  if (!description) {
    console.log('Usage: node manual-instagram-post.js "Your post description"');
    console.log('\nExample:');
    console.log('  node manual-instagram-post.js "Weekend wine sale - 30% off all red wines"');
    process.exit(1);
  }

  console.log('🍷 MANUAL INSTAGRAM POSTING');
  console.log('='.repeat(60));

  const post = createPost(description);

  console.log('\n📋 POST PREVIEW:');
  console.log('='.repeat(60));
  console.log(post.caption);
  console.log('='.repeat(60));
  console.log(`Image: ${post.imageUrl}`);
  console.log('='.repeat(60));

  await sendPreview(post);

  console.log('\n✅ Preview sent to Slack');
  console.log('Check #social-media-approvals, then run:');
  console.log(`\nnode post-confirmed.js "${description}"\n`);
}

// Run
if (process.argv.length > 2) {
  commandLine();
} else {
  interactive();
}

/*
USAGE:

Interactive mode:
  node manual-instagram-post.js
  > Weekend wine sale - 30% off all red wines
  > [previews and asks confirmation]

Command line:
  node manual-instagram-post.js "Weekend wine sale"

WORKFLOW:
1. Describe what you want
2. Script creates post with caption, image, hashtags
3. Sends preview to Slack #social-media-approvals
4. Confirm "post it"
5. Posts to Instagram
6. Notifies #social

SIMPLE. WORKS. NO AUTOMATION FAILURES.
*/
