#!/usr/bin/env node
/**
 * MAILGUN API CONNECTION TEST
 * Test and establish proper Mailgun API connection
 */

import axios from 'axios';
import FormData from 'form-data';

// Your Mailgun credentials
const MAILGUN = {
  // API Key format: key-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  apiKey: 'key-d1a745f5cea48f636e92c8ff16f8fe714ac',
  domain: 'mail.legacywineandliquor.com',
  apiUrl: 'https://api.mailgun.net/v3'
};

// Test email configuration
const TEST_EMAIL = {
  from: 'Legacy Wine & Liquor <campaigns@mail.legacywineandliquor.com>',
  to: 'justin.etwaru@icloud.com',
  subject: '🍷 Mailgun API Test - Legacy Wine Campaign',
  text: 'This is a test email from your Mailgun API connection.',
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>✅ Mailgun API Connection Successful!</h2>
      <p>Your Mailgun API is now properly configured.</p>
      <hr>
      <p><strong>Configuration Details:</strong></p>
      <ul>
        <li>Domain: mail.legacywineandliquor.com</li>
        <li>API Endpoint: https://api.mailgun.net/v3</li>
        <li>Authentication: API Key</li>
      </ul>
      <p>You can now send campaign emails through this connection.</p>
    </div>
  `
};

// Test connection function
async function testConnection() {
  console.log('🔌 Testing Mailgun API Connection\n');
  console.log('=' .repeat(50));

  try {
    // First, let's test if we can access the API
    console.log('\n📊 API Configuration:');
    console.log('   Domain:', MAILGUN.domain);
    console.log('   API Key:', MAILGUN.apiKey.substring(0, 15) + '...');
    console.log('   Endpoint:', MAILGUN.apiUrl);

    // Try to get domain info
    console.log('\n🔍 Verifying domain access...');

    const domainResponse = await axios({
      method: 'get',
      url: `${MAILGUN.apiUrl}/domains/${MAILGUN.domain}`,
      auth: {
        username: 'api',
        password: MAILGUN.apiKey
      }
    }).catch(err => {
      console.log('   Domain verification failed:', err.response?.status || err.message);
      return null;
    });

    if (domainResponse) {
      console.log('✅ Domain verified:', domainResponse.data.domain.name);
      console.log('   State:', domainResponse.data.domain.state);
      console.log('   Type:', domainResponse.data.domain.type);
    }

    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data?.message || error.response.statusText);
    }
    return false;
  }
}

// Send test email
async function sendTestEmail() {
  console.log('\n📧 Sending test email...');
  console.log('   To:', TEST_EMAIL.to);
  console.log('   Subject:', TEST_EMAIL.subject);

  const form = new FormData();
  form.append('from', TEST_EMAIL.from);
  form.append('to', TEST_EMAIL.to);
  form.append('subject', TEST_EMAIL.subject);
  form.append('text', TEST_EMAIL.text);
  form.append('html', TEST_EMAIL.html);

  try {
    const response = await axios({
      method: 'post',
      url: `${MAILGUN.apiUrl}/${MAILGUN.domain}/messages`,
      auth: {
        username: 'api',
        password: MAILGUN.apiKey
      },
      data: form,
      headers: form.getHeaders()
    });

    console.log('\n✅ Email sent successfully!');
    console.log('   Message ID:', response.data.id);
    console.log('   Status:', response.data.message);

    return response.data;
  } catch (error) {
    console.error('\n❌ Failed to send email');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data?.message || error.response.statusText);

      // Provide helpful debugging info
      if (error.response.status === 401) {
        console.log('\n📌 Authentication Error - Possible solutions:');
        console.log('   1. Verify your API key starts with "key-"');
        console.log('   2. Check if the domain is verified in Mailgun');
        console.log('   3. Ensure the API key has permission for this domain');
        console.log('   4. Try regenerating the API key in Mailgun dashboard');
      } else if (error.response.status === 404) {
        console.log('\n📌 Domain Not Found - Possible solutions:');
        console.log('   1. Add the domain in Mailgun dashboard');
        console.log('   2. Verify DNS records are configured');
        console.log('   3. Check domain verification status');
      }
    } else {
      console.error('   Error:', error.message);
    }

    return null;
  }
}

// Alternative: Try with different auth format
async function tryAlternativeAuth() {
  console.log('\n🔄 Trying alternative authentication format...');

  const form = new FormData();
  form.append('from', TEST_EMAIL.from);
  form.append('to', TEST_EMAIL.to);
  form.append('subject', TEST_EMAIL.subject + ' (Alternative Auth)');
  form.append('text', TEST_EMAIL.text);

  // Try with Bearer token format
  try {
    const response = await axios({
      method: 'post',
      url: `${MAILGUN.apiUrl}/${MAILGUN.domain}/messages`,
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${MAILGUN.apiKey}`).toString('base64')}`,
        ...form.getHeaders()
      },
      data: form
    });

    console.log('✅ Alternative auth successful!');
    console.log('   Message ID:', response.data.id);
    return response.data;
  } catch (error) {
    console.log('❌ Alternative auth also failed');
    return null;
  }
}

// Main execution
async function main() {
  console.log('🚀 MAILGUN API CONNECTION TEST');
  console.log('=' .repeat(50));

  // Test connection
  const connectionOk = await testConnection();

  if (!connectionOk) {
    console.log('\n⚠️  Connection test failed. Attempting to send anyway...');
  }

  // Try to send email
  const emailResult = await sendTestEmail();

  if (!emailResult) {
    // Try alternative authentication
    await tryAlternativeAuth();
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(50));

  if (emailResult) {
    console.log('✅ SUCCESS: Mailgun API is working!');
    console.log('   You can now send campaign emails.');
  } else {
    console.log('❌ FAILED: Could not establish Mailgun connection');
    console.log('\nNext steps:');
    console.log('1. Log into Mailgun dashboard: https://app.mailgun.com');
    console.log('2. Verify domain "mail.legacywineandliquor.com" is added');
    console.log('3. Check DNS records are configured (SPF, DKIM, MX)');
    console.log('4. Ensure API key has correct permissions');
    console.log('5. Consider using sandbox domain for testing');
  }
}

// Run the test
main().catch(console.error);