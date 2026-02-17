import React, { useState, useEffect } from 'react';
import './CommonBlocksManager.scss';
import { useCommonBlocks } from '../../hooks/useCommonBlocks';
import { CommonBlock, BlockVersion } from '../../data/commonBlocks';

interface CommonBlocksManagerProps {
  onClose?: () => void;
}

const CommonBlocksManager: React.FC<CommonBlocksManagerProps> = ({ onClose }) => {
  const {
    blocks,
    tasks,
    updateCommonBlock,
    getVersionHistory,
    getTemplatesUsingBlock,
    completeTask
  } = useCommonBlocks();

  const [selectedBlock, setSelectedBlock] = useState<CommonBlock | null>(null);
  const [editContent, setEditContent] = useState('');
  const [changeDescription, setChangeDescription] = useState('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versionHistory, setVersionHistory] = useState<BlockVersion[]>([]);
  const [affectedTemplates, setAffectedTemplates] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (selectedBlock) {
      setEditContent(selectedBlock.content);
      setAffectedTemplates(getTemplatesUsingBlock(selectedBlock.id));
      const history = getVersionHistory(selectedBlock.id);
      setVersionHistory(history);
    }
  }, [selectedBlock, getTemplatesUsingBlock, getVersionHistory]);

  const handleSelectBlock = (block: CommonBlock) => {
    setSelectedBlock(block);
    setIsEditing(false);
    setUpdateSuccess(false);
    setChangeDescription('');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setUpdateSuccess(false);
  };

  const handleCancel = () => {
    if (selectedBlock) {
      setEditContent(selectedBlock.content);
    }
    setIsEditing(false);
    setChangeDescription('');
  };

  const handleSave = () => {
    if (!selectedBlock || !changeDescription.trim()) {
      alert('Please provide a description of your changes');
      return;
    }

    try {
      const result = updateCommonBlock(selectedBlock.id, editContent, changeDescription);
      
      setUpdateSuccess(true);
      setIsEditing(false);
      setChangeDescription('');
      
      // Show update summary
      alert(
        `Block Updated Successfully!\n\n` +
        `New Version: ${result.newVersion}\n` +
        `Affected Templates: ${result.affectedTemplates.length}\n` +
        `Forked Documents: ${result.affectedForks.length}\n\n` +
        `Tasks have been created for review.`
      );
      
      // Refresh history
      const history = getVersionHistory(selectedBlock.id);
      setVersionHistory(history);
    } catch (error) {
      alert(`Error updating block: ${error}`);
    }
  };

  const getPendingTasksForBlock = (blockId: string) => {
    return tasks.filter(t => t.blockId === blockId && !t.completed);
  };

  return (
    <div className="common-blocks-manager">
      <div className="manager-header">
        <h2>Common Blocks Manager</h2>
        <p className="subtitle">Manage shared content blocks used across multiple documents</p>
        {onClose && (
          <button className="close-btn" onClick={onClose}>×</button>
        )}
      </div>

      <div className="manager-content">
        {/* Blocks List */}
        <div className="blocks-list">
          <h3>Common Blocks</h3>
          {blocks.map(block => {
            const pendingTasks = getPendingTasksForBlock(block.id);
            return (
              <div
                key={block.id}
                className={`block-item ${selectedBlock?.id === block.id ? 'active' : ''}`}
                onClick={() => handleSelectBlock(block)}
              >
                <div className="block-item-header">
                  <strong>{block.title}</strong>
                  {pendingTasks.length > 0 && (
                    <span className="task-badge">{pendingTasks.length} tasks</span>
                  )}
                </div>
                <div className="block-item-meta">
                  <span className="version">v{block.version}</span>
                  <span className="used-count">{block.usedIn.length} templates</span>
                  <span className="last-updated">{block.lastUpdated}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Block Editor */}
        <div className="block-editor">
          {selectedBlock ? (
            <>
              <div className="editor-header">
                <div>
                  <h3>{selectedBlock.title}</h3>
                  <span className="block-id">{selectedBlock.id}</span>
                  <span className="version-badge">Version {selectedBlock.version}</span>
                </div>
                <div className="editor-actions">
                  {!isEditing ? (
                    <button className="btn-primary" onClick={handleEdit}>
                       Edit Block
                    </button>
                  ) : (
                    <>
                      <button className="btn-secondary" onClick={handleCancel}>
                        Cancel
                      </button>
                      <button className="btn-primary" onClick={handleSave}>
                         Save Changes
                      </button>
                    </>
                  )}
                </div>
              </div>

              {updateSuccess && (
                <div className="update-success-banner">
                   Block updated successfully! New version: {selectedBlock.version}
                </div>
              )}

              {isEditing && (
                <div className="change-description-section">
                  <label htmlFor="change-description">
                    <strong>Describe your changes:</strong>
                  </label>
                  <input
                    id="change-description"
                    type="text"
                    className="change-description-input"
                    placeholder="E.g., Updated quiet hours policy"
                    value={changeDescription}
                    onChange={(e) => setChangeDescription(e.target.value)}
                  />
                </div>
              )}

              <div className="editor-content">
                <textarea
                  className="content-editor"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  disabled={!isEditing}
                  rows={20}
                />
              </div>

              {/* Affected Templates */}
              <div className="affected-section">
                <h4> Used in Templates ({affectedTemplates.length})</h4>
                <div className="template-tags">
                  {affectedTemplates.map(templateId => (
                    <span key={templateId} className="template-tag">
                      {templateId}
                    </span>
                  ))}
                </div>
                {affectedTemplates.length === 0 && (
                  <p className="no-items">No templates currently use this block</p>
                )}
              </div>

              {/* Version History */}
              <div className="version-section">
                <div className="version-header">
                  <h4> Version History ({versionHistory.length})</h4>
                  <button 
                    className="btn-link"
                    onClick={() => setShowVersionHistory(!showVersionHistory)}
                  >
                    {showVersionHistory ? '▼ Hide' : '▶ Show'}
                  </button>
                </div>
                
                {showVersionHistory && (
                  <div className="version-list">
                    {versionHistory.length === 0 ? (
                      <p className="no-items">No version history available</p>
                    ) : (
                      versionHistory.slice().reverse().map((version, idx) => (
                        <div key={idx} className="version-item">
                          <div className="version-item-header">
                            <strong>Version {version.version}</strong>
                            <span className="version-date">
                              {new Date(version.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="version-description">{version.changeDescription}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Pending Tasks */}
              {getPendingTasksForBlock(selectedBlock.id).length > 0 && (
                <div className="pending-tasks-section">
                  <h4> Pending Tasks ({getPendingTasksForBlock(selectedBlock.id).length})</h4>
                  {getPendingTasksForBlock(selectedBlock.id).map(task => (
                    <div key={task.id} className="task-item">
                      <div className="task-content">
                        <strong>{task.title}</strong>
                        <p>{task.description}</p>
                        <span className="task-type">{task.type}</span>
                      </div>
                      <button 
                        className="btn-complete"
                        onClick={() => completeTask(task.id)}
                      >
                        ✓ Complete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="no-selection">
              <div className="no-selection-content">
                <h3>Select a Common Block</h3>
                <p>Choose a block from the list to view and edit its content</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommonBlocksManager;
