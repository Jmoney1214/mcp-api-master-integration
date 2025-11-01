#!/usr/bin/env node
/**
 * LIGHTSPEED RETAIL POS API - COMPLETE CONNECTION GUIDE
 * =====================================================
 * Line-by-line guide to Lightspeed Retail API
 * Inventory, sales, customers, analytics
 */

// STEP 1: Import required packages
import axios from 'axios';                        // HTTP client
import OAuth2 from 'simple-oauth2';               // OAuth authentication
import dotenv from 'dotenv';                      // Environment variables

// STEP 2: Load environment variables
dotenv.config({ path: '../configs/.env' });

// STEP 3: Configuration
const LIGHTSPEED_ACCOUNT_ID = process.env.LIGHTSPEED_ACCOUNT_ID || '294428';
const LIGHTSPEED_CLIENT_ID = process.env.LIGHTSPEED_CLIENT_ID || 'fa84fbf5248f88df1e8c977ee83b4e76f973a1a674fc76bf88c8a62fa37e4f3c';
const LIGHTSPEED_CLIENT_SECRET = process.env.LIGHTSPEED_CLIENT_SECRET || 'a95b1e20f01a95bb6fb5797154f86e59e0e2f2f2b8bc3e5c67e87bbfa93bb502';
const LIGHTSPEED_REFRESH_TOKEN = process.env.LIGHTSPEED_REFRESH_TOKEN || 'f2097e7b9f3b069c9e6ca066d9a079fa96f0ec38';
const LIGHTSPEED_API_BASE = `https://api.lightspeedapp.com/API/V3/Account/${LIGHTSPEED_ACCOUNT_ID}`;

