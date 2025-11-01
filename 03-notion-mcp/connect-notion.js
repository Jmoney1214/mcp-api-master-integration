#!/usr/bin/env node
/**
 * NOTION API INTEGRATION - COMPLETE CONNECTION GUIDE
 * ==================================================
 * Line-by-line guide to Notion API and MCP operations
 * Database queries, page creation, content management
 */

// STEP 1: Import required packages
import { Client } from '@notionhq/client';        // Official Notion SDK
import axios from 'axios';                        // For direct API calls
import dotenv from 'dotenv';                      // Environment variables

// STEP 2: Load environment variables
dotenv.config({ path: '../configs/.env' });

// STEP 3: Configuration
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = '30e69da8-ce72-472b-b6e1-602e40fe8b42';  // Your main database

// STEP 4: Initialize Notion client
const notion = new Client({
  auth: NOTION_API_KEY,
  notionVersion: '2022-06-28'  // API version
});

// STEP 5: Notion API class wrapper
class NotionAPI {
  constructor() {
    this.notion = notion;
    this.databaseId = NOTION_DATABASE_ID;
  }

  // STEP 6: Search across all Notion content
  async search(query, filter = {}) {
    try {
      const response = await this.notion.search({
        query: query,
        filter: filter,           // {object: 'page'} or {object: 'database'}
        page_size: 10,
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time'
        }
      });

      console.log(`🔍 Search Results for "${query}":`);
      response.results.forEach(result => {
        const title = this.extractTitle(result);
        console.log(`  ${result.object}: ${title} (${result.id})`);
      });

      return response.results;
    } catch (error) {
      console.error('❌ Search failed:', error.message);
      return [];
    }
  }

  // STEP 7: Get page with all content
  async getPage(pageId) {
    try {
      // Get page properties
      const page = await this.notion.pages.retrieve({
        page_id: pageId
      });

      // Get page blocks (content)
      const blocks = await this.notion.blocks.children.list({
        block_id: pageId,
        page_size: 100
      });

      console.log('📄 Page Details:');
      console.log('  Title:', this.extractTitle(page));
      console.log('  Created:', page.created_time);
      console.log('  Blocks:', blocks.results.length);

      return { page, blocks: blocks.results };
    } catch (error) {
      console.error('❌ Get page failed:', error.message);
      return null;
    }
  }

  // STEP 8: Query a database
  async queryDatabase(databaseId, filter = null, sorts = []) {
    try {
      const response = await this.notion.databases.query({
        database_id: databaseId || this.databaseId,
        filter: filter,           // Complex filters
        sorts: sorts,            // Sorting rules
        page_size: 25
      });

      console.log('📊 Database Query Results:');
      response.results.forEach(page => {
        const title = this.extractTitle(page);
        console.log(`  ${title}`);
      });

      return response.results;
    } catch (error) {
      console.error('❌ Database query failed:', error.message);
      return [];
    }
  }

  // STEP 9: Create a new page
  async createPage(title, content, properties = {}) {
    try {
      const response = await this.notion.pages.create({
        parent: {
          database_id: this.databaseId
        },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: title
                }
              }
            ]
          },
          ...properties           // Additional properties
        },
        children: content        // Page blocks
      });

      console.log('✅ Page created:', response.id);
      return response;
    } catch (error) {
      console.error('❌ Create page failed:', error.message);
      return null;
    }
  }

  // STEP 10: Update page properties
  async updatePage(pageId, properties) {
    try {
      const response = await this.notion.pages.update({
        page_id: pageId,
        properties: properties
      });

      console.log('✅ Page updated');
      return response;
    } catch (error) {
      console.error('❌ Update page failed:', error.message);
      return null;
    }
  }

  // STEP 11: Append blocks to a page
  async appendBlocks(pageId, blocks) {
    try {
      const response = await this.notion.blocks.children.append({
        block_id: pageId,
        children: blocks
      });

      console.log('✅ Blocks appended:', response.results.length);
      return response.results;
    } catch (error) {
      console.error('❌ Append blocks failed:', error.message);
      return [];
    }
  }

  // STEP 12: Get database schema
  async getDatabaseSchema(databaseId) {
    try {
      const response = await this.notion.databases.retrieve({
        database_id: databaseId || this.databaseId
      });

      console.log('📋 Database Schema:');
      Object.entries(response.properties).forEach(([key, prop]) => {
        console.log(`  ${key}: ${prop.type}`);
      });

      return response.properties;
    } catch (error) {
      console.error('❌ Get schema failed:', error.message);
      return null;
    }
  }

  // STEP 13: Create a database
  async createDatabase(title, properties) {
    try {
      const response = await this.notion.databases.create({
        parent: {
          type: 'page_id',
          page_id: 'YOUR_PARENT_PAGE_ID'  // Parent page
        },
        title: [
          {
            text: {
              content: title
            }
          }
        ],
        properties: properties    // Database schema
      });

      console.log('✅ Database created:', response.id);
      return response;
    } catch (error) {
      console.error('❌ Create database failed:', error.message);
      return null;
    }
  }

  // STEP 14: Delete a block/page
  async deleteBlock(blockId) {
    try {
      const response = await this.notion.blocks.delete({
        block_id: blockId
      });

      console.log('✅ Block deleted');
      return response;
    } catch (error) {
      console.error('❌ Delete failed:', error.message);
      return null;
    }
  }

  // STEP 15: Get all users
  async listUsers() {
    try {
      const response = await this.notion.users.list({
        page_size: 100
      });

      console.log('👥 Notion Users:');
      response.results.forEach(user => {
        console.log(`  ${user.name} (${user.type})`);
      });

      return response.results;
    } catch (error) {
      console.error('❌ List users failed:', error.message);
      return [];
    }
  }

  // STEP 16: Complex database filter example
  async queryWithFilters() {
    const filter = {
      and: [
        {
          property: 'Status',
          select: {
            equals: 'In Progress'
          }
        },
        {
          property: 'Priority',
          select: {
            equals: 'High'
          }
        },
        {
          property: 'Due Date',
          date: {
            on_or_before: new Date().toISOString()
          }
        }
      ]
    };

    const sorts = [
      {
        property: 'Priority',
        direction: 'descending'
      },
      {
        property: 'Due Date',
        direction: 'ascending'
      }
    ];

    return await this.queryDatabase(this.databaseId, filter, sorts);
  }

  // STEP 17: Create rich content blocks
  createRichContent() {
    return [
      {
        type: 'heading_1',
        heading_1: {
          rich_text: [
            {
              text: {
                content: 'Project Overview'
              }
            }
          ]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              text: {
                content: 'This is a ',
              }
            },
            {
              text: {
                content: 'bold',
              },
              annotations: {
                bold: true
              }
            },
            {
              text: {
                content: ' and ',
              }
            },
            {
              text: {
                content: 'italic',
              },
              annotations: {
                italic: true
              }
            },
            {
              text: {
                content: ' text with a ',
              }
            },
            {
              text: {
                content: 'link',
                link: {
                  url: 'https://notion.so'
                }
              },
              annotations: {
                color: 'blue'
              }
            }
          ]
        }
      },
      {
        type: 'to_do',
        to_do: {
          rich_text: [
            {
              text: {
                content: 'Complete integration'
              }
            }
          ],
          checked: false
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [
            {
              text: {
                content: 'First bullet point'
              }
            }
          ]
        }
      },
      {
        type: 'code',
        code: {
          rich_text: [
            {
              text: {
                content: 'console.log("Hello Notion!");'
              }
            }
          ],
          language: 'javascript'
        }
      },
      {
        type: 'divider',
        divider: {}
      },
      {
        type: 'table',
        table: {
          table_width: 2,
          has_column_header: true,
          has_row_header: false,
          children: [
            {
              type: 'table_row',
              table_row: {
                cells: [
                  [{ text: { content: 'Header 1' } }],
                  [{ text: { content: 'Header 2' } }]
                ]
              }
            },
            {
              type: 'table_row',
              table_row: {
                cells: [
                  [{ text: { content: 'Cell 1' } }],
                  [{ text: { content: 'Cell 2' } }]
                ]
              }
            }
          ]
        }
      }
    ];
  }

  // STEP 18: Helper to extract title from page/database
  extractTitle(item) {
    if (item.properties?.title?.title?.[0]?.text?.content) {
      return item.properties.title.title[0].text.content;
    }
    if (item.properties?.Name?.title?.[0]?.text?.content) {
      return item.properties.Name.title[0].text.content;
    }
    if (item.title?.[0]?.text?.content) {
      return item.title[0].text.content;
    }
    return 'Untitled';
  }

  // STEP 19: Create a task in database
  async createTask(title, description, dueDate, priority = 'Medium') {
    const properties = {
      'Task': {
        title: [
          {
            text: {
              content: title
            }
          }
        ]
      },
      'Description': {
        rich_text: [
          {
            text: {
              content: description
            }
          }
        ]
      },
      'Status': {
        select: {
          name: 'Not Started'
        }
      },
      'Priority': {
        select: {
          name: priority
        }
      },
      'Due Date': {
        date: {
          start: dueDate
        }
      }
    };

    return await this.notion.pages.create({
      parent: {
        database_id: this.databaseId
      },
      properties: properties
    });
  }

  // STEP 20: Export database to JSON
  async exportDatabase(databaseId) {
    const pages = await this.queryDatabase(databaseId);
    const exportData = [];

    for (const page of pages) {
      const blocks = await this.notion.blocks.children.list({
        block_id: page.id
      });

      exportData.push({
        id: page.id,
        properties: page.properties,
        content: blocks.results
      });
    }

    return exportData;
  }
}

// STEP 21: MCP Server Configuration
const MCP_CONFIG = {
  notion: {
    command: 'node',
    args: ['/Users/justinetwaru/mcp-servers/notion/index.js'],
    env: {
      NOTION_API_KEY: NOTION_API_KEY
    }
  }
};

// STEP 22: Main execution
async function main() {
  console.log('📓 NOTION API CONNECTION DEMO\n');
  console.log('Configuration:');
  console.log('  API Key:', NOTION_API_KEY?.substring(0, 20) + '...');
  console.log('  Database ID:', NOTION_DATABASE_ID);
  console.log('');

  const notionAPI = new NotionAPI();

  // Test various operations
  await notionAPI.search('Legacy Wine');
  await notionAPI.getDatabaseSchema();
  await notionAPI.queryDatabase();
  await notionAPI.listUsers();
}

// STEP 23: Export for use in other files
export default NotionAPI;
export { MCP_CONFIG };

// STEP 24: Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}