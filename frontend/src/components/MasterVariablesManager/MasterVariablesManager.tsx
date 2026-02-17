import React, { useState, useEffect } from 'react';
import './MasterVariablesManager.scss';
import { FALLBACK_VARIABLES } from '../../data/database-sync';

interface MasterVariable {
  master_var_id: number;
  var_name: string;
  var_description: string;
  var_type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  var_options?: string;
  default_value: string;
  is_active: boolean;
  groups: Array<{
    group_id: number;
    group_name: string;
  }>;
  template_usage_count?: number;
  document_usage_count?: number;
}

interface VariableGroup {
  group_id: number;
  group_name: string;
  group_description: string;
  variable_count: number;
}

// API base URL - try multiple endpoints
const API_ENDPOINTS = [
  'http://127.0.0.1:8800',      // Direct backend - 127.0.0.1 (MOST RELIABLE on Windows)
  'http://localhost:8800',      // Direct backend - localhost alternative
  '',                           // React proxy (may not work on Windows)
  'http://localhost:3001/api',  // Database Proxy (direct DB access)
  'http://127.0.0.1:3001/api',  // Database Proxy alternative
  'http://localhost:9999',      // Bridge API - Direct Database Access
  'http://127.0.0.1:9999'       // Bridge API - Alternative localhost
];

