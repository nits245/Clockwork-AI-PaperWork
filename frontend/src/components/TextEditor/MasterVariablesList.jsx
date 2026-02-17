import React, { useState, useEffect } from "react";
import "./MasterVariablesList.scss";
import { useMasterVariables } from "../../hooks/useMasterVariables";
import variableIcon from "../../img/textEditor/add-circle.svg";

export default function MasterVariablesList({ onDragStart = null }) {
  const { variables: masterVariables, loading, error } = useMasterVariables();
  const [filter, setFilter] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  
  // Extract unique groups from master variables
  const groups = ["all", ...new Set(masterVariables.map(v => v.group_name).filter(Boolean))];
  
  // Filter variables based on search and group
  const filteredVariables = masterVariables.filter(variable => {
    const matchesSearch = variable.var_name.toLowerCase().includes(filter.toLowerCase()) ||
                          variable.var_description?.toLowerCase().includes(filter.toLowerCase());
    const matchesGroup = selectedGroup === "all" || variable.group_name === selectedGroup;
    return matchesSearch && matchesGroup && variable.is_active;
  });

  const handleDragStart = (event, variable) => {
    // Create the placeholder text for the document
    const placeholderText = `{{${variable.var_name}}}`;
    
    // Set data in multiple formats for better compatibility
    event.dataTransfer.setData("text/plain", placeholderText);
    event.dataTransfer.setData("text/html", `<span class="variable-placeholder" data-variable="${variable.var_name}">${placeholderText}</span>`);
    event.dataTransfer.setData("application/x-variable", variable.var_name);
    event.dataTransfer.effectAllowed = "copy";
    
    // Add dragging class for visual feedback
    event.currentTarget.classList.add('dragging');
    event.currentTarget.style.opacity = "0.5";
    
    // Optional: Call parent onDragStart if provided
    if (onDragStart) {
      onDragStart(event, variable);
    }
  };
  
  // Helper function to format variable name for display (remove REF_ prefix)
  const formatVariableName = (varName) => {
    return varName.replace(/^REF_/i, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleDragEnd = (event) => {
    // Remove dragging class and reset opacity
    event.currentTarget.classList.remove('dragging');
    event.currentTarget.style.opacity = "1";
  };

  const getVariableTypeIcon = (type) => {
    switch (type) {
      case 'text':
        return 'T';
      case 'select':
        return 'S';
      case 'boolean':
        return 'B';
      case 'date':
        return 'D';
      case 'email':
        return 'E';
      default:
        return 'V';
    }
  };

  if (loading) {
    return (
      <div className="master-variables-list loading">
        <div className="loading-spinner">Loading master variables...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="master-variables-list error">
        <p>Warning: Unable to load master variables</p>
        <small>Using local input fields only</small>
      </div>
    );
  }

  return (
    <div className="master-variables-list">
      <div className="mvl-header">
        <h3>Master Variables</h3>
        <span className="mvl-count">{filteredVariables.length} available</span>
      </div>

      <div className="mvl-filters">
        <input
          type="text"
          className="mvl-search"
          placeholder="Search variables..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        
        {groups.length > 1 && (
          <select 
            className="mvl-group-filter"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            {groups.map(group => (
              <option key={group} value={group}>
                {group === 'all' ? 'All Groups' : group}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mvl-instructions">
        <p>💡 <strong>Drag</strong> variables into the document or <strong>click</strong> to copy to clipboard</p>
      </div>

      <div className="mvl-variables">
        {filteredVariables.length === 0 ? (
          <div className="mvl-empty">
            <p>No variables found</p>
            {filter && <small>Try adjusting your search</small>}
          </div>
        ) : (
          filteredVariables.map((variable) => (
            <div
              key={variable.master_var_id}
              className="mvl-variable-item"
              draggable="true"
              onDragStart={(e) => handleDragStart(e, variable)}
              onDragEnd={handleDragEnd}
              title={`${variable.var_description || variable.var_name} - Drag to document or click to copy`}
              onClick={(e) => {
                // Fallback: Copy to clipboard on click
                const placeholderText = `{{${variable.var_name}}}`;
                navigator.clipboard.writeText(placeholderText).then(() => {
                  // Visual feedback
                  e.currentTarget.style.background = '#c8e6c9';
                  setTimeout(() => {
                    e.currentTarget.style.background = '';
                  }, 300);
                });
              }}
            >
              <div className="mvl-variable-header">
                <span className="mvl-variable-icon">
                  {getVariableTypeIcon(variable.var_type)}
                </span>
                <span className="mvl-variable-name">{formatVariableName(variable.var_name)}</span>
              </div>
              
              {variable.var_description && (
                <div className="mvl-variable-description">
                  {variable.var_description}
                </div>
              )}
              
              <div className="mvl-variable-footer">
                {variable.var_type && (
                  <span className="mvl-variable-type">{variable.var_type}</span>
                )}
                {variable.default_value && (
                  <span className="mvl-variable-default" title={`Default: ${variable.default_value}`}>
                    Default: {variable.default_value.length > 20 
                      ? variable.default_value.substring(0, 20) + '...' 
                      : variable.default_value}
                  </span>
                )}
              </div>
              
              {variable.group_name && (
                <div className="mvl-variable-group">
                  {variable.group_name}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mvl-footer">
        <small>
          Variables will be replaced with actual values when documents are generated
        </small>
      </div>
    </div>
  );
}
