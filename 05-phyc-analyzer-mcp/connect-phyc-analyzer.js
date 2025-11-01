#!/usr/bin/env node
/**
 * PHYC ANALYZER MCP - SALES & CUSTOMER INTELLIGENCE
 * ==================================================
 * Line-by-line guide to Phyc Analyzer integration
 * Sales data, repeat customers, analytics, AI-powered insights
 */

// STEP 1: Import required packages
import { exec } from 'child_process';               // Execute scripts
import { promisify } from 'util';                   // Promise wrapper
import fs from 'fs';                                // File system
import path from 'path';                            // Path handling
import dotenv from 'dotenv';                        // Environment variables

// STEP 2: Load environment variables
dotenv.config({ path: '../configs/.env' });

// STEP 3: Configuration
const PHYC_ANALYZER_PATH = process.env.PHYC_ANALYZER_PATH || '/Users/justinetwaru/Desktop/Phyc Analyzer agent';
const LIGHTSPEED_TOKEN_PATH = `${PHYC_ANALYZER_PATH}/config/lightspeed-token.txt`;
const REPORTS_PATH = `${PHYC_ANALYZER_PATH}/reports`;

// Promisify exec for async/await
const execAsync = promisify(exec);

// STEP 4: Phyc Analyzer MCP class
class PhycAnalyzerMCP {
  constructor() {
    this.analyzerPath = PHYC_ANALYZER_PATH;
    this.reportsPath = REPORTS_PATH;
  }

