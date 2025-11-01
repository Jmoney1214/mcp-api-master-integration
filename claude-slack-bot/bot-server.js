#!/usr/bin/env node
/**
 * CLAUDE 24/7 SLACK BOT - RENDER DEPLOYMENT
 * ==========================================
 * Always-on Claude assistant via Slack
 * Deployed on Render with full MCP access
 */

import { App } from '@slack/bolt';
import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import dotenv from 'dotenv';
// import PhycAnalyzerMCP from './connect-phyc-analyzer.js';

// Load environment (Render provides env vars directly)
dotenv.config();

// Configuration
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
const SLACK_APP_TOKEN = process.env.SLACK_APP_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const PORT = process.env.PORT || 3000;

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY
});

// Initialize Phyc Analyzer (disabled for initial deployment)
// const phycAnalyzer = new PhycAnalyzerMCP();
const phycAnalyzer = null;

// Initialize Slack Bot
const app = new App({
  token: SLACK_BOT_TOKEN,
  signingSecret: SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: SLACK_APP_TOKEN,
  port: PORT
});

// Conversation history (in-memory, for now)
const conversationHistory = new Map();

/**
 * Process message with Claude
 */
async function processWithClaude(userId, message, channelId) {
  try {
    // Get or create conversation history
    const historyKey = `${userId}-${channelId}`;
    if (!conversationHistory.has(historyKey)) {
      conversationHistory.set(historyKey, []);
    }
    const history = conversationHistory.get(historyKey);

    // Add user message to history
    history.push({
      role: 'user',
      content: message
    });

    // Keep only last 10 messages
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    // System prompt with MCP capabilities
    const systemPrompt = `You are Claude, deployed as a 24/7 Slack bot for Legacy Wine & Liquor.

You have access to the Phyc Analyzer MCP which provides:
- Today's sales data
- Repeat customer analysis
- At-risk customer identification
- VIP customer data
- Customer segmentation
- Re-engagement lists

When users ask about sales, customers, or analytics, you can use these capabilities.

Be helpful, concise, and use emojis to make responses engaging. Keep responses under 2000 characters for Slack.`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: history
    });

    const assistantMessage = response.content[0].text;

    // Add assistant response to history
    history.push({
      role: 'assistant',
      content: assistantMessage
    });

    return assistantMessage;
  } catch (error) {
    console.error('Claude API error:', error);
    return `Sorry, I encountered an error: ${error.message}`;
  }
}

/**
 * Check if message is for analytics/data
 */
function needsAnalytics(message) {
  const triggers = [
    'sales', 'customers', 'repeat', 'vip', 'at risk',
    'revenue', 'today', 'analytics', 'dashboard',
    'profit', 'transactions', 'report'
  ];

  return triggers.some(trigger =>
    message.toLowerCase().includes(trigger)
  );
}

/**
 * Get analytics data based on query
 */
