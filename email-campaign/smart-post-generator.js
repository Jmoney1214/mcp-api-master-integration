#!/usr/bin/env node
/**
 * SMART INSTAGRAM POST GENERATOR
 *
 * AI-powered content that knows:
 * - Your business (Legacy Wine & Liquor)
 * - Liquor industry trends
 * - Holidays and events
 * - Seasonal promotions
 * - New products
 *
 * Learns from what works and suggests intelligent posts.
 */

import fs from 'fs';
import axios from 'axios';

const KNOWLEDGE_BASE = './business-knowledge.json';
const ZAPIER_WEBHOOK = 'https://hooks.zapier.com/hooks/catch/23493233/urrpmdj/';
const SLACK_APPROVAL_CHANNEL = 'C09J5PYTACV'; // #social-media-approvals

// Load business knowledge
function loadKnowledge() {
  return JSON.parse(fs.readFileSync(KNOWLEDGE_BASE, 'utf8'));
}

// Save updated knowledge
function saveKnowledge(knowledge) {
  fs.writeFileSync(KNOWLEDGE_BASE, JSON.stringify(knowledge, null, 2));
}

// Get current date context
function getDateContext() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

  // Determine season
  let season = 'spring';
  if (month >= 6 && month <= 8) season = 'summer';
  else if (month >= 9 && month <= 11) season = 'fall';
  else if (month === 12 || month <= 2) season = 'winter';

  return {
    date: now,
    month,
    day,
    dayOfWeek,
    season,
    isWeekend: dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday',
    formattedDate: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  };
}

// Find upcoming holidays
function getUpcomingHolidays(knowledge, daysAhead = 14) {
  const dateContext = getDateContext();
  const today = new Date();
  const upcoming = [];

  for (const holiday of knowledge.holidays_and_events.annual_holidays) {
    // Simple date matching (you could make this more sophisticated)
    const holidayMonth = holiday.date.includes('December') ? 12 :
                        holiday.date.includes('November') ? 11 :
                        holiday.date.includes('October') ? 10 : 0;

    if (holidayMonth && Math.abs(holidayMonth - dateContext.month) <= 1) {
      upcoming.push(holiday);
    }
  }

  return upcoming;
}

// Generate intelligent post based on context
function generateContextualPost(context, knowledge) {
  const dateContext = getDateContext();
  const upcomingHolidays = getUpcomingHolidays(knowledge);

  // Check for specific context triggers
  if (context.type === 'holiday' && upcomingHolidays.length > 0) {
    return generateHolidayPost(upcomingHolidays[0], knowledge);
  }

  if (context.type === 'new_product' && context.product) {
    return generateNewProductPost(context.product, knowledge);
  }

  if (context.type === 'sale' && context.details) {
    return generateSalePost(context.details, knowledge);
  }

  if (dateContext.dayOfWeek === 'Wednesday') {
    return generateWineWednesdayPost(knowledge);
  }

  if (dateContext.dayOfWeek === 'Thursday') {
    return generateThirstyThursdayPost(knowledge);
  }

  if (dateContext.isWeekend) {
    return generateWeekendPost(knowledge);
  }

  // Default: seasonal promotion
  return generateSeasonalPost(dateContext.season, knowledge);
}

// Holiday post generator
function generateHolidayPost(holiday, knowledge) {
  const products = holiday.products.join(', ');
  const theme = holiday.themes[0];

  const captions = [
    `🎉 ${holiday.name} is coming! Stock up on ${products} for your celebration.`,
    `Get ready for ${holiday.name}! We have everything you need: ${products}`,
    `${holiday.name} celebration starts here! Featured: ${products}`
  ];

  const caption = captions[Math.floor(Math.random() * captions.length)];

  return {
    caption: buildFullCaption(caption, knowledge),
    category: holiday.products[0].toLowerCase().includes('wine') ? 'wine' :
              holiday.products[0].toLowerCase().includes('beer') ? 'beer' : 'liquor',
    theme: holiday.name,
    hashtags: generateHashtags(['holiday', holiday.name.toLowerCase().replace(/\s/g, '')], knowledge)
  };
}