// STEP 4: Lightspeed API class
class LightspeedAPI {
  constructor() {
    this.accountId = LIGHTSPEED_ACCOUNT_ID;
    this.accessToken = null;
    this.refreshToken = LIGHTSPEED_REFRESH_TOKEN;

    // OAuth2 configuration
    this.oauth2 = new OAuth2.ClientCredentials({
      client: {
        id: LIGHTSPEED_CLIENT_ID,
        secret: LIGHTSPEED_CLIENT_SECRET
      },
      auth: {
        tokenHost: 'https://cloud.lightspeedapp.com',
        tokenPath: '/oauth/access_token.php'
      }
    });

    // Initialize axios with base config
    this.client = axios.create({
      baseURL: LIGHTSPEED_API_BASE,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  // STEP 5: Refresh access token
  async refreshAccessToken() {
    try {
      const params = {
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: LIGHTSPEED_CLIENT_ID,
        client_secret: LIGHTSPEED_CLIENT_SECRET
      };

      const response = await axios.post(
        'https://cloud.lightspeedapp.com/oauth/access_token.php',
        params
      );

      this.accessToken = response.data.access_token;
      this.client.defaults.headers['Authorization'] = `Bearer ${this.accessToken}`;

      console.log('✅ Access token refreshed');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Token refresh failed:', error.message);
      return null;
    }
  }

  // STEP 6: Get account information
  async getAccountInfo() {
    try {
      await this.refreshAccessToken();
      const response = await this.client.get('/Account.json');

      const account = response.data.Account;
      console.log('🏪 Account Information:');
      console.log('  Name:', account.name);
      console.log('  Type:', account.accountType);
      console.log('  Time Zone:', account.timeZone);

      return account;
    } catch (error) {
      console.error('❌ Get account failed:', error.message);
      return null;
    }
  }

  // STEP 7: Get inventory items
  async getItems(options = {}) {
    try {
      const params = {
        limit: options.limit || 100,
        offset: options.offset || 0,
        load_relations: options.relations || '["ItemShops", "Prices", "Images"]',
        orderby: options.orderBy || 'description'
      };

      const response = await this.client.get('/Item.json', { params });

      console.log('📦 Inventory Items:');
      const items = Array.isArray(response.data.Item) ? response.data.Item : [response.data.Item];

      items.forEach(item => {
        console.log(`  ${item.description}`);
        console.log(`    SKU: ${item.customSku || item.systemSku}`);
        console.log(`    Price: $${item.Prices?.ItemPrice?.[0]?.amount || 'N/A'}`);
        console.log(`    Qty: ${item.ItemShops?.ItemShop?.[0]?.qoh || 0}`);
      });

      return items;
    } catch (error) {
      console.error('❌ Get items failed:', error.message);
      return [];
    }
  }

  // STEP 8: Search items
  async searchItems(query) {
    try {
      const params = {
        description: `~${query}`,  // Fuzzy search
        limit: 50,
        load_relations: '["ItemShops", "Prices"]'
      };

      const response = await this.client.get('/Item.json', { params });

      const items = Array.isArray(response.data.Item) ? response.data.Item : [response.data.Item];
      console.log(`🔍 Found ${items.length} items matching "${query}"`);

      return items;
    } catch (error) {
      console.error('❌ Search failed:', error.message);
      return [];
    }
  }

  // STEP 9: Get item by ID
  async getItem(itemId) {
    try {
      const response = await this.client.get(`/Item/${itemId}.json`, {
        params: {
          load_relations: '["ItemShops", "Prices", "Images", "Category", "Manufacturer"]'
        }
      });

      const item = response.data.Item;
      console.log('📦 Item Details:');
      console.log('  Name:', item.description);
      console.log('  Category:', item.Category?.name);
      console.log('  Manufacturer:', item.Manufacturer?.name);
      console.log('  Cost:', item.defaultCost);
      console.log('  Price:', item.Prices?.ItemPrice?.[0]?.amount);

      return item;
    } catch (error) {
      console.error('❌ Get item failed:', error.message);
      return null;
    }
  }

  // STEP 10: Update item quantity
  async updateItemQuantity(itemId, shopId, quantity) {
    try {
      const response = await this.client.put(
        `/ItemShop/${itemId}/${shopId}.json`,
        {
          ItemShop: {
            qoh: quantity
          }
        }
      );

      console.log('✅ Quantity updated to:', quantity);
      return response.data.ItemShop;
    } catch (error) {
      console.error('❌ Update quantity failed:', error.message);
      return null;
    }
  }

  // STEP 11: Create new item
  async createItem(itemData) {
    try {
      const item = {
        Item: {
          description: itemData.name,
          customSku: itemData.sku,
          defaultCost: itemData.cost,
          tax: itemData.taxable || true,
          itemType: 'default',
          Prices: {
            ItemPrice: [
              {
                amount: itemData.price,
                useType: 'Default',
                useTypeID: 1
              }
            ]
          }
        }
      };

      const response = await this.client.post('/Item.json', item);
      console.log('✅ Item created:', response.data.Item.itemID);
      return response.data.Item;
    } catch (error) {
      console.error('❌ Create item failed:', error.message);
      return null;
    }
  }

  // STEP 12: Get sales/transactions
  async getSales(options = {}) {
    try {
      const params = {
        limit: options.limit || 100,
        offset: options.offset || 0,
        timeStamp: options.dateRange || '><,2025-01-01T00:00:00,2025-12-31T23:59:59',
        load_relations: '["Customer", "SaleLines"]'
      };

      const response = await this.client.get('/Sale.json', { params });

      const sales = Array.isArray(response.data.Sale) ? response.data.Sale : [response.data.Sale];

      console.log('💰 Recent Sales:');
      sales.forEach(sale => {
        console.log(`  Sale #${sale.ticketNumber}`);
        console.log(`    Date: ${sale.createTime}`);
        console.log(`    Total: $${sale.calcTotal}`);
        console.log(`    Customer: ${sale.Customer?.firstName || 'Guest'}`);
      });

      return sales;
    } catch (error) {
      console.error('❌ Get sales failed:', error.message);
      return [];
    }
  }

  // STEP 13: Get sale details
  async getSale(saleId) {
    try {
      const response = await this.client.get(`/Sale/${saleId}.json`, {
        params: {
          load_relations: '["Customer", "SaleLines", "SalePayments", "Employee"]'
        }
      });

      const sale = response.data.Sale;
      console.log('🧾 Sale Details:');
      console.log('  Ticket:', sale.ticketNumber);
      console.log('  Date:', sale.createTime);
      console.log('  Employee:', sale.Employee?.firstName);
      console.log('  Items:', sale.SaleLines?.SaleLine?.length || 0);
      console.log('  Total:', sale.calcTotal);

      return sale;
    } catch (error) {
      console.error('❌ Get sale failed:', error.message);
      return null;
    }
  }

  // STEP 14: Get customers
  async getCustomers(options = {}) {
    try {
      const params = {
        limit: options.limit || 100,
        offset: options.offset || 0,
        orderby: options.orderBy || 'lastName'
      };

      const response = await this.client.get('/Customer.json', { params });

      const customers = Array.isArray(response.data.Customer) ?
        response.data.Customer : [response.data.Customer];

      console.log('👥 Customers:');
      customers.forEach(customer => {
        console.log(`  ${customer.firstName} ${customer.lastName}`);
        console.log(`    Email: ${customer.Contact?.Emails?.ContactEmail?.[0]?.address || 'N/A'}`);
        console.log(`    Lifetime: $${customer.lifetimeSpent || 0}`);
      });

      return customers;
    } catch (error) {
      console.error('❌ Get customers failed:', error.message);
      return [];
    }
  }

  // STEP 15: Create customer
  async createCustomer(customerData) {
    try {
      const customer = {
        Customer: {
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          Contact: {
            Emails: {
              ContactEmail: {
                address: customerData.email,
                useType: 'Primary'
              }
            },
            Phones: {
              ContactPhone: {
                number: customerData.phone,
                useType: 'Mobile'
              }
            }
          }
        }
      };

      const response = await this.client.post('/Customer.json', customer);
      console.log('✅ Customer created:', response.data.Customer.customerID);
      return response.data.Customer;
    } catch (error) {
      console.error('❌ Create customer failed:', error.message);
      return null;
    }
  }

  // STEP 16: Get categories
  async getCategories() {
    try {
      const response = await this.client.get('/Category.json');

      const categories = Array.isArray(response.data.Category) ?
        response.data.Category : [response.data.Category];

      console.log('📁 Categories:');
      categories.forEach(category => {
        console.log(`  ${category.name} (${category.nodeDepth})`);
      });

      return categories;
    } catch (error) {
      console.error('❌ Get categories failed:', error.message);
      return [];
    }
  }

  // STEP 17: Get vendors/manufacturers
  async getVendors() {
    try {
      const response = await this.client.get('/Manufacturer.json');

      const vendors = Array.isArray(response.data.Manufacturer) ?
        response.data.Manufacturer : [response.data.Manufacturer];

      console.log('🏭 Vendors:');
      vendors.forEach(vendor => {
        console.log(`  ${vendor.name}`);
      });

      return vendors;
    } catch (error) {
      console.error('❌ Get vendors failed:', error.message);
      return [];
    }
  }

  // STEP 18: Analytics - Sales by date range
  async getSalesAnalytics(startDate, endDate) {
    try {
      const params = {
        timeStamp: `><,${startDate}T00:00:00,${endDate}T23:59:59`,
        stats: 'sum:calcTotal,count:saleID,avg:calcTotal'
      };

      const response = await this.client.get('/Sale.json', { params });

      console.log('📊 Sales Analytics:');
      console.log('  Period:', startDate, 'to', endDate);
      console.log('  Total Sales:', response.data['@attributes'].sum_calcTotal);
      console.log('  Transaction Count:', response.data['@attributes'].count);
      console.log('  Average Sale:', response.data['@attributes'].avg_calcTotal);

      return response.data['@attributes'];
    } catch (error) {
      console.error('❌ Analytics failed:', error.message);
      return null;
    }
  }

  // STEP 19: Low stock alert
  async getLowStockItems(threshold = 10) {
    try {
      const params = {
        load_relations: '["ItemShops"]',
        limit: 200
      };

      const response = await this.client.get('/Item.json', { params });
      const items = Array.isArray(response.data.Item) ?
        response.data.Item : [response.data.Item];

      const lowStock = items.filter(item => {
        const qoh = item.ItemShops?.ItemShop?.[0]?.qoh || 0;
        return qoh > 0 && qoh < threshold;
      });

      console.log(`⚠️ Low Stock Items (< ${threshold}):`);
      lowStock.forEach(item => {
        const qoh = item.ItemShops?.ItemShop?.[0]?.qoh || 0;
        console.log(`  ${item.description}: ${qoh} remaining`);
      });

      return lowStock;
    } catch (error) {
      console.error('❌ Low stock check failed:', error.message);
      return [];
    }
  }

  // STEP 20: Best sellers
  async getBestSellers(days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const params = {
        timeStamp: `><,${startDate.toISOString()},${endDate.toISOString()}`,
        load_relations: '["SaleLines"]',
        limit: 100
      };

      const response = await this.client.get('/Sale.json', { params });
      const sales = Array.isArray(response.data.Sale) ?
        response.data.Sale : [response.data.Sale];

      // Aggregate item sales
      const itemSales = {};
      sales.forEach(sale => {
        const lines = sale.SaleLines?.SaleLine || [];
        const saleLines = Array.isArray(lines) ? lines : [lines];

        saleLines.forEach(line => {
          if (line.itemID) {
            if (!itemSales[line.itemID]) {
              itemSales[line.itemID] = {
                description: line.Item?.description,
                quantity: 0,
                revenue: 0
              };
            }
            itemSales[line.itemID].quantity += parseFloat(line.unitQuantity || 0);
            itemSales[line.itemID].revenue += parseFloat(line.calcTotal || 0);
          }
        });
      });

      // Sort by quantity sold
      const bestSellers = Object.entries(itemSales)
        .sort((a, b) => b[1].quantity - a[1].quantity)
        .slice(0, 10);

      console.log(`🏆 Best Sellers (Last ${days} days):`);
      bestSellers.forEach(([id, data]) => {
        console.log(`  ${data.description}: ${data.quantity} sold ($${data.revenue})`);
      });

      return bestSellers;
    } catch (error) {
      console.error('❌ Best sellers failed:', error.message);
      return [];
    }
  }
}

// STEP 21: Main execution
async function main() {
  console.log('💼 LIGHTSPEED POS API CONNECTION DEMO\n');
  console.log('Configuration:');
  console.log('  Account ID:', LIGHTSPEED_ACCOUNT_ID);
  console.log('  Client ID:', LIGHTSPEED_CLIENT_ID?.substring(0, 20) + '...');
  console.log('');

  const pos = new LightspeedAPI();

  // Test various operations
  await pos.getAccountInfo();
  await pos.getItems({ limit: 5 });
  await pos.getSales({ limit: 5 });
  await pos.getLowStockItems();
}

// STEP 22: Export for use in other files
export default LightspeedAPI;

// STEP 23: Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}