async function getAnalyticsData(message) {
  try {
    // Analytics not available yet - Phyc Analyzer needs local filesystem access
    if (!phycAnalyzer) {
      return {
        success: false,
        message: "📊 Analytics integration coming soon! I'm currently running without access to the Phyc Analyzer data. For now, I can help with general questions and conversations."
      };
    }

    if (message.includes('today') || message.includes('sales today')) {
      return await phycAnalyzer.getTodaySales();
    }

    if (message.includes('repeat customer') || message.includes('repeat')) {
      return await phycAnalyzer.getRepeatCustomers();
    }

    if (message.includes('at risk') || message.includes('churning')) {
      return await phycAnalyzer.getAtRiskCustomers();
    }

    if (message.includes('vip') || message.includes('best customer')) {
      return await phycAnalyzer.getVIPCustomers();
    }

    if (message.includes('dashboard') || message.includes('overview')) {
      return await phycAnalyzer.getDashboardData();
    }

    // Default: get dashboard
    return await phycAnalyzer.getDashboardData();
  } catch (error) {
    console.error('Analytics error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Listen for app mentions (@claude)
 */
app.event('app_mention', async ({ event, client }) => {
  try {
    // Remove bot mention from message
    const message = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();

    console.log(`📩 Mention from ${event.user}: ${message}`);

    // Show typing indicator
    await client.chat.postMessage({
      channel: event.channel,
      text: '...',
      thread_ts: event.thread_ts || event.ts
    });

    // Check if analytics is needed
    let analyticsContext = '';
    if (needsAnalytics(message)) {
      const analytics = await getAnalyticsData(message);
      if (analytics.success) {
        analyticsContext = `\n\n[Analytics Data: ${JSON.stringify(analytics.data, null, 2)}]`;
      }
    }

    // Process with Claude
    const response = await processWithClaude(
      event.user,
      message + analyticsContext,
      event.channel
    );

    // Send response
    await client.chat.postMessage({
      channel: event.channel,
      text: response,
      thread_ts: event.thread_ts || event.ts
    });

    console.log('✅ Response sent');
  } catch (error) {
    console.error('Error handling mention:', error);

    await client.chat.postMessage({
      channel: event.channel,
      text: `❌ Sorry, I encountered an error: ${error.message}`,
      thread_ts: event.thread_ts || event.ts
    });
  }
});

/**
 * Listen for direct messages
 */
app.event('message', async ({ event, client }) => {
  // Skip bot messages and threaded replies
  if (event.bot_id || event.thread_ts) return;

  try {
    console.log(`💬 DM from ${event.user}: ${event.text}`);

    // Show typing
    await client.chat.postMessage({
      channel: event.channel,
      text: '...'
    });

    // Check if analytics is needed
    let analyticsContext = '';
    if (needsAnalytics(event.text)) {
      const analytics = await getAnalyticsData(event.text);
      if (analytics.success) {
        analyticsContext = `\n\n[Analytics Data: ${JSON.stringify(analytics.data, null, 2)}]`;
      }
    }

    // Process with Claude
    const response = await processWithClaude(
      event.user,
      event.text + analyticsContext,
      event.channel
    );

    // Send response
    await client.chat.update({
      channel: event.channel,
      ts: (await client.chat.postMessage({
        channel: event.channel,
        text: '...'
      })).ts,
      text: response
    });

    console.log('✅ Response sent');
  } catch (error) {
    console.error('Error handling message:', error);
  }
});

/**
 * Handle /claude slash command
 */
app.command('/claude', async ({ command, ack, respond }) => {
  await ack();

  try {
    const message = command.text;
    console.log(`⚡ Slash command: ${message}`);

    // Check if analytics is needed
    let analyticsContext = '';
    if (needsAnalytics(message)) {
      const analytics = await getAnalyticsData(message);
      if (analytics.success) {
        analyticsContext = `\n\n[Analytics Data: ${JSON.stringify(analytics.data, null, 2)}]`;
      }
    }

    // Process with Claude
    const response = await processWithClaude(
      command.user_id,
      message + analyticsContext,
      command.channel_id
    );

    await respond({
      text: response,
      response_type: 'in_channel'
    });

    console.log('✅ Response sent');
  } catch (error) {
    console.error('Error handling command:', error);
    await respond({
      text: `❌ Error: ${error.message}`,
      response_type: 'ephemeral'
    });
  }
});

/**
 * Health check endpoint for Render
 */
const expressApp = express();

expressApp.get('/', (req, res) => {
  res.json({
    status: 'online',
    bot: 'Claude 24/7 Slack Bot',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

expressApp.get('/health', (req, res) => {
  res.json({
    healthy: true,
    conversationCount: conversationHistory.size
  });
});

// Start servers
(async () => {
  try {
    // Start Slack bot
    await app.start();
    console.log('⚡️ Claude Slack Bot is running!');
    console.log(`🔌 Socket Mode: ${!!SLACK_APP_TOKEN}`);

    // Start Express for health checks
    expressApp.listen(PORT, () => {
      console.log(`🌐 Health check server on port ${PORT}`);
    });

    // Test Phyc Analyzer connection
    if (phycAnalyzer) {
      const testResult = await phycAnalyzer.testConnection();
      if (testResult.success) {
        console.log('✅ Phyc Analyzer MCP connected');
      } else {
        console.warn('⚠️  Phyc Analyzer not available');
      }
    } else {
      console.warn('⚠️  Phyc Analyzer disabled for cloud deployment');
    }

    console.log('\n🎉 Bot is ready! Mention @claude in Slack or DM me!');
  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('👋 Shutting down gracefully...');
  await app.stop();
  process.exit(0);
});
