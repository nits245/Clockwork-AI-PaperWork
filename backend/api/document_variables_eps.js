import express from "express";
import cors from "cors";
import db from "../utils/db.js";
import ep_macros from "../utils/macro.js";

const document_variables_router = express.Router();
document_variables_router.use(cors());
document_variables_router.use(express.json());
const macros = new ep_macros();

// Get all variable values for a specific document instance
document_variables_router.get("/:document_container_id/variables", (req, res) => {
  const document_container_id = req.params.document_container_id;
  
  const query = `
    SELECT 
      dmvv.*,
      mv.var_name,
      mv.var_description,
      mv.var_type,
      mv.var_options,
      mv.default_value as master_default_value,
      tmv.variable_key,
      tmv.is_required,
      tmv.default_override,
      CASE 
        WHEN dmvv.variable_value IS NOT NULL THEN dmvv.variable_value
        WHEN tmv.default_override IS NOT NULL THEN tmv.default_override
        ELSE mv.default_value
      END as effective_value,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'group_id', vg.group_id,
            'group_name', vg.group_name
          )
        ) FILTER (WHERE vg.group_id IS NOT NULL), 
        '[]'
      ) as groups
    FROM document_container dc
    INNER JOIN template_master_variables tmv ON dc.document_template_id = tmv.document_template_id
    INNER JOIN master_variables mv ON tmv.master_var_id = mv.master_var_id
    LEFT JOIN document_master_variable_values dmvv ON dc.document_container_id = dmvv.document_container_id 
                                                    AND tmv.master_var_id = dmvv.master_var_id
    LEFT JOIN master_variable_groups mvg ON mv.master_var_id = mvg.master_var_id
    LEFT JOIN variable_groups vg ON mvg.group_id = vg.group_id
    WHERE dc.document_container_id = $1 AND mv.is_active = true
    GROUP BY dmvv.value_id, mv.master_var_id, tmv.template_master_id, dc.document_container_id
    ORDER BY mv.var_name
  `;
  
  db.query(query, [document_container_id], (err, result) => {
    if (err) {
      console.error("Error fetching document variables:", err);
      return res.status(500).json({ error: "Failed to fetch document variables" });
    }
    res.json(result.rows);
  });
});

// Set/update a variable value for a document instance
document_variables_router.put("/:document_container_id/variables/:master_var_id", (req, res) => {
  const document_container_id = req.params.document_container_id;
  const master_var_id = req.params.master_var_id;
  const { variable_value, is_inherited = false, updated_by } = req.body;
  
  // Verify the document container exists and has this master variable linked
  const verifyQuery = `
    SELECT 1
    FROM document_container dc
    INNER JOIN template_master_variables tmv ON dc.document_template_id = tmv.document_template_id
    WHERE dc.document_container_id = $1 AND tmv.master_var_id = $2
  `;
  
  db.query(verifyQuery, [document_container_id, master_var_id], (err, verifyResult) => {
    if (err) {
      return res.status(500).json({ error: "Failed to verify document variable relationship" });
    }
    
    if (verifyResult.rows.length === 0) {
      return res.status(404).json({ error: "Document variable relationship not found" });
    }
    
    // Upsert the variable value
    const upsertQuery = `
      INSERT INTO document_master_variable_values (document_container_id, master_var_id, variable_value, is_inherited, updated_by)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (document_container_id, master_var_id)
      DO UPDATE SET 
        variable_value = $3,
        is_inherited = $4,
        last_updated = CURRENT_TIMESTAMP,
        updated_by = $5
      RETURNING value_id
    `;
    
    db.query(upsertQuery, [document_container_id, master_var_id, variable_value, is_inherited, updated_by], (err, result) => {
      if (err) {
        console.error("Error updating document variable value:", err);
        return res.status(500).json({ error: "Failed to update document variable value" });
      }
      
      res.json({ 
        message: "Document variable value updated successfully",
        value_id: result.rows[0].value_id
      });
    });
  });
});

// Bulk update variable values for a document instance
document_variables_router.put("/:document_container_id/variables", (req, res) => {
  const document_container_id = req.params.document_container_id;
  const { variable_values, updated_by } = req.body; // Array of {master_var_id, variable_value, is_inherited}
  
  if (!Array.isArray(variable_values) || variable_values.length === 0) {
    return res.status(400).json({ error: "Variable values array is required" });
  }
  
  // Start transaction
  db.query('BEGIN', (err) => {
    if (err) {
      return res.status(500).json({ error: "Transaction start failed" });
    }
    
    let completedUpdates = 0;
    let errors = [];
    
    variable_values.forEach((varUpdate, index) => {
      const { master_var_id, variable_value, is_inherited = false } = varUpdate;
      
      const upsertQuery = `
        INSERT INTO document_master_variable_values (document_container_id, master_var_id, variable_value, is_inherited, updated_by)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (document_container_id, master_var_id)
        DO UPDATE SET 
          variable_value = $3,
          is_inherited = $4,
          last_updated = CURRENT_TIMESTAMP,
          updated_by = $5
      `;
      
      db.query(upsertQuery, [document_container_id, master_var_id, variable_value, is_inherited, updated_by], (err) => {
        if (err) {
          errors.push({ index, master_var_id, error: err.message });
        }
        
        completedUpdates++;
        
        // Check if all updates have been processed
        if (completedUpdates === variable_values.length) {
          if (errors.length > 0) {
            db.query('ROLLBACK', () => {
              res.status(500).json({ 
                error: "Some variable values could not be updated",
                errors: errors
              });
            });
          } else {
            db.query('COMMIT', (err) => {
              if (err) {
                return res.status(500).json({ error: "Transaction commit failed" });
              }
              res.json({ 
                message: `${variable_values.length} variable values updated successfully`
              });
            });
          }
        }
      });
    });
  });
});

