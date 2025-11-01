#!/usr/bin/env node
/**
 * AIRTABLE API - COMPLETE CONNECTION GUIDE
 * ========================================
 * Line-by-line guide to Airtable API
 * Database operations, CRM, inventory management
 */

// STEP 1: Import required packages
import Airtable from 'airtable';                  // Official Airtable SDK
import axios from 'axios';                        // For direct API calls
import dotenv from 'dotenv';                      // Environment variables

// STEP 2: Load environment variables
dotenv.config({ path: '../configs/.env' });

// STEP 3: Configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appM5cPBtZBEEhlbq';
const AIRTABLE_TABLE = 'Wine Inventory';  // Your main table

// STEP 4: Initialize Airtable
Airtable.configure({
  apiKey: AIRTABLE_API_KEY
});

const base = Airtable.base(AIRTABLE_BASE_ID);

// STEP 5: Airtable API class wrapper
class AirtableAPI {
  constructor() {
    this.base = base;
    this.apiKey = AIRTABLE_API_KEY;
    this.baseId = AIRTABLE_BASE_ID;
    this.apiUrl = `https://api.airtable.com/v0/${this.baseId}`;
  }

  // STEP 6: List all records from a table
  async listRecords(tableName, options = {}) {
    try {
      const records = [];
      await base(tableName).select({
        maxRecords: options.maxRecords || 100,
        view: options.view || 'Grid view',
        filterByFormula: options.filter,
        sort: options.sort || [{ field: 'Name', direction: 'asc' }],
        fields: options.fields,
        pageSize: options.pageSize || 100
      }).eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach(record => {
          records.push({
            id: record.id,
            fields: record.fields
          });
        });
        fetchNextPage();
      });

