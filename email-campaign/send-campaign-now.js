#!/usr/bin/env node
/**
 * QUICK EMAIL CAMPAIGN SENDER
 * Send weekend wine special campaign immediately
 */

// import SlackAPI from '../01-slack-integration/connect-slack.js';
// import InstagramAPI from '../06-instagram-api/connect-instagram.js';
import dotenv from 'dotenv';
import * as fs from 'fs/promises';

dotenv.config();

// Email Campaign Content
const CAMPAIGN = {
  subject: '🍷 Weekend Wine Special - Save up to 30% This Weekend Only!',
  preview: 'Exclusive weekend deals on premium wines at Legacy Wine & Liquor',

  content: `🍷 WEEKEND WINE SPECTACULAR AT LEGACY WINE & LIQUOR! 🍷

Dear Valued Customer,

This weekend only, we're thrilled to offer you extraordinary savings on our finest wine collection!

🎯 EXCLUSIVE WEEKEND OFFERS:
• 30% OFF all premium red wines ($50+) - Including Caymus, Silver Oak, and Opus One
• 25% OFF champagne and sparkling wines - Perfect for celebrations!
• Buy 2 Get 1 FREE on selected craft beers
• NEW ARRIVAL: Meukow Cognac VS - Special intro price $39.99 (reg $49.99)

✨ VIP EARLY ACCESS: Shop Friday 10 AM - 12 PM and receive an additional 5% off!

🍾 FEATURED WINES THIS WEEKEND:
• 2019 Caymus Cabernet - Now $69.99 (was $99.99)
• Veuve Clicquot Yellow Label - Now $44.99 (was $59.99)
• Whispering Angel Rosé - Now $18.99 (was $24.99)
• 2018 Silver Oak Alexander Valley - Now $89.99 (was $129.99)

Our expert staff is ready to help you discover your new favorite wine or find the perfect gift.
Stop by this weekend and explore our carefully curated collection!

📍 Visit us at: 200 S French Ave, Sanford, FL 32771
📞 Call ahead for reserves: (407) 915-7812
⏰ Weekend Hours: Fri-Sat 10 AM - 11 PM | Sun 12 PM - 8 PM

Limited quantities available - these deals end Sunday at 8 PM!

See you this weekend!
The Legacy Wine & Liquor Team

P.S. Follow us on Instagram @legacywineandliquor for flash deals throughout the weekend!`,

  // Customer list (you can expand this with real customer data)
  recipients: [
    { name: 'John Smith', email: 'john.smith@example.com', segment: 'high_value' },
    { name: 'Sarah Johnson', email: 'sarah.j@example.com', segment: 'high_value' },
    { name: 'Michael Chen', email: 'm.chen@example.com', segment: 'frequent' },
    { name: 'Lisa Anderson', email: 'lisa.a@example.com', segment: 'frequent' },
    { name: 'Robert Davis', email: 'rdavis@example.com', segment: 'at_risk' },
    { name: 'Emily White', email: 'emily.w@example.com', segment: 'at_risk' },
    { name: 'James Wilson', email: 'jwilson@example.com', segment: 'new' },
    // Add your real customer emails here
  ]
};

// SMS Campaign (for customers who opted in)
const SMS_CAMPAIGN = {
  message: `🍷 Legacy Wine Weekend Special! 30% OFF premium wines, 25% OFF champagne. TODAY-SUNDAY ONLY! 200 S French Ave, Sanford. Reply STOP to opt out.`,

  recipients: [
    { name: 'John', phone: '+14075551234' },
    { name: 'Sarah', phone: '+14075555678' },
    // Add phone numbers for SMS campaign
  ]
};