// Reset a variable value to inherit from master (remove override)
document_variables_router.delete("/:document_container_id/variables/:master_var_id", (req, res) => {
  const document_container_id = req.params.document_container_id;
  const master_var_id = req.params.master_var_id;
  const { updated_by } = req.body;
  
  // Get the current master default value or template override
  const getMasterValueQuery = `
    SELECT 
      CASE 
        WHEN tmv.default_override IS NOT NULL THEN tmv.default_override
        ELSE mv.default_value
      END as master_value
    FROM document_container dc
    INNER JOIN template_master_variables tmv ON dc.document_template_id = tmv.document_template_id
    INNER JOIN master_variables mv ON tmv.master_var_id = mv.master_var_id
    WHERE dc.document_container_id = $1 AND mv.master_var_id = $2
  `;
  
  db.query(getMasterValueQuery, [document_container_id, master_var_id], (err, masterResult) => {
    if (err) {
      return res.status(500).json({ error: "Failed to get master variable value" });
    }
    
    if (masterResult.rows.length === 0) {
      return res.status(404).json({ error: "Document variable relationship not found" });
    }
    
    const master_value = masterResult.rows[0].master_value;
    
    // Update to inherit from master
    const resetQuery = `
      INSERT INTO document_master_variable_values (document_container_id, master_var_id, variable_value, is_inherited, updated_by)
      VALUES ($1, $2, $3, true, $4)
      ON CONFLICT (document_container_id, master_var_id)
      DO UPDATE SET 
        variable_value = $3,
        is_inherited = true,
        last_updated = CURRENT_TIMESTAMP,
        updated_by = $4
    `;
    
    db.query(resetQuery, [document_container_id, master_var_id, master_value, updated_by], (err) => {
      if (err) {
        console.error("Error resetting variable value:", err);
        return res.status(500).json({ error: "Failed to reset variable value" });
      }
      
      res.json({ 
        message: "Variable value reset to inherit from master successfully",
        new_value: master_value
      });
    });
  });
});

// Get cascade update history for a document
document_variables_router.get("/:document_container_id/cascade-history", (req, res) => {
  const document_container_id = req.params.document_container_id;
  const { limit = 50 } = req.query;
  
  const query = `
    SELECT 
      cul.*,
      mv.var_name,
      mv.var_description
    FROM cascade_update_log cul
    INNER JOIN master_variables mv ON cul.master_var_id = mv.master_var_id
    INNER JOIN document_master_variable_values dmvv ON mv.master_var_id = dmvv.master_var_id
    WHERE dmvv.document_container_id = $1 
      AND dmvv.is_inherited = true
      AND cul.completion_timestamp IS NOT NULL
    ORDER BY cul.update_timestamp DESC
    LIMIT $2
  `;
  
  db.query(query, [document_container_id, limit], (err, result) => {
    if (err) {
      console.error("Error fetching cascade history:", err);
      return res.status(500).json({ error: "Failed to fetch cascade history" });
    }
    res.json(result.rows);
  });
});

// Generate processed document content with variable substitution
document_variables_router.get("/:document_container_id/processed-content", (req, res) => {
  const document_container_id = req.params.document_container_id;
  
  // Get document template content and all variable values
  const query = `
    SELECT 
      dt.content as template_content,
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'variable_key', tmv.variable_key,
          'variable_value', CASE 
            WHEN dmvv.variable_value IS NOT NULL THEN dmvv.variable_value
            WHEN tmv.default_override IS NOT NULL THEN tmv.default_override
            ELSE mv.default_value
          END
        )
      ) as variables
    FROM document_container dc
    INNER JOIN document_template dt ON dc.document_template_id = dt.document_template_id
    INNER JOIN template_master_variables tmv ON dt.document_template_id = tmv.document_template_id
    INNER JOIN master_variables mv ON tmv.master_var_id = mv.master_var_id
    LEFT JOIN document_master_variable_values dmvv ON dc.document_container_id = dmvv.document_container_id 
                                                    AND tmv.master_var_id = dmvv.master_var_id
    WHERE dc.document_container_id = $1 AND mv.is_active = true
    GROUP BY dt.content
  `;
  
  db.query(query, [document_container_id], (err, result) => {
    if (err) {
      console.error("Error fetching document content:", err);
      return res.status(500).json({ error: "Failed to fetch document content" });
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }
    
    let processedContent = result.rows[0].template_content;
    const variables = result.rows[0].variables;
    
    // Replace variable placeholders with actual values
    variables.forEach(variable => {
      if (variable.variable_key && variable.variable_value !== null) {
        const placeholder = `{{${variable.variable_key}}}`;
        const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        processedContent = processedContent.replace(regex, variable.variable_value);
      }
    });
    
    res.json({
      template_content: result.rows[0].template_content,
      processed_content: processedContent,
      variables: variables
    });
  });
});

export default document_variables_router;