const fetchWithFallback = async (path: string, options?: RequestInit) => {
  let lastError;
  
  for (const baseUrl of API_ENDPOINTS) {
    const startTime = performance.now();
    try {
      const url = baseUrl + path;
      console.log(`[API] Trying: ${url}`);
      
      // Add timeout to prevent waiting too long on unresponsive endpoints
      // Use longer timeout for POST/PUT/DELETE operations
      const isWriteOperation = options?.method && ['POST', 'PUT', 'DELETE'].includes(options.method);
      const timeoutDuration = isWriteOperation ? 10000 : 3000; // 10s for writes, 3s for reads
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const elapsed = (performance.now() - startTime).toFixed(0);
      
      if (response.ok) {
        console.log(`[API] Success (${elapsed}ms): ${url}`);
        // Add endpoint info to response for success messages
        (response as any).usedEndpoint = baseUrl || 'proxy';
        return response;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      const elapsed = (performance.now() - startTime).toFixed(0);
      if (error instanceof Error && error.name === 'AbortError') {
        console.log(`[API] Timeout (${elapsed}ms): ${baseUrl + path}`);
      } else {
        console.log(`[API] Failed (${elapsed}ms): ${baseUrl + path}`, error);
      }
      lastError = error;
      continue;
    }
  }
  
  throw lastError;
};

const MasterVariablesManager: React.FC = () => {
  const [variables, setVariables] = useState<MasterVariable[]>([]);
  const [groups, setGroups] = useState<VariableGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingVariable, setEditingVariable] = useState<MasterVariable | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    var_name: '',
    var_description: '',
    var_type: 'text' as 'text' | 'number' | 'date' | 'boolean' | 'select',
    var_options: '',
    default_value: '',
    group_ids: [] as number[]
  });

  useEffect(() => {
    fetchVariables();
    fetchGroups();
  }, [selectedGroup]);

  const fetchVariables = async () => {
    const startTime = performance.now();
    console.log('[FETCH] Fetching variables from database...');
    try {
      // Use query parameter for filtering by group
      const path = selectedGroup ? `/master-variables?group_id=${selectedGroup}` : '/master-variables';
      console.log(`[FETCH] API path: ${path}`);
      
      const response = await fetchWithFallback(path);
      const data = await response.json();
      
      const loadTime = (performance.now() - startTime).toFixed(2);
      console.log(`[FETCH] Loaded ${data.length} variables from database in ${loadTime}ms`);
      setVariables(data);
      setError(null);
    } catch (err) {
      const loadTime = (performance.now() - startTime).toFixed(2);
      console.error(`❌ Error fetching variables from API (${loadTime}ms):`, err);
      console.log('📂 Using local fallback data (auto-synced from database)');
      
      // Use real database data (auto-synced)
      setVariables(FALLBACK_VARIABLES);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetchWithFallback('/master-variables/groups/all');
      const data = await response.json();
      setGroups(data);
    } catch (err) {
      console.error('Error fetching groups:', err);
      
      // Fallback to real database data (from direct database test)
      setGroups([
        { group_id: 4, group_name: 'Assessment Data', group_description: 'Assessment and evaluation information', variable_count: 0 },
        { group_id: 1, group_name: 'Entity Information', group_description: 'Basic entity and organization details', variable_count: 0 },
        { group_id: 5, group_name: 'Financial Information', group_description: 'Fees, deposits, and financial details', variable_count: 0 },
        { group_id: 6, group_name: 'Legal and Compliance', group_description: 'Legal reviewer and compliance information', variable_count: 0 },
        { group_id: 2, group_name: 'Location Data', group_description: 'Address and location information', variable_count: 0 },
        { group_id: 7, group_name: 'nLive Program', group_description: 'nLive program specific variables', variable_count: 0 },
        { group_id: 3, group_name: 'Participant Details', group_description: 'Individual participant information', variable_count: 0 }
      ]);
    }
  };

  const handleCreateVariable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Try API first
      const response = await fetchWithFallback('/master-variables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          created_by: 'current_user'
        })
      });

      if (!response.ok) throw new Error('Failed to create variable');

      setShowCreateModal(false);
      resetForm();
      fetchVariables();
      
      // Show endpoint-specific success message
      const endpoint = (response as any).usedEndpoint;
      if (endpoint === 'http://127.0.0.1:9999' || endpoint === 'http://localhost:9999') {
        setSuccessMessage('Variable created successfully via Database Bridge');
      } else if (endpoint) {
        setSuccessMessage('Variable created successfully via API');
      } else {
        setSuccessMessage('Variable created successfully via Proxy');
      }
    } catch (err) {
      console.error('All API endpoints failed for create:', err);
      
      // Fallback: Create locally
      const newVariable: MasterVariable = {
        master_var_id: Math.max(...variables.map(v => v.master_var_id)) + 1,
        var_name: formData.var_name,
        var_description: formData.var_description,
        var_type: formData.var_type,
        var_options: formData.var_options || undefined,
        default_value: formData.default_value,
        is_active: true,
        groups: []
      };
      
      // Update local state immediately
      setVariables(prev => [...prev, newVariable]);
      setShowCreateModal(false);
      resetForm();
      
      setSuccessMessage('Variable created locally. To save to database, use: node backend/db-cli.js create');
    }
  };

  const handleEditVariable = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[EDIT] handleEditVariable called');
    console.log('[EDIT] Form data:', formData);
    console.log('[EDIT] Editing variable:', editingVariable);
    
    if (!editingVariable) {
      console.error('[ERROR] No editing variable found');
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      // Try API first
      const response = await fetchWithFallback(`/master-variables/${editingVariable.master_var_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          is_active: true, // Always keep variable active when updating
          cascade_update: true,
          updated_by: 'frontend_user'
        })
      });

      if (!response.ok) throw new Error('Failed to update variable');

      // Close edit form immediately
      setEditingVariable(null);
      resetForm();
      setSaving(false);
      
      // Fetch fresh data from database to ensure consistency
      await fetchVariables();
      
      // Show endpoint-specific success message
      const endpoint = (response as any).usedEndpoint;
      if (endpoint === 'http://127.0.0.1:9999' || endpoint === 'http://localhost:9999') {
        setSuccessMessage('Variable updated successfully via Database Bridge. Data refreshed from database.');
      } else if (endpoint) {
        setSuccessMessage('Variable updated successfully via API. Data refreshed from database.');
      } else {
        setSuccessMessage('Variable updated successfully via Proxy. Data refreshed from database.');
      }
    } catch (err) {
      console.error('[ERROR] Failed to update variable:', err);
      setError('Failed to update variable. Please ensure the backend server is running and try again.');
      setSaving(false);
    }
  };

  const handleDeleteVariable = async (variable: MasterVariable) => {
    if (!window.confirm(`Are you sure you want to delete "${variable.var_name}"?`)) {
      return;
    }

    try {
      // Try API first
      const response = await fetchWithFallback(`/master-variables/${variable.master_var_id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete variable');
      }

      fetchVariables();
      
      // Show endpoint-specific success message
      const endpoint = (response as any).usedEndpoint;
      if (endpoint === 'http://127.0.0.1:9999' || endpoint === 'http://localhost:9999') {
        setSuccessMessage(`Variable "${variable.var_name}" deleted successfully via Database Bridge`);
      } else if (endpoint) {
        setSuccessMessage(`Variable "${variable.var_name}" deleted successfully via API`);
      } else {
        setSuccessMessage(`Variable "${variable.var_name}" deleted successfully via Proxy`);
      }
    } catch (err) {
      console.error('[ERROR] Failed to delete variable:', err);
      setError(`Failed to delete variable "${variable.var_name}". Please ensure the backend server is running and try again.`);
    }
  };

  const openEditModal = (variable: MasterVariable) => {
    // If clicking on the same variable, close it (toggle behavior)
    if (editingVariable?.master_var_id === variable.master_var_id) {
      setEditingVariable(null);
      resetForm();
      return;
    }
    
    // Open edit form for this variable
    setEditingVariable(variable);
    setFormData({
      var_name: variable.var_name,
      var_description: variable.var_description,
      var_type: variable.var_type,
      var_options: variable.var_options || '',
      default_value: variable.default_value,
      group_ids: variable.groups.map(g => g.group_id)
    });
  };

  const resetForm = () => {
    setFormData({
      var_name: '',
      var_description: '',
      var_type: 'text',
      var_options: '',
      default_value: '',
      group_ids: []
    });
  };

  const getVariableTypeLabel = (type: string) => {
    const labels = {
      text: 'Text',
      number: 'Number',
      date: 'Date',
      boolean: 'Boolean',
      select: 'Select'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const renderVariableOptions = () => {
    if (formData.var_type === 'select') {
      return (
        <div className="form-group">
          <label htmlFor="var_options">Options (JSON array)</label>
          <textarea
            id="var_options"
            value={formData.var_options}
            onChange={(e) => setFormData({ ...formData, var_options: e.target.value })}
            placeholder='["Option 1", "Option 2", "Option 3"]'
            rows={3}
          />
        </div>
      );
    }
    return null;
  };

  // Auto-dismiss error and success messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (loading) return <div className="loading">Loading master variables...</div>;

  return (
    <div className="master-variables-manager">
      <div className="header">
        <h2>Master Variables</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create Variable
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          {successMessage}
          <button onClick={() => setSuccessMessage(null)}>×</button>
        </div>
      )}

      <div className="filters">
        <label htmlFor="group-filter">Filter by Group:</label>
        <select
          id="group-filter"
          value={selectedGroup || ''}
          onChange={(e) => setSelectedGroup(e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">All Groups</option>
          {groups.map(group => (
            <option key={group.group_id} value={group.group_id}>
              {group.group_name} ({group.variable_count})
            </option>
          ))}
        </select>
      </div>

      <div className="variables-list">
        {variables.length === 0 ? (
          <div className="no-variables">No variables found.</div>
        ) : (
          variables.map(variable => (
            <div key={variable.master_var_id} className="variable-card">
              <div className="variable-header">
                <h3>{variable.var_name}</h3>
                <div className="variable-actions">
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => openEditModal(variable)}
                  >
                    {editingVariable?.master_var_id === variable.master_var_id ? 'Cancel' : 'Edit'}
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteVariable(variable)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="variable-description">{variable.var_description}</p>
              <div className="variable-meta">
                <span className="variable-type">Type: {getVariableTypeLabel(variable.var_type)}</span>
                <span className="variable-default">Default: {variable.default_value || 'None'}</span>
                <span className="variable-status">
                  Status: {variable.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {variable.groups.length > 0 && (
                <div className="variable-groups">
                  Groups: {variable.groups.map(g => g.group_name).join(', ')}
                </div>
              )}
              
              {/* Inline Edit Form - Slides Down */}
              {editingVariable?.master_var_id === variable.master_var_id && (
                <div className="edit-form-slide">
                  <form onSubmit={handleEditVariable}>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="edit_var_name">Variable Name</label>
                        <input
                          type="text"
                          id="edit_var_name"
                          value={formData.var_name}
                          onChange={(e) => setFormData({ ...formData, var_name: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="edit_var_type">Type</label>
                        <select
                          id="edit_var_type"
                          value={formData.var_type}
                          onChange={(e) => setFormData({ ...formData, var_type: e.target.value as any })}
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="boolean">Boolean</option>
                          <option value="select">Select</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="edit_var_description">Description</label>
                      <textarea
                        id="edit_var_description"
                        value={formData.var_description}
                        onChange={(e) => setFormData({ ...formData, var_description: e.target.value })}
                        required
                        rows={2}
                      />
                    </div>
                    
                    {renderVariableOptions()}
                    
                    <div className="form-group">
                      <label htmlFor="edit_default_value">Default Value</label>
                      <input
                        type="text"
                        id="edit_default_value"
                        value={formData.default_value}
                        onChange={(e) => setFormData({ ...formData, default_value: e.target.value })}
                      />
                      <small>Changes will cascade to all documents using this variable</small>
                    </div>
                    
                    <div className="form-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => {
                        setEditingVariable(null);
                        resetForm();
                      }}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Variable</h3>
              <button onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateVariable}>
              <div className="form-group">
                <label htmlFor="var_name">Variable Name</label>
                <input
                  type="text"
                  id="var_name"
                  value={formData.var_name}
                  onChange={(e) => setFormData({ ...formData, var_name: e.target.value })}
                  placeholder="REF-XXX.variable_name"
                  required
                />
                <small>Follow the pattern: REF-XXX.descriptive_name</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="var_description">Description</label>
                <textarea
                  id="var_description"
                  value={formData.var_description}
                  onChange={(e) => setFormData({ ...formData, var_description: e.target.value })}
                  placeholder="Describe what this variable represents"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="var_type">Variable Type</label>
                <select
                  id="var_type"
                  value={formData.var_type}
                  onChange={(e) => setFormData({ ...formData, var_type: e.target.value as any })}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="boolean">Boolean</option>
                  <option value="select">Select</option>
                </select>
              </div>
              
              {renderVariableOptions()}
              
              <div className="form-group">
                <label htmlFor="default_value">Default Value</label>
                <input
                  type="text"
                  id="default_value"
                  value={formData.default_value}
                  onChange={(e) => setFormData({ ...formData, default_value: e.target.value })}
                />
                <small>This value will cascade to all documents using this variable</small>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Variable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
};

export default MasterVariablesManager;