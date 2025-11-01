#!/usr/bin/env node
/**
 * CLOUDFLARE MCP INTEGRATION - COMPLETE CONNECTION GUIDE
 * ======================================================
 * Line-by-line guide to all Cloudflare API operations
 * MCP Server implementation and direct API calls
 */

// STEP 1: Import required packages
import axios from 'axios';                        // HTTP client for API calls
import dotenv from 'dotenv';                      // Environment variables

// STEP 2: Load environment variables
dotenv.config({ path: '../configs/.env' });

// STEP 3: Configuration from environment
const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY;         // -PUywZD8VWrA1QDt2CBkd9r_7v6oQpFnjDRoOVH1
const CLOUDFLARE_EMAIL = 'legacywineandliquor@gmail.com';          // Account email
const CLOUDFLARE_ZONE_ID = '71641cf7234bde112acd9c5eb8ab2ec2';     // Your domain zone
const CLOUDFLARE_ACCOUNT_ID = '31394ad4685a4a71b31a07f05319b29e';  // Account ID

// STEP 4: Create Cloudflare API client
class CloudflareAPI {
  constructor() {
    // Base configuration for all API calls
    this.client = axios.create({
      baseURL: 'https://api.cloudflare.com/client/v4',
      headers: {
        'X-Auth-Email': CLOUDFLARE_EMAIL,
        'X-Auth-Key': CLOUDFLARE_API_KEY,
        'Content-Type': 'application/json'
      }
    });
  }

  // STEP 5: List all zones (domains) in account
  async listZones() {
    try {
      const response = await this.client.get('/zones', {
        params: {
          page: 1,
          per_page: 50,
          order: 'name',
          direction: 'asc',
          status: 'active'
        }
      });

      console.log('🌐 Your Cloudflare Zones:');
      response.data.result.forEach(zone => {
        console.log(`  ${zone.name} (${zone.id})`);
        console.log(`    Status: ${zone.status}`);
        console.log(`    Plan: ${zone.plan.name}`);
        console.log(`    Name Servers: ${zone.name_servers.join(', ')}`);
      });

      return response.data.result;
    } catch (error) {
      console.error('❌ List zones failed:', error.response?.data || error.message);
      return [];
    }
  }

