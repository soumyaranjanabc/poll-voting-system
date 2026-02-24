#!/usr/bin/env bash
npm install
node -e "
const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const schema = fs.readFileSync('./config/schema.sql', 'utf8');
pool.query(schema).then(() => {
  console.log('✅ Schema applied');
  pool.end();
}).catch(err => {
  console.error('Schema error (may already exist):', err.message);
  pool.end();
});
"
