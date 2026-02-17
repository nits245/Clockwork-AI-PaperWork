import express from 'express';
import db from '../utils/db.js';
const router = express.Router();
const pool = db;

// GET all participant groups
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM participant_groups ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching participant groups:', error);
    res.status(500).json({ error: 'Failed to fetch participant groups' });
  }
});

// GET participant group by document instance ID
router.get('/document/:documentInstanceId', async (req, res) => {
  const { documentInstanceId } = req.params;
  
  try {
    const groupResult = await pool.query(
      'SELECT * FROM participant_groups WHERE document_instance_id = $1',
      [documentInstanceId]
    );
    
    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Participant group not found' });
    }
    
    const group = groupResult.rows[0];
    
    // Get all variables for this group
    const variablesResult = await pool.query(
      'SELECT * FROM participant_variables WHERE group_id = $1 ORDER BY participant_index, full_variable_name',
      [group.id]
    );
    
    res.json({
      ...group,
      participants: variablesResult.rows
    });
  } catch (error) {
    console.error('Error fetching participant group:', error);
    res.status(500).json({ error: 'Failed to fetch participant group' });
  }
});

// POST create a new participant group
router.post('/', async (req, res) => {
  const { documentInstanceId, templateId, participantCount, variables } = req.body;
  
  if (!documentInstanceId || !templateId || !participantCount) {
    return res.status(400).json({ 
      error: 'documentInstanceId, templateId, and participantCount are required' 
    });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insert participant group
    const groupResult = await client.query(
      `INSERT INTO participant_groups (document_instance_id, template_id, participant_count) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [documentInstanceId, templateId, participantCount]
    );
    
    const group = groupResult.rows[0];
    
    // Insert participant variables
    if (variables && Array.isArray(variables)) {
      for (const variable of variables) {
        await client.query(
          `INSERT INTO participant_variables (group_id, participant_index, base_variable_name, full_variable_name, value, inherited_from) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            group.id,
            variable.participantIndex,
            variable.baseVariableName,
            variable.fullVariableName,
            variable.value || null,
            variable.inheritedFrom || null
          ]
        );
      }
    }
    
    await client.query('COMMIT');
    
    // Fetch complete group with variables
    const variablesResult = await pool.query(
      'SELECT * FROM participant_variables WHERE group_id = $1',
      [group.id]
    );
    
    res.status(201).json({
      ...group,
      participants: variablesResult.rows
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating participant group:', error);
    res.status(500).json({ error: 'Failed to create participant group' });
  } finally {
    client.release();
  }
});

// PUT update participant group (add/remove participants)
router.put('/:groupId', async (req, res) => {
  const { groupId } = req.params;
  const { participantCount, variables } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Update participant count
    if (participantCount !== undefined) {
      await client.query(
        'UPDATE participant_groups SET participant_count = $1 WHERE id = $2',
        [participantCount, groupId]
      );
    }
    
    // Update variables if provided
    if (variables && Array.isArray(variables)) {
      // Delete existing variables
      await client.query(
        'DELETE FROM participant_variables WHERE group_id = $1',
        [groupId]
      );
      
      // Insert new variables
      for (const variable of variables) {
        await client.query(
          `INSERT INTO participant_variables (group_id, participant_index, base_variable_name, full_variable_name, value, inherited_from) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            groupId,
            variable.participantIndex,
            variable.baseVariableName,
            variable.fullVariableName,
            variable.value || null,
            variable.inheritedFrom || null
          ]
        );
      }
    }
    
    await client.query('COMMIT');
    
    // Fetch updated group
    const groupResult = await pool.query(
      'SELECT * FROM participant_groups WHERE id = $1',
      [groupId]
    );
    
    const variablesResult = await pool.query(
      'SELECT * FROM participant_variables WHERE group_id = $1 ORDER BY participant_index, full_variable_name',
      [groupId]
    );
    
    res.json({
      ...groupResult.rows[0],
      participants: variablesResult.rows
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating participant group:', error);
    res.status(500).json({ error: 'Failed to update participant group' });
  } finally {
    client.release();
  }
});

// PUT update a single participant variable
router.put('/variable/:variableId', async (req, res) => {
  const { variableId } = req.params;
  const { value } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE participant_variables SET value = $1 WHERE id = $2 RETURNING *',
      [value, variableId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Variable not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating variable:', error);
    res.status(500).json({ error: 'Failed to update variable' });
  }
});

// DELETE a participant group
router.delete('/:groupId', async (req, res) => {
  const { groupId } = req.params;
  
  try {
    const result = await pool.query(
      'DELETE FROM participant_groups WHERE id = $1 RETURNING *',
      [groupId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Participant group not found' });
    }
    
    res.json({ message: 'Participant group deleted successfully' });
  } catch (error) {
    console.error('Error deleting participant group:', error);
    res.status(500).json({ error: 'Failed to delete participant group' });
  }
});

export default router;
