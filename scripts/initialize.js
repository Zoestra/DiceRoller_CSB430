#!/usr/bin/env node

/**
 * Database Initialization Script
 *
 * Initializes the SQLite database with schema from init-db.sql.
 * This script should be run before the app starts.
 *
 * Usage: npm run initialize
 *
 * ---
 * NOTE: This file was written with AI assistance (Claude Code).
 * ---
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../diceRoller.db');
const SCHEMA_PATH = path.join(__dirname, '../src/db/init-db.sql');
console.log('Loading schema from:', SCHEMA_PATH);

function main() {
  try {
    // Check if schema file exists
    if (!fs.existsSync(SCHEMA_PATH)) {
      console.error(`ERROR: Schema file not found: ${SCHEMA_PATH}`);
      process.exit(1);
    }

    // Load schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');

    // Open/create database
    const db = new Database(DB_PATH);
    console.log(`Database connection opened: ${DB_PATH}`);

    // Enable foreign key enforcement
    db.pragma('foreign_keys = ON');
    console.log('Foreign key enforcement enabled');

    // Execute schema
    db.exec(schema);
    console.log('Database schema initialized successfully');

    // Verify tables were created
    const tables = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table'
      ORDER BY name
    `).all();

    console.log(`\nCreated ${tables.length} tables:`);
    tables.forEach(function(table) {
      console.log(`   • ${table.name}`);
    });

    // Verify seed data
    const userState = db.prepare('SELECT * FROM user_state WHERE id = 1').get();
    const diceSets = db.prepare('SELECT COUNT(*) as count FROM dice_sets').get();
    const achievements = db.prepare('SELECT COUNT(*) as count FROM achievements').get();
    const skins = db.prepare('SELECT COUNT(*) as count FROM skins').get();

    console.log('\n Seed data verified:');
    console.log(` • User state initialized (points: ${userState.points})`);
    console.log(` • ${diceSets.count} dice sets created`);
    console.log(` • ${achievements.count} achievements created`);
    console.log(` • ${skins.count} skins created`);

    // Close database
    db.close();
    console.log('\nDatabase initialization complete!');
  } catch (error) {
    console.error('ERROR: Database initialization failed:', error.message);
    process.exit(1);
  }
}

main();
