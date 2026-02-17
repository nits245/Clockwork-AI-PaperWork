import { useState, useCallback } from 'react';
import {
  commonBlocks,
  blockVersionHistory,
  forkedBlocks,
  getCommonBlock,
  getTemplatesUsingBlock,
  createBlockFork,
  flagForksForReview,
  CommonBlock,
  BlockVersion,
  ForkedBlock
} from '../data/commonBlocks';

interface CascadeUpdate {
  blockId: string;
  affectedTemplates: string[];
  affectedForks: ForkedBlock[];
  newVersion: string;
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  type: 'cascade_update' | 'fork_review' | 'external_platform';
  blockId: string;
  affectedItems: string[];
  created: string;
  completed: boolean;
}

export const useCommonBlocks = () => {
  const [blocks] = useState(commonBlocks);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  // Update a common block and cascade to all documents
  const updateCommonBlock = useCallback((
    blockId: string,
    newContent: string,
    changeDescription: string
  ): CascadeUpdate => {
    const block = getCommonBlock(blockId);
    
    if (!block) {
      throw new Error(`Block ${blockId} not found`);
    }

    // Increment version
    const versionParts = block.version.split('.').map(Number);
    versionParts[1]++; // Increment minor version
    const newVersion = versionParts.join('.');

    // Add to version history
    const newVersionEntry: BlockVersion = {
      version: newVersion,
      content: newContent,
      timestamp: new Date().toISOString(),
      changeDescription
    };

    if (!blockVersionHistory[blockId]) {
      blockVersionHistory[blockId] = [];
    }
    blockVersionHistory[blockId].push(newVersionEntry);

    // Update the block
    block.content = newContent;
    block.version = newVersion;
    block.lastUpdated = new Date().toISOString().split('T')[0];

    // Get affected templates
    const affectedTemplates = getTemplatesUsingBlock(blockId);

    // Flag forked blocks for review
    const affectedForks = flagForksForReview(blockId);

    // Create cascade update task
    const task: TaskItem = {
      id: `cascade_${blockId}_${Date.now()}`,
      title: `Cascade Update: ${block.title}`,
      description: `Common block "${block.title}" has been updated. ${affectedTemplates.length} templates and ${affectedForks.length} forked documents need review.`,
      type: 'cascade_update',
      blockId,
      affectedItems: [...affectedTemplates, ...affectedForks.map(f => f.documentInstanceId)],
      created: new Date().toISOString(),
      completed: false
    };

    setTasks(prev => [...prev, task]);

    // Create task for external platform updates
    if (affectedTemplates.length > 0) {
      const externalTask: TaskItem = {
        id: `external_${blockId}_${Date.now()}`,
        title: `Update External Platforms: ${block.title}`,
        description: `Update ${block.title} on external platforms: Airbnb, Flatmates, etc.`,
        type: 'external_platform',
        blockId,
        affectedItems: ['Airbnb', 'Flatmates', 'Website'],
        created: new Date().toISOString(),
        completed: false
      };

      setTasks(prev => [...prev, externalTask]);
    }

    return {
      blockId,
      affectedTemplates,
      affectedForks,
      newVersion
    };
  }, []);

  // Mark a forked block for review
  const reviewFork = useCallback((documentInstanceId: string, approved: boolean, notes?: string) => {
    const fork = forkedBlocks.find(f => f.documentInstanceId === documentInstanceId);
    
    if (fork) {
      fork.needsReview = false;
      fork.reviewNote = notes || (approved ? 'Approved' : 'Rejected');
    }

    // Complete related tasks
    setTasks(prev => prev.map(task => {
      if (task.affectedItems.includes(documentInstanceId)) {
        return { ...task, completed: true };
      }
      return task;
    }));
  }, []);

  // Complete a task
  const completeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    ));
  }, []);

  // Get version history for a block
  const getVersionHistory = useCallback((blockId: string): BlockVersion[] => {
    return blockVersionHistory[blockId] || [];
  }, []);

  // Check if a block has pending updates
  const hasPendingUpdates = useCallback((blockId: string): boolean => {
    return tasks.some(task => 
      task.blockId === blockId && !task.completed
    );
  }, [tasks]);

  // Get all forked blocks that need review
  const getForksNeedingReview = useCallback((): ForkedBlock[] => {
    return forkedBlocks.filter(fork => fork.needsReview);
  }, []);

  return {
    blocks,
    tasks,
    updateCommonBlock,
    reviewFork,
    completeTask,
    getVersionHistory,
    hasPendingUpdates,
    getForksNeedingReview,
    getCommonBlock,
    getTemplatesUsingBlock
  };
};

export default useCommonBlocks;