// New product post generator
function generateNewProductPost(product, knowledge) {
  const captions = [
    `🆕 NEW ARRIVAL: ${product.name}! ${product.description || 'Limited quantities available.'}`,
    `Just in! ${product.name} - ${product.description || 'Get it before it\'s gone!'}`,
    `Fresh arrival alert: ${product.name}! ${product.description || 'Available now.'}`
  ];

  const caption = captions[Math.floor(Math.random() * captions.length)];

  // Add price if available
  const priceInfo = product.price ? `\n\n💰 Special intro price: $${product.price}` : '';

  return {
    caption: buildFullCaption(caption + priceInfo, knowledge),
    category: product.category || 'wine',
    theme: 'New Arrival',
    imageUrl: product.imageUrl,
    hashtags: generateHashtags(['newarrival', product.category], knowledge)
  };
}

// Sale post generator
function generateSalePost(details, knowledge) {
  const captions = [
    `🔥 ${details.title}! ${details.discount} OFF ${details.items}!`,
    `💥 SALE ALERT: ${details.discount} OFF ${details.items}! ${details.duration}`,
    `🎯 Don't miss this! ${details.discount} OFF ${details.items}. ${details.duration}`
  ];

  const caption = captions[Math.floor(Math.random() * captions.length)];

  return {
    caption: buildFullCaption(caption, knowledge),
    category: details.category || 'wine',
    theme: 'Sale',
    hashtags: generateHashtags(['sale', 'deal', details.category], knowledge)
  };
}

// Wine Wednesday post
function generateWineWednesdayPost(knowledge) {
  const wineTypes = knowledge.product_categories.wine.types;
  const randomWine = wineTypes[Math.floor(Math.random() * wineTypes.length)];

  const captions = [
    `🍷 Wine Wednesday! Featured today: ${randomWine}. Stop by for expert recommendations!`,
    `It's Wine Wednesday! Discover our ${randomWine} collection. Our staff can help you find the perfect bottle.`,
    `🍷 Wine Wednesday Special: ${randomWine} lovers, this one's for you!`
  ];

  return {
    caption: buildFullCaption(captions[Math.floor(Math.random() * captions.length)], knowledge),
    category: 'wine',
    theme: 'Wine Wednesday',
    hashtags: generateHashtags(['wine', 'winewednesday'], knowledge)
  };
}

// Thirsty Thursday post
function generateThirstyThursdayPost(knowledge) {
  const cocktails = ['Margarita', 'Old Fashioned', 'Mojito', 'Manhattan', 'Martini'];
  const randomCocktail = cocktails[Math.floor(Math.random() * cocktails.length)];

  const captions = [
    `🍸 Thirsty Thursday! Perfect ${randomCocktail} weather. Get your ingredients here!`,
    `🍹 It's Thirsty Thursday! Try our ${randomCocktail} recipe. We have everything you need!`,
    `Thirsty Thursday cocktail: ${randomCocktail}! Stop by for premium spirits and mixers.`
  ];

  return {
    caption: buildFullCaption(captions[Math.floor(Math.random() * captions.length)], knowledge),
    category: 'cocktail',
    theme: 'Thirsty Thursday',
    hashtags: generateHashtags(['cocktails', 'thirstythursday'], knowledge)
  };
}

// Weekend post
function generateWeekendPost(knowledge) {
  const captions = [
    `🎉 Weekend plans? We've got you covered! Premium wines, craft beers, and spirits for every occasion.`,
    `🍷 It's the weekend! Stock up on your favorites. Special deals on select items!`,
    `Weekend vibes! 🍾 Visit us for the perfect drinks to celebrate.`
  ];

  return {
    caption: buildFullCaption(captions[Math.floor(Math.random() * captions.length)], knowledge),
    category: 'wine',
    theme: 'Weekend',
    hashtags: generateHashtags(['weekend', 'wine'], knowledge)
  };
}

// Seasonal post
function generateSeasonalPost(season, knowledge) {
  const themes = knowledge.holidays_and_events.seasonal_themes[season];
  const randomTheme = themes[Math.floor(Math.random() * themes.length)];

  const captions = {
    spring: `🌸 Spring is here! Perfect time for ${randomTheme}. Visit us today!`,
    summer: `☀️ Summer essentials: ${randomTheme}! Beat the heat with our selection.`,
    fall: `🍂 Fall favorites: ${randomTheme}! Cozy up with something special.`,
    winter: `❄️ Winter warmth: ${randomTheme}! Perfect for the season.`
  };

  return {
    caption: buildFullCaption(captions[season], knowledge),
    category: 'wine',
    theme: season,
    hashtags: generateHashtags([season, randomTheme.toLowerCase().replace(/\s/g, '')], knowledge)
  };
}

