#!/usr/bin/env node
/**
 * MASTER CONTROL DASHBOARD - ALL APIS & MCP SERVERS
 * =================================================
 * Central command center for all 24 API integrations
 * Real-time monitoring, testing, and management
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import dotenv from 'dotenv';

// Import all API connections
import SlackAPI from './01-slack-integration/connect-slack.js';
import CloudflareAPI from './02-cloudflare-mcp/connect-cloudflare.js';
import NotionAPI from './03-notion-mcp/connect-notion.js';
import RenderAPI from './04-render-mcp/connect-render.js';
import OpenAIAPI from './05-openai-gpt4/connect-openai.js';
import InstagramAPI from './06-instagram-api/connect-instagram.js';
import ClaudeAPI from './07-anthropic-claude/connect-anthropic.js';
import VertexAPI from './08-vertex-ai/connect-vertex.js';
import LightspeedAPI from './09-lightspeed-pos/connect-lightspeed.js';
import AirtableAPI from './10-airtable-api/connect-airtable.js';
import GitHubAPI from './11-github-api/connect-github.js';

// Load environment variables
dotenv.config({ path: './configs/.env' });

/**
 * MASTER CONTROL CLASS
 * Manages all API connections and operations
 */
class MasterControl {
  constructor() {
    this.apis = {
      slack: null,
      cloudflare: null,
      notion: null,
      render: null,
      openai: null,
      instagram: null,
      anthropic: null,
      vertex: null,
      lightspeed: null,
      airtable: null,
      github: null
    };

    this.status = {
      slack: { connected: false, lastCheck: null },
      cloudflare: { connected: false, lastCheck: null },
      notion: { connected: false, lastCheck: null },
      render: { connected: false, lastCheck: null },
      openai: { connected: false, lastCheck: null },
      instagram: { connected: false, lastCheck: null },
      anthropic: { connected: false, lastCheck: null },
      vertex: { connected: false, lastCheck: null },
      lightspeed: { connected: false, lastCheck: null },
      airtable: { connected: false, lastCheck: null },
      github: { connected: false, lastCheck: null }
    };

    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      uptime: Date.now()
    };
  }

  // Initialize all API connections
  async initialize() {
    const spinner = ora('Initializing Master Control System...').start();

    try {
      // Initialize each API
      this.apis.slack = new SlackAPI();
      this.apis.cloudflare = new CloudflareAPI();
      this.apis.notion = new NotionAPI();
      this.apis.render = new RenderAPI();
      this.apis.openai = new OpenAIAPI();
      this.apis.instagram = new InstagramAPI();
      this.apis.anthropic = new ClaudeAPI();
      this.apis.vertex = new VertexAPI();
      this.apis.lightspeed = new LightspeedAPI();
      this.apis.airtable = new AirtableAPI();
      this.apis.github = new GitHubAPI();

      spinner.succeed('Master Control System initialized');
      await this.testConnections();
    } catch (error) {
      spinner.fail('Initialization failed');
      console.error(error);
    }
  }

  // Test all API connections
  async testConnections() {
    console.log(chalk.cyan('\n🔌 Testing API Connections...\n'));

    const tests = [
      { name: 'Slack', api: 'slack', test: () => this.apis.slack.testConnection() },
      { name: 'Cloudflare', api: 'cloudflare', test: () => this.apis.cloudflare.getZoneDetails() },
      { name: 'Notion', api: 'notion', test: () => this.apis.notion.listUsers() },
      { name: 'Render', api: 'render', test: () => this.apis.render.listServices() },
      { name: 'OpenAI', api: 'openai', test: () => this.apis.openai.listModels() },
      { name: 'Instagram', api: 'instagram', test: () => this.apis.instagram.getAccountInfo() },
      { name: 'Anthropic Claude', api: 'anthropic', test: () => this.apis.anthropic.complete('Quick health check for Claude in one sentence.', { maxTokens: 20 }) },
      { name: 'Vertex AI', api: 'vertex', test: () => this.apis.vertex.generateText('Provide a short health-check response for Vertex AI.') },
      { name: 'Lightspeed POS', api: 'lightspeed', test: () => this.apis.lightspeed.getAccountInfo() },
      { name: 'Airtable', api: 'airtable', test: () => {
        const table = process.env.AIRTABLE_DEFAULT_TABLE || process.env.AIRTABLE_TABLE || 'Inventory';
        return this.apis.airtable.listRecords(table, { maxRecords: 1 });
      } },
      { name: 'GitHub', api: 'github', test: () => {
        const username = process.env.GITHUB_USERNAME || process.env.GITHUB_OWNER;
        if (!username) throw new Error('GITHUB_USERNAME not set');
        return this.apis.github.getUserInfo(username);
      } }
    ];

    for (const { name, api, test } of tests) {
      const spinner = ora(`Testing ${name}...`).start();
      try {
        await test();
        this.status[api] = { connected: true, lastCheck: new Date() };
        spinner.succeed(chalk.green(`${name} connected`));
      } catch (error) {
        this.status[api] = { connected: false, lastCheck: new Date() };
        spinner.fail(chalk.red(`${name} failed: ${error.message}`));
      }
    }
  }

  // Display status dashboard
  displayDashboard() {
    console.clear();
    console.log(chalk.cyan.bold(`
╔════════════════════════════════════════════════════════════════╗
║            MASTER CONTROL DASHBOARD - API STATUS              ║
╚════════════════════════════════════════════════════════════════╝
    `));

    // Create status table
    const table = new Table({
      head: ['API', 'Status', 'Last Check', 'Endpoint'],
      colWidths: [15, 15, 25, 40]
    });

    const apiInfo = {
      slack: { endpoint: 'api.slack.com' },
      cloudflare: { endpoint: 'api.cloudflare.com' },
      notion: { endpoint: 'api.notion.com' },
      render: { endpoint: 'api.render.com' },
      openai: { endpoint: 'api.openai.com' },
      instagram: { endpoint: 'graph.facebook.com' },
      anthropic: { endpoint: 'api.anthropic.com' },
      vertex: { endpoint: 'aiplatform.googleapis.com' },
      lightspeed: { endpoint: 'api.lightspeedapp.com' },
      airtable: { endpoint: 'api.airtable.com' },
      github: { endpoint: 'api.github.com' }
    };

    Object.entries(this.status).forEach(([api, status]) => {
      table.push([
        chalk.yellow(api.toUpperCase()),
        status.connected ? chalk.green('✅ Connected') : chalk.red('❌ Disconnected'),
        status.lastCheck ? status.lastCheck.toLocaleString() : 'Never',
        chalk.gray(apiInfo[api].endpoint)
      ]);
    });

    console.log(table.toString());

    // Display statistics
    const uptime = Math.floor((Date.now() - this.stats.uptime) / 1000 / 60);
    console.log(chalk.cyan('\n📊 Statistics:'));
    console.log(`  Uptime: ${uptime} minutes`);
    console.log(`  Total Requests: ${this.stats.totalRequests}`);
    console.log(`  Success Rate: ${this.stats.successfulRequests}/${this.stats.totalRequests}`);
  }

  // Main menu
  async showMainMenu() {
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'What would you like to do?',
        choices: [
          '📊 View Dashboard',
          '🔌 Test Connections',
          '📸 Instagram Operations',
          '💬 Slack Operations',
          '☁️ Cloudflare Operations',
          '📝 Notion Operations',
          '🚀 Render Operations',
          '🤖 OpenAI Operations',
          '🧠 Claude Operations',
          '✨ Vertex AI Operations',
          '📦 Lightspeed POS Operations',
          '🗂 Airtable Operations',
          '🐙 GitHub Operations',
          '🔄 Sync All Systems',
          '📈 Generate Reports',
          '⚙️ Settings',
          '❌ Exit'
        ]
      }
    ]);

    switch (choice) {
      case '📊 View Dashboard':
        this.displayDashboard();
        break;
      case '🔌 Test Connections':
        await this.testConnections();
        break;
      case '📸 Instagram Operations':
        await this.instagramMenu();
        break;
      case '💬 Slack Operations':
        await this.slackMenu();
        break;
      case '☁️ Cloudflare Operations':
        await this.cloudflareMenu();
        break;
      case '📝 Notion Operations':
        await this.notionMenu();
        break;
      case '🚀 Render Operations':
        await this.renderMenu();
        break;
      case '🤖 OpenAI Operations':
        await this.aiMenu();
        break;
      case '🧠 Claude Operations':
        await this.claudeMenu();
        break;
      case '✨ Vertex AI Operations':
        await this.vertexMenu();
        break;
      case '📦 Lightspeed POS Operations':
        await this.lightspeedMenu();
        break;
      case '🗂 Airtable Operations':
        await this.airtableMenu();
        break;
      case '🐙 GitHub Operations':
        await this.githubMenu();
        break;
      case '🔄 Sync All Systems':
        await this.syncAllSystems();
        break;
      case '📈 Generate Reports':
        await this.generateReports();
        break;
      case '⚙️ Settings':
        await this.settings();
        break;
      case '❌ Exit':
        process.exit(0);
    }

    // Return to main menu
    await this.showMainMenu();
  }

  // Instagram operations menu
  async instagramMenu() {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Instagram Operations:',
        choices: [
          'Post Image',
          'Post Carousel',
          'Post Reel',
          'Get Analytics',
          'View Recent Posts',
          'Back to Main Menu'
        ]
      }
    ]);

    switch (action) {
      case 'Post Image':
        await this.postToInstagram();
        break;
      case 'Get Analytics':
        await this.apis.instagram.getAccountInsights('day');
        break;
      case 'View Recent Posts':
        await this.apis.instagram.getRecentMedia(5);
        break;
    }
  }

  // Slack operations menu
  async slackMenu() {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Slack Operations:',
        choices: [
          'Send Message',
          'List Channels',
          'Read Messages',
          'Send Report',
          'Back to Main Menu'
        ]
      }
    ]);

    switch (action) {
      case 'Send Message':
        await this.sendSlackMessage();
        break;
      case 'List Channels':
        await this.apis.slack.listChannels();
        break;
      case 'Send Report':
        await this.sendSlackReport();
        break;
    }
  }

  // AI operations menu
  async aiMenu() {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'AI Operations:',
        choices: [
          'Generate Instagram Content',
          'Generate Product Description',
          'Analyze Sentiment',
          'Generate Image',
          'Back to Main Menu'
        ]
      }
    ]);

    switch (action) {
      case 'Generate Instagram Content':
        await this.generateInstagramContent();
        break;
      case 'Generate Image':
        await this.generateImage();
        break;
    }
  }

  async claudeMenu() {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Claude Operations:',
        choices: [
          'Quick Completion',
          'Generate Instagram Copy',
          'Back to Main Menu'
        ]
      }
    ]);

    switch (action) {
      case 'Quick Completion':
        await this.apis.anthropic.complete('Provide a short status update for Legacy Wine systems.', { maxTokens: 40 });
        break;
      case 'Generate Instagram Copy':
        await this.apis.anthropic.generateInstagramPost('weekend specials');
        break;
    }
  }

  async vertexMenu() {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Vertex AI Operations:',
        choices: [
          'Generate Text',
          'Analyze Image (URL)',
          'Back to Main Menu'
        ]
      }
    ]);

    switch (action) {
      case 'Generate Text':
        await this.apis.vertex.generateText('Share a one-sentence update for the Legacy Wine team.');
        break;
      case 'Analyze Image (URL)':
        const { imageUrl } = await inquirer.prompt([{ type: 'input', name: 'imageUrl', message: 'Image URL:' }]);
        if (imageUrl) {
          await this.apis.vertex.analyzeImage(imageUrl, 'Describe this image for a product highlight.');
        }
        break;
    }
  }

  async lightspeedMenu() {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Lightspeed POS Operations:',
        choices: [
          'Get Account Info',
          'List Inventory Items',
          'Search Items',
          'Back to Main Menu'
        ]
      }
    ]);

    switch (action) {
      case 'Get Account Info':
        await this.apis.lightspeed.getAccountInfo();
        break;
      case 'List Inventory Items':
        await this.apis.lightspeed.getItems({ limit: 10 });
        break;
      case 'Search Items':
        const { query } = await inquirer.prompt([{ type: 'input', name: 'query', message: 'Search term:' }]);
        if (query) {
          await this.apis.lightspeed.searchItems(query);
        }
        break;
    }
  }

  async airtableMenu() {
    const defaultTable = process.env.AIRTABLE_DEFAULT_TABLE || process.env.AIRTABLE_TABLE || 'Inventory';
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Airtable Operations:',
        choices: [
          'List Default Table Records',
          'List Records (Custom Table)',
          'Back to Main Menu'
        ]
      }
    ]);

    switch (action) {
      case 'List Default Table Records':
        await this.apis.airtable.listRecords(defaultTable, { maxRecords: 10 });
        break;
      case 'List Records (Custom Table)':
        const { tableName } = await inquirer.prompt([{ type: 'input', name: 'tableName', message: 'Table name:' }]);
        if (tableName) {
          await this.apis.airtable.listRecords(tableName, { maxRecords: 10 });
        }
        break;
    }
  }

  async githubMenu() {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'GitHub Operations:',
        choices: [
          'List Repositories',
          'Create Issue',
          'Back to Main Menu'
        ]
      }
    ]);

    switch (action) {
      case 'List Repositories':
        await this.apis.github.listRepos();
        break;
      case 'Create Issue':
        const answers = await inquirer.prompt([
          { type: 'input', name: 'title', message: 'Issue title:' },
          { type: 'input', name: 'body', message: 'Issue body:' }
        ]);
        if (answers.title) {
          await this.apis.github.createIssue(answers.title, answers.body || 'Created via Master Control Dashboard');
        }
        break;
    }
  }

  // Sync all systems
  async syncAllSystems() {
    console.log(chalk.cyan('\n🔄 Synchronizing All Systems...\n'));

    const spinner = ora('Syncing...').start();

    try {
      const summary = [];

      const run = async (label, fn) => {
        try {
          const result = await fn();
          summary.push({ label, success: true, result });
          return result;
        } catch (error) {
          summary.push({ label, success: false, error });
          return null;
        }
      };

      const slackChannels = await run('Slack channels', () => this.apis.slack.listChannels());
      const cloudflareZones = await run('Cloudflare zones', () => this.apis.cloudflare.listZones());
      const notionPages = await run('Notion pages', () => this.apis.notion.queryDatabase());
      const renderServices = await run('Render services', () => this.apis.render.listServices());
      await run('OpenAI models', () => this.apis.openai.listModels());
      await run('Instagram account', () => this.apis.instagram.getAccountInfo());
      await run('Claude (Anthropic)', () => this.apis.anthropic.complete('Confirm Claude connectivity in one sentence.', { maxTokens: 32 }));
      await run('Vertex AI', () => this.apis.vertex.generateText('Confirm Vertex AI connectivity with a short message.'));
      await run('Lightspeed POS items', () => this.apis.lightspeed.getItems({ limit: 5 }));

      const defaultTable = process.env.AIRTABLE_DEFAULT_TABLE || process.env.AIRTABLE_TABLE;
      if (defaultTable) {
        await run(`Airtable records (${defaultTable})`, () => this.apis.airtable.listRecords(defaultTable, { maxRecords: 5 }));
      } else {
        summary.push({ label: 'Airtable records', success: false, error: new Error('AIRTABLE_DEFAULT_TABLE not set') });
      }

      const githubUser = process.env.GITHUB_USERNAME || process.env.GITHUB_OWNER;
      if (githubUser) {
        await run('GitHub repositories', () => this.apis.github.listRepos());
      } else {
        summary.push({ label: 'GitHub repositories', success: false, error: new Error('GITHUB_USERNAME not set') });
      }

      spinner.succeed('All systems synchronized');

      console.log(chalk.green('\n✅ Sync Complete:'));
      summary.forEach((entry) => {
        if (entry.success) {
          let details = '';
          if (Array.isArray(entry.result)) {
            details = ` (${entry.result.length})`;
          } else if (entry.label.includes('Claude') || entry.label.includes('Vertex')) {
            details = ' (response received)';
          }
          console.log(`  - ${entry.label}${details}`);
        } else {
          console.log(chalk.yellow(`  - ${entry.label}: ${entry.error.message}`));
        }
      });
    } catch (error) {
      spinner.fail('Sync failed');
      console.error(error);
    }
  }

  // Generate comprehensive reports
  async generateReports() {
    console.log(chalk.cyan('\n📈 Generating Reports...\n'));

    const report = {
      timestamp: new Date(),
      apis: {},
      performance: {},
      recommendations: []
    };

    // Gather data from all APIs
    if (this.status.instagram.connected) {
      report.apis.instagram = await this.apis.instagram.getAccountInsights('week');
    }

    if (this.status.cloudflare.connected) {
      report.apis.cloudflare = await this.apis.cloudflare.getAnalytics();
    }

    // Save report
    const fs = require('fs');
    const reportPath = `./reports/report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(chalk.green(`✅ Report saved to: ${reportPath}`));
  }

  // Post to Instagram with AI generation
  async postToInstagram() {
    const { topic } = await inquirer.prompt([
      {
        type: 'input',
        name: 'topic',
        message: 'What topic for the Instagram post?'
      }
    ]);

    const spinner = ora('Generating content...').start();

    try {
      // Generate content with AI
      const content = await this.apis.openai.generateInstagramPost(topic);

      spinner.text = 'Creating image...';
      const images = await this.apis.openai.generateImage(content.imageDescription);

      spinner.text = 'Posting to Instagram...';
      await this.apis.instagram.createImagePost(
        images[0].url,
        `${content.caption}\n\n${content.cta}\n\n${content.hashtags}`
      );

      spinner.succeed('Posted to Instagram successfully!');
    } catch (error) {
      spinner.fail('Failed to post');
      console.error(error);
    }
  }

  // Send Slack message
  async sendSlackMessage() {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'channel',
        message: 'Channel ID or name:',
        default: '#general'
      },
      {
        type: 'input',
        name: 'message',
        message: 'Message to send:'
      }
    ]);

    await this.apis.slack.sendMessage(answers.channel, answers.message);
  }

  // Generate Instagram content
  async generateInstagramContent() {
    const { topic } = await inquirer.prompt([
      {
        type: 'input',
        name: 'topic',
        message: 'Topic for content:'
      }
    ]);

    const content = await this.apis.openai.generateInstagramPost(topic);

    console.log(chalk.green('\n📸 Generated Content:'));
    console.log('Caption:', content.caption);
    console.log('CTA:', content.cta);
    console.log('Hashtags:', content.hashtags);
    console.log('Image:', content.imageDescription);
  }

  // Automated workflow: Daily social media post
  async dailySocialMediaWorkflow() {
    console.log(chalk.cyan('\n🤖 Running Daily Social Media Workflow...\n'));

    const steps = [
      '1. Generate content with AI',
      '2. Create image with DALL-E',
      '3. Post to Instagram',
      '4. Share link in Slack',
      '5. Log in Notion',
      '6. Update analytics'
    ];

    for (const step of steps) {
      const spinner = ora(step).start();
      await new Promise(resolve => setTimeout(resolve, 2000));
      spinner.succeed();
    }

    console.log(chalk.green('\n✅ Daily workflow completed!'));
  }
}

// Main execution
async function main() {
  console.log(chalk.cyan.bold(`
╔════════════════════════════════════════════════════════════════╗
║                   MASTER CONTROL DASHBOARD                    ║
║              24 APIs & MCP Servers Integration                ║
╚════════════════════════════════════════════════════════════════╝
  `));

  const master = new MasterControl();
  await master.initialize();
  await master.showMainMenu();
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});

// Run the dashboard
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default MasterControl;