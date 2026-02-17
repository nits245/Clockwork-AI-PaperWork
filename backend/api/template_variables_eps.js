import express from "express";
import cors from "cors";
import db from "../utils/db.js";
import ep_macros from "../utils/macro.js";

const template_variables_router = express.Router();
template_variables_router.use(cors());
template_variables_router.use(express.json());
const macros = new ep_macros();

// Get all master variables linked to a specific template
template_variables_router.get("/:template_id/master-variables", (req, res) => {
  const template_id = req.params.template_id;
  
  const query = `
    SELECT 
      tmv.*,
      mv.var_name,
      mv.var_description,
      mv.var_type,
      mv.var_options,
      mv.default_value,
      mv.is_active,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'group_id', vg.group_id,
            'group_name', vg.group_name
          )
        ) FILTER (WHERE vg.group_id IS NOT NULL), 
        '[]'
      ) as groups
    FROM template_master_variables tmv
    INNER JOIN master_variables mv ON tmv.master_var_id = mv.master_var_id
    LEFT JOIN master_variable_groups mvg ON mv.master_var_id = mvg.master_var_id
    LEFT JOIN variable_groups vg ON mvg.group_id = vg.group_id
    WHERE tmv.document_template_id = $1 AND mv.is_active = true
    GROUP BY tmv.template_master_id, mv.master_var_id
    ORDER BY mv.var_name
  `;
  
  db.query(query, [template_id], (err, result) => {
    if (err) {
      console.error("Error fetching template master variables:", err);
      return res.status(500).json({ error: "Failed to fetch template master variables" });
    }
    res.json(result.rows);
  });
});

// Link a master variable to a template
template_variables_router.post("/:template_id/master-variables", (req, res) => {
  const template_id = req.params.template_id;
  const { master_var_id, variable_key, is_required = false, default_override } = req.body;
  
  // Check if the template exists
  db.query('SELECT document_template_id FROM document_template WHERE document_template_id = $1', [template_id], (err, templateResult) => {
    if (err) {
      return res.status(500).json({ error: "Failed to verify template" });
    }
    
    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: "Template not found" });
    }
    
    // Check if master variable exists
    db.query('SELECT master_var_id FROM master_variables WHERE master_var_id = $1 AND is_active = true', [master_var_id], (err, varResult) => {
      if (err) {
        return res.status(500).json({ error: "Failed to verify master variable" });
      }
      
      if (varResult.rows.length === 0) {
        return res.status(404).json({ error: "Master variable not found or inactive" });
      }
      
      // Link the master variable to the template
      const insertQuery = `
        INSERT INTO template_master_variables (document_template_id, master_var_id, variable_key, is_required, default_override)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (document_template_id, master_var_id, variable_key) 
        DO UPDATE SET is_required = $4, default_override = $5, created_date = CURRENT_TIMESTAMP
        RETURNING template_master_id
      `;
      
      db.query(insertQuery, [template_id, master_var_id, variable_key, is_required, default_override], (err, result) => {
        if (err) {
          console.error("Error linking master variable to template:", err);
          return res.status(500).json({ error: "Failed to link master variable to template" });
        }
        
        res.status(201).json({ 
          message: "Master variable linked to template successfully",
          template_master_id: result.rows[0].template_master_id
        });
      });
    });
  });
});

// Update a template-master variable relationship
template_variables_router.put("/:template_id/master-variables/:template_master_id", (req, res) => {
  const template_id = req.params.template_id;
  const template_master_id = req.params.template_master_id;
  const { variable_key, is_required, default_override } = req.body;
  
  const updateQuery = `
    UPDATE template_master_variables 
    SET variable_key = $1, is_required = $2, default_override = $3
    WHERE template_master_id = $4 AND document_template_id = $5
  `;
  
  db.query(updateQuery, [variable_key, is_required, default_override, template_master_id, template_id], (err, result) => {
    if (err) {
      console.error("Error updating template master variable relationship:", err);
      return res.status(500).json({ error: "Failed to update template master variable relationship" });
    }
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Template master variable relationship not found" });
    }
    
    res.json({ 
      message: "Template master variable relationship updated successfully"
    });
  });
});