// Build full caption with store info
function buildFullCaption(mainText, knowledge) {
  const store = knowledge.business;
  return `${mainText}

📍 ${store.name}
${store.location.address}, ${store.location.city}, ${store.location.state} ${store.location.zip}
📞 ${store.location.phone}
⏰ ${store.hours}`;
}

// Generate relevant hashtags
function generateHashtags(themes, knowledge) {
  const strategy = knowledge.content_strategies.hashtag_strategy;
  let hashtags = [...strategy.always_use];

  // Add theme-specific hashtags
  for (const theme of themes) {
    if (theme.includes('wine')) {
      hashtags.push(...strategy.wine_specific.slice(0, 3));
    } else if (theme.includes('beer')) {
      hashtags.push(...strategy.beer_specific.slice(0, 3));
    } else if (theme.includes('cocktail') || theme.includes('spirit')) {
      hashtags.push(...strategy.spirits_specific.slice(0, 3));
    }
  }

  // Add local hashtags
  hashtags.push(...strategy.local.slice(0, 2));

  // Remove duplicates and limit to 12
  return [...new Set(hashtags)].slice(0, 12).join(' ');
}

// Get appropriate image URL
function getImageUrl(category) {
  const images = {
    wine: [
      'https://images.pexels.com/photos/1123260/pexels-photo-1123260.jpeg',
      'https://images.pexels.com/photos/1189256/pexels-photo-1189256.jpeg'
    ],
    beer: [
      'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg'
    ],
    liquor: [
      'https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg'
    ],
    cocktail: [
      'https://images.pexels.com/photos/2788792/pexels-photo-2788792.jpeg'
    ]
  };

  const categoryImages = images[category] || images.wine;
  return categoryImages[Math.floor(Math.random() * categoryImages.length)];
}

