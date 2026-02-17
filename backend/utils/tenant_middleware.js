import db from './db.js';

/**
 * Middleware to extract and set tenant context
 * Tenant ID can come from:
 * 1. Request header (X-Tenant-ID)
 * 2. JWT token payload
 * 3. Subdomain
 * 4. Query parameter (for development)
 */
export const tenantMiddleware = async (req, res, next) => {
  try {
    // Extract tenant ID from various sources
    let tenantId = 
      req.headers['x-tenant-id'] || 
      req.query.tenant_id ||
      req.user?.tenant_id ||
      extractTenantFromSubdomain(req) ||
      'default_tenant';

    // Validate tenant ID format
    if (!isValidTenantId(tenantId)) {
      return res.status(400).json({ 
        error: 'Invalid tenant ID format',
        message: 'Tenant ID must be alphanumeric with underscores/hyphens only'
      });
    }

    // Attach tenant ID to request object
    req.tenantId = tenantId;
    
    // Log tenant context
    console.log(`Request on tenant: ${tenantId} - ${req.method} ${req.path}`);
    
    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({ error: 'Internal server error in tenant processing' });
  }
};

/**
 * Extract tenant from subdomain (e.g., tenant1.paperwork.com -> tenant1)
 */
function extractTenantFromSubdomain(req) {
  const host = req.headers.host || '';
  const parts = host.split('.');
  
  // If subdomain exists and is not 'www'
  if (parts.length > 2 && parts[0] !== 'www') {
    return parts[0];
  }
  
  return null;
}

/**
 * Validate tenant ID format (alphanumeric, underscore, hyphen only)
 */
function isValidTenantId(tenantId) {
  return /^[a-zA-Z0-9_-]+$/.test(tenantId);
}

/**
 * Middleware to require specific tenant context
 */
export const requireTenant = (req, res, next) => {
  if (!req.tenantId || req.tenantId === 'default_tenant') {
    return res.status(400).json({ 
      error: 'Tenant required',
      message: 'This operation requires a valid tenant context'
    });
  }
  next();
};

/**
 * Middleware to get a database client with tenant context
 */
export const withTenantClient = async (req, res, next) => {
  try {
    req.tenantClient = await db.getTenantClient(req.tenantId);
    
    // Ensure client is released even if handler errors
    res.on('finish', () => {
      if (req.tenantClient) {
        req.tenantClient.release();
      }
    });
    
    next();
  } catch (error) {
    console.error('Error getting tenant client:', error);
    res.status(500).json({ error: 'Database connection error' });
  }
};

/**
 * Admin middleware - bypass tenant isolation for admin users
 */
export const adminBypass = (req, res, next) => {
  if (req.user?.role === 'admin' || req.user?.role === 'superadmin') {
    req.bypassTenant = true;
    console.log('Admin tenant bypass enabled');
  }
  next();
};

export default {
  tenantMiddleware,
  requireTenant,
  withTenantClient,
  adminBypass
};
