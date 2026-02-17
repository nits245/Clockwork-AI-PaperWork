import React, { useState, useEffect } from 'react';
import './TemplateVariablesEditor.scss';

interface MasterVariable {
  master_var_id: number;
  var_name: string;
  var_description: string;
  var_type: string;
  var_options?: string;
  default_value: string;
  groups: Array<{
    group_id: number;
    group_name: string;
  }>;
  is_linked: boolean;
}

interface TemplateVariable {
  template_master_id: number;
  master_var_id: number;
  variable_key: string;
  is_required: boolean;
  default_override?: string;
  var_name: string;
  var_description: string;
  var_type: string;
  default_value: string;
}

interface TemplateVariablesEditorProps {
  templateId: string;
  templateTitle: string;
  templateContent: string;
  onContentUpdate?: (newContent: string) => void;
}

const TemplateVariablesEditor: React.FC<TemplateVariablesEditorProps> = ({
  templateId,
  templateTitle,
  templateContent,
  onContentUpdate
}) => {
  const [templateVariables, setTemplateVariables] = useState<TemplateVariable[]>([]);
  const [availableVariables, setAvailableVariables] = useState<MasterVariable[]>([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedVariables, setSelectedVariables] = useState<number[]>([]);
  const [variableKeys, setVariableKeys] = useState<{[key: number]: string}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplateVariables();
    fetchAvailableVariables();
  }, [templateId]);

  const fetchTemplateVariables = async () => {
    try {
      const response = await fetch(`/api/template-variables/${templateId}/master-variables`);
      if (!response.ok) throw new Error('Failed to fetch template variables');
      
      const data = await response.json();
      setTemplateVariables(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchAvailableVariables = async () => {
    try {
      const response = await fetch(`/api/template-variables/${templateId}/available-master-variables`);
      if (!response.ok) throw new Error('Failed to fetch available variables');
      
      const data = await response.json();
      setAvailableVariables(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  const handleLinkVariables = async () => {
    if (selectedVariables.length === 0) return;

    try {
      const variableLinks = selectedVariables.map(master_var_id => ({
        master_var_id,
        variable_key: variableKeys[master_var_id] || generateVariableKey(master_var_id),
        is_required: false
      }));

      const response = await fetch(`/api/template-variables/${templateId}/master-variables/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variable_links: variableLinks })
      });

      if (!response.ok) throw new Error('Failed to link variables');

      setShowLinkModal(false);
      setSelectedVariables([]);
      setVariableKeys({});
      fetchTemplateVariables();
      fetchAvailableVariables();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleUnlinkVariable = async (templateVariable: TemplateVariable) => {
    if (!window.confirm(`Remove "${templateVariable.var_name}" from this template?`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/template-variables/${templateId}/master-variables/${templateVariable.template_master_id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unlink variable');
      }

      fetchTemplateVariables();
      fetchAvailableVariables();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleUpdateVariableKey = async (templateVariable: TemplateVariable, newKey: string) => {
    try {
      const response = await fetch(
        `/api/template-variables/${templateId}/master-variables/${templateVariable.template_master_id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            variable_key: newKey,
            is_required: templateVariable.is_required,
            default_override: templateVariable.default_override
          })
        }
      );

      if (!response.ok) throw new Error('Failed to update variable key');

      fetchTemplateVariables();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const generateVariableKey = (master_var_id: number): string => {
    const variable = availableVariables.find(v => v.master_var_id === master_var_id);
    return variable ? variable.var_name.toLowerCase().replace(/\s+/g, '_') : `var_${master_var_id}`;
  };

  const insertVariableIntoContent = (variableKey: string) => {
    const placeholder = `{{${variableKey}}}`;
    if (onContentUpdate) {
      const newContent = templateContent + ` ${placeholder}`;
      onContentUpdate(newContent);
    }
  };

  const extractVariableKeysFromContent = (): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const keys: string[] = [];
    let match;
    
    while ((match = regex.exec(templateContent)) !== null) {
      keys.push(match[1]);
    }
    
    return [...new Set(keys)]; // Remove duplicates
  };

  const getUnusedVariables = (): TemplateVariable[] => {
    const usedKeys = extractVariableKeysFromContent();
    return templateVariables.filter(tv => !usedKeys.includes(tv.variable_key));
  };

  const getMissingVariables = (): string[] => {
    const usedKeys = extractVariableKeysFromContent();
    const linkedKeys = templateVariables.map(tv => tv.variable_key);
    return usedKeys.filter(key => !linkedKeys.includes(key));
  };

  if (loading) return <div className="loading">Loading template variables...</div>;

  const unusedVariables = getUnusedVariables();
  const missingVariables = getMissingVariables();

  return (
    <div className="template-variables-editor">
      <div className="header">
        <h3>Template Variables</h3>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowLinkModal(true)}
          >
            Link Variables
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Template Analysis */}
      <div className="template-analysis">
        <div className="analysis-section">
          <h4>Template Analysis</h4>
          <div className="analysis-stats">
            <div className="stat">
              <span className="stat-label">Linked Variables:</span>
              <span className="stat-value">{templateVariables.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Used in Content:</span>
              <span className="stat-value">{templateVariables.length - unusedVariables.length}</span>
            </div>
            {missingVariables.length > 0 && (
              <div className="stat warning">
                <span className="stat-label">Missing Links:</span>
                <span className="stat-value">{missingVariables.length}</span>
              </div>
            )}
          </div>
        </div>

        {missingVariables.length > 0 && (
          <div className="missing-variables">
            <h5>Variables Used in Content but Not Linked:</h5>
            <div className="variable-tags">
              {missingVariables.map(key => (
                <span key={key} className="variable-tag missing">
                  {`{{${key}}}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {unusedVariables.length > 0 && (
          <div className="unused-variables">
            <h5>Linked Variables Not Used in Content:</h5>
            <div className="variable-tags">
              {unusedVariables.map(variable => (
                <span key={variable.template_master_id} className="variable-tag unused">
                  {`{{${variable.variable_key}}}`}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Template Variables List */}
      <div className="variables-list">
        <h4>Linked Master Variables</h4>
        {templateVariables.length === 0 ? (
          <div className="empty-state">
            <p>No master variables linked to this template.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowLinkModal(true)}
            >
              Link Your First Variable
            </button>
          </div>
        ) : (
          <div className="variables-grid">
            {templateVariables.map(variable => (
              <div key={variable.template_master_id} className="variable-item">
                <div className="variable-header">
                  <span className="variable-name">{variable.var_name}</span>
                  <div className="variable-actions">
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => insertVariableIntoContent(variable.variable_key)}
                    >
                      Insert
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleUnlinkVariable(variable)}
                    >
                      Unlink
                    </button>
                  </div>
                </div>
                
                <p className="variable-description">{variable.var_description}</p>
                
                <div className="variable-key-editor">
                  <label>Template Key:</label>
                  <div className="key-input-group">
                    <span className="key-prefix">{'{{'}</span>
                    <input
                      type="text"
                      value={variable.variable_key}
                      onChange={(e) => {
                        // Update locally first
                        const newVariables = templateVariables.map(tv => 
                          tv.template_master_id === variable.template_master_id 
                            ? { ...tv, variable_key: e.target.value }
                            : tv
                        );
                        setTemplateVariables(newVariables);
                      }}
                      onBlur={(e) => handleUpdateVariableKey(variable, e.target.value)}
                      className="key-input"
                    />
                    <span className="key-suffix">{'}}'}</span>
                  </div>
                </div>
                
                <div className="variable-meta">
                  <span className="variable-type">{variable.var_type}</span>
                  <span className="default-value">Default: {variable.default_value}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Link Variables Modal */}
      {showLinkModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Link Master Variables</h3>
              <button onClick={() => setShowLinkModal(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="available-variables">
                {availableVariables.filter(v => !v.is_linked).map(variable => (
                  <div key={variable.master_var_id} className="available-variable">
                    <label className="variable-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedVariables.includes(variable.master_var_id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVariables([...selectedVariables, variable.master_var_id]);
                            setVariableKeys({
                              ...variableKeys,
                              [variable.master_var_id]: generateVariableKey(variable.master_var_id)
                            });
                          } else {
                            setSelectedVariables(selectedVariables.filter(id => id !== variable.master_var_id));
                            const newKeys = { ...variableKeys };
                            delete newKeys[variable.master_var_id];
                            setVariableKeys(newKeys);
                          }
                        }}
                      />
                      <div className="variable-info">
                        <span className="variable-name">{variable.var_name}</span>
                        <span className="variable-description">{variable.var_description}</span>
                        
                        {selectedVariables.includes(variable.master_var_id) && (
                          <div className="variable-key-input">
                            <label>Template Key:</label>
                            <input
                              type="text"
                              value={variableKeys[variable.master_var_id] || ''}
                              onChange={(e) => setVariableKeys({
                                ...variableKeys,
                                [variable.master_var_id]: e.target.value
                              })}
                              placeholder="variable_key"
                            />
                          </div>
                        )}
                        
                        <div className="variable-groups">
                          {variable.groups.map(group => (
                            <span key={group.group_id} className="group-tag">
                              {group.group_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
                
                {availableVariables.filter(v => !v.is_linked).length === 0 && (
                  <p className="no-variables">All available master variables are already linked to this template.</p>
                )}
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                type="button" 
                onClick={() => setShowLinkModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn btn-primary"
                onClick={handleLinkVariables}
                disabled={selectedVariables.length === 0}
              >
                Link {selectedVariables.length} Variable{selectedVariables.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateVariablesEditor;