#!/usr/bin/env node
/**
 * N8N CAMPAIGN TRIGGER
 * Trigger email campaigns through N8N workflow automation
 */

import axios from 'axios';

// N8N Configuration
const N8N_CONFIG = {
  apiToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjNjBlZjJkMi0xMTk0LTQ0OTMtYmFiNC1iMjhlNjQ1ZTNiMDEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYxMzQ4OTgzLCJleHAiOjE3NjM4NzQwMDB9.wtpDl7MX7EZBua4urMKs3MMP07Sczcswls4KbNsw5dU',
  baseUrl: 'https://n8n.yourdomain.com/api/v1', // Update with your N8N instance URL
  // Alternative common endpoints:
  // 'http://localhost:5678/api/v1'
  // 'https://app.n8n.cloud/api/v1'
};

// Campaign data to send to N8N workflow
const CAMPAIGN_DATA = {
  campaignName: 'Weekend Wine Spectacular',
  recipient: {
    email: 'justin.etwaru@icloud.com',
    phone: '+19144201823',
    name: 'Justin Etwaru'
  },
  emailContent: {
    subject: '🍷 Weekend Wine Campaign Successfully Launched!',
    from: 'Legacy Wine & Liquor <campaigns@mail.legacywineandliquor.com>',
    fromName: 'Legacy Wine & Liquor'
  },
  campaignMetrics: {
    instagramPosted: true,
    slackNotified: true,
    emailsSent: 7,
    expectedRevenue: '$5,000+',
    trafficIncrease: '20-30%'
  },
  offers: [
    { discount: '30% OFF', description: 'Premium red wines ($50+)' },
    { discount: '25% OFF', description: 'All champagne & sparkling wines' },
    { discount: 'BOGO', description: 'Buy 2 Get 1 FREE craft beers' },
    { discount: '$39.99', description: 'Meukow Cognac VS Special' }
  ],
  storeInfo: {
    name: 'Legacy Wine & Liquor',
    address: '200 S French Ave, Sanford, FL 32771',
    phone: '(407) 915-7812',
    hours: 'Fri-Sat: 10am-11pm | Sun: 12-8pm',
    instagram: '@legacywineandliquor'
  }
};

