#!/usr/bin/env node
/**
 * RENDER API INTEGRATION - COMPLETE CONNECTION GUIDE
 * ==================================================
 * Line-by-line guide to Render cloud platform API
 * Deploy services, databases, and monitor infrastructure
 */

// STEP 1: Import required packages
import axios from 'axios';                        // HTTP client
import dotenv from 'dotenv';                      // Environment variables
import { exec } from 'child_process';             // Execute commands

// STEP 2: Load environment variables
dotenv.config({ path: '../configs/.env' });

// STEP 3: Configuration
const RENDER_API_KEY = process.env.RENDER_API_KEY || 'rnd_pWnGEJi9M0lWvlQuWCdwl4bG2IHA';
const RENDER_OWNER_ID = 'usr-cno7kkl8f03k4rvg5gu0';  // Your account ID
const RENDER_BASE_URL = 'https://api.render.com/v1';

// STEP 4: Render API class
class RenderAPI {
  constructor() {
    // Create axios instance with auth
    this.client = axios.create({
      baseURL: RENDER_BASE_URL,
      headers: {
        'Authorization': `Bearer ${RENDER_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  // STEP 5: List all services
  async listServices(includePreviews = false) {
    try {
      const response = await this.client.get('/services', {
        params: {
          ownerId: RENDER_OWNER_ID,
          includePreviews: includePreviews,
          limit: 100
        }
      });

      console.log('🚀 Your Render Services:');
      response.data.forEach(service => {
        console.log(`  ${service.name} (${service.type})`);
        console.log(`    ID: ${service.id}`);
        console.log(`    Status: ${service.suspended ? 'Suspended' : 'Active'}`);
        console.log(`    URL: ${service.serviceDetails?.url || 'N/A'}`);
      });

      return response.data;
    } catch (error) {
      console.error('❌ List services failed:', error.response?.data || error.message);
      return [];
    }
  }

  // STEP 6: Get service details
  async getService(serviceId) {
    try {
      const response = await this.client.get(`/services/${serviceId}`);
      const service = response.data;

      console.log('📊 Service Details:');
      console.log('  Name:', service.name);
      console.log('  Type:', service.type);
      console.log('  Region:', service.region);
      console.log('  Branch:', service.branch);
      console.log('  Plan:', service.plan);

      return service;
    } catch (error) {
      console.error('❌ Get service failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 7: Create web service
  async createWebService(config) {
    try {
      const serviceConfig = {
        type: 'web_service',
        name: config.name,
        ownerId: RENDER_OWNER_ID,
        repo: config.repo,                    // GitHub/GitLab URL
        branch: config.branch || 'main',
        runtime: config.runtime || 'node',    // node, python, go, rust, etc.
        region: config.region || 'oregon',
        plan: config.plan || 'starter',
        buildCommand: config.buildCommand,
        startCommand: config.startCommand,
        envVars: config.envVars || [],
        autoDeploy: config.autoDeploy !== false
      };

      const response = await this.client.post('/services', serviceConfig);
      console.log('✅ Web service created:', response.data.service.id);
      return response.data.service;
    } catch (error) {
      console.error('❌ Create service failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 8: Create static site
  async createStaticSite(config) {
    try {
      const siteConfig = {
        type: 'static_site',
        name: config.name,
        ownerId: RENDER_OWNER_ID,
        repo: config.repo,
        branch: config.branch || 'main',
        buildCommand: config.buildCommand,
        publishPath: config.publishPath || 'public',
        envVars: config.envVars || [],
        autoDeploy: config.autoDeploy !== false
      };

      const response = await this.client.post('/services', siteConfig);
      console.log('✅ Static site created:', response.data.service.id);
      return response.data.service;
    } catch (error) {
      console.error('❌ Create static site failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 9: Create PostgreSQL database
  async createPostgres(config) {
    try {
      const dbConfig = {
        name: config.name,
        databaseName: config.databaseName || config.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        databaseUser: config.databaseUser || config.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        region: config.region || 'oregon',
        plan: config.plan || 'free',          // free, basic, standard, pro
        version: config.version || 16,
        diskSizeGb: config.diskSizeGb || 1
      };

      const response = await this.client.post('/postgres', dbConfig);
      console.log('✅ Postgres database created:', response.data.id);
      console.log('  Connection URL:', response.data.connectionInfo?.internalConnectionString);
      return response.data;
    } catch (error) {
      console.error('❌ Create Postgres failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 10: Create Redis instance (Key-Value store)
  async createKeyValue(config) {
    try {
      const kvConfig = {
        name: config.name,
        region: config.region || 'oregon',
        plan: config.plan || 'free',
        maxmemoryPolicy: config.maxmemoryPolicy || 'allkeys-lru'
      };

      const response = await this.client.post('/key-values', kvConfig);
      console.log('✅ Key-Value store created:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Create Key-Value failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 11: Deploy a service
  async deployService(serviceId, clearCache = false) {
    try {
      const response = await this.client.post(`/services/${serviceId}/deploys`, {
        clearCache: clearCache
      });

      console.log('✅ Deployment triggered:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Deploy failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 12: List deploys
  async listDeploys(serviceId, limit = 10) {
    try {
      const response = await this.client.get(`/services/${serviceId}/deploys`, {
        params: {
          limit: limit
        }
      });

      console.log('📦 Recent Deploys:');
      response.data.forEach(deploy => {
        console.log(`  ${deploy.id}`);
        console.log(`    Status: ${deploy.status}`);
        console.log(`    Commit: ${deploy.commit?.id?.substring(0, 7)}`);
        console.log(`    Created: ${deploy.createdAt}`);
      });

      return response.data;
    } catch (error) {
      console.error('❌ List deploys failed:', error.response?.data || error.message);
      return [];
    }
  }

  // STEP 13: Get deploy details
  async getDeploy(serviceId, deployId) {
    try {
      const response = await this.client.get(`/services/${serviceId}/deploys/${deployId}`);
      const deploy = response.data;

      console.log('🚀 Deploy Details:');
      console.log('  Status:', deploy.status);
      console.log('  Build Duration:', deploy.buildDuration, 'seconds');
      console.log('  Upload Size:', deploy.uploadSizeBytes, 'bytes');

      return deploy;
    } catch (error) {
      console.error('❌ Get deploy failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 14: Update environment variables
  async updateEnvVars(serviceId, envVars, replace = false) {
    try {
      const response = await this.client.put(`/services/${serviceId}/env-vars`, {
        envVars: envVars,
        replace: replace        // Replace all or merge
      });

      console.log('✅ Environment variables updated');
      return response.data;
    } catch (error) {
      console.error('❌ Update env vars failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 15: Get logs
  async getLogs(resourceId, options = {}) {
    try {
      const params = {
        resource: resourceId,
        limit: options.limit || 100,
        direction: options.direction || 'backward',
        startTime: options.startTime,
        endTime: options.endTime
      };

      const response = await this.client.get('/logs', { params });

      console.log('📄 Logs:');
      response.data.logs.forEach(log => {
        console.log(`  [${log.timestamp}] ${log.message}`);
      });

      return response.data.logs;
    } catch (error) {
      console.error('❌ Get logs failed:', error.response?.data || error.message);
      return [];
    }
  }

  // STEP 16: Get performance metrics
  async getMetrics(resourceId, metricTypes, options = {}) {
    try {
      const params = {
        resourceId: resourceId,
        metricTypes: metricTypes,     // cpu_usage, memory_usage, etc.
        startTime: options.startTime,
        endTime: options.endTime,
        resolution: options.resolution || 60
      };

      const response = await this.client.get('/metrics', { params });

      console.log('📈 Metrics:');
      Object.entries(response.data).forEach(([metric, data]) => {
        console.log(`  ${metric}: ${data.length} data points`);
      });

      return response.data;
    } catch (error) {
      console.error('❌ Get metrics failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 17: Suspend service
  async suspendService(serviceId) {
    try {
      const response = await this.client.post(`/services/${serviceId}/suspend`);
      console.log('✅ Service suspended');
      return response.data;
    } catch (error) {
      console.error('❌ Suspend failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 18: Resume service
  async resumeService(serviceId) {
    try {
      const response = await this.client.post(`/services/${serviceId}/resume`);
      console.log('✅ Service resumed');
      return response.data;
    } catch (error) {
      console.error('❌ Resume failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 19: Delete service
  async deleteService(serviceId) {
    try {
      await this.client.delete(`/services/${serviceId}`);
      console.log('✅ Service deleted');
      return true;
    } catch (error) {
      console.error('❌ Delete failed:', error.response?.data || error.message);
      return false;
    }
  }

  // STEP 20: Query Postgres database
  async queryPostgres(postgresId, sql) {
    try {
      const response = await this.client.post(`/postgres/${postgresId}/query`, {
        sql: sql
      });

      console.log('📊 Query Results:');
      console.log('  Rows:', response.data.rows.length);
      if (response.data.rows.length > 0) {
        console.table(response.data.rows);
      }

      return response.data.rows;
    } catch (error) {
      console.error('❌ Query failed:', error.response?.data || error.message);
      return [];
    }
  }

  // STEP 21: List Postgres databases
  async listPostgres() {
    try {
      const response = await this.client.get('/postgres');

      console.log('🗄️ Postgres Databases:');
      response.data.forEach(db => {
        console.log(`  ${db.name} (${db.id})`);
        console.log(`    Plan: ${db.plan}`);
        console.log(`    Version: ${db.version}`);
        console.log(`    Region: ${db.region}`);
      });

      return response.data;
    } catch (error) {
      console.error('❌ List Postgres failed:', error.response?.data || error.message);
      return [];
    }
  }

  // STEP 22: Full deployment example
  async deployFullStack(projectName) {
    console.log(`🚀 Deploying full stack for ${projectName}...`);

    // Create database
    const db = await this.createPostgres({
      name: `${projectName}-db`,
      plan: 'free'
    });

    // Create web service
    const web = await this.createWebService({
      name: `${projectName}-web`,
      repo: 'https://github.com/your-username/your-repo',
      runtime: 'node',
      buildCommand: 'npm install && npm run build',
      startCommand: 'npm start',
      envVars: [
        { key: 'DATABASE_URL', value: db?.connectionInfo?.externalConnectionString }
      ]
    });

    // Create static site for frontend
    const frontend = await this.createStaticSite({
      name: `${projectName}-frontend`,
      repo: 'https://github.com/your-username/frontend-repo',
      buildCommand: 'npm install && npm run build',
      publishPath: 'dist',
      envVars: [
        { key: 'VITE_API_URL', value: web?.serviceDetails?.url }
      ]
    });

    return { db, web, frontend };
  }
}

// STEP 23: MCP Server Configuration
const MCP_CONFIG = {
  render: {
    command: 'node',
    args: ['/Users/justinetwaru/mcp-servers/render/index.js'],
    env: {
      RENDER_API_KEY: RENDER_API_KEY
    }
  }
};

// STEP 24: Main execution
async function main() {
  console.log('☁️ RENDER API CONNECTION DEMO\n');
  console.log('Configuration:');
  console.log('  API Key:', RENDER_API_KEY?.substring(0, 20) + '...');
  console.log('  Owner ID:', RENDER_OWNER_ID);
  console.log('');

  const render = new RenderAPI();

  // Test various operations
  await render.listServices();
  await render.listPostgres();

  // Example: Get metrics for a service
  // await render.getMetrics('srv-xxx', ['cpu_usage', 'memory_usage']);
}

// STEP 25: Export for use in other files
export default RenderAPI;
export { MCP_CONFIG };

// STEP 26: Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}