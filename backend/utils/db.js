import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration for PaperWork-Module
const dbConfig = {
  user: process.env.DB_USER || 'paperwork_user',
  password: process.env.DB_PASSWORD || 'paperwork2024!',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'paperwork_module',
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database:', dbConfig.database);
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Query helper function with tenant isolation support
const query = async (text, params, tenantId = null) => {
  const start = Date.now();
  const client = await pool.connect();
  try {
    // Set tenant context if provided
    if (tenantId) {
      await client.query(`SET LOCAL app.current_tenant = '${tenantId}'`);
    }
    
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    if (res && res.rows) {
      console.log('Executed query', { text: text.substring(0, 50) + '...', duration, rows: res.rows.length, tenant: tenantId || 'none' });
    }
    return res;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

// Query helper for multi-tenant operations
const queryWithTenant = async (text, params, tenantId) => {
  if (!tenantId) {
    throw new Error('Tenant ID is required for this operation');
  }
  return query(text, params, tenantId);
};

// Transaction helper
const getClient = async () => {
  const client = await pool.connect();
  return client;
};

// Tenant context manager
class TenantContext {
  constructor(client, tenantId) {
    this.client = client;
    this.tenantId = tenantId;
  }

  async query(text, params) {
    return this.client.query(text, params);
  }

  async release() {
    this.client.release();
  }
}

// Get a client with tenant context
const getTenantClient = async (tenantId) => {
  if (!tenantId) {
    throw new Error('Tenant ID is required');
  }
  const client = await pool.connect();
  await client.query(`SET LOCAL app.current_tenant = '${tenantId}'`);
  return new TenantContext(client, tenantId);
};

// For backward compatibility
const db = {
  query,
  queryWithTenant,
  getClient,
  getTenantClient,
  pool,
  // Legacy method support
  connect: () => pool.connect(),
  end: () => pool.end()
};

export default db;
