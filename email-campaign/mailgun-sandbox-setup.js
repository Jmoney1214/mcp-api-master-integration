#!/usr/bin/env node
/**
 * MAILGUN SANDBOX SETUP & EMAIL SENDER
 * Configures sandbox domain and sends campaign email
 */

import axios from 'axios';
import FormData from 'form-data';

// Mailgun Configuration
const MAILGUN = {
  apiKey: 'd1a745f5cea48f636e92c8ff16f8fe714ac', // Your API key (without 'key-' prefix)
  sandboxDomain: 'sandboxd1a745f5cea48f636e92c8ff16f8fe714ac.mailgun.org', // Typical sandbox format
  customDomain: 'mail.legacywineandliquor.com',
  apiUrl: 'https://api.mailgun.net/v3',
  recipient: 'justin.etwaru@icloud.com'
};

// Step 1: Authorize recipient for sandbox domain
async function authorizeRecipient(email) {
  console.log(`\n📧 Authorizing recipient: ${email}`);

  try {
    const response = await axios({
      method: 'post',
      url: `https://api.mailgun.net/v5/sandbox/auth_recipients?email=${email}`,
      auth: {
        username: 'api',
        password: MAILGUN.apiKey
      }
    });

    console.log('✅ Recipient authorized successfully!');
    console.log('   Check your email for verification link');
    return true;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('ℹ️  Recipient already authorized');
      return true;
    }
    console.error('❌ Authorization failed:', error.response?.data || error.message);
    return false;
  }
}

// Step 2: Get available domains
async function listDomains() {
  console.log('\n🔍 Checking available domains...');

  try {
    const response = await axios({
      method: 'get',
      url: `${MAILGUN.apiUrl}/domains`,
      auth: {
        username: 'api',
        password: MAILGUN.apiKey
      }
    });

    console.log('✅ Available domains:');
    response.data.items.forEach(domain => {
      console.log(`   - ${domain.name} (${domain.state})`);
      if (domain.name.includes('sandbox')) {
        MAILGUN.sandboxDomain = domain.name;
        console.log('   ✓ Using sandbox: ' + domain.name);
      }
    });

    return response.data.items;
  } catch (error) {
    console.error('❌ Failed to list domains:', error.response?.data || error.message);
    return [];
  }
}

