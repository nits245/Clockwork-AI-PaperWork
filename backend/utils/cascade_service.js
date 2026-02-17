import db from './db.js';

/**
 * Cascade Update Service
 * Handles automatic propagation of master variable changes to dependent documents
 */
class CascadeUpdateService {
  constructor() {
    this.isProcessing = false;
    this.updateQueue = [];
  }

  /**
   * Queue a cascade update for processing
   * @param {number} masterVarId - ID of the master variable that changed
   * @param {string} oldValue - Previous value
   * @param {string} newValue - New value  
   * @param {string} updatedBy - User who initiated the change
   */
  async queueCascadeUpdate(masterVarId, oldValue, newValue, updatedBy) {
    try {
      // Log the cascade operation
      const logQuery = `
        INSERT INTO cascade_update_log (master_var_id, old_value, new_value, initiated_by, status)
        VALUES ($1, $2, $3, $4, 'pending')
        RETURNING log_id
      `;
      
      const result = await this.query(logQuery, [masterVarId, oldValue, newValue, updatedBy]);
      const logId = result.rows[0].log_id;
      
      // Add to processing queue
      this.updateQueue.push({
        logId,
        masterVarId,
        oldValue,
        newValue,
        updatedBy,
        timestamp: new Date()
      });
      
      // Process queue if not already processing
      if (!this.isProcessing) {
        this.processQueue();
      }
      
      return logId;
    } catch (error) {
      console.error('Error queuing cascade update:', error);
      throw error;
    }
  }

  /**
   * Process the cascade update queue
   */
  async processQueue() {
    if (this.isProcessing || this.updateQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`Processing ${this.updateQueue.length} cascade updates...`);

    while (this.updateQueue.length > 0) {
      const update = this.updateQueue.shift();
      await this.processCascadeUpdate(update);
    }

    this.isProcessing = false;
    console.log('Cascade update processing completed');
  }

  /**
   * Process a single cascade update
   * @param {Object} update - Update object from queue
   */
  async processCascadeUpdate(update) {
    const { logId, masterVarId, newValue, updatedBy } = update;
    
    try {
      // Get all document instances that should inherit this change
      const documentsQuery = `
        SELECT DISTINCT dmvv.document_container_id, dmvv.value_id
        FROM document_master_variable_values dmvv
        INNER JOIN document_container dc ON dmvv.document_container_id = dc.document_container_id
        INNER JOIN template_master_variables tmv ON dc.document_template_id = tmv.document_template_id 
                                                  AND dmvv.master_var_id = tmv.master_var_id
        WHERE dmvv.master_var_id = $1 AND dmvv.is_inherited = true
      `;
      
      const documentsResult = await this.query(documentsQuery, [masterVarId]);
      const affectedDocuments = documentsResult.rows;
      
      if (affectedDocuments.length === 0) {
        await this.completeCascadeLog(logId, 0, 'completed', null);
        return;
      }

      // Update all inherited values
      const updatePromises = affectedDocuments.map(doc => 
        this.updateDocumentVariable(doc.document_container_id, masterVarId, newValue, updatedBy)
      );
      
      await Promise.all(updatePromises);
      
      // Mark cascade as completed
      await this.completeCascadeLog(logId, affectedDocuments.length, 'completed', null);
      
      console.log(`Cascade update completed: ${affectedDocuments.length} documents updated`);
      
      // Trigger post-cascade hooks
      await this.triggerPostCascadeHooks(masterVarId, affectedDocuments.length);
      
    } catch (error) {
      console.error('Error processing cascade update:', error);
      await this.completeCascadeLog(logId, 0, 'failed', error.message);
    }
  }

  /**
   * Update a single document variable value
   */
  async updateDocumentVariable(documentContainerId, masterVarId, newValue, updatedBy) {
    const updateQuery = `
      UPDATE document_master_variable_values 
      SET variable_value = $1, last_updated = CURRENT_TIMESTAMP, updated_by = $2
      WHERE document_container_id = $3 AND master_var_id = $4 AND is_inherited = true
    `;
    
    return this.query(updateQuery, [newValue, updatedBy, documentContainerId, masterVarId]);
  }

  /**
   * Complete cascade update log entry
   */
  async completeCascadeLog(logId, affectedCount, status, errorMessage) {
    const completeQuery = `
      UPDATE cascade_update_log 
      SET affected_documents_count = $1, completion_timestamp = CURRENT_TIMESTAMP, 
          status = $2, error_message = $3
      WHERE log_id = $4
    `;
    
    return this.query(completeQuery, [affectedCount, status, errorMessage, logId]);
  }