// Unlink a master variable from a template
template_variables_router.delete("/:template_id/master-variables/:template_master_id", (req, res) => {
  const template_id = req.params.template_id;
  const template_master_id = req.params.template_master_id;
  
  // Check if there are any document instances using this variable
  const usageCheckQuery = `
    SELECT COUNT(*) as usage_count
    FROM document_master_variable_values dmvv
    INNER JOIN document_container dc ON dmvv.document_container_id = dc.document_container_id
    INNER JOIN template_master_variables tmv ON dmvv.master_var_id = tmv.master_var_id
    WHERE tmv.template_master_id = $1 AND dc.document_template_id = $2
  `;
  
  db.query(usageCheckQuery, [template_master_id, template_id], (err, usageResult) => {
    if (err) {
      return res.status(500).json({ error: "Failed to check variable usage" });
    }
    
    const usageCount = parseInt(usageResult.rows[0].usage_count);
    
    if (usageCount > 0) {
      return res.status(400).json({ 
        error: "Cannot unlink master variable that is being used in document instances",
        usage_count: usageCount
      });
    }
    
    // Safe to delete the relationship
    const deleteQuery = `
      DELETE FROM template_master_variables 
      WHERE template_master_id = $1 AND document_template_id = $2
    `;
    
    db.query(deleteQuery, [template_master_id, template_id], (err, result) => {
      if (err) {
        console.error("Error unlinking master variable from template:", err);
        return res.status(500).json({ error: "Failed to unlink master variable from template" });
      }
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Template master variable relationship not found" });
      }
      
      res.json({ 
        message: "Master variable unlinked from template successfully"
      });
    });
  });
});

// Get available master variables that can be linked to a template
template_variables_router.get("/:template_id/available-master-variables", (req, res) => {
  const template_id = req.params.template_id;
  const { group_id } = req.query;
  
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
      ) as groups,
      CASE WHEN tmv.master_var_id IS NOT NULL THEN true ELSE false END as is_linked
    FROM master_variables mv
    LEFT JOIN master_variable_groups mvg ON mv.master_var_id = mvg.master_var_id
    LEFT JOIN variable_groups vg ON mvg.group_id = vg.group_id
    LEFT JOIN template_master_variables tmv ON mv.master_var_id = tmv.master_var_id 
                                            AND tmv.document_template_id = $1
    WHERE mv.is_active = true
  `;
  
  const params = [template_id];
  
  if (group_id) {
    query += ` AND mvg.group_id = $${params.length + 1}`;
    params.push(group_id);
  }
  
  query += ` GROUP BY mv.master_var_id, tmv.master_var_id ORDER BY mv.var_name`;
  
  db.query(query, params, (err, result) => {
    if (err) {
      console.error("Error fetching available master variables:", err);
      return res.status(500).json({ error: "Failed to fetch available master variables" });
    }
    res.json(result.rows);
  });
});

// Bulk link multiple master variables to a template
template_variables_router.post("/:template_id/master-variables/bulk", (req, res) => {
  const template_id = req.params.template_id;
  const { variable_links } = req.body; // Array of {master_var_id, variable_key, is_required, default_override}
  
  if (!Array.isArray(variable_links) || variable_links.length === 0) {
    return res.status(400).json({ error: "Variable links array is required" });
  }
  
  // Start transaction
  db.query('BEGIN', (err) => {
    if (err) {
      return res.status(500).json({ error: "Transaction start failed" });
    }
    
    let completedLinks = 0;
    let errors = [];
    
    variable_links.forEach((link, index) => {
      const { master_var_id, variable_key, is_required = false, default_override } = link;
      
      const insertQuery = `
        INSERT INTO template_master_variables (document_template_id, master_var_id, variable_key, is_required, default_override)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (document_template_id, master_var_id, variable_key) 
        DO UPDATE SET is_required = $4, default_override = $5, created_date = CURRENT_TIMESTAMP
      `;
      
      db.query(insertQuery, [template_id, master_var_id, variable_key, is_required, default_override], (err) => {
        if (err) {
          errors.push({ index, master_var_id, error: err.message });
        }
        
        completedLinks++;
        
        // Check if all links have been processed
        if (completedLinks === variable_links.length) {
          if (errors.length > 0) {
            db.query('ROLLBACK', () => {
              res.status(500).json({ 
                error: "Some master variables could not be linked",
                errors: errors
              });
            });
          } else {
            db.query('COMMIT', (err) => {
              if (err) {
                return res.status(500).json({ error: "Transaction commit failed" });
              }
              res.status(201).json({ 
                message: `${variable_links.length} master variables linked successfully`
              });
            });
          }
        }
      });
    });
  });
});

export default template_variables_router;