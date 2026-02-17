import express from "express";
import cors from "cors";
import db from "../utils/db.js";
import ep_macros from "../utils/macro.js";

const master_variables_router = express.Router();
master_variables_router.use(cors());
master_variables_router.use(express.json());
const macros = new ep_macros();

// Logging middleware
master_variables_router.use((req, res, next) => {
  console.log(`[ROUTER] ${req.method} ${req.path}`);
  next();
});

// Get all master variables with optional grouping
master_variables_router.get("/", async (req, res) => {
  const { group_id, include_inactive } = req.query;
  
  let query = `
    SELECT 
      mv.*,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'group_id', vg.group_id,
            'group_name', vg.group_name
          )
        ) FILTER (WHERE vg.group_id IS NOT NULL), 
        '[]'
      ) as groups
    FROM master_variables mv
    LEFT JOIN master_variable_groups mvg ON mv.master_var_id = mvg.master_var_id
    LEFT JOIN variable_groups vg ON mvg.group_id = vg.group_id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (group_id) {
    query += ` AND mvg.group_id = $${params.length + 1}`;
    params.push(group_id);
  }
  
  if (!include_inactive) {
    query += ` AND mv.is_active = true`;
  }
  
  query += ` GROUP BY mv.master_var_id ORDER BY mv.var_name`;
  
  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching master variables:", err);
    res.status(500).json({ error: "Failed to fetch master variables" });
  }
});

// Get a specific master variable
master_variables_router.get("/:id", (req, res) => {
  const query = `
    SELECT 
      mv.*,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'group_id', vg.group_id,
            'group_name', vg.group_name,
            'sort_order', mvg.sort_order
          )
        ) FILTER (WHERE vg.group_id IS NOT NULL), 
        '[]'
      ) as groups,
      (
        SELECT COUNT(DISTINCT tmv.document_template_id)
        FROM template_master_variables tmv
        WHERE tmv.master_var_id = mv.master_var_id
      ) as template_usage_count,
      (
        SELECT COUNT(DISTINCT dmvv.document_container_id)
        FROM document_master_variable_values dmvv
        WHERE dmvv.master_var_id = mv.master_var_id
      ) as document_usage_count
    FROM master_variables mv
    LEFT JOIN master_variable_groups mvg ON mv.master_var_id = mvg.master_var_id
    LEFT JOIN variable_groups vg ON mvg.group_id = vg.group_id
    WHERE mv.master_var_id = $1
    GROUP BY mv.master_var_id
  `;
  
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error("Error fetching master variable:", err);
      return res.status(500).json({ error: "Failed to fetch master variable" });
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Master variable not found" });
    }
    
    res.json(result.rows[0]);
  });
});

// Create a new master variable
master_variables_router.post("/", async (req, res) => {
  const {
    var_name,
    var_description,
    var_type = 'text',
    var_options,
    default_value,
    created_by,
    group_ids = []
  } = req.body;
  
  try {
    // Start transaction
    await db.query('BEGIN');
    
    // Insert master variable
    const insertQuery = `
      INSERT INTO master_variables (var_name, var_description, var_type, var_options, default_value, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING master_var_id
    `;
    
    const result = await db.query(insertQuery, [var_name, var_description, var_type, var_options, default_value, created_by]);
    const master_var_id = result.rows[0].master_var_id;
    
    // Add to groups if specified
    if (group_ids.length > 0) {
      const groupInserts = group_ids.map((group_id, index) => 
        `($1, $${index + 2}, ${index})`
      ).join(', ');
      
      const groupQuery = `INSERT INTO master_variable_groups (master_var_id, group_id, sort_order) VALUES ${groupInserts}`;
      await db.query(groupQuery, [master_var_id, ...group_ids]);
    }
    
    await db.query('COMMIT');
    
    res.status(201).json({ 
      message: "Master variable created successfully", 
      master_var_id 
    });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error("Error creating master variable:", err);
    return res.status(500).json({ error: "Failed to create master variable: " + err.message });
  }
});

// Update a master variable (with cascade option)
master_variables_router.put("/:id", async (req, res) => {
  console.log(`[PUT] Received update request for master_var_id=${req.params.id}`);
  const master_var_id = parseInt(req.params.id); // Ensure it's a number
  const {
    var_name,
    var_description,
    var_type,
    var_options,
    default_value,
    is_active,
    cascade_update = false,
    updated_by
  } = req.body;
  console.log(`[PUT] cascade_update=${cascade_update}, var_name=${var_name}, master_var_id type=${typeof master_var_id}`);
  
  try {
    // Get current default value for cascade comparison
    console.log('[PUT] Fetching current default value...');
    const currentResult = await db.query('SELECT default_value FROM master_variables WHERE master_var_id = $1', [master_var_id]);
    
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: "Master variable not found" });
    }
    
    const currentDefaultValue = currentResult.rows[0].default_value;
    const valueChanged = currentDefaultValue !== default_value;
    
    // Update the master variable
    console.log('[PUT] Executing UPDATE query...');
    console.log('[PUT] Update params:', {
      var_name, 
      var_description: var_description?.substring(0, 50),
      var_type, 
      var_options: var_options?.substring(0, 50),
      default_value: default_value?.substring(0, 50),
      is_active, 
      master_var_id
    });
    const updateQuery = `
      UPDATE master_variables 
      SET var_name = $1, var_description = $2, var_type = $3, var_options = $4, 
          default_value = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
      WHERE master_var_id = $7
      RETURNING master_var_id, var_name
    `;
    
    const updateResult = await db.query(updateQuery, [var_name, var_description, var_type, var_options, default_value, is_active, master_var_id]);
    console.log('[PUT] Update result rows:', updateResult.rows.length, updateResult.rows[0]);
    
    console.log('[PUT] Update successful, sending response');
    res.json({ 
      message: "Master variable updated successfully", 
      master_var_id,
      cascade_queued: false
    });
    
  } catch (err) {
    console.error('[PUT] Error:', err);
    return res.status(500).json({ error: "Failed to update master variable: " + err.message });
  }
});

// Delete a master variable
master_variables_router.delete("/:id", (req, res) => {
  const master_var_id = req.params.id;
  
  // Check if variable is in use
  const usageCheckQuery = `
    SELECT 
      (SELECT COUNT(*) FROM template_master_variables WHERE master_var_id = $1) as template_count,
      (SELECT COUNT(*) FROM document_master_variable_values WHERE master_var_id = $1) as document_count
  `;
  
  db.query(usageCheckQuery, [master_var_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to check variable usage" });
    }
    
    const { template_count, document_count } = result.rows[0];
    
    if (template_count > 0 || document_count > 0) {
      return res.status(400).json({ 
        error: "Cannot delete master variable that is in use",
        usage: { template_count, document_count }
      });
    }
    
    // Delete the master variable (cascade will handle related records)
    db.query('DELETE FROM master_variables WHERE master_var_id = $1', [master_var_id], (err) => {
      if (err) {
        console.error("Error deleting master variable:", err);
        return res.status(500).json({ error: "Failed to delete master variable" });
      }
      
      res.json({ message: "Master variable deleted successfully" });
    });
  });
});

// Get variable groups
master_variables_router.get("/groups/all", async (req, res) => {
  const query = `
    SELECT 
      vg.*,
      COUNT(mvg.master_var_id) as variable_count
    FROM variable_groups vg
    LEFT JOIN master_variable_groups mvg ON vg.group_id = mvg.group_id
    WHERE vg.is_active = true
    GROUP BY vg.group_id
    ORDER BY vg.group_name
  `;
  
  try {
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching variable groups:", err);
    res.status(500).json({ error: "Failed to fetch variable groups" });
  }
});

// Create a new variable group
master_variables_router.post("/groups", (req, res) => {
  const { group_name, group_description } = req.body;
  
  const insertQuery = `
    INSERT INTO variable_groups (group_name, group_description)
    VALUES ($1, $2)
    RETURNING group_id
  `;
  
  db.query(insertQuery, [group_name, group_description], (err, result) => {
    if (err) {
      console.error("Error creating variable group:", err);
      return res.status(500).json({ error: "Failed to create variable group" });
    }
    
    res.status(201).json({ 
      message: "Variable group created successfully", 
      group_id: result.rows[0].group_id 
    });
  });
});

export default master_variables_router;