#!/usr/bin/env node
/**
 * SLACK API INTEGRATION - COMPLETE CONNECTION GUIDE
 * =================================================
 * This file shows EVERY method to connect to Slack API
 * Line-by-line explanation of all configuration options
 */

// STEP 1: Import required packages
import { WebClient } from '@slack/web-api';     // Main Slack SDK
import { createEventAdapter } from '@slack/events-api'; // For receiving events
import { createMessageAdapter } from '@slack/interactive-messages'; // For buttons/menus
import dotenv from 'dotenv';                     // Load environment variables

// STEP 2: Load environment variables from .env file
dotenv.config({ path: '../configs/.env' });

// STEP 3: Configuration - Get tokens from environment
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;     // xoxb-8592279508421-...
const SLACK_APP_TOKEN = process.env.SLACK_APP_TOKEN;     // xapp-1-A09MX0MRY4Q-...
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET; // ee18ec4bf0a3f82e...
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;   // bb114ab4978194186...
const SLACK_CHANNEL = process.env.SLACK_CHANNEL || 'C09M2PHPRJ6'; // #claude channel

// STEP 4: Initialize Slack Web Client
const slack = new WebClient(SLACK_BOT_TOKEN);

// STEP 5: Test connection by getting auth info
async function testConnection() {
  try {
    // auth.test verifies token and returns bot info
    const result = await slack.auth.test();
    console.log('✅ Connected to Slack!');
    console.log('Bot User ID:', result.user_id);
    console.log('Team:', result.team);
    console.log('Bot Name:', result.user);
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

// STEP 6: Send a message to a channel
async function sendMessage(channel, text, blocks = null) {
  try {
    const result = await slack.chat.postMessage({
      channel: channel,           // Channel ID or name (#general)
      text: text,                 // Plain text fallback
      blocks: blocks,             // Rich formatted blocks (optional)
      as_user: true,              // Post as bot user (not app)
      link_names: true,           // Link @mentions and #channels
      unfurl_links: true,         // Expand URLs
      unfurl_media: true          // Show media previews
    });

    console.log('✅ Message sent:', result.ts);
    return result;
  } catch (error) {
    console.error('❌ Send message failed:', error.message);
    return null;
  }
}

// STEP 7: List all channels the bot has access to
async function listChannels() {
  try {
    const result = await slack.conversations.list({
      types: 'public_channel,private_channel',  // Channel types
      exclude_archived: true,                   // Skip archived
      limit: 100                                 // Max per page
    });

    console.log('📋 Available Channels:');
    result.channels.forEach(channel => {
      console.log(`  ${channel.name} (${channel.id}) - ${channel.num_members} members`);
    });

    return result.channels;
  } catch (error) {
    console.error('❌ List channels failed:', error.message);
    return [];
  }
}

// STEP 8: Read messages from a channel
async function readChannelHistory(channelId, limit = 10) {
  try {
    const result = await slack.conversations.history({
      channel: channelId,         // Channel to read from
      limit: limit,               // Number of messages
      inclusive: true,            // Include messages at boundaries
      oldest: 0,                  // Timestamp to start from (0 = beginning)
      latest: 'now'               // Timestamp to end at
    });

    console.log(`📖 Last ${limit} messages from channel ${channelId}:`);
    result.messages.forEach(msg => {
      console.log(`  [${new Date(msg.ts * 1000).toLocaleString()}] ${msg.user}: ${msg.text}`);
    });

    return result.messages;
  } catch (error) {
    console.error('❌ Read history failed:', error.message);
    return [];
  }
}

// STEP 9: Add reactions to messages
async function addReaction(channel, timestamp, emoji) {
  try {
    await slack.reactions.add({
      channel: channel,           // Channel containing message
      timestamp: timestamp,       // Message timestamp
      name: emoji                 // Emoji name without colons
    });

    console.log(`✅ Added :${emoji}: reaction`);
    return true;
  } catch (error) {
    console.error('❌ Add reaction failed:', error.message);
    return false;
  }
}

// STEP 10: Get reactions on a message
async function getReactions(channel, timestamp) {
  try {
    const result = await slack.reactions.get({
      channel: channel,
      timestamp: timestamp,
      full: true                  // Get full message details
    });

    if (result.message.reactions) {
      console.log('👍 Reactions:');
      result.message.reactions.forEach(reaction => {
        console.log(`  :${reaction.name}: - ${reaction.count} users`);
      });
    }

    return result.message.reactions || [];
  } catch (error) {
    console.error('❌ Get reactions failed:', error.message);
    return [];
  }
}

// STEP 11: Upload files to Slack
async function uploadFile(channels, filePath, comment) {
  try {
    const result = await slack.files.upload({
      channels: channels,         // Comma-separated channel IDs
      file: filePath,            // Path to file
      initial_comment: comment,  // Message with file
      title: 'Report'           // File title
    });

    console.log('✅ File uploaded:', result.file.id);
    return result;
  } catch (error) {
    console.error('❌ File upload failed:', error.message);
    return null;
  }
}

// STEP 12: Create thread reply
async function replyInThread(channel, threadTs, text) {
  try {
    const result = await slack.chat.postMessage({
      channel: channel,
      thread_ts: threadTs,       // Parent message timestamp
      text: text,
      reply_broadcast: false     // Don't send to channel
    });

    console.log('✅ Thread reply sent');
    return result;
  } catch (error) {
    console.error('❌ Thread reply failed:', error.message);
    return null;
  }
}

// STEP 13: Update a message
async function updateMessage(channel, timestamp, newText) {
  try {
    const result = await slack.chat.update({
      channel: channel,
      ts: timestamp,              // Message to update
      text: newText,
      as_user: true
    });

    console.log('✅ Message updated');
    return result;
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    return null;
  }
}

// STEP 14: Delete a message
async function deleteMessage(channel, timestamp) {
  try {
    const result = await slack.chat.delete({
      channel: channel,
      ts: timestamp,
      as_user: true
    });

    console.log('✅ Message deleted');
    return result;
  } catch (error) {
    console.error('❌ Delete failed:', error.message);
    return null;
  }
}

// STEP 15: Get user info
async function getUserInfo(userId) {
  try {
    const result = await slack.users.info({
      user: userId
    });

    console.log('👤 User Info:');
    console.log('  Name:', result.user.real_name);
    console.log('  Email:', result.user.profile.email);
    console.log('  Status:', result.user.profile.status_text);

    return result.user;
  } catch (error) {
    console.error('❌ Get user failed:', error.message);
    return null;
  }
}

// STEP 16: Set bot status
async function setStatus(statusText, statusEmoji) {
  try {
    const result = await slack.users.profile.set({
      profile: {
        status_text: statusText,
        status_emoji: statusEmoji,
        status_expiration: 0      // Never expire
      }
    });

    console.log('✅ Status updated');
    return result;
  } catch (error) {
    console.error('❌ Set status failed:', error.message);
    return null;
  }
}

// STEP 17: Send rich formatted message with blocks
async function sendRichMessage(channel) {
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Legacy Wine & Liquor* - Daily Report'
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: '*Sales Today:*\n$2,450'
        },
        {
          type: 'mrkdwn',
          text: '*Customers:*\n47'
        }
      ]
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Details'
          },
          url: 'https://legacywineandliquor.com'
        }
      ]
    }
  ];

  return await sendMessage(channel, 'Daily Report', blocks);
}