  // STEP 6: Get zone details
  async getZoneDetails(zoneId = CLOUDFLARE_ZONE_ID) {
    try {
      const response = await this.client.get(`/zones/${zoneId}`);
      const zone = response.data.result;

      console.log('📊 Zone Details:');
      console.log('  Name:', zone.name);
      console.log('  Status:', zone.status);
      console.log('  Plan:', zone.plan.name);
      console.log('  Created:', zone.created_on);
      console.log('  Modified:', zone.modified_on);

      return zone;
    } catch (error) {
      console.error('❌ Get zone failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 7: List DNS records
  async listDNSRecords(zoneId = CLOUDFLARE_ZONE_ID) {
    try {
      const response = await this.client.get(`/zones/${zoneId}/dns_records`, {
        params: {
          page: 1,
          per_page: 100,
          order: 'type',
          direction: 'asc'
        }
      });

      console.log('📝 DNS Records:');
      response.data.result.forEach(record => {
        console.log(`  ${record.type} | ${record.name} → ${record.content}`);
        console.log(`    Proxied: ${record.proxied ? '✅' : '❌'} | TTL: ${record.ttl}`);
      });

      return response.data.result;
    } catch (error) {
      console.error('❌ List DNS failed:', error.response?.data || error.message);
      return [];
    }
  }

  // STEP 8: Create DNS record
  async createDNSRecord(type, name, content, proxied = false, ttl = 1) {
    try {
      const response = await this.client.post(`/zones/${CLOUDFLARE_ZONE_ID}/dns_records`, {
        type: type,           // A, AAAA, CNAME, MX, TXT, etc.
        name: name,           // Subdomain or @ for root
        content: content,     // IP address or target
        proxied: proxied,     // Use Cloudflare proxy
        ttl: ttl,            // 1 = automatic
        priority: 10         // For MX records
      });

      console.log('✅ DNS record created:', response.data.result.id);
      return response.data.result;
    } catch (error) {
      console.error('❌ Create DNS failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 9: Update DNS record
  async updateDNSRecord(recordId, updates) {
    try {
      const response = await this.client.patch(
        `/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${recordId}`,
        updates
      );

      console.log('✅ DNS record updated');
      return response.data.result;
    } catch (error) {
      console.error('❌ Update DNS failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 10: Delete DNS record
  async deleteDNSRecord(recordId) {
    try {
      await this.client.delete(
        `/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${recordId}`
      );

      console.log('✅ DNS record deleted');
      return true;
    } catch (error) {
      console.error('❌ Delete DNS failed:', error.response?.data || error.message);
      return false;
    }
  }

  // STEP 11: Get zone settings
  async getZoneSettings(zoneId = CLOUDFLARE_ZONE_ID) {
    try {
      const response = await this.client.get(`/zones/${zoneId}/settings`);

      console.log('⚙️ Zone Settings:');
      response.data.result.forEach(setting => {
        console.log(`  ${setting.id}: ${JSON.stringify(setting.value)}`);
      });

      return response.data.result;
    } catch (error) {
      console.error('❌ Get settings failed:', error.response?.data || error.message);
      return [];
    }
  }

  // STEP 12: Update zone setting
  async updateZoneSetting(settingId, value) {
    try {
      const response = await this.client.patch(
        `/zones/${CLOUDFLARE_ZONE_ID}/settings/${settingId}`,
        { value: value }
      );

      console.log(`✅ Setting ${settingId} updated to:`, value);
      return response.data.result;
    } catch (error) {
      console.error('❌ Update setting failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 13: Configure SSL/TLS
  async configureSSL(mode = 'full') {
    // SSL modes: off, flexible, full, strict
    return await this.updateZoneSetting('ssl', mode);
  }

  // STEP 14: Configure caching
  async configureCaching(level = 'aggressive') {
    // Cache levels: bypass, basic, simplified, aggressive
    return await this.updateZoneSetting('cache_level', level);
  }

  // STEP 15: Enable minification
  async enableMinification() {
    const minifySettings = {
      css: true,
      html: true,
      js: true
    };
    return await this.updateZoneSetting('minify', minifySettings);
  }

  // STEP 16: Create page rule
  async createPageRule(url, actions) {
    try {
      const response = await this.client.post(`/zones/${CLOUDFLARE_ZONE_ID}/pagerules`, {
        targets: [
          {
            target: 'url',
            constraint: {
              operator: 'matches',
              value: url              // e.g., "*example.com/api/*"
            }
          }
        ],
        actions: actions,             // Array of actions
        priority: 1,                  // Lower = higher priority
        status: 'active'
      });

      console.log('✅ Page rule created:', response.data.result.id);
      return response.data.result;
    } catch (error) {
      console.error('❌ Create page rule failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 17: List page rules
  async listPageRules() {
    try {
      const response = await this.client.get(`/zones/${CLOUDFLARE_ZONE_ID}/pagerules`);

      console.log('📋 Page Rules:');
      response.data.result.forEach(rule => {
        console.log(`  ${rule.targets[0].constraint.value}`);
        rule.actions.forEach(action => {
          console.log(`    ${action.id}: ${JSON.stringify(action.value)}`);
        });
      });

      return response.data.result;
    } catch (error) {
      console.error('❌ List page rules failed:', error.response?.data || error.message);
      return [];
    }
  }

  // STEP 18: Purge cache
  async purgeCache(options = { purge_everything: true }) {
    try {
      const response = await this.client.post(
        `/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
        options
      );

      console.log('✅ Cache purged');
      return response.data.result;
    } catch (error) {
      console.error('❌ Purge cache failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 19: Get analytics
  async getAnalytics(since = '-1d', until = 'now') {
    try {
      const response = await this.client.get(
        `/zones/${CLOUDFLARE_ZONE_ID}/analytics/dashboard`,
        {
          params: {
            since: since,            // -30m, -1h, -1d, -7d
            until: until,
            continuous: true
          }
        }
      );

      const data = response.data.result;
      console.log('📈 Analytics:');
      console.log('  Requests:', data.totals.requests.all);
      console.log('  Bandwidth:', data.totals.bandwidth.all, 'bytes');
      console.log('  Unique Visitors:', data.totals.uniques.all);
      console.log('  Threats:', data.totals.threats.all);

      return data;
    } catch (error) {
      console.error('❌ Get analytics failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 20: List firewall rules
  async listFirewallRules() {
    try {
      const response = await this.client.get(
        `/zones/${CLOUDFLARE_ZONE_ID}/firewall/rules`
      );

      console.log('🔥 Firewall Rules:');
      response.data.result.forEach(rule => {
        console.log(`  ${rule.description}`);
        console.log(`    Action: ${rule.action}`);
        console.log(`    Expression: ${rule.filter.expression}`);
      });

      return response.data.result;
    } catch (error) {
      console.error('❌ List firewall failed:', error.response?.data || error.message);
      return [];
    }
  }

  // STEP 21: Create firewall rule
  async createFirewallRule(expression, action = 'block', description = '') {
    try {
      // First create a filter
      const filterResponse = await this.client.post(
        `/zones/${CLOUDFLARE_ZONE_ID}/filters`,
        {
          expression: expression,     // e.g., "ip.src eq 1.2.3.4"
          description: description
        }
      );

      const filterId = filterResponse.data.result[0].id;

      // Then create the rule
      const ruleResponse = await this.client.post(
        `/zones/${CLOUDFLARE_ZONE_ID}/firewall/rules`,
        {
          filter: { id: filterId },
          action: action,            // block, challenge, allow, log
          description: description
        }
      );

      console.log('✅ Firewall rule created');
      return ruleResponse.data.result[0];
    } catch (error) {
      console.error('❌ Create firewall failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 22: Get SSL certificate details
  async getSSLCertificates() {
    try {
      const response = await this.client.get(
        `/zones/${CLOUDFLARE_ZONE_ID}/ssl/certificate_packs`
      );

      console.log('🔒 SSL Certificates:');
      response.data.result.forEach(cert => {
        console.log(`  Type: ${cert.type}`);
        console.log(`  Status: ${cert.status}`);
        console.log(`  Hosts: ${cert.hosts.join(', ')}`);
      });

      return response.data.result;
    } catch (error) {
      console.error('❌ Get SSL failed:', error.response?.data || error.message);
      return [];
    }
  }
}

// STEP 23: MCP Server Configuration
const MCP_CONFIG = {
  cloudflare: {
    command: 'node',
    args: ['/Users/justinetwaru/mcp-servers/cloudflare/index.js'],
    env: {
      CLOUDFLARE_GLOBAL_API_KEY: CLOUDFLARE_API_KEY,
      CLOUDFLARE_EMAIL: CLOUDFLARE_EMAIL,
      CLOUDFLARE_ZONE_ID: CLOUDFLARE_ZONE_ID,
      CLOUDFLARE_ACCOUNT_ID: CLOUDFLARE_ACCOUNT_ID
    }
  }
};

// STEP 24: Main execution
async function main() {
  console.log('🌩️ CLOUDFLARE API CONNECTION DEMO\n');
  console.log('Configuration:');
  console.log('  API Key:', CLOUDFLARE_API_KEY?.substring(0, 20) + '...');
  console.log('  Zone ID:', CLOUDFLARE_ZONE_ID);
  console.log('  Email:', CLOUDFLARE_EMAIL);
  console.log('');

  const cf = new CloudflareAPI();

  // Test various operations
  await cf.listZones();
  await cf.getZoneDetails();
  await cf.listDNSRecords();
  await cf.getZoneSettings();
  await cf.getAnalytics();
  await cf.listPageRules();
  await cf.listFirewallRules();
  await cf.getSSLCertificates();
}

// STEP 25: Export for use in other files
export default CloudflareAPI;
export { MCP_CONFIG };

// STEP 26: Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}