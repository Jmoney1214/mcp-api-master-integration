#!/usr/bin/env node
/**
 * WEEKEND WINE SPECIAL EMAIL CAMPAIGN
 * Legacy Wine & Liquor Marketing
 * ===================================
 */

import OpenAIAPI from '../05-openai-gpt4/connect-openai.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: '../configs/.env' });

// Campaign Configuration
const CAMPAIGN_CONFIG = {
  name: 'Weekend Wine Special - October 2025',
  subject: '🍷 Weekend Wine Special - Up to 30% OFF Premium Selections!',
  previewText: 'Exclusive deals on premium wines this weekend only at Legacy Wine & Liquor',
  fromName: 'Legacy Wine & Liquor',
  fromEmail: 'deals@legacywineandliquor.com',
  replyTo: 'legacywineandliquor@gmail.com'
};

// Customer Segments (from your marketing agent data)
const CUSTOMER_SEGMENTS = {
  high_value: [
    { name: 'John Smith', email: 'john.smith@email.com', preferences: 'red wine, bourbon' },
    { name: 'Sarah Johnson', email: 'sarah.j@email.com', preferences: 'white wine, champagne' },
    { name: 'Michael Chen', email: 'm.chen@email.com', preferences: 'whiskey, craft beer' }
  ],
  frequent_buyers: [
    { name: 'Lisa Anderson', email: 'lisa.a@email.com', preferences: 'wine variety' },
    { name: 'Robert Davis', email: 'rdavis@email.com', preferences: 'bourbon, scotch' }
  ],
  at_risk: [
    { name: 'Emily White', email: 'emily.w@email.com', preferences: 'prosecco, rose' },
    { name: 'James Wilson', email: 'jwilson@email.com', preferences: 'craft spirits' }
  ]
};

class EmailCampaign {
  constructor() {
    this.ai = new OpenAIAPI();
    this.setupEmailTransporter();
  }

