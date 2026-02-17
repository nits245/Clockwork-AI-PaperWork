import express from "express";
import cors from "cors";
import db from "../utils/db.js";

const document_instance_router = express.Router();
document_instance_router.use(cors());
document_instance_router.use(express.json());

/**
 * Save a new document instance
 * POST /document-instance
 * 
 * Creates a document_container entry linking a template to a user
 * with the filled-in variable values
 */
document_instance_router.post("/", async (req, res) => {
  const { 
    document_template_id, 
    identity_id, 
    var_list, 
    tenant_id 
  } = req.body;

  // Validate required fields
  if (!document_template_id || !identity_id) {
    return res.status(400).json({ 
      error: "Missing required fields: document_template_id and identity_id are required" 
    });
  }

  const issue_date = new Date().toISOString();
  const effective_tenant_id = tenant_id || req.tenantId || 'default_tenant';

  try {
    // Check if tenant_id column exists in the table
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'document_container' 
      AND column_name = 'tenant_id'
    `;
    
    const columnCheck = await db.query(checkColumnQuery);
    const hasTenantColumn = columnCheck.rows.length > 0;

    // Insert document instance into document_container
    let insertQuery, queryParams;
    
    if (hasTenantColumn) {
      insertQuery = `
        INSERT INTO document_container 
          (identity_id, document_template_id, issue_date, var_list, tenant_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING document_container_id, issue_date
      `;
      queryParams = [
        identity_id,
        document_template_id,
        issue_date,
        var_list || null,
        effective_tenant_id
      ];
    } else {
      insertQuery = `
        INSERT INTO document_container 
          (identity_id, document_template_id, issue_date, var_list)
        VALUES ($1, $2, $3, $4)
        RETURNING document_container_id, issue_date
      `;
      queryParams = [
        identity_id,
        document_template_id,
        issue_date,
        var_list || null
      ];
    }

    const result = await db.query(insertQuery, queryParams);

    const newDocument = result.rows[0];

    res.status(201).json({
      message: "Document saved successfully",
      document_container_id: newDocument.document_container_id,
      issue_date: newDocument.issue_date,
      document_template_id,
      identity_id
    });

  } catch (error) {
    console.error("Error saving document:", error);
    res.status(500).json({ 
      error: "Failed to save document",
      details: error.message 
    });
  }
});

/**
 * Get all document instances for a user
 * GET /document-instance/user/:identity_id
 */
document_instance_router.get("/user/:identity_id", async (req, res) => {
  const { identity_id } = req.params;

  try {
    const query = `
      SELECT 
        dc.document_container_id,
        dc.identity_id,
        dc.document_template_id,
        dc.issue_date,
        dc.signed_date,
        dc.var_list,
        dt.title as template_title,
        dt.type as template_type,
        dt.content as template_content,
        ddt.title as category_title
      FROM document_container dc
      INNER JOIN document_template dt 
        ON dc.document_template_id = dt.document_template_id
      INNER JOIN document_default_template ddt
        ON dt.type = ddt.type
      WHERE dc.identity_id = $1
      ORDER BY dc.issue_date DESC
    `;

    const result = await db.query(query, [identity_id]);

    res.json({
      documents: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error("Error fetching user documents:", error);
    res.status(500).json({ 
      error: "Failed to fetch documents",
      details: error.message 
    });
  }
});

/**
 * Get recently created documents (for homepage widget)
 * GET /document-instance/recent?limit=5
 */
document_instance_router.get("/recent", async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  try {
    const query = `
      SELECT 
        dc.document_container_id,
        dc.identity_id,
        dc.document_template_id,
        dc.issue_date,
        dc.signed_date,
        dt.title as template_title,
        dt.type as template_type,
        i.firstname,
        i.lastname,
        i.email
      FROM document_container dc
      INNER JOIN document_template dt 
        ON dc.document_template_id = dt.document_template_id
      INNER JOIN identity i
        ON dc.identity_id = i.identity_id
      ORDER BY dc.issue_date DESC
      LIMIT $1
    `;

    const result = await db.query(query, [limit]);

    res.json({
      documents: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error("Error fetching recent documents:", error);
    res.status(500).json({ 
      error: "Failed to fetch recent documents",
      details: error.message 
    });
  }
});

/**
 * Get a specific document instance
 * GET /document-instance/:id
 */
document_instance_router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT 
        dc.*,
        dt.title as template_title,
        dt.type as template_type,
        dt.content as template_content,
        dt.version as template_version,
        ddt.title as category_title,
        i.firstname,
        i.lastname,
        i.email
      FROM document_container dc
      INNER JOIN document_template dt 
        ON dc.document_template_id = dt.document_template_id
      INNER JOIN document_default_template ddt
        ON dt.type = ddt.type
      LEFT JOIN identity i
        ON dc.identity_id = i.identity_id
      WHERE dc.document_container_id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: "Document not found" 
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ 
      error: "Failed to fetch document",
      details: error.message 
    });
  }
});

/**
 * Update a document instance (edit saved document)
 * PUT /document-instance/:id
 */
document_instance_router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { var_list, signed_date } = req.body;

  try {
    // Build dynamic update query based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (var_list !== undefined) {
      updates.push(`var_list = $${paramCount}`);
      values.push(var_list);
      paramCount++;
    }

    if (signed_date !== undefined) {
      updates.push(`signed_date = $${paramCount}`);
      values.push(signed_date);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        error: "No fields to update" 
      });
    }

    // Add document_container_id to values
    values.push(id);

    const updateQuery = `
      UPDATE document_container
      SET ${updates.join(', ')}
      WHERE document_container_id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: "Document not found or access denied" 
      });
    }

    res.json({
      message: "Document updated successfully",
      document: result.rows[0]
    });

  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ 
      error: "Failed to update document",
      details: error.message 
    });
  }
});

/**
 * Delete a document instance
 * DELETE /document-instance/:id
 */
document_instance_router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleteQuery = `
      DELETE FROM document_container
      WHERE document_container_id = $1
      RETURNING document_container_id
    `;

    const result = await db.query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: "Document not found or access denied" 
      });
    }

    res.json({
      message: "Document deleted successfully",
      document_container_id: result.rows[0].document_container_id
    });

  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ 
      error: "Failed to delete document",
      details: error.message 
    });
  }
});

export default document_instance_router;
