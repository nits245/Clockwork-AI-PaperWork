import React, { useState, useMemo } from 'react';
import { useCommonBlocks } from '../../hooks/useCommonBlocks';
import './TaskDashboard.scss';

interface TaskDashboardProps {
  onTaskComplete?: (taskId: string) => void;
}

type TaskFilter = 'all' | 'cascade_update' | 'fork_review' | 'external_platform';

const TaskDashboard: React.FC<TaskDashboardProps> = ({ onTaskComplete }) => {
  const { tasks, completeTask } = useCommonBlocks();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const filteredTasks = useMemo(() => {
    if (filter === 'all') {
      return tasks;
    }
    return tasks.filter(task => task.type === filter);
  }, [tasks, filter]);

  const pendingTasks = filteredTasks.filter(task => !task.completed);
  const completedTasks = filteredTasks.filter(task => task.completed);

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
    if (onTaskComplete) {
      onTaskComplete(taskId);
    }
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const getTaskTypeLabel = (type: string): string => {
    switch (type) {
      case 'cascade_update':
        return 'Cascade Update';
      case 'fork_review':
        return 'Fork Review';
      case 'external_platform':
        return 'External Platform';
      default:
        return type;
    }
  };

  const getTaskTypeColor = (type: string): string => {
    switch (type) {
      case 'cascade_update':
        return '#2196f3';
      case 'fork_review':
        return '#ff9800';
      case 'external_platform':
        return '#9c27b0';
      default:
        return '#666';
    }
  };

  const getFilterCount = (filterType: TaskFilter): number => {
    if (filterType === 'all') {
      return tasks.filter(t => !t.completed).length;
    }
    return tasks.filter(t => t.type === filterType && !t.completed).length;
  };

  return (
    <div className="task-dashboard">
      <div className="dashboard-header">
        <h1>Task Dashboard</h1>
        <div className="task-summary">
          <span className="pending-count">{pendingTasks.length} Pending</span>
          <span className="completed-count">{completedTasks.length} Completed</span>
        </div>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Tasks
          {getFilterCount('all') > 0 && (
            <span className="count-badge">{getFilterCount('all')}</span>
          )}
        </button>
        <button
          className={`filter-tab ${filter === 'cascade_update' ? 'active' : ''}`}
          onClick={() => setFilter('cascade_update')}
        >
          Cascade Updates
          {getFilterCount('cascade_update') > 0 && (
            <span className="count-badge">{getFilterCount('cascade_update')}</span>
          )}
        </button>
        <button
          className={`filter-tab ${filter === 'fork_review' ? 'active' : ''}`}
          onClick={() => setFilter('fork_review')}
        >
          Fork Reviews
          {getFilterCount('fork_review') > 0 && (
            <span className="count-badge">{getFilterCount('fork_review')}</span>
          )}
        </button>
        <button
          className={`filter-tab ${filter === 'external_platform' ? 'active' : ''}`}
          onClick={() => setFilter('external_platform')}
        >
          External Platforms
          {getFilterCount('external_platform') > 0 && (
            <span className="count-badge">{getFilterCount('external_platform')}</span>
          )}
        </button>
      </div>

      <div className="dashboard-content">
        {pendingTasks.length === 0 && completedTasks.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">✓</div>
            <h3>No tasks to display</h3>
            <p>All clear! No pending or completed tasks matching the current filter.</p>
          </div>
        )}

        {pendingTasks.length > 0 && (
          <div className="task-section">
            <h2 className="section-title">Pending Tasks</h2>
            <div className="task-list">
              {pendingTasks.map(task => (
                <div key={task.id} className="task-card pending">
                  <div className="task-header">
                    <div className="task-info">
                      <div
                        className="task-type-badge"
                        style={{ backgroundColor: getTaskTypeColor(task.type) }}
                      >
                        {getTaskTypeLabel(task.type)}
                      </div>
                      <h3 className="task-title">{task.title}</h3>
                    </div>
                    <button
                      className="btn-complete"
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      Mark Complete
                    </button>
                  </div>

                  <div className="task-body">
                    <div className="block-reference">
                      <strong>Block:</strong> {task.blockId}
                    </div>

                    {task.affectedItems.length > 0 && (
                      <div className="affected-items">
                        <button
                          className="expand-toggle"
                          onClick={() => toggleTaskExpansion(task.id)}
                        >
                          {expandedTasks.has(task.id) ? 'Hide' : 'Show'} Affected Items
                          ({task.affectedItems.length})
                        </button>

                        {expandedTasks.has(task.id) && (
                          <ul className="items-list">
                            {task.affectedItems.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="task-section">
            <h2 className="section-title">Completed Tasks</h2>
            <div className="task-list">
              {completedTasks.map(task => (
                <div key={task.id} className="task-card completed">
                  <div className="task-header">
                    <div className="task-info">
                      <div
                        className="task-type-badge"
                        style={{ backgroundColor: getTaskTypeColor(task.type) }}
                      >
                        {getTaskTypeLabel(task.type)}
                      </div>
                      <h3 className="task-title">{task.title}</h3>
                    </div>
                    <div className="completed-badge">Completed</div>
                  </div>

                  <div className="task-body">
                    <div className="block-reference">
                      <strong>Block:</strong> {task.blockId}
                    </div>

                    {task.affectedItems.length > 0 && (
                      <div className="affected-items">
                        <button
                          className="expand-toggle"
                          onClick={() => toggleTaskExpansion(task.id)}
                        >
                          {expandedTasks.has(task.id) ? 'Hide' : 'Show'} Affected Items
                          ({task.affectedItems.length})
                        </button>

                        {expandedTasks.has(task.id) && (
                          <ul className="items-list">
                            {task.affectedItems.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDashboard;