      console.log(`📋 Found ${records.length} records in ${tableName}`);
      return records;
    } catch (error) {
      console.error('❌ List records failed:', error.message);
      return [];
    }
  }

  // STEP 7: Get single record by ID
  async getRecord(tableName, recordId) {
    try {
      const record = await base(tableName).find(recordId);

      console.log('📄 Record Details:');
      console.log('  ID:', record.id);
      Object.entries(record.fields).forEach(([key, value]) => {
        console.log(`  ${key}:`, value);
      });

      return record;
    } catch (error) {
      console.error('❌ Get record failed:', error.message);
      return null;
    }
  }

  // STEP 8: Create new record
  async createRecord(tableName, fields) {
    try {
      const record = await base(tableName).create(fields, { typecast: true });

      console.log('✅ Record created:', record.id);
      return record;
    } catch (error) {
      console.error('❌ Create failed:', error.message);
      return null;
    }
  }

  // STEP 9: Create multiple records (batch)
  async createRecords(tableName, recordsData) {
    try {
      const records = await base(tableName).create(
        recordsData.map(fields => ({ fields })),
        { typecast: true }
      );

      console.log(`✅ Created ${records.length} records`);
      return records;
    } catch (error) {
      console.error('❌ Batch create failed:', error.message);
      return [];
    }
  }

  // STEP 10: Update record
  async updateRecord(tableName, recordId, fields) {
    try {
      const record = await base(tableName).update(recordId, fields, { typecast: true });

      console.log('✅ Record updated:', record.id);
      return record;
    } catch (error) {
      console.error('❌ Update failed:', error.message);
      return null;
    }
  }

  // STEP 11: Update multiple records
  async updateRecords(tableName, updates) {
    try {
      const records = await base(tableName).update(updates, { typecast: true });

      console.log(`✅ Updated ${records.length} records`);
      return records;
    } catch (error) {
      console.error('❌ Batch update failed:', error.message);
      return [];
    }
  }

  // STEP 12: Delete record
  async deleteRecord(tableName, recordId) {
    try {
      const result = await base(tableName).destroy(recordId);

      console.log('✅ Record deleted:', result.id);
      return true;
    } catch (error) {
      console.error('❌ Delete failed:', error.message);
      return false;
    }
  }

  // STEP 13: Delete multiple records
  async deleteRecords(tableName, recordIds) {
    try {
      const results = await base(tableName).destroy(recordIds);

      console.log(`✅ Deleted ${results.length} records`);
      return results;
    } catch (error) {
      console.error('❌ Batch delete failed:', error.message);
      return [];
    }
  }

  // STEP 14: Search records with filter
  async searchRecords(tableName, searchTerm, searchField = 'Name') {
    try {
      const filter = `SEARCH("${searchTerm}", {${searchField}})`;

      const records = await this.listRecords(tableName, { filter });

      console.log(`🔍 Found ${records.length} matching records`);
      return records;
    } catch (error) {
      console.error('❌ Search failed:', error.message);
      return [];
    }
  }

  // STEP 15: Complex filtering
  async filterRecords(tableName, conditions) {
    try {
      // Build filter formula
      // Example: AND({Price} > 20, {Category} = "Wine", {Stock} < 10)
      const filters = [];

      if (conditions.minPrice) {
        filters.push(`{Price} >= ${conditions.minPrice}`);
      }
      if (conditions.maxPrice) {
        filters.push(`{Price} <= ${conditions.maxPrice}`);
      }
      if (conditions.category) {
        filters.push(`{Category} = "${conditions.category}"`);
      }
      if (conditions.inStock !== undefined) {
        filters.push(conditions.inStock ? '{Stock} > 0' : '{Stock} = 0');
      }

      const filterFormula = filters.length > 1 ?
        `AND(${filters.join(', ')})` : filters[0];

      const records = await this.listRecords(tableName, {
        filter: filterFormula
      });

      return records;
    } catch (error) {
      console.error('❌ Filter failed:', error.message);
      return [];
    }
  }

  // STEP 16: Get table schema
  async getTableSchema(tableName) {
    try {
      const response = await axios.get(
        `https://api.airtable.com/v0/meta/bases/${this.baseId}/tables`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      const table = response.data.tables.find(t => t.name === tableName);

      console.log(`📊 Table Schema for ${tableName}:`);
      table.fields.forEach(field => {
        console.log(`  ${field.name}: ${field.type}`);
      });

      return table;
    } catch (error) {
      console.error('❌ Get schema failed:', error.message);
      return null;
    }
  }

  // STEP 17: Wine inventory specific functions
  async addWineToInventory(wineData) {
    const record = await this.createRecord('Wine Inventory', {
      'Name': wineData.name,
      'Type': wineData.type,          // Red, White, Rosé, Sparkling
      'Vintage': wineData.vintage,
      'Region': wineData.region,
      'Price': wineData.price,
      'Cost': wineData.cost,
      'Stock': wineData.stock,
      'SKU': wineData.sku,
      'Description': wineData.description,
      'Supplier': wineData.supplier,
      'Rating': wineData.rating,
      'Image': wineData.imageUrl ? [{ url: wineData.imageUrl }] : undefined
    });

    return record;
  }

  // STEP 18: Update stock levels
  async updateStock(recordId, quantity, operation = 'set') {
    try {
      // Get current stock
      const record = await this.getRecord('Wine Inventory', recordId);
      const currentStock = record.fields.Stock || 0;

      let newStock;
      switch (operation) {
        case 'add':
          newStock = currentStock + quantity;
          break;
        case 'subtract':
          newStock = Math.max(0, currentStock - quantity);
          break;
        default:
          newStock = quantity;
      }

      const updated = await this.updateRecord('Wine Inventory', recordId, {
        'Stock': newStock,
        'Last Updated': new Date().toISOString()
      });

      console.log(`📦 Stock updated: ${currentStock} → ${newStock}`);
      return updated;
    } catch (error) {
      console.error('❌ Stock update failed:', error.message);
      return null;
    }
  }

  // STEP 19: Get low stock items
  async getLowStockItems(threshold = 10) {
    try {
      const filter = `AND({Stock} > 0, {Stock} < ${threshold})`;

      const records = await this.listRecords('Wine Inventory', {
        filter,
        sort: [{ field: 'Stock', direction: 'asc' }]
      });

      console.log(`⚠️ ${records.length} items with low stock (< ${threshold})`);
      records.forEach(record => {
        console.log(`  ${record.fields.Name}: ${record.fields.Stock} remaining`);
      });

      return records;
    } catch (error) {
      console.error('❌ Low stock check failed:', error.message);
      return [];
    }
  }

  // STEP 20: Customer CRM functions
  async addCustomer(customerData) {
    const record = await this.createRecord('Customers', {
      'Name': `${customerData.firstName} ${customerData.lastName}`,
      'Email': customerData.email,
      'Phone': customerData.phone,
      'Address': customerData.address,
      'Birthday': customerData.birthday,
      'Preferences': customerData.preferences,
      'Loyalty Points': 0,
      'Total Spent': 0,
      'Join Date': new Date().toISOString(),
      'Tags': customerData.tags || []
    });

    return record;
  }

  // STEP 21: Sales tracking
  async recordSale(saleData) {
    const record = await this.createRecord('Sales', {
      'Date': saleData.date || new Date().toISOString(),
      'Customer': saleData.customerId ? [saleData.customerId] : undefined,
      'Items': saleData.items,          // Link to Wine Inventory records
      'Quantities': saleData.quantities.join(', '),
      'Subtotal': saleData.subtotal,
      'Tax': saleData.tax,
      'Total': saleData.total,
      'Payment Method': saleData.paymentMethod,
      'Employee': saleData.employee,
      'Notes': saleData.notes
    });

    // Update stock for sold items
    for (let i = 0; i < saleData.items.length; i++) {
      await this.updateStock(saleData.items[i], saleData.quantities[i], 'subtract');
    }

    return record;
  }

  // STEP 22: Generate reports
  async generateSalesReport(startDate, endDate) {
    try {
      const filter = `AND(
        IS_AFTER({Date}, '${startDate}'),
        IS_BEFORE({Date}, '${endDate}')
      )`;

      const sales = await this.listRecords('Sales', { filter });

      const report = {
        period: { start: startDate, end: endDate },
        totalSales: sales.length,
        revenue: sales.reduce((sum, sale) => sum + (sale.fields.Total || 0), 0),
        averageSale: 0,
        topItems: {}
      };

      report.averageSale = report.revenue / report.totalSales || 0;

      console.log('📊 Sales Report:');
      console.log('  Period:', startDate, 'to', endDate);
      console.log('  Total Sales:', report.totalSales);
      console.log('  Revenue: $', report.revenue.toFixed(2));
      console.log('  Average Sale: $', report.averageSale.toFixed(2));

      return report;
    } catch (error) {
      console.error('❌ Report generation failed:', error.message);
      return null;
    }
  }

  // STEP 23: Sync with external systems
  async exportToCSV(tableName) {
    try {
      const records = await this.listRecords(tableName);

      if (records.length === 0) return '';

      // Get headers from first record
      const headers = Object.keys(records[0].fields);
      const csv = [
        headers.join(','),
        ...records.map(record =>
          headers.map(header =>
            JSON.stringify(record.fields[header] || '')
          ).join(',')
        )
      ].join('\n');

      console.log(`📁 Exported ${records.length} records to CSV`);
      return csv;
    } catch (error) {
      console.error('❌ Export failed:', error.message);
      return '';
    }
  }
}

// STEP 24: Main execution
async function main() {
  console.log('📊 AIRTABLE API CONNECTION DEMO\n');
  console.log('Configuration:');
  console.log('  API Key:', AIRTABLE_API_KEY?.substring(0, 20) + '...');
  console.log('  Base ID:', AIRTABLE_BASE_ID);
  console.log('');

  const airtable = new AirtableAPI();

  // Test various operations
  const records = await airtable.listRecords('Wine Inventory', { maxRecords: 5 });
  console.log(`Found ${records.length} wine records`);

  // Check low stock
  await airtable.getLowStockItems(20);
}

// STEP 25: Export for use in other files
export default AirtableAPI;

// STEP 26: Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}