  // STEP 5: Get today's sales (from live-transactions-today.js)
  async getTodaySales() {
    try {
      console.log('📊 Fetching today\'s sales...');

      const { stdout, stderr } = await execAsync(
        `cd "${this.analyzerPath}" && node live-transactions-today.js`,
        { maxBuffer: 1024 * 1024 * 10 } // 10MB buffer for large outputs
      );

      if (stderr) console.error('Warning:', stderr);

      // Parse the output to extract key metrics
      const lines = stdout.split('\n');
      const metrics = this.parseSalesSummary(lines);

      console.log('✅ Today\'s sales retrieved');
      return {
        success: true,
        data: metrics,
        rawOutput: stdout
      };
    } catch (error) {
      console.error('❌ Failed to get today\'s sales:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // STEP 6: Get repeat customers (from find-repeat-customers.js)
  async getRepeatCustomers() {
    try {
      console.log('🔍 Analyzing repeat customers (last 3 months)...');

      const { stdout, stderr } = await execAsync(
        `cd "${this.analyzerPath}" && node find-repeat-customers.js`,
        { maxBuffer: 1024 * 1024 * 10, timeout: 120000 } // 2 minute timeout
      );

      if (stderr) console.error('Warning:', stderr);

      // Read the generated JSON report
      const reportFiles = fs.readdirSync(this.reportsPath)
        .filter(f => f.startsWith('repeat-customers-'))
        .sort()
        .reverse();

      if (reportFiles.length === 0) {
        throw new Error('No repeat customer report found');
      }

      const latestReport = JSON.parse(
        fs.readFileSync(path.join(this.reportsPath, reportFiles[0]), 'utf8')
      );

      console.log('✅ Repeat customer analysis complete');
      return {
        success: true,
        data: latestReport,
        reportPath: reportFiles[0]
      };
    } catch (error) {
      console.error('❌ Failed to analyze repeat customers:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // STEP 7: Get at-risk customers (high-value customers who haven't purchased recently)
  async getAtRiskCustomers() {
    try {
      console.log('⚠️ Identifying at-risk customers...');

      const repeatData = await this.getRepeatCustomers();

      if (!repeatData.success) {
        throw new Error('Failed to load repeat customer data');
      }

      // Filter high-value at-risk customers (LTV > $200 and 30+ days since last purchase)
      const atRisk = repeatData.data.customers.filter(c =>
        c.totalSpent > 200 && c.daysSinceLast > 30
      );

      console.log(`✅ Found ${atRisk.length} at-risk customers`);
      return {
        success: true,
        data: atRisk,
        count: atRisk.length,
        totalValue: atRisk.reduce((sum, c) => sum + c.totalSpent, 0)
      };
    } catch (error) {
      console.error('❌ Failed to identify at-risk customers:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // STEP 8: Get VIP customers (10+ visits)
  async getVIPCustomers() {
    try {
      console.log('⭐ Identifying VIP customers...');

      const repeatData = await this.getRepeatCustomers();

      if (!repeatData.success) {
        throw new Error('Failed to load repeat customer data');
      }

      const vips = repeatData.data.customers.filter(c => c.visitCount >= 10);

      console.log(`✅ Found ${vips.length} VIP customers`);
      return {
        success: true,
        data: vips,
        count: vips.length,
        totalRevenue: vips.reduce((sum, c) => sum + c.totalSpent, 0)
      };
    } catch (error) {
      console.error('❌ Failed to identify VIP customers:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // STEP 9: Get customer by ID
  async getCustomerById(customerId) {
    try {
      console.log(`🔍 Looking up customer ID: ${customerId}...`);

      const repeatData = await this.getRepeatCustomers();

      if (!repeatData.success) {
        throw new Error('Failed to load repeat customer data');
      }

      const customer = repeatData.data.customers.find(c =>
        c.customerId === customerId || c.customerId === String(customerId)
      );

      if (!customer) {
        throw new Error(`Customer ${customerId} not found`);
      }

      console.log(`✅ Found customer: ${customer.name}`);
      return {
        success: true,
        data: customer
      };
    } catch (error) {
      console.error('❌ Customer lookup failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // STEP 10: Get sales summary for a specific date
  async getSalesByDate(dateStr) {
    try {
      console.log(`📅 Fetching sales for ${dateStr}...`);

      // Check if we have a saved report for that date
      const reportFile = `${this.reportsPath}/oct31-full-sales.json`; // Example

      if (fs.existsSync(reportFile)) {
        const salesData = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
        console.log('✅ Sales data loaded from report');
        return {
          success: true,
          data: salesData,
          source: 'cached_report'
        };
      }

      console.log('⚠️ No cached report found for that date');
      return {
        success: false,
        error: 'No cached report available'
      };
    } catch (error) {
      console.error('❌ Failed to get sales by date:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // STEP 11: Get customer segmentation data
  async getCustomerSegmentation() {
    try {
      console.log('📊 Getting customer segmentation...');

      const repeatData = await this.getRepeatCustomers();

      if (!repeatData.success) {
        throw new Error('Failed to load repeat customer data');
      }

      const segmentation = repeatData.data.segmentation;

      console.log('✅ Segmentation data retrieved');
      return {
        success: true,
        data: segmentation
      };
    } catch (error) {
      console.error('❌ Failed to get segmentation:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // STEP 12: Generate customer re-engagement list
  async generateReengagementList() {
    try {
      console.log('📧 Generating re-engagement list...');

      const atRisk = await this.getAtRiskCustomers();

      if (!atRisk.success) {
        throw new Error('Failed to get at-risk customers');
      }

      // Format for marketing campaigns
      const engagementList = atRisk.data.map(customer => ({
        customerId: customer.customerId,
        name: customer.name,
        email: customer.email,
        lifetimeValue: customer.totalSpent,
        lastPurchase: customer.lastVisit,
        daysSincePurchase: customer.daysSinceLast,
        avgOrderValue: customer.averageOrderValue,
        recommendedOffer: this.generateOfferRecommendation(customer)
      }));

      console.log('✅ Re-engagement list generated');
      return {
        success: true,
        data: engagementList,
        count: engagementList.length
      };
    } catch (error) {
      console.error('❌ Failed to generate re-engagement list:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // STEP 13: Get analytics dashboard data
  async getDashboardData() {
    try {
      console.log('📊 Generating dashboard data...');

      const [todaySales, repeatCustomers, atRisk, vips] = await Promise.all([
        this.getTodaySales(),
        this.getRepeatCustomers(),
        this.getAtRiskCustomers(),
        this.getVIPCustomers()
      ]);

      const dashboard = {
        today: todaySales.data || null,
        repeatCustomers: {
          total: repeatCustomers.data?.summary?.totalRepeatCustomers || 0,
          revenue: repeatCustomers.data?.summary?.totalRepeatRevenue || 0,
          avgLifetimeValue: repeatCustomers.data?.summary?.avgLifetimeValue || 0
        },
        atRisk: {
          count: atRisk.count || 0,
          value: atRisk.totalValue || 0
        },
        vips: {
          count: vips.count || 0,
          revenue: vips.totalRevenue || 0
        },
        generatedAt: new Date().toISOString()
      };

      console.log('✅ Dashboard data ready');
      return {
        success: true,
        data: dashboard
      };
    } catch (error) {
      console.error('❌ Failed to generate dashboard:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // STEP 14: Export customer data for external use
  async exportCustomerData(format = 'json') {
    try {
      console.log(`📤 Exporting customer data as ${format}...`);

      const repeatData = await this.getRepeatCustomers();

      if (!repeatData.success) {
        throw new Error('Failed to load customer data');
      }

      const exportPath = path.join(this.reportsPath, `customer-export-${Date.now()}.${format}`);

      if (format === 'json') {
        fs.writeFileSync(exportPath, JSON.stringify(repeatData.data, null, 2));
      } else if (format === 'csv') {
        const csv = this.convertToCSV(repeatData.data.customers);
        fs.writeFileSync(exportPath, csv);
      }

      console.log(`✅ Exported to: ${exportPath}`);
      return {
        success: true,
        exportPath: exportPath
      };
    } catch (error) {
      console.error('❌ Export failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // STEP 15: Helper - Parse sales summary from output
  parseSalesSummary(lines) {
    const metrics = {};

    for (const line of lines) {
      if (line.includes('Total Sales:')) {
        metrics.totalSales = parseInt(line.match(/\d+/)?.[0]) || 0;
      }
      if (line.includes('Total Items:')) {
        metrics.totalItems = parseInt(line.match(/\d+/)?.[0]) || 0;
      }
      if (line.includes('Total Revenue:')) {
        metrics.totalRevenue = parseFloat(line.match(/\$[\d,]+\.?\d*/)?.[0]?.replace(/[$,]/g, '')) || 0;
      }
      if (line.includes('Total Profit:')) {
        metrics.totalProfit = parseFloat(line.match(/\$[\d,]+\.?\d*/)?.[0]?.replace(/[$,]/g, '')) || 0;
      }
      if (line.includes('Profit Margin:')) {
        metrics.profitMargin = parseFloat(line.match(/[\d.]+%/)?.[0]?.replace('%', '')) || 0;
      }
      if (line.includes('Average Sale:')) {
        metrics.averageSale = parseFloat(line.match(/\$[\d,]+\.?\d*/)?.[0]?.replace(/[$,]/g, '')) || 0;
      }
    }

    return metrics;
  }

  // STEP 16: Helper - Generate offer recommendation based on customer profile
  generateOfferRecommendation(customer) {
    if (customer.totalSpent > 1000) {
      return 'VIP: 20% off next purchase + free delivery';
    } else if (customer.totalSpent > 500) {
      return '15% off + complimentary gift';
    } else if (customer.visitCount >= 5) {
      return 'Loyalty: Buy 2 get 1 free on select items';
    } else {
      return '10% off welcome back offer';
    }
  }

  // STEP 17: Helper - Convert customer data to CSV
  convertToCSV(customers) {
    const headers = [
      'Customer ID', 'Name', 'Email', 'Visit Count',
      'Total Spent', 'AOV', 'Last Visit', 'Days Since Last'
    ];

    const rows = customers.map(c => [
      c.customerId,
      c.name,
      c.email,
      c.visitCount,
      c.totalSpent.toFixed(2),
      c.averageOrderValue.toFixed(2),
      c.lastVisit,
      c.daysSinceLast
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  // STEP 18: Test connection
  async testConnection() {
    try {
      console.log('🔌 Testing Phyc Analyzer connection...');

      // Check if analyzer path exists
      if (!fs.existsSync(this.analyzerPath)) {
        throw new Error(`Analyzer path not found: ${this.analyzerPath}`);
      }

      // Check if token file exists
      if (!fs.existsSync(LIGHTSPEED_TOKEN_PATH)) {
        throw new Error('Lightspeed token not found');
      }

      // Try to read token
      const token = fs.readFileSync(LIGHTSPEED_TOKEN_PATH, 'utf8').trim();
      if (!token) {
        throw new Error('Lightspeed token is empty');
      }

      console.log('✅ Phyc Analyzer MCP connected');
      console.log(`  ↳ Path: ${this.analyzerPath}`);
      console.log(`  ↳ Reports: ${this.reportsPath}`);

      return {
        success: true,
        path: this.analyzerPath,
        reportsPath: this.reportsPath
      };
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// STEP 19: MCP configuration for Claude Desktop
export const mcpConfig = {
  name: 'phyc-analyzer',
  version: '1.0.0',
  description: 'Phyc Analyzer - Sales & Customer Intelligence MCP',
  tools: [
    {
      name: 'get_todays_sales',
      description: 'Get today\'s sales transactions and metrics',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    {
      name: 'get_repeat_customers',
      description: 'Analyze repeat customers from last 3 months',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    {
      name: 'get_at_risk_customers',
      description: 'Get high-value customers at risk of churning',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    {
      name: 'get_vip_customers',
      description: 'Get VIP customers (10+ visits)',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    {
      name: 'get_customer_by_id',
      description: 'Look up customer by ID',
      inputSchema: {
        type: 'object',
        properties: {
          customerId: {
            type: 'string',
            description: 'Customer ID to look up'
          }
        },
        required: ['customerId']
      }
    },
    {
      name: 'get_dashboard_data',
      description: 'Get comprehensive dashboard analytics',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    {
      name: 'generate_reengagement_list',
      description: 'Generate list of customers for re-engagement campaigns',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  ]
};

// STEP 20: Main execution (for testing)
async function main() {
  console.log('🚀 Phyc Analyzer MCP - Testing...\n');

  const phyc = new PhycAnalyzerMCP();

  // Test connection
  await phyc.testConnection();

  // Get dashboard data
  const dashboard = await phyc.getDashboardData();
  console.log('\n📊 Dashboard Data:', JSON.stringify(dashboard.data, null, 2));
}

// STEP 21: Export
export default PhycAnalyzerMCP;

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