// Get N8N workflows
async function listWorkflows() {
  console.log('📋 Fetching N8N workflows...\n');

  try {
    const response = await axios({
      method: 'get',
      url: `${N8N_CONFIG.baseUrl}/workflows`,
      headers: {
        'Authorization': `Bearer ${N8N_CONFIG.apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Available workflows:');
    response.data.data.forEach((workflow, index) => {
      console.log(`   ${index + 1}. ${workflow.name} (ID: ${workflow.id})`);
      console.log(`      Active: ${workflow.active}`);
    });

    return response.data.data;
  } catch (error) {
    console.error('❌ Failed to list workflows');
    console.error('   Error:', error.response?.data?.message || error.message);
    return [];
  }
}

// Trigger N8N workflow via webhook
async function triggerWebhook(webhookUrl, data) {
  console.log(`\n🎯 Triggering N8N workflow via webhook...`);
  console.log('   URL:', webhookUrl);

  try {
    const response = await axios({
      method: 'post',
      url: webhookUrl,
      data: data,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Workflow triggered successfully!');
    console.log('   Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('\n❌ Failed to trigger workflow');
    console.error('   Error:', error.response?.data || error.message);
    return null;
  }
}

// Execute workflow directly via API
async function executeWorkflow(workflowId, data) {
  console.log(`\n▶️  Executing workflow ID: ${workflowId}...`);

  try {
    const response = await axios({
      method: 'post',
      url: `${N8N_CONFIG.baseUrl}/workflows/${workflowId}/execute`,
      headers: {
        'Authorization': `Bearer ${N8N_CONFIG.apiToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        data: data
      }
    });

    console.log('\n✅ Workflow executed!');
    console.log('   Execution ID:', response.data.data.executionId);
    return response.data;
  } catch (error) {
    console.error('\n❌ Failed to execute workflow');
    console.error('   Error:', error.response?.data?.message || error.message);
    return null;
  }
}

// Get execution result
async function getExecution(executionId) {
  console.log(`\n📊 Fetching execution result: ${executionId}...`);

  try {
    const response = await axios({
      method: 'get',
      url: `${N8N_CONFIG.baseUrl}/executions/${executionId}`,
      headers: {
        'Authorization': `Bearer ${N8N_CONFIG.apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Execution completed');
    console.log('   Status:', response.data.data.finished ? 'Success' : 'Running');
    console.log('   Mode:', response.data.data.mode);
    return response.data;
  } catch (error) {
    console.error('\n❌ Failed to get execution');
    console.error('   Error:', error.response?.data?.message || error.message);
    return null;
  }
}

// Create a new workflow for email campaigns
async function createEmailWorkflow() {
  console.log('\n🔨 Creating new email campaign workflow...');

  const workflowDefinition = {
    name: 'Legacy Wine - Email Campaign',
    nodes: [
      {
        parameters: {},
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [250, 300],
        webhookId: 'campaign-trigger'
      },
      {
        parameters: {
          functionCode: `// Process campaign data
const data = items[0].json;
return [{
  json: {
    to: data.recipient.email,
    subject: data.emailContent.subject,
    from: data.emailContent.from,
    html: generateCampaignHTML(data)
  }
}];

function generateCampaignHTML(data) {
  return \`
    <div style="font-family: Arial, sans-serif;">
      <h1>🍷 Campaign Successfully Launched!</h1>
      <p>Your weekend wine campaign is live!</p>
      <h2>Campaign Metrics:</h2>
      <ul>
        <li>Instagram: \${data.campaignMetrics.instagramPosted ? '✅ Posted' : '❌ Not posted'}</li>
        <li>Expected Revenue: \${data.campaignMetrics.expectedRevenue}</li>
      </ul>
    </div>
  \`;
}`
        },
        name: 'Process Data',
        type: 'n8n-nodes-base.function',
        typeVersion: 1,
        position: [450, 300]
      },
      {
        parameters: {
          fromEmail: '={{$json["from"]}}',
          toEmail: '={{$json["to"]}}',
          subject: '={{$json["subject"]}}',
          emailType: 'html',
          message: '={{$json["html"]}}'
        },
        name: 'Send Email',
        type: 'n8n-nodes-base.emailSend',
        typeVersion: 1,
        position: [650, 300]
      }
    ],
    connections: {
      'Webhook': {
        main: [[{ node: 'Process Data', type: 'main', index: 0 }]]
      },
      'Process Data': {
        main: [[{ node: 'Send Email', type: 'main', index: 0 }]]
      }
    },
    active: false,
    settings: {},
    tags: []
  };

  try {
    const response = await axios({
      method: 'post',
      url: `${N8N_CONFIG.baseUrl}/workflows`,
      headers: {
        'Authorization': `Bearer ${N8N_CONFIG.apiToken}`,
        'Content-Type': 'application/json'
      },
      data: workflowDefinition
    });

    console.log('✅ Workflow created!');
    console.log('   ID:', response.data.data.id);
    console.log('   Name:', response.data.data.name);
    return response.data.data;
  } catch (error) {
    console.error('❌ Failed to create workflow');
    console.error('   Error:', error.response?.data?.message || error.message);
    return null;
  }
}

// Main execution
async function main() {
  console.log('🚀 N8N CAMPAIGN AUTOMATION');
  console.log('=' .repeat(60));
  console.log('\n📍 N8N Configuration:');
  console.log('   Base URL:', N8N_CONFIG.baseUrl);
  console.log('   Token:', N8N_CONFIG.apiToken.substring(0, 30) + '...');

  // List available workflows
  const workflows = await listWorkflows();

  if (workflows.length === 0) {
    console.log('\n⚠️  No workflows found. You can:');
    console.log('1. Create workflows in N8N UI');
    console.log('2. Or use the webhook URL directly');
    console.log('\n💡 To create a workflow via API, uncomment createEmailWorkflow() below');
    // await createEmailWorkflow();
  }

  // Example: Trigger via webhook (if you have a webhook URL)
  const webhookUrl = 'https://n8n.yourdomain.com/webhook/campaign-trigger';
  console.log('\n📌 To trigger campaign via webhook:');
  console.log(`   POST ${webhookUrl}`);
  console.log('   With campaign data');

  // Uncomment to trigger:
  // await triggerWebhook(webhookUrl, CAMPAIGN_DATA);

  // Example: Execute workflow directly (if you have workflow ID)
  if (workflows.length > 0) {
    const workflowId = workflows[0].id;
    console.log(`\n📌 To execute workflow directly:`);
    console.log(`   Workflow ID: ${workflowId}`);

    // Uncomment to execute:
    // const execution = await executeWorkflow(workflowId, CAMPAIGN_DATA);
    // if (execution?.data?.executionId) {
    //   await getExecution(execution.data.executionId);
    // }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('📊 SETUP COMPLETE');
  console.log('=' .repeat(60));
  console.log('\nNext steps:');
  console.log('1. Update N8N_CONFIG.baseUrl with your N8N instance URL');
  console.log('2. Create email campaign workflow in N8N UI');
  console.log('3. Set up webhook trigger or use workflow ID');
  console.log('4. Uncomment trigger code above to send campaign');
}

// Export for use in other scripts
export { triggerWebhook, executeWorkflow, listWorkflows, CAMPAIGN_DATA };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}