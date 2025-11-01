#!/usr/bin/env node
/**
 * Deploy Instagram Workflow to N8N via API
 * Programmatically creates and activates the Instagram auto-post workflow
 */

import axios from 'axios';
import fs from 'fs';

const N8N_API_URL = 'http://localhost:5678/api/v1';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiOWRiZDNkZi00ZjBkLTQ0OTMtOGRlOC1iODk2Yjk0ZTU2ZjEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYxMzUyOTg4fQ.mtNTX8ICi5teqYjp9dnteg5M5KRbTz68vmesE0DUGVA';

// Read the workflow JSON
const workflowData = JSON.parse(
  fs.readFileSync('./n8n-instagram-workflow.json', 'utf8')
);

async function deployWorkflow() {
  console.log('🚀 Deploying Instagram Workflow to N8N...\n');

  try {
    // Step 1: Create the workflow (remove read-only fields)
    console.log('📝 Creating workflow...');
    const { active, tags, ...createData } = workflowData;
    const response = await axios.post(
      `${N8N_API_URL}/workflows`,
      createData,
      {
        headers: {
          'X-N8N-API-KEY': JWT_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    const workflowId = response.data.id;
    console.log(`✅ Workflow created successfully!`);
    console.log(`   ID: ${workflowId}`);
    console.log(`   Name: ${response.data.name}`);

    // Step 2: Activate the workflow using PUT
    console.log('\n🔄 Activating workflow...');
    await axios.put(
      `${N8N_API_URL}/workflows/${workflowId}/activate`,
      {},
      {
        headers: {
          'X-N8N-API-KEY': JWT_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Workflow activated!');

    // Step 3: Get webhook URL
    console.log('\n📍 Webhook Details:');
    console.log(`   URL: http://localhost:5678/webhook/instagram-post`);
    console.log(`   Method: POST`);
    console.log(`   Status: LIVE`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Instagram Workflow Successfully Deployed!');
    console.log('='.repeat(60));

    console.log('\n📸 Test the workflow:');
    console.log('   node post-to-instagram.js weekendSpecial');

    console.log('\n🔗 View in N8N:');
    console.log('   http://localhost:5678/workflow/' + workflowId);

    return workflowId;

  } catch (error) {
    console.error('\n❌ Deployment failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   Error:', error.message);
    }
    process.exit(1);
  }
}

// Run deployment
deployWorkflow();
