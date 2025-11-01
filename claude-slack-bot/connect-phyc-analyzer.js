#!/usr/bin/env node
/**
 * PHYC ANALYZER MCP - CLOUD VERSION
 * ==================================
 * Cloud-compatible sales & customer intelligence
 * Direct API calls, no local filesystem dependencies
 */

// Import required packages
import axios from 'axios';

// Configuration from environment variables
const LIGHTSPEED_ACCOUNT_ID = process.env.LIGHTSPEED_ACCOUNT_ID || '222537';
const LIGHTSPEED_ACCESS_TOKEN = process.env.LIGHTSPEED_ACCESS_TOKEN;
const LIGHTSPEED_API_BASE = `https://api.lightspeedapp.com/API/V3/Account/${LIGHTSPEED_ACCOUNT_ID}`;

// Axios instance for Lightspeed API
const lightspeedAPI = axios.create({
  baseURL: LIGHTSPEED_API_BASE,
  headers: {
    'Authorization': `Bearer ${LIGHTSPEED_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Helper: Get today's date range
function getTodayDateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  return {
    start: start.toISOString().slice(0, 19),
    end: end.toISOString().slice(0, 19)
  };
}

// Helper: Get date range for last N days
function getDateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  return {
    start: start.toISOString().slice(0, 19),
    end: end.toISOString().slice(0, 19)
  };
}

// Phyc Analyzer MCP Class
class PhycAnalyzerMCP {
  constructor() {
    this.accountId = LIGHTSPEED_ACCOUNT_ID;
  }

  // Test connection to Lightspeed API
  async testConnection() {
    try {
      if (!LIGHTSPEED_ACCESS_TOKEN) {
        return {
          success: false,
          message: 'Lightspeed access token not configured'
        };
      }

      // Test with a simple Sale query (limit 1) to verify API access
      const response = await lightspeedAPI.get('/Sale.json', {
        params: { limit: 1 }
      });

      return {
        success: true,
        message: 'Connected to Lightspeed API',
        accountName: `Account ${LIGHTSPEED_ACCOUNT_ID}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get today's sales
  async getTodaySales() {
    try {
      if (!LIGHTSPEED_ACCESS_TOKEN) {
        return {
          success: false,
          message: 'Lightspeed API token not configured. Set LIGHTSPEED_ACCESS_TOKEN environment variable.'
        };
      }

      console.log('📊 Fetching today\'s sales from Lightspeed API...');

      const { start, end } = getTodayDateRange();

      // Fetch today's sales
      const response = await lightspeedAPI.get('/Sale.json', {
        params: {
          timeStamp: `><,${start},${end}`,
          load_relations: '["Customer","SaleLines.Item"]',
          completed: 'true',
          limit: 100
        }
      });

      const sales = response.data.Sale || [];

      // Calculate metrics
      const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total || 0), 0);
      const totalProfit = sales.reduce((sum, sale) => sum + parseFloat(sale.calcTotal || 0) - parseFloat(sale.calcCost || 0), 0);
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;

      console.log(`✅ Retrieved ${sales.length} sales`);

      return {
        success: true,
        data: {
          count: sales.length,
          revenue: totalRevenue.toFixed(2),
          profit: totalProfit.toFixed(2),
          profitMargin: profitMargin.toFixed(2),
          sales: sales.map(s => ({
            id: s.saleID,
            total: parseFloat(s.total || 0).toFixed(2),
            customer: s.Customer?.firstName + ' ' + s.Customer?.lastName || 'Walk-in',
            time: s.completeTime
          }))
        }
      };
    } catch (error) {
      console.error('❌ Failed to get today\'s sales:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get repeat customers (last 90 days)
  async getRepeatCustomers() {
    try {
      if (!LIGHTSPEED_ACCESS_TOKEN) {
        return {
          success: false,
          message: 'Lightspeed API token not configured'
        };
      }

      console.log('🔍 Analyzing repeat customers (last 90 days)...');

      const { start, end } = getDateRange(90);

      // Fetch sales from last 90 days
      const response = await lightspeedAPI.get('/Sale.json', {
        params: {
          timeStamp: `><,${start},${end}`,
          load_relations: '["Customer"]',
          completed: 'true',
          limit: 100
        }
      });

      const sales = response.data.Sale || [];

      // Group by customer
      const customerMap = new Map();

      sales.forEach(sale => {
        const customerId = sale.customerID || 'walk-in';
        if (customerId === '0' || customerId === 'walk-in') return;

        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            customerId,
            name: sale.Customer ? `${sale.Customer.firstName} ${sale.Customer.lastName}` : 'Unknown',
            email: sale.Customer?.Contact?.Emails?.ContactEmail?.[0]?.address || '',
            purchases: [],
            totalSpent: 0,
            visitCount: 0
          });
        }

        const customer = customerMap.get(customerId);
        customer.purchases.push({
          date: sale.completeTime,
          amount: parseFloat(sale.total || 0)
        });
        customer.totalSpent += parseFloat(sale.total || 0);
        customer.visitCount++;
      });

      // Filter repeat customers (2+ purchases)
      const repeatCustomers = Array.from(customerMap.values())
        .filter(c => c.visitCount >= 2)
        .map(c => {
          const sortedPurchases = c.purchases.sort((a, b) => new Date(b.date) - new Date(a.date));
          const lastPurchase = sortedPurchases[0];
          const daysSinceLast = Math.floor((Date.now() - new Date(lastPurchase.date)) / (1000 * 60 * 60 * 24));

          return {
            ...c,
            lastPurchaseDate: lastPurchase.date,
            daysSinceLast,
            avgOrderValue: (c.totalSpent / c.visitCount).toFixed(2),
            segment: c.visitCount >= 10 ? 'VIP' : c.visitCount >= 5 ? 'Frequent' : c.visitCount >= 3 ? 'Occasional' : 'Two-time'
          };
        })
        .sort((a, b) => b.totalSpent - a.totalSpent);

      const totalRevenue = repeatCustomers.reduce((sum, c) => sum + c.totalSpent, 0);

      console.log(`✅ Found ${repeatCustomers.length} repeat customers`);

      return {
        success: true,
        data: {
          summary: {
            totalRepeatCustomers: repeatCustomers.length,
            totalRevenue: totalRevenue.toFixed(2),
            avgLifetimeValue: (totalRevenue / repeatCustomers.length).toFixed(2)
          },
          customers: repeatCustomers
        }
      };
    } catch (error) {
      console.error('❌ Failed to analyze repeat customers:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get at-risk customers
  async getAtRiskCustomers() {
    try {
      console.log('⚠️ Identifying at-risk customers...');

      const repeatData = await this.getRepeatCustomers();

      if (!repeatData.success) {
        return repeatData;
      }

      // Filter high-value at-risk customers (spent > $200 and 30+ days inactive)
      const atRisk = repeatData.data.customers.filter(c =>
        c.totalSpent > 200 && c.daysSinceLast > 30
      );

      const totalValue = atRisk.reduce((sum, c) => sum + c.totalSpent, 0);

      console.log(`✅ Found ${atRisk.length} at-risk customers`);

      return {
        success: true,
        data: atRisk,
        summary: {
          count: atRisk.length,
          totalValue: totalValue.toFixed(2),
          avgValue: atRisk.length > 0 ? (totalValue / atRisk.length).toFixed(2) : '0.00'
        }
      };
    } catch (error) {
      console.error('❌ Failed to identify at-risk customers:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get VIP customers
  async getVIPCustomers() {
    try {
      console.log('⭐ Identifying VIP customers...');

      const repeatData = await this.getRepeatCustomers();

      if (!repeatData.success) {
        return repeatData;
      }

      // Filter VIP customers (10+ visits or $1000+ spent)
      const vips = repeatData.data.customers.filter(c =>
        c.visitCount >= 10 || c.totalSpent >= 1000
      );

      const totalValue = vips.reduce((sum, c) => sum + c.totalSpent, 0);

      console.log(`✅ Found ${vips.length} VIP customers`);

      return {
        success: true,
        data: vips,
        summary: {
          count: vips.length,
          totalValue: totalValue.toFixed(2),
          avgValue: vips.length > 0 ? (totalValue / vips.length).toFixed(2) : '0.00'
        }
      };
    } catch (error) {
      console.error('❌ Failed to identify VIP customers:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get dashboard data (overview)
  async getDashboardData() {
    try {
      console.log('📊 Generating dashboard overview...');

      const [todaySales, repeatCustomers, atRisk, vips] = await Promise.all([
        this.getTodaySales(),
        this.getRepeatCustomers(),
        this.getAtRiskCustomers(),
        this.getVIPCustomers()
      ]);

      return {
        success: true,
        data: {
          todaySales: todaySales.success ? todaySales.data : null,
          repeatCustomers: repeatCustomers.success ? repeatCustomers.data.summary : null,
          atRiskCustomers: atRisk.success ? atRisk.summary : null,
          vipCustomers: vips.success ? vips.summary : null
        }
      };
    } catch (error) {
      console.error('❌ Failed to generate dashboard:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate reengagement list
  async generateReengagementList() {
    try {
      const atRisk = await this.getAtRiskCustomers();

      if (!atRisk.success) {
        return atRisk;
      }

      const reengagementList = atRisk.data.map(c => ({
        name: c.name,
        email: c.email,
        totalSpent: c.totalSpent,
        lastPurchase: c.lastPurchaseDate,
        daysSinceLast: c.daysSinceLast,
        suggestedOffer: c.totalSpent > 500 ? '20% off next purchase' : '15% off next purchase'
      }));

      return {
        success: true,
        data: reengagementList
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export
export default PhycAnalyzerMCP;
