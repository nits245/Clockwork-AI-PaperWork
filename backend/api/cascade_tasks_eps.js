import express from 'express';
import db from '../utils/db.js';
const router = express.Router();
const pool = db;

// GET all tasks
router.get('/', async (req, res) => {
  const { type, completed } = req.query;
  
  try {
    let query = 'SELECT * FROM cascade_tasks WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    
    if (completed !== undefined) {
      query += ` AND completed = $${paramIndex}`;
      params.push(completed === 'true');
      paramIndex++;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET tasks for a specific block
router.get('/block/:blockId', async (req, res) => {
  const { blockId } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM cascade_tasks WHERE block_id = $1 ORDER BY created_at DESC',
      [blockId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching block tasks:', error);
    res.status(500).json({ error: 'Failed to fetch block tasks' });
  }
});

// GET a single task
router.get('/:taskId', async (req, res) => {
  const { taskId } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM cascade_tasks WHERE task_id = $1',
      [taskId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST create a new task
router.post('/', async (req, res) => {
  const { taskId, title, type, blockId, affectedItems } = req.body;
  
  if (!taskId || !title || !type) {
    return res.status(400).json({ error: 'taskId, title, and type are required' });
  }
  
  try {
    const result = await pool.query(
      `INSERT INTO cascade_tasks (task_id, title, type, block_id, affected_items) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [taskId, title, type, blockId || null, affectedItems || []]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT complete a task
router.put('/:taskId/complete', async (req, res) => {
  const { taskId } = req.params;
  const { completedBy } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE cascade_tasks 
       SET completed = TRUE, completed_at = CURRENT_TIMESTAMP, completed_by = $1 
       WHERE task_id = $2 
       RETURNING *`,
      [completedBy || null, taskId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

// DELETE a task
router.delete('/:taskId', async (req, res) => {
  const { taskId } = req.params;
  
  try {
    const result = await pool.query(
      'DELETE FROM cascade_tasks WHERE task_id = $1 RETURNING *',
      [taskId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// GET pending tasks count by type
router.get('/stats/pending', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT type, COUNT(*) as count 
       FROM cascade_tasks 
       WHERE completed = FALSE 
       GROUP BY type`
    );
    
    const stats = {
      cascade_update: 0,
      fork_review: 0,
      external_platform: 0,
      total: 0
    };
    
    result.rows.forEach(row => {
      stats[row.type] = parseInt(row.count);
      stats.total += parseInt(row.count);
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({ error: 'Failed to fetch task stats' });
  }
});

export default router;
