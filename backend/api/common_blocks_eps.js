import express from 'express';
import db from '../utils/db.js';
const router = express.Router();
const pool = db;

// GET all common blocks
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM common_blocks ORDER BY title ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching common blocks:', error);
    res.status(500).json({ error: 'Failed to fetch common blocks' });
  }
});

// GET a single common block by ID
router.get('/:blockId', async (req, res) => {
  const { blockId } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM common_blocks WHERE block_id = $1',
      [blockId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Common block not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching common block:', error);
    res.status(500).json({ error: 'Failed to fetch common block' });
  }
});

// GET version history for a common block
router.get('/:blockId/versions', async (req, res) => {
  const { blockId } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM block_versions WHERE block_id = $1 ORDER BY timestamp DESC',
      [blockId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching version history:', error);
    res.status(500).json({ error: 'Failed to fetch version history' });
  }
});

// POST create a new common block
router.post('/', async (req, res) => {
  const { blockId, title, content, tags, usedIn } = req.body;
  
  if (!blockId || !title || !content) {
    return res.status(400).json({ error: 'block_id, title, and content are required' });
  }
  
  try {
    // Insert common block
    const blockResult = await pool.query(
      `INSERT INTO common_blocks (block_id, title, content, version, tags, used_in) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [blockId, title, content, '1.0.0', tags || [], usedIn || []]
    );
    
    // Insert initial version history
    await pool.query(
      `INSERT INTO block_versions (block_id, version, content, change_description) 
       VALUES ($1, $2, $3, $4)`,
      [blockId, '1.0.0', content, 'Initial version']
    );
    
    res.status(201).json(blockResult.rows[0]);
  } catch (error) {
    console.error('Error creating common block:', error);
    res.status(500).json({ error: 'Failed to create common block' });
  }
});

// PUT update a common block (with cascade and versioning)
router.put('/:blockId', async (req, res) => {
  const { blockId } = req.params;
  const { content, changeDescription, changedBy } = req.body;
  
  if (!content || !changeDescription) {
    return res.status(400).json({ error: 'content and changeDescription are required' });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get current block info
    const currentBlock = await client.query(
      'SELECT * FROM common_blocks WHERE block_id = $1',
      [blockId]
    );
    
    if (currentBlock.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Common block not found' });
    }
    
    const block = currentBlock.rows[0];
    
    // Increment version
    const versionParts = block.version.split('.');
    const newVersion = `${versionParts[0]}.${parseInt(versionParts[1]) + 1}.${versionParts[2]}`;
    
    // Update common block
    await client.query(
      `UPDATE common_blocks 
       SET content = $1, version = $2, last_updated = CURRENT_TIMESTAMP 
       WHERE block_id = $3`,
      [content, newVersion, blockId]
    );
    
    // Insert version history
    await client.query(
      `INSERT INTO block_versions (block_id, version, content, change_description, changed_by) 
       VALUES ($1, $2, $3, $4, $5)`,
      [blockId, newVersion, content, changeDescription, changedBy || null]
    );
    
    // Check for forked blocks that need review
    const forkedBlocks = await client.query(
      'SELECT * FROM forked_blocks WHERE block_id = $1 AND needs_review = FALSE',
      [blockId]
    );
    
    // Mark forks as needing review
    if (forkedBlocks.rows.length > 0) {
      await client.query(
        'UPDATE forked_blocks SET needs_review = TRUE WHERE block_id = $1',
        [blockId]
      );
    }
    
    // Create cascade update task
    const taskId = `cascade_${blockId}_${Date.now()}`;
    await client.query(
      `INSERT INTO cascade_tasks (task_id, title, type, block_id, affected_items) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        taskId,
        `Review cascade update for ${block.title}`,
        'cascade_update',
        blockId,
        block.used_in || []
      ]
    );
    
    // Create external platform task
    const externalTaskId = `external_${blockId}_${Date.now()}`;
    await client.query(
      `INSERT INTO cascade_tasks (task_id, title, type, block_id, affected_items) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        externalTaskId,
        `Update ${block.title} on external platforms`,
        'external_platform',
        blockId,
        ['Airbnb', 'Flatmates', 'Website']
      ]
    );
    
    await client.query('COMMIT');
    
    const updatedBlock = await pool.query(
      'SELECT * FROM common_blocks WHERE block_id = $1',
      [blockId]
    );
    
    res.json({
      block: updatedBlock.rows[0],
      affectedTemplates: block.used_in || [],
      affectedForks: forkedBlocks.rows.length,
      newVersion: newVersion
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating common block:', error);
    res.status(500).json({ error: 'Failed to update common block' });
  } finally {
    client.release();
  }
});

// DELETE a common block
router.delete('/:blockId', async (req, res) => {
  const { blockId } = req.params;
  
  try {
    const result = await pool.query(
      'DELETE FROM common_blocks WHERE block_id = $1 RETURNING *',
      [blockId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Common block not found' });
    }
    
    res.json({ message: 'Common block deleted successfully' });
  } catch (error) {
    console.error('Error deleting common block:', error);
    res.status(500).json({ error: 'Failed to delete common block' });
  }
});

export default router;
