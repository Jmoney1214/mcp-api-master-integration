#!/usr/bin/env node
/**
 * AUTOMATED DEPLOY TO RENDER
 * ==========================
 * Deploy Claude Slack Bot to Render with one command
 */

import RenderAPI from '../04-render-mcp/connect-render.js';
import dotenv from 'dotenv';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';

dotenv.config({ path: '../configs/.env' });

async function deploy() {
  console.log(chalk.cyan.bold(`
╔════════════════════════════════════════════════════════════╗
║         CLAUDE SLACK BOT - RENDER DEPLOYMENT              ║
╚════════════════════════════════════════════════════════════╝
  `));

  // Prompt for deployment details
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'githubRepo',
      message: 'GitHub repository URL (e.g., github.com/user/repo):',
      validate: input => input.includes('github.com') || 'Please enter a valid GitHub URL'
    },
    {
      type: 'input',
      name: 'branch',
      message: 'Branch to deploy:',
      default: 'main'
    },
    {
      type: 'list',
      name: 'plan',
      message: 'Render plan:',
      choices: ['free', 'starter', 'standard', 'pro'],
      default: 'starter'
    },
    {
      type: 'confirm',
      name: 'setEnvVars',
      message: 'Set environment variables now?',
      default: true
    }
  ]);

  const spinner = ora('Deploying to Render...').start();

  try {
    const render = new RenderAPI();

    // Prepare service configuration
    const serviceConfig = {
      name: 'claude-slack-bot',
      repo: answers.githubRepo.startsWith('https://') ?
        answers.githubRepo :
        `https://${answers.githubRepo}`,
      branch: answers.branch,
      runtime: 'node',
      region: 'oregon',
      plan: answers.plan,
      buildCommand: 'cd claude-slack-bot && npm install',
      startCommand: 'cd claude-slack-bot && npm start',
      autoDeploy: true
    };

    // Add environment variables if requested
    if (answers.setEnvVars) {
      spinner.text = 'Setting environment variables...';

      serviceConfig.envVars = [
        {
          key: 'NODE_ENV',
          value: 'production'
        },
        {
          key: 'SLACK_BOT_TOKEN',
          value: process.env.SLACK_BOT_TOKEN || ''
        },
        {
          key: 'SLACK_APP_TOKEN',
          value: process.env.SLACK_APP_TOKEN || ''
        },
        {
          key: 'SLACK_SIGNING_SECRET',
          value: process.env.SLACK_SIGNING_SECRET || ''
        },
        {
          key: 'ANTHROPIC_API_KEY',
          value: process.env.ANTHROPIC_API_KEY || ''
        },
        {
          key: 'PORT',
          value: '10000'
        }
      ].filter(env => env.value); // Remove empty values
    }

    // Create service on Render
    spinner.text = 'Creating Render service...';
    const service = await render.createWebService(serviceConfig);

    if (!service) {
      throw new Error('Failed to create service');
    }

    spinner.succeed(chalk.green('🎉 Deployment successful!'));

    console.log(chalk.cyan('\n📊 Service Details:'));
    console.log(`  Name: ${service.name}`);
    console.log(`  ID: ${service.id}`);
    console.log(`  URL: ${service.serviceDetails?.url || 'Pending...'}`);
    console.log(`  Plan: ${service.plan}`);
    console.log(`  Region: ${service.region}`);

    console.log(chalk.yellow('\n⚠️  Important Next Steps:'));
    console.log('  1. Wait for initial deployment (5-10 minutes)');
    console.log('  2. Verify environment variables in Render dashboard');
    console.log('  3. Check service logs for any errors');
    console.log('  4. Test bot in Slack by mentioning @claude');

    console.log(chalk.cyan('\n🔗 Quick Links:'));
    console.log(`  Dashboard: https://dashboard.render.com/web/${service.id}`);
    console.log(`  Logs: https://dashboard.render.com/web/${service.id}/logs`);
    console.log(`  Health: ${service.serviceDetails?.url}/health`);

    console.log(chalk.green('\n✅ Bot will be live in ~5-10 minutes!'));
    console.log(chalk.gray('   Try messaging @claude in Slack once deployment completes.\n'));

  } catch (error) {
    spinner.fail(chalk.red('Deployment failed'));
    console.error(chalk.red(`\n❌ Error: ${error.message}`));

    if (error.response?.data) {
      console.error(chalk.gray('\nAPI Response:'), error.response.data);
    }

    console.log(chalk.yellow('\n💡 Troubleshooting:'));
    console.log('  1. Verify GitHub repository is public or Render has access');
    console.log('  2. Check that render.yaml exists in your repo');
    console.log('  3. Ensure environment variables are set');
    console.log('  4. Try manual deployment via Render dashboard');

    process.exit(1);
  }
}

// Check prerequisites
async function checkPrerequisites() {
  console.log(chalk.cyan('🔍 Checking prerequisites...\n'));

  const checks = [];

  // Check RENDER_API_KEY
  if (!process.env.RENDER_API_KEY) {
    checks.push('❌ RENDER_API_KEY not set');
  } else {
    checks.push('✅ RENDER_API_KEY found');
  }

  // Check Slack tokens
  if (!process.env.SLACK_BOT_TOKEN) {
    checks.push('⚠️  SLACK_BOT_TOKEN not set (can set later in Render)');
  } else {
    checks.push('✅ SLACK_BOT_TOKEN found');
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    checks.push('⚠️  ANTHROPIC_API_KEY not set (can set later in Render)');
  } else {
    checks.push('✅ ANTHROPIC_API_KEY found');
  }

  checks.forEach(check => console.log(check));

  if (checks.some(c => c.startsWith('❌'))) {
    console.log(chalk.red('\n❌ Missing required credentials!'));
    console.log(chalk.yellow('\nPlease set in ../configs/.env:'));
    console.log('  RENDER_API_KEY=your_render_api_key');
    process.exit(1);
  }

  console.log(chalk.green('\n✅ All checks passed!\n'));
}

// Main execution
async function main() {
  await checkPrerequisites();
  await deploy();
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