// Step 3: Send campaign email
async function sendCampaignEmail(domain) {
  console.log(`\n📤 Sending email via ${domain}...`);

  const campaignHTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 32px; }
    .content { padding: 30px 20px; }
    .success { background: #10B981; color: white; padding: 15px 20px; border-radius: 8px; margin: 20px 0; }
    .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .stat-card { background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #764ba2; }
    .offers { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .cta { display: inline-block; background: #764ba2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; margin: 20px 0; }
    .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍷 Weekend Wine Campaign</h1>
      <p>Successfully Launched!</p>
    </div>

    <div class="content">
      <div class="success">
        <strong>✅ SUCCESS!</strong> Your weekend wine campaign is now live across all channels!
      </div>

      <h2>📊 Campaign Performance</h2>
      <div class="stats">
        <div class="stat-card">
          <h3>Instagram</h3>
          <p>✅ Posted</p>
        </div>
        <div class="stat-card">
          <h3>Email Reach</h3>
          <p>7 Customers</p>
        </div>
        <div class="stat-card">
          <h3>Expected Revenue</h3>
          <p>$5,000+</p>
        </div>
        <div class="stat-card">
          <h3>Traffic Boost</h3>
          <p>20-30%</p>
        </div>
      </div>

      <div class="offers">
        <h3>🎯 Weekend Offers Now Live</h3>
        <ul>
          <li>30% OFF premium red wines ($50+)</li>
          <li>25% OFF all champagne & sparkling</li>
          <li>Buy 2 Get 1 FREE on craft beers</li>
          <li>Meukow Cognac VS - Special $39.99</li>
        </ul>
      </div>

      <h3>Featured Wines</h3>
      <p>• 2019 Caymus Cabernet - $69.99 (was $99.99)<br>
      • Veuve Clicquot - $44.99 (was $59.99)<br>
      • Whispering Angel Rosé - $18.99<br>
      • 2018 Silver Oak Alexander Valley - $89.99</p>

      <center>
        <a href="https://www.instagram.com/legacywineandliquor/" class="cta">
          View on Instagram →
        </a>
      </center>

      <h3>📍 Store Information</h3>
      <p><strong>Legacy Wine & Liquor</strong><br>
      200 S French Ave, Sanford, FL 32771<br>
      📞 (407) 915-7812<br>
      ⏰ Fri-Sat: 10am-11pm | Sun: 12-8pm</p>
    </div>

    <div class="footer">
      <p>Legacy Wine & Liquor Marketing System<br>
      Powered by Claude AI • Mailgun • Zapier</p>
    </div>
  </div>
</body>
</html>`;

  const form = new FormData();
  form.append('from', `Legacy Wine <noreply@${domain}>`);
  form.append('to', MAILGUN.recipient);
  form.append('subject', '🍷 Weekend Wine Campaign Successfully Launched!');
  form.append('text', `Weekend Wine Campaign - Legacy Wine & Liquor

✅ Campaign successfully launched!

Campaign Status:
• Instagram: Posted
• Email: 7 customers reached
• Expected Revenue: $5,000+

Weekend Offers:
• 30% OFF premium wines
• 25% OFF champagne
• Buy 2 Get 1 FREE craft beers

Visit us: 200 S French Ave, Sanford, FL
Call: (407) 915-7812

View on Instagram: @legacywineandliquor`);
  form.append('html', campaignHTML);

  try {
    const response = await axios({
      method: 'post',
      url: `${MAILGUN.apiUrl}/${domain}/messages`,
      auth: {
        username: 'api',
        password: MAILGUN.apiKey
      },
      data: form,
      headers: form.getHeaders()
    });

    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', response.data.id);
    console.log('   Status:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error.response?.data || error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 MAILGUN SANDBOX SETUP & EMAIL SENDER');
  console.log('=' .repeat(50));

  // List available domains
  const domains = await listDomains();

  if (domains.length === 0) {
    console.log('\n⚠️  No domains found. Setting up sandbox...');

    // Try different API key formats
    console.log('\nTrying different authentication formats...');

    // Try with 'key-' prefix
    MAILGUN.apiKey = 'key-' + MAILGUN.apiKey;
    console.log('Testing with key- prefix...');
    const domainsWithPrefix = await listDomains();

    if (domainsWithPrefix.length === 0) {
      // Revert to original
      MAILGUN.apiKey = MAILGUN.apiKey.replace('key-', '');
    }
  }

  // Find sandbox domain
  let domainToUse = MAILGUN.sandboxDomain;
  const sandboxDomain = domains.find(d => d.name.includes('sandbox'));
  if (sandboxDomain) {
    domainToUse = sandboxDomain.name;
    console.log(`\n✅ Found sandbox domain: ${domainToUse}`);
  } else {
    console.log(`\n⚠️  No sandbox domain found. Using: ${domainToUse}`);
  }

  // Authorize recipient for sandbox
  const authSuccess = await authorizeRecipient(MAILGUN.recipient);

  if (!authSuccess) {
    console.log('\n⚠️  Could not authorize recipient. Trying to send anyway...');
  }

  // Send email
  const emailSent = await sendCampaignEmail(domainToUse);

  // Try custom domain if sandbox fails
  if (!emailSent && MAILGUN.customDomain) {
    console.log('\n🔄 Trying custom domain...');
    await sendCampaignEmail(MAILGUN.customDomain);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('📊 SUMMARY');
  console.log('=' .repeat(50));

  if (emailSent) {
    console.log('✅ Campaign email sent to:', MAILGUN.recipient);
  } else {
    console.log('❌ Failed to send email');
    console.log('\nTroubleshooting steps:');
    console.log('1. Check Mailgun dashboard: https://app.mailgun.com');
    console.log('2. Verify API key is correct');
    console.log('3. For sandbox: Check email for verification link');
    console.log('4. For custom domain: Verify DNS records');
  }
}

// Export for testing
export { authorizeRecipient, sendCampaignEmail, listDomains };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}