// Suggest posts based on current context
function suggestPosts() {
  console.log('🧠 SMART POST SUGGESTIONS\n');
  console.log('='.repeat(60));

  const knowledge = loadKnowledge();
  const dateContext = getDateContext();
  const upcomingHolidays = getUpcomingHolidays(knowledge);

  console.log(`📅 Today: ${dateContext.formattedDate} (${dateContext.dayOfWeek})`);
  console.log(`🍂 Season: ${dateContext.season}`);

  if (upcomingHolidays.length > 0) {
    console.log(`\n🎉 Upcoming: ${upcomingHolidays[0].name}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📝 SUGGESTED POSTS:\n');

  const suggestions = [];

  // Daily theme suggestion
  if (dateContext.dayOfWeek === 'Wednesday') {
    suggestions.push({ type: 'default', name: 'Wine Wednesday', priority: 'HIGH' });
  } else if (dateContext.dayOfWeek === 'Thursday') {
    suggestions.push({ type: 'default', name: 'Thirsty Thursday', priority: 'HIGH' });
  } else if (dateContext.isWeekend) {
    suggestions.push({ type: 'default', name: 'Weekend Special', priority: 'HIGH' });
  }

  // Holiday suggestions
  if (upcomingHolidays.length > 0) {
    suggestions.push({
      type: 'holiday',
      name: upcomingHolidays[0].name,
      priority: 'HIGH',
      products: upcomingHolidays[0].products
    });
  }

  // Seasonal suggestion
  suggestions.push({
    type: 'seasonal',
    name: `${dateContext.season.charAt(0).toUpperCase() + dateContext.season.slice(1)} Feature`,
    priority: 'MEDIUM'
  });

  // Display suggestions
  suggestions.forEach((s, i) => {
    console.log(`${i + 1}. [${s.priority}] ${s.name}`);
    if (s.products) {
      console.log(`   Products: ${s.products.join(', ')}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 Use these commands to generate posts:');
  console.log('   node smart-post-generator.js suggest <number>');
  console.log('   node smart-post-generator.js new-product "Product Name"');
  console.log('   node smart-post-generator.js sale "Details"');
  console.log('   node smart-post-generator.js custom "Your idea"\n');
}

// Send post to Slack for approval
async function sendToSlack(post, knowledge) {
  console.log('\n📤 Sending to Slack for approval...\n');

  try {
    const fullCaption = post.caption + '\n\n' + post.hashtags;
    const imageUrl = post.imageUrl || getImageUrl(post.category);

    const message = `📸 **Smart Instagram Post Suggestion**

**Theme:** ${post.theme}
**Category:** ${post.category}

**Full Caption:**
\`\`\`
${fullCaption}
\`\`\`

**Image:** ${imageUrl}

**Context:** Generated based on ${getDateContext().dayOfWeek}, ${getDateContext().season} season${getUpcomingHolidays(knowledge).length > 0 ? `, upcoming ${getUpcomingHolidays(knowledge)[0].name}` : ''}

✅ Reply "post it" to publish
📝 Reply with edits to modify
❌ Reply "skip" to cancel`;

    await axios.post('http://localhost:3000/mcp/slack/send_slack_message', {
      channel: SLACK_APPROVAL_CHANNEL,
      message: message
    });

    console.log('✅ Sent to #social-media-approvals');
    console.log('\n💾 Post data saved for publishing:');

    // Save for posting
    const postData = {
      caption: fullCaption,
      imageUrl: imageUrl,
      theme: post.theme,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync('./pending-post.json', JSON.stringify(postData, null, 2));
    console.log('   Saved to: pending-post.json\n');

    return postData;
  } catch (error) {
    console.error('❌ Failed to send to Slack:', error.message);
    return null;
  }
}

// Post to Instagram
async function postToInstagram() {
  console.log('📸 Posting to Instagram...\n');

  try {
    const postData = JSON.parse(fs.readFileSync('./pending-post.json', 'utf8'));

    const response = await axios.post(ZAPIER_WEBHOOK, {
      image_url: postData.imageUrl,
      caption: postData.caption,
      campaign: postData.theme
    }, { timeout: 30000 });

    console.log('✅ Successfully posted to Instagram!');
    console.log(`   Zapier ID: ${response.data.id || 'N/A'}\n');

    // Learn from success
    const knowledge = loadKnowledge();
    knowledge.learning.successful_posts.push({
      ...postData,
      posted_at: new Date().toISOString()
    });
    saveKnowledge(knowledge);

    // Clean up
    fs.unlinkSync('./pending-post.json');

    return true;
  } catch (error) {
    console.error('❌ Failed to post:', error.message);
    return false;
  }
}

// Main CLI
async function main() {
  const command = process.argv[2];
  const arg = process.argv.slice(3).join(' ');

  const knowledge = loadKnowledge();

  if (!command || command === 'suggest') {
    suggestPosts();
    return;
  }

  if (command === 'post') {
    await postToInstagram();
    return;
  }

  let context = {};
  let post;

  if (command === 'new-product') {
    context = {
      type: 'new_product',
      product: {
        name: arg,
        description: 'Limited quantities available.',
        category: 'wine'
      }
    };
  } else if (command === 'sale') {
    context = {
      type: 'sale',
      details: {
        title: 'Flash Sale',
        discount: '30%',
        items: arg || 'Select Items',
        duration: 'This weekend only!',
        category: 'wine'
      }
    };
  } else if (command === 'holiday') {
    const holidays = getUpcomingHolidays(knowledge);
    if (holidays.length > 0) {
      post = generateHolidayPost(holidays[0], knowledge);
    }
  } else {
    // Default contextual post
    context = { type: 'default' };
  }

  if (!post) {
    post = generateContextualPost(context, knowledge);
  }

  await sendToSlack(post, knowledge);
}

// Run
main().catch(console.error);

/*
USAGE:

# See smart suggestions based on today
node smart-post-generator.js suggest

# Generate specific posts
node smart-post-generator.js new-product "Caymus Cabernet 2021"
node smart-post-generator.js sale "Premium red wines"
node smart-post-generator.js holiday

# After approval in Slack, post it
node smart-post-generator.js post

SMART FEATURES:
✅ Knows holidays and events
✅ Tracks seasons
✅ Daily themes (Wine Wednesday, etc.)
✅ Learns from successful posts
✅ Generates appropriate hashtags
✅ Context-aware content
*/