  /**
   * Trigger post-cascade hooks (notifications, webhooks, etc.)
   */
  async triggerPostCascadeHooks(masterVarId, affectedCount) {
    try {
      // Get master variable info for notifications
      const varQuery = 'SELECT var_name, var_description FROM master_variables WHERE master_var_id = $1';
      const varResult = await this.query(varQuery, [masterVarId]);
      
      if (varResult.rows.length > 0) {
        const variable = varResult.rows[0];
        
        // Log notification (in real app, this could send emails, webhooks, etc.)
        console.log(`NOTIFICATION: Master variable "${variable.var_name}" cascade completed. ${affectedCount} documents updated.`);
        
        // Here you could add:
        // - Email notifications to affected users
        // - Webhook calls to external systems
        // - Real-time updates via WebSocket
        // - Audit log entries
      }
    } catch (error) {
      console.error('Error in post-cascade hooks:', error);
      // Don't throw - hooks failing shouldn't break the cascade
    }
  }

  /**
   * Get cascade update history
   */
  async getCascadeHistory(options = {}) {
    const { masterVarId, limit = 50, status, dateFrom, dateTo } = options;
    
    let query = `
      SELECT 
        cul.*,
        mv.var_name,
        mv.var_description
      FROM cascade_update_log cul
      INNER JOIN master_variables mv ON cul.master_var_id = mv.master_var_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (masterVarId) {
      query += ` AND cul.master_var_id = $${params.length + 1}`;
      params.push(masterVarId);
    }
    
    if (status) {
      query += ` AND cul.status = $${params.length + 1}`;
      params.push(status);
    }
    
    if (dateFrom) {
      query += ` AND cul.update_timestamp >= $${params.length + 1}`;
      params.push(dateFrom);
    }
    
    if (dateTo) {
      query += ` AND cul.update_timestamp <= $${params.length + 1}`;
      params.push(dateTo);
    }
    
    query += ` ORDER BY cul.update_timestamp DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    
    return this.query(query, params);
  }

  /**
   * Get cascade update statistics
   */
  async getCascadeStats() {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_cascades,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_cascades,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_cascades,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_cascades,
        SUM(affected_documents_count) as total_documents_updated,
        AVG(affected_documents_count) as avg_documents_per_cascade
      FROM cascade_update_log
      WHERE update_timestamp >= NOW() - INTERVAL '30 days'
    `;
    
    return this.query(statsQuery);
  }

  /**
   * Retry failed cascade updates
   */
  async retryFailedCascades(maxRetries = 3) {
    const failedCascadesQuery = `
      SELECT log_id, master_var_id, new_value, initiated_by
      FROM cascade_update_log 
      WHERE status = 'failed' 
        AND update_timestamp >= NOW() - INTERVAL '24 hours'
      ORDER BY update_timestamp DESC
    `;
    
    const result = await this.query(failedCascadesQuery);
    const failedCascades = result.rows;
    
    console.log(`Retrying ${failedCascades.length} failed cascades...`);
    
    for (const cascade of failedCascades) {
      try {
        // Reset status to pending
        await this.query(
          'UPDATE cascade_update_log SET status = $1, error_message = NULL WHERE log_id = $2',
          ['pending', cascade.log_id]
        );
        
        // Add to queue for reprocessing
        this.updateQueue.push({
          logId: cascade.log_id,
          masterVarId: cascade.master_var_id,
          newValue: cascade.new_value,
          updatedBy: cascade.initiated_by,
          timestamp: new Date(),
          isRetry: true
        });
      } catch (error) {
        console.error(`Error queuing retry for cascade ${cascade.log_id}:`, error);
      }
    }
    
    // Process the retry queue
    if (!this.isProcessing) {
      this.processQueue();
    }
    
    return failedCascades.length;
  }

  /**
   * Clean up old cascade logs
   */
  async cleanupOldLogs(daysToKeep = 90) {
    const cleanupQuery = `
      DELETE FROM cascade_update_log 
      WHERE update_timestamp < NOW() - INTERVAL '${daysToKeep} days'
        AND status IN ('completed', 'failed')
    `;
    
    const result = await this.query(cleanupQuery);
    console.log(`Cleaned up ${result.rowCount} old cascade log entries`);
    
    return result.rowCount;
  }

  /**
   * Database query wrapper with connection handling
   */
  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Start the cascade service (periodic cleanup, retry failed cascades, etc.)
   */
  start() {
    console.log('Starting Cascade Update Service...');
    
    // Retry failed cascades every hour
    setInterval(() => {
      this.retryFailedCascades().catch(console.error);
    }, 60 * 60 * 1000);
    
    // Cleanup old logs daily
    setInterval(() => {
      this.cleanupOldLogs().catch(console.error);
    }, 24 * 60 * 60 * 1000);
    
    console.log('Cascade Update Service started');
  }

  /**
   * Stop the cascade service
   */
  stop() {
    console.log('Stopping Cascade Update Service...');
    // In a real implementation, you'd clear intervals and finish processing
    console.log('Cascade Update Service stopped');
  }
}

// Export singleton instance
const cascadeUpdateService = new CascadeUpdateService();
export default cascadeUpdateService;