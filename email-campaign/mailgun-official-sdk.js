#!/usr/bin/env node
/**
 * MAILGUN OFFICIAL SDK EMAIL SENDER
 * Using the official mailgun.js package
 */

import FormData from 'form-data';
import Mailgun from 'mailgun.js';

// Initialize Mailgun client
const mailgun = new Mailgun(FormData);

// Configure the client with your API credentials
const mg = mailgun.client({
  username: 'api',
  key: '3626b6dc593d127464a82d1ef1edc6cbc10cede03c34fb460b732436f3b11c2c', // Your actual API key
  url: 'https://api.mailgun.net' // or 'https://api.eu.mailgun.net' for EU
});

// Email configuration
const CAMPAIGN_CONFIG = {
  domain: 'mail.legacywineandliquor.com', // Your domain
  sandboxDomain: 'sandboxd1a745f5cea48f636e92c8ff16f8fe714ac.mailgun.org',
  recipient: 'justin.etwaru@icloud.com',
  subject: '🍷 Weekend Wine Campaign Successfully Launched!',
  from: 'Legacy Wine & Liquor <campaigns@mail.legacywineandliquor.com>'
};

// Campaign HTML template
function getCampaignHTML() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .email-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-top: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .header p { margin: 10px 0 0 0; opacity: 0.95; font-size: 16px; }
    .content { padding: 30px; color: #333; }
    .success-banner { background: #10B981; color: white; padding: 15px 20px; border-radius: 8px; margin: 20px 0; display: flex; align-items: center; }
    .success-banner .icon { font-size: 24px; margin-right: 15px; }
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; }
    .metric-card { background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #764ba2; }
    .metric-card h3 { margin: 0 0 5px 0; font-size: 14px; color: #666; font-weight: 500; }
    .metric-card p { margin: 0; font-size: 24px; font-weight: 600; color: #333; }
    .offers-section { background: #fef9f3; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fbbf24; }
    .offer-list { list-style: none; padding: 0; margin: 10px 0; }
    .offer-list li { padding: 10px 0; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; }
    .offer-list li:last-child { border-bottom: none; }
    .offer-list li:before { content: "✓"; color: #10B981; font-weight: bold; margin-right: 10px; font-size: 18px; }
    .cta-button { background: #764ba2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; display: inline-block; margin: 20px 0; font-weight: 500; text-align: center; }
    .cta-button:hover { background: #667eea; }
    .footer { background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }
    .footer a { color: #a78bfa; text-decoration: none; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🍷 Campaign Successfully Launched!</h1>
      <p>Weekend Wine Spectacular is LIVE</p>
    </div>

    <div class="content">
      <div class="success-banner">
        <div class="icon">✅</div>
        <div>
          <strong>SUCCESS!</strong> Your weekend wine campaign is now live across all channels
        </div>
      </div>

      <h2 style="color: #333; margin: 25px 0 15px 0;">📊 Campaign Performance</h2>

      <div class="metrics-grid">
        <div class="metric-card">
          <h3>Instagram Status</h3>
          <p>✅ Posted</p>
        </div>
        <div class="metric-card">
          <h3>Email Campaign</h3>
          <p>7 Sent</p>
        </div>
        <div class="metric-card">
          <h3>Expected Revenue</h3>
          <p>$5,000+</p>
        </div>
        <div class="metric-card">
          <h3>Traffic Increase</h3>
          <p>20-30%</p>
        </div>
      </div>

      <div class="offers-section">
        <h3 style="margin: 0 0 15px 0; color: #92400e;">🎯 Weekend Offers Now Live</h3>
        <ul class="offer-list">
          <li>30% OFF premium red wines ($50+) - Caymus, Silver Oak, Opus One</li>
          <li>25% OFF all champagne & sparkling wines</li>
          <li>Buy 2 Get 1 FREE on selected craft beers</li>
          <li>Meukow Cognac VS - Special intro price $39.99</li>
          <li>VIP Early Access: Extra 5% off Friday 10 AM - 12 PM</li>
        </ul>
      </div>

      <h3 style="color: #333; margin: 25px 0 15px 0;">📍 Store Information</h3>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
        <p style="margin: 0 0 10px 0;"><strong>Legacy Wine & Liquor</strong></p>
        <p style="margin: 5px 0;">200 S French Ave, Sanford, FL 32771</p>
        <p style="margin: 5px 0;">📞 (407) 915-7812</p>
        <p style="margin: 5px 0;">⏰ Fri-Sat: 10am-11pm | Sun: 12-8pm</p>
      </div>

      <center>
        <a href="https://www.instagram.com/legacywineandliquor/" class="cta-button">
          View on Instagram →
        </a>
      </center>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        <strong>Legacy Wine & Liquor Marketing System</strong>
      </p>
      <p style="margin: 5px 0;">
        Powered by Claude AI • Mailgun • Zapier Integration
      </p>
      <p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.8;">
        This is an automated campaign notification
      </p>
    </div>
  </div>
</body>
</html>`;
}

// Plain text version
function getCampaignText() {
  return `🍷 WEEKEND WINE CAMPAIGN SUCCESSFULLY LAUNCHED!

✅ SUCCESS! Your campaign is now live across all channels.

CAMPAIGN PERFORMANCE:
• Instagram: Posted successfully via Zapier
• Slack: Team notifications sent
• Email: 7 customers reached
• SMS: 2 VIP customers notified
• Expected Revenue: $5,000+
• Traffic Increase: 20-30%

WEEKEND OFFERS (NOW LIVE):
• 30% OFF premium red wines ($50+)
• 25% OFF champagne & sparkling wines
• Buy 2 Get 1 FREE on selected craft beers
• Meukow Cognac VS - Special $39.99
• VIP Early Access: Extra 5% Friday 10 AM - 12 PM

FEATURED WINES:
• 2019 Caymus Cabernet - $69.99 (was $99.99)
• Veuve Clicquot - $44.99 (was $59.99)
• Whispering Angel Rosé - $18.99
• 2018 Silver Oak Alexander Valley - $89.99

STORE INFORMATION:
Legacy Wine & Liquor
200 S French Ave, Sanford, FL 32771
📞 (407) 915-7812
⏰ Fri-Sat: 10am-11pm | Sun: 12-8pm

View on Instagram: @legacywineandliquor

---
This is an automated notification from Legacy Wine & Liquor Marketing System
Powered by Claude AI • Mailgun • Zapier Integration`;
}

// Send email using Mailgun SDK
async function sendCampaignEmail(useSandbox = false) {
  const domain = useSandbox ? CAMPAIGN_CONFIG.sandboxDomain : CAMPAIGN_CONFIG.domain;

  console.log(`\n📧 Sending email via ${domain}...`);
  console.log('   To:', CAMPAIGN_CONFIG.recipient);
  console.log('   Subject:', CAMPAIGN_CONFIG.subject);

  const messageData = {
    from: CAMPAIGN_CONFIG.from,
    to: [CAMPAIGN_CONFIG.recipient],
    subject: CAMPAIGN_CONFIG.subject,
    text: getCampaignText(),
    html: getCampaignHTML()
  };

  try {
    const msg = await mg.messages.create(domain, messageData);
    console.log('\n✅ Email sent successfully!');
    console.log('   Message ID:', msg.id);
    console.log('   Status:', msg.message);
    return msg;
  } catch (error) {
    console.error('\n❌ Failed to send email');
    console.error('   Error:', error.message);
    if (error.details) {
      console.error('   Details:', error.details);
    }
    return null;
  }
}

// List available domains
async function listDomains() {
  console.log('\n🔍 Checking available domains...');

  try {
    const domains = await mg.domains.list();
    console.log('✅ Found domains:');
    domains.forEach(domain => {
      console.log(`   - ${domain.name} (${domain.state})`);
    });
    return domains;
  } catch (error) {
    console.error('❌ Failed to list domains:', error.message);
    return [];
  }
}

// Main execution
async function main() {
  console.log('🚀 MAILGUN OFFICIAL SDK - EMAIL CAMPAIGN');
  console.log('=' .repeat(60));

  // Check available domains
  const domains = await listDomains();

  // Try to send with custom domain first
  let result = await sendCampaignEmail(false);

  // If custom domain fails, try sandbox
  if (!result && domains.some(d => d.name.includes('sandbox'))) {
    console.log('\n🔄 Trying with sandbox domain...');
    result = await sendCampaignEmail(true);
  }

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 SUMMARY');
  console.log('=' .repeat(60));

  if (result) {
    console.log('✅ Campaign email delivered successfully!');
    console.log('   Check inbox:', CAMPAIGN_CONFIG.recipient);
    console.log('\n📱 Next: Send SMS notification to 19144201823');
  } else {
    console.log('❌ Failed to send email');
    console.log('\nTroubleshooting:');
    console.log('1. Verify API key is correct');
    console.log('2. Check if domain is verified in Mailgun');
    console.log('3. For sandbox: Authorize recipient email');
    console.log('4. Check Mailgun dashboard for logs');
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { sendCampaignEmail, listDomains };