// STEP 18: Main execution
async function main() {
  console.log('🚀 SLACK API CONNECTION DEMO\n');
  console.log('Configuration:');
  console.log('  Token:', SLACK_BOT_TOKEN?.substring(0, 20) + '...');
  console.log('  Channel:', SLACK_CHANNEL);
  console.log('');

  // Test connection
  const connected = await testConnection();
  if (!connected) return;

  // List available channels
  await listChannels();

  // Send a test message
  await sendMessage(SLACK_CHANNEL, 'Hello from Slack API integration! 👋');

  // Read recent messages
  await readChannelHistory(SLACK_CHANNEL, 5);

  // Send rich formatted message
  await sendRichMessage(SLACK_CHANNEL);
}

// STEP 18.5: Class wrapper for unified interface
class SlackAPI {
  async testConnection() {
    return testConnection();
  }

  async sendMessage(channel, text, blocks) {
    return sendMessage(channel, text, blocks);
  }

  async listChannels() {
    return listChannels();
  }

  async readChannelHistory(channelId, limit = 10) {
    return readChannelHistory(channelId, limit);
  }

  async sendRichMessage(channel) {
    return sendRichMessage(channel);
  }

  async addReaction(channel, timestamp, emoji) {
    return addReaction(channel, timestamp, emoji);
  }

  async getReactions(channel, timestamp) {
    return getReactions(channel, timestamp);
  }

  async uploadFile(channel, filePath, title) {
    return uploadFile(channel, filePath, title);
  }

  async replyInThread(channel, threadTs, text) {
    return replyInThread(channel, threadTs, text);
  }

  async updateMessage(channel, timestamp, text) {
    return updateMessage(channel, timestamp, text);
  }

  async deleteMessage(channel, timestamp) {
    return deleteMessage(channel, timestamp);
  }

  async getUserInfo(userId) {
    return getUserInfo(userId);
  }

  async setStatus(statusText, statusEmoji) {
    return setStatus(statusText, statusEmoji);
  }
}

// STEP 19: Export functions for use in other files
export {
  testConnection,
  sendMessage,
  listChannels,
  readChannelHistory,
  addReaction,
  getReactions,
  uploadFile,
  replyInThread,
  updateMessage,
  deleteMessage,
  getUserInfo,
  setStatus,
  sendRichMessage
};

export default SlackAPI;

// STEP 20: Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