  // Setup email transporter (configure with your service)
  setupEmailTransporter() {
    // Option 1: Gmail (requires app password)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'legacywineandliquor@gmail.com',
        pass: process.env.EMAIL_APP_PASSWORD || 'your-app-password'
      }
    });

    // Option 2: SendGrid (recommended for production)
    // this.transporter = nodemailer.createTransport({
    //   host: 'smtp.sendgrid.net',
    //   port: 587,
    //   auth: {
    //     user: 'apikey',
    //     pass: process.env.SENDGRID_API_KEY
    //   }
    // });
  }

  // Generate campaign content with AI
  async generateCampaignContent() {
    const prompt = `Create an engaging email campaign for Legacy Wine & Liquor's weekend special.

Store Info:
- Location: 200 S French Ave, Sanford, FL
- Hours: Mon-Thu 10am-10pm, Fri-Sat 10am-11pm, Sun 12pm-8pm
- Phone: (407) 915-7812

Offers:
1. 30% OFF all premium red wines ($50+)
2. 25% OFF champagne and sparkling wines
3. Buy 2 Get 1 FREE on selected craft beers
4. NEW: Meukow Cognac VS - Special intro price $39.99

Generate:
1. Compelling headline
2. 3-4 engaging paragraphs
3. Call-to-action
4. Special note for VIP customers

Make it warm, inviting, and urgency-driven for weekend sales.`;

    const content = await this.ai.chatCompletion(prompt, {
      temperature: 0.8,
      maxTokens: 800
    });

    return content || this.getDefaultContent();
  }

  // Default content if AI fails
  getDefaultContent() {
    return `
🍷 WEEKEND WINE SPECTACULAR! 🍷

Dear Wine Lover,

This weekend only, we're offering extraordinary savings on our finest wine collection at Legacy Wine & Liquor!

Join us for our biggest wine event of the season with up to 30% OFF premium selections. Whether you're a connoisseur of bold reds, crisp whites, or celebratory bubbles, we have something special waiting for you.

EXCLUSIVE WEEKEND OFFERS:
• 30% OFF all premium red wines ($50+)
• 25% OFF champagne and sparkling wines
• Buy 2 Get 1 FREE on selected craft beers
• NEW ARRIVAL: Meukow Cognac VS - Special intro price $39.99

Our expert staff is ready to help you discover your new favorite wine or find the perfect gift. Stop by this weekend and explore our carefully curated collection!

Limited quantities available - these deals end Sunday at 8 PM!

See you this weekend!
The Legacy Wine & Liquor Team`;
  }

  // Create HTML email template
  createEmailHTML(content, customerName) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${CAMPAIGN_CONFIG.subject}</title>
  <style>
    body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 32px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
    .content { padding: 30px 20px; }
    .greeting { font-size: 18px; color: #764ba2; margin-bottom: 20px; }
    .offer-box { background: #f9f9f9; border-left: 4px solid #764ba2; padding: 20px; margin: 20px 0; }
    .offer-box h3 { color: #764ba2; margin-top: 0; }
    .offer-list { list-style: none; padding: 0; }
    .offer-list li { padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
    .offer-list li:before { content: "🎯 "; color: #764ba2; font-weight: bold; }
    .cta-button { display: inline-block; background: #764ba2; color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-size: 18px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .cta-button:hover { background: #667eea; }
    .footer { background: #333; color: #999; padding: 30px 20px; text-align: center; font-size: 14px; }
    .footer a { color: #667eea; text-decoration: none; }
    .social { margin: 20px 0; }
    .social a { margin: 0 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍷 Legacy Wine & Liquor 🍷</h1>
      <p style="margin-top: 10px; font-size: 18px;">Weekend Wine Spectacular</p>
    </div>

    <div class="content">
      <div class="greeting">Dear ${customerName},</div>

      <div style="white-space: pre-line;">${content}</div>

      <div class="offer-box">
        <h3>📍 Visit Us This Weekend!</h3>
        <p><strong>Legacy Wine & Liquor</strong><br>
        200 S French Ave, Sanford, FL 32771<br>
        📞 (407) 915-7812</p>

        <p><strong>Weekend Hours:</strong><br>
        Friday-Saturday: 10 AM - 11 PM<br>
        Sunday: 12 PM - 8 PM</p>
      </div>

      <center>
        <a href="https://legacywineandliquor.com/weekend-special" class="cta-button">
          Shop Weekend Specials →
        </a>
      </center>

      <p style="text-align: center; color: #999; margin-top: 30px; font-size: 14px;">
        *Offers valid through Sunday. While supplies last. Must be 21+ with valid ID.
      </p>
    </div>

    <div class="footer">
      <div class="social">
        <a href="https://instagram.com/legacywineandliquor">Instagram</a> |
        <a href="https://facebook.com/legacywineandliquor">Facebook</a> |
        <a href="https://legacywineandliquor.com">Website</a>
      </div>

      <p>© 2025 Legacy Wine & Liquor. All rights reserved.<br>
      200 S French Ave, Sanford, FL 32771</p>

      <p style="font-size: 12px;">
        You're receiving this because you're a valued customer of Legacy Wine & Liquor.<br>
        <a href="{unsubscribe_link}">Unsubscribe</a> | <a href="{preferences_link}">Update Preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`;
  }

  // Send email to single recipient
  async sendEmail(recipient, content) {
    const mailOptions = {
      from: `"${CAMPAIGN_CONFIG.fromName}" <${CAMPAIGN_CONFIG.fromEmail}>`,
      to: recipient.email,
      subject: CAMPAIGN_CONFIG.subject,
      html: this.createEmailHTML(content, recipient.name.split(' ')[0]),
      text: content, // Plain text version
      replyTo: CAMPAIGN_CONFIG.replyTo
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${recipient.name} (${recipient.email})`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Failed to send to ${recipient.email}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Send campaign to all segments
  async sendCampaign() {
    console.log('🚀 STARTING EMAIL CAMPAIGN\n');
    console.log('Campaign:', CAMPAIGN_CONFIG.name);
    console.log('Subject:', CAMPAIGN_CONFIG.subject);
    console.log('');

    // Generate AI content
    console.log('🤖 Generating AI content...');
    const content = await this.generateCampaignContent();
    console.log('✅ Content generated\n');

    // Combine all customer segments
    const allCustomers = [
      ...CUSTOMER_SEGMENTS.high_value,
      ...CUSTOMER_SEGMENTS.frequent_buyers,
      ...CUSTOMER_SEGMENTS.at_risk
    ];

    console.log(`📧 Sending to ${allCustomers.length} customers...\n`);

    const results = {
      sent: 0,
      failed: 0,
      details: []
    };

    // Send to each customer
    for (const customer of allCustomers) {
      const result = await this.sendEmail(customer, content);

      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
      }

      results.details.push({
        customer: customer.email,
        ...result
      });

      // Rate limiting - wait between sends
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Summary
    console.log('\n📊 CAMPAIGN RESULTS:');
    console.log(`✅ Successfully sent: ${results.sent}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success rate: ${((results.sent / allCustomers.length) * 100).toFixed(1)}%`);

    return results;
  }

  // Preview email without sending
  async previewCampaign() {
    console.log('👁️ GENERATING EMAIL PREVIEW...\n');

    const content = await this.generateCampaignContent();
    const html = this.createEmailHTML(content, 'Valued Customer');

    // Save preview to file
    const fs = require('fs');
    const previewPath = './email-preview.html';
    fs.writeFileSync(previewPath, html);

    console.log('📄 Preview saved to:', previewPath);
    console.log('\nEmail Content:');
    console.log('================');
    console.log(content);
    console.log('================\n');

    return { content, html };
  }
}

// Main execution
async function main() {
  const campaign = new EmailCampaign();

  // Check command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--preview')) {
    // Preview mode - don't send emails
    await campaign.previewCampaign();
  } else if (args.includes('--test')) {
    // Test mode - send to single test email
    const testRecipient = {
      name: 'Test User',
      email: 'legacywineandliquor@gmail.com'
    };

    console.log('📧 Sending test email...');
    const content = await campaign.generateCampaignContent();
    await campaign.sendEmail(testRecipient, content);
  } else {
    // Production mode - send to all customers
    console.log('⚠️  PRODUCTION MODE - This will send emails to all customers!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

    await new Promise(resolve => setTimeout(resolve, 5000));

    await campaign.sendCampaign();
  }
}

// Export for use in other scripts
export default EmailCampaign;

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}