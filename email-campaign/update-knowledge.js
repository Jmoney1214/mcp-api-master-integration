#!/usr/bin/env node
/**
 * UPDATE BUSINESS KNOWLEDGE
 *
 * Teach the system about:
 * - New products
 * - Upcoming events
 * - Successful posts
 * - Industry trends
 */

import fs from 'fs';
import readline from 'readline';

const KNOWLEDGE_BASE = './business-knowledge.json';

function loadKnowledge() {
  return JSON.parse(fs.readFileSync(KNOWLEDGE_BASE, 'utf8'));
}

function saveKnowledge(knowledge) {
  fs.writeFileSync(KNOWLEDGE_BASE, JSON.stringify(knowledge, null, 2));
  console.log('✅ Knowledge base updated!\n');
}

// Add new product
function addNewProduct(interactive = false) {
  const knowledge = loadKnowledge();

  if (interactive) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\n🆕 ADD NEW PRODUCT\n');

    const questions = [
      'Product name: ',
      'Category (wine/beer/liquor): ',
      'Description: ',
      'Price (optional): ',
      'Image URL (optional): '
    ];

    let answers = [];
    let i = 0;

    const ask = () => {
      if (i < questions.length) {
        rl.question(questions[i], (answer) => {
          answers.push(answer);
          i++;
          ask();
        });
      } else {
        const [name, category, description, price, imageUrl] = answers;

        const product = {
          name,
          category: category || 'wine',
          description,
          price: price || null,
          imageUrl: imageUrl || null,
          added: new Date().toISOString()
        };

        knowledge.inventory_tracking.new_arrivals.push(product);
        saveKnowledge(knowledge);

        console.log(`\n✅ Added: ${name}`);
        console.log('\n📸 Generate a post for this product:');
        console.log(`   node smart-post-generator.js new-product "${name}"\n`);

        rl.close();
      }
    };

    ask();
  } else {
    // Command line mode
    const name = process.argv[3];
    if (!name) {
      console.log('Usage: node update-knowledge.js add-product "Product Name"');
      return;
    }

    const product = {
      name,
      category: 'wine',
      description: 'New arrival - limited quantities available.',
      added: new Date().toISOString()
    };

    knowledge.inventory_tracking.new_arrivals.push(product);
    saveKnowledge(knowledge);

    console.log(`✅ Added new product: ${name}\n`);
  }
}

// Add event
function addEvent() {
  const knowledge = loadKnowledge();
  const eventName = process.argv[3];
  const eventDate = process.argv[4];

  if (!eventName || !eventDate) {
    console.log('Usage: node update-knowledge.js add-event "Event Name" "Date"');
    console.log('Example: node update-knowledge.js add-event "Wine Tasting Night" "2025-11-15"');
    return;
  }

  const event = {
    name: eventName,
    date: eventDate,
    added: new Date().toISOString()
  };

  if (!knowledge.holidays_and_events.store_events) {
    knowledge.holidays_and_events.store_events = [];
  }

  knowledge.holidays_and_events.store_events.push(event);
  saveKnowledge(knowledge);

  console.log(`✅ Added event: ${eventName} on ${eventDate}\n`);
}

// Mark post as successful
function recordSuccess() {
  const knowledge = loadKnowledge();
  const theme = process.argv[3];
  const engagement = process.argv[4] || 'high';

  if (!theme) {
    console.log('Usage: node update-knowledge.js record-success "Theme" "engagement"');
    return;
  }

  const record = {
    theme,
    engagement,
    timestamp: new Date().toISOString()
  };

  knowledge.learning.successful_posts.push(record);
  saveKnowledge(knowledge);

  console.log(`✅ Recorded successful post: ${theme} (${engagement} engagement)\n`);
}

// Show current inventory
function showInventory() {
  const knowledge = loadKnowledge();
  const inventory = knowledge.inventory_tracking;

  console.log('\n📦 CURRENT INVENTORY TRACKING\n');
  console.log('='.repeat(60));

  console.log('\n🆕 NEW ARRIVALS:');
  if (inventory.new_arrivals.length === 0) {
    console.log('   (none yet)');
  } else {
    inventory.new_arrivals.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} (${p.category})`);
      if (p.added) console.log(`      Added: ${new Date(p.added).toLocaleDateString()}`);
    });
  }

  console.log('\n🌟 BEST SELLERS:');
  if (inventory.best_sellers.length === 0) {
    console.log('   (not tracked yet)');
  } else {
    inventory.best_sellers.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p}`);
    });
  }

  console.log('\n💰 SALE ITEMS:');
  if (inventory.sale_items.length === 0) {
    console.log('   (no active sales)');
  } else {
    inventory.sale_items.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p}`);
    });
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// Show learning insights
function showLearning() {
  const knowledge = loadKnowledge();
  const learning = knowledge.learning;

  console.log('\n🧠 LEARNING INSIGHTS\n');
  console.log('='.repeat(60));

  console.log('\n✅ SUCCESSFUL POSTS:');
  if (learning.successful_posts.length === 0) {
    console.log('   (no data yet - system will learn as you post)');
  } else {
    const recent = learning.successful_posts.slice(-5);
    recent.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.theme || 'Post'} - ${p.engagement || 'tracked'}`);
      if (p.posted_at) {
        console.log(`      Posted: ${new Date(p.posted_at).toLocaleDateString()}`);
      }
    });
  }

  console.log('\n📊 ENGAGEMENT PATTERNS:');
  console.log('   (Will track best posting times, hashtags, themes)');

  console.log('\n' + '='.repeat(60) + '\n');
}

// Interactive menu
function interactiveMenu() {
  console.log('\n🧠 KNOWLEDGE BASE MANAGER\n');
  console.log('='.repeat(60));
  console.log('\n1. Add new product');
  console.log('2. Add event');
  console.log('3. View inventory');
  console.log('4. View learning insights');
  console.log('5. Record successful post');
  console.log('6. Exit\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Select option: ', (answer) => {
    rl.close();

    switch (answer) {
      case '1':
        addNewProduct(true);
        break;
      case '2':
        console.log('\nUse: node update-knowledge.js add-event "Name" "Date"');
        break;
      case '3':
        showInventory();
        break;
      case '4':
        showLearning();
        break;
      case '5':
        console.log('\nUse: node update-knowledge.js record-success "Theme" "engagement"');
        break;
      default:
        console.log('Goodbye!\n');
    }
  });
}

// Main
function main() {
  const command = process.argv[2];

  if (!command) {
    interactiveMenu();
    return;
  }

  switch (command) {
    case 'add-product':
      addNewProduct(false);
      break;
    case 'add-event':
      addEvent();
      break;
    case 'show-inventory':
      showInventory();
      break;
    case 'show-learning':
      showLearning();
      break;
    case 'record-success':
      recordSuccess();
      break;
    default:
      console.log('Unknown command. Use: node update-knowledge.js [command]');
      console.log('\nCommands:');
      console.log('  add-product "Name"');
      console.log('  add-event "Name" "Date"');
      console.log('  show-inventory');
      console.log('  show-learning');
      console.log('  record-success "Theme" "engagement"');
  }
}

main();

/*
USAGE:

# Interactive mode
node update-knowledge.js

# Add new product
node update-knowledge.js add-product "Caymus Cabernet 2021"

# Add store event
node update-knowledge.js add-event "Wine Tasting Night" "2025-11-15"

# View what the system knows
node update-knowledge.js show-inventory
node update-knowledge.js show-learning

# Tell it when a post does well
node update-knowledge.js record-success "Wine Wednesday" "high"
*/