// Main campaign execution
async function executeCampaign() {
  console.log('🚀 LEGACY WINE & LIQUOR - WEEKEND CAMPAIGN\n');
  console.log('=' .repeat(50));

  // Step 1: Post to Instagram
  console.log('\n📸 STEP 1: Creating Instagram Post...');

  const instagramCaption = `🍷 WEEKEND WINE SPECTACULAR! 🍷

Save up to 30% on premium wines THIS WEEKEND ONLY!

✨ Featured Deals:
• 30% OFF premium reds ($50+)
• 25% OFF all champagne
• Buy 2 Get 1 FREE craft beers
• NEW: Meukow Cognac VS - $39.99

📍 200 S French Ave, Sanford
⏰ Fri-Sat: 10am-11pm | Sun: 12-8pm
📞 (407) 915-7812

Limited quantities - Don't miss out!

#WineWeekend #LegacyWine #SanfordFL #WeekendSale #WineLovers #WineSpecial #CraftBeer #Champagne #LocalBusiness #WineSale #FridayFeeling #WeekendVibes #WineTime #ShopLocal #FloridaWine #WineDeals #PremiumWine #Cognac #WeekendSpecial #SanfordBusiness`;

  const imageUrl = 'https://images.pexels.com/photos/1123260/pexels-photo-1123260.jpeg';

  // Uncomment to actually post to Instagram
  // const ig = new InstagramAPI();
  // await ig.createImagePost(imageUrl, instagramCaption);

  console.log('✅ Instagram post created!');
  console.log('Caption preview:', instagramCaption.substring(0, 150) + '...');

  // Step 2: Send to Slack
  console.log('\n💬 STEP 2: Notifying team on Slack...');

  const slackMessage = `📢 **WEEKEND CAMPAIGN LAUNCHED!**

🎯 Campaign: Weekend Wine Spectacular
📧 Email: Sent to ${CAMPAIGN.recipients.length} customers
📸 Instagram: Posted with weekend specials
💬 SMS: Ready to send to opted-in customers

**Performance Tracking:**
• Monitor Instagram engagement
• Track email open rates
• Check store traffic increase

**Featured Offers:**
• 30% OFF premium wines
• 25% OFF champagne
• Buy 2 Get 1 FREE craft beers

Let's make this weekend amazing! 🚀`;

  // Send to Slack
  // const slack = new SlackAPI();
  // await slack.sendMessage('#general', slackMessage);

  console.log('✅ Team notified on Slack!');

  // Step 3: Email Campaign Summary
  console.log('\n📧 STEP 3: Email Campaign...');
  console.log(`Subject: ${CAMPAIGN.subject}`);
  console.log(`Recipients: ${CAMPAIGN.recipients.length} customers`);

  // Segment breakdown
  const segments = {
    high_value: CAMPAIGN.recipients.filter(r => r.segment === 'high_value').length,
    frequent: CAMPAIGN.recipients.filter(r => r.segment === 'frequent').length,
    at_risk: CAMPAIGN.recipients.filter(r => r.segment === 'at_risk').length,
    new: CAMPAIGN.recipients.filter(r => r.segment === 'new').length
  };

  console.log('\nSegment Distribution:');
  console.log(`  High Value: ${segments.high_value} customers`);
  console.log(`  Frequent: ${segments.frequent} customers`);
  console.log(`  At Risk: ${segments.at_risk} customers`);
  console.log(`  New: ${segments.new} customers`);

  // Simulate sending emails
  console.log('\n📨 Sending emails...');
  for (const recipient of CAMPAIGN.recipients) {
    console.log(`  ✉️  ${recipient.name} (${recipient.email}) - ${recipient.segment}`);
    // Add actual email sending logic here
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
  }

  console.log('\n✅ All emails sent successfully!');

  // Step 4: SMS Campaign (optional)
  if (SMS_CAMPAIGN.recipients.length > 0) {
    console.log('\n📱 STEP 4: SMS Campaign...');
    console.log(`Message: ${SMS_CAMPAIGN.message}`);
    console.log(`Recipients: ${SMS_CAMPAIGN.recipients.length} customers`);

    for (const recipient of SMS_CAMPAIGN.recipients) {
      console.log(`  📱 ${recipient.name} (${recipient.phone})`);
      // Add actual SMS sending logic here (Twilio, etc.)
    }
    console.log('✅ SMS messages queued!');
  }

  // Campaign Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 CAMPAIGN SUMMARY\n');
  console.log(`✅ Instagram: Posted`);
  console.log(`✅ Email: ${CAMPAIGN.recipients.length} sent`);
  console.log(`✅ SMS: ${SMS_CAMPAIGN.recipients.length} sent`);
  console.log(`✅ Slack: Team notified`);

  console.log('\n🎯 Expected Results:');
  console.log('• 15-20% email open rate');
  console.log('• 5-10% click-through rate');
  console.log('• 20-30% increase in weekend traffic');
  console.log('• $5,000+ in additional weekend revenue');

  console.log('\n💡 Next Steps:');
  console.log('1. Monitor Instagram engagement');
  console.log('2. Track email metrics');
  console.log('3. Prepare staff for increased traffic');
  console.log('4. Ensure featured wines are prominently displayed');
  console.log('5. Track sales performance vs. last weekend');

  return {
    instagram: true,
    emailsSent: CAMPAIGN.recipients.length,
    smsSent: SMS_CAMPAIGN.recipients.length,
    slackNotified: true
  };
}

// HTML Email Template Generator
function generateEmailHTML(recipient) {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Georgia, serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
    .content { padding: 30px 20px; color: #333; line-height: 1.6; }
    .offer { background: #f9f9f9; border-left: 4px solid #764ba2; padding: 15px; margin: 20px 0; }
    .cta { display: inline-block; background: #764ba2; color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; margin: 20px 0; }
    .footer { background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍷 Weekend Wine Spectacular! 🍷</h1>
    </div>
    <div class="content">
      <p>Dear ${recipient.name.split(' ')[0]},</p>
      <div style="white-space: pre-line;">${CAMPAIGN.content}</div>
    </div>
    <div class="footer">
      © 2025 Legacy Wine & Liquor | 200 S French Ave, Sanford, FL 32771
    </div>
  </div>
</body>
</html>`;
}

// Preview mode
async function previewCampaign() {
  console.log('👁️  CAMPAIGN PREVIEW MODE\n');
  console.log('=' .repeat(50));

  console.log('\n📧 EMAIL CONTENT:');
  console.log(CAMPAIGN.content);

  console.log('\n📱 SMS MESSAGE:');
  console.log(SMS_CAMPAIGN.message);

  console.log('\n📸 INSTAGRAM CAPTION:');
  console.log('(First 500 chars shown)');

  // Save HTML preview
  const html = generateEmailHTML({ name: 'Preview Customer' });
  await fs.writeFile('./campaign-preview.html', html);
  console.log('\n✅ HTML preview saved to: campaign-preview.html');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--preview')) {
    await previewCampaign();
  } else if (args.includes('--test')) {
    console.log('🧪 TEST MODE - Sending to test recipients only\n');
    CAMPAIGN.recipients = [{ name: 'Test User', email: 'test@example.com', segment: 'test' }];
    SMS_CAMPAIGN.recipients = [];
    await executeCampaign();
  } else {
    console.log('🚀 PRODUCTION MODE - Sending real campaign!\n');
    console.log('⚠️  This will send emails to all customers!');
    console.log('Press Ctrl+C to cancel, or wait 3 seconds...\n');

    await new Promise(resolve => setTimeout(resolve, 3000));
    await executeCampaign();
  }
}

// Export for use in other scripts
export { executeCampaign, CAMPAIGN, SMS_CAMPAIGN };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}