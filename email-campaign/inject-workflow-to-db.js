#!/usr/bin/env node
/**
 * Inject Instagram Workflow Directly into N8N Database
 * Bypasses API authentication by writing directly to SQLite
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// N8N Database path
const DB_PATH = join(process.env.HOME, '.n8n', 'database.sqlite');

// Read workflow JSON
const workflowData = JSON.parse(
  fs.readFileSync(join(__dirname, 'n8n-instagram-workflow.json'), 'utf8')
);

console.log('🚀 Injecting Instagram Workflow into N8N Database...\n');

try {
  // Open database
  console.log('📂 Opening N8N database:', DB_PATH);
  const db = new Database(DB_PATH);

  // Check if workflow already exists
  const existing = db.prepare(
    'SELECT id FROM workflow_entity WHERE name = ?'
  ).get(workflowData.name);

  if (existing) {
    console.log('⚠️  Workflow already exists:', existing.id);
    console.log('   Updating existing workflow...');

    db.prepare(`
      UPDATE workflow_entity
      SET nodes = ?,
          connections = ?,
          active = ?,
          settings = ?,
          updatedAt = datetime('now')
      WHERE id = ?
    `).run(
      JSON.stringify(workflowData.nodes),
      JSON.stringify(workflowData.connections),
      workflowData.active ? 1 : 0,
      JSON.stringify(workflowData.settings || {}),
      existing.id
    );

    console.log('✅ Workflow updated successfully!');
    console.log('   ID:', existing.id);

  } else {
    // Insert new workflow
    console.log('📝 Creating new workflow...');

    const result = db.prepare(`
      INSERT INTO workflow_entity (
        name,
        nodes,
        connections,
        active,
        settings,
        createdAt,
        updatedAt
      ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      workflowData.name,
      JSON.stringify(workflowData.nodes),
      JSON.stringify(workflowData.connections),
      workflowData.active ? 1 : 0,
      JSON.stringify(workflowData.settings || {})
    );

    console.log('✅ Workflow created successfully!');
    console.log('   ID:', result.lastInsertRowid);
  }

  // Close database
  db.close();

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Instagram Workflow Successfully Injected!');
  console.log('='.repeat(60));

  console.log('\n📍 Webhook URL:');
  console.log('   http://localhost:5678/webhook/instagram-post');

  console.log('\n🔄 Next Steps:');
  console.log('1. Restart N8N to load the workflow');
  console.log('2. Open N8N UI: http://localhost:5678');
  console.log('3. Activate the workflow');
  console.log('4. Test: node post-to-instagram.js weekendSpecial');

} catch (error) {
  console.error('\n❌ Database injection failed:');
  console.error('   Error:', error.message);
  process.exit(1);
}
