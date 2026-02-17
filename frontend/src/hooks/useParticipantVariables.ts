import { useState, useCallback } from 'react';
import {
  ParticipantGroup,
  ParticipantVariable,
  createParticipantGroup,
  getParticipantVariables,
  updateParticipantVariable,
  addParticipant,
  removeParticipant,
  flattenParticipantVariables,
  getVariableScope
} from '../utils/participantVariables';

interface UseParticipantVariablesReturn {
  participantGroup: ParticipantGroup | null;
  initializeParticipants: (documentId: string, templateId: string, count: number) => void;
  getVariablesForParticipant: (index: number) => ParticipantVariable[];
  updateVariable: (variableName: string, value: string) => void;
  addNewParticipant: () => void;
  removeParticipantByIndex: (index: number) => void;
  getFlattenedVariables: () => Record<string, string>;
  participantCount: number;
}

export const useParticipantVariables = (): UseParticipantVariablesReturn => {
  const [participantGroup, setParticipantGroup] = useState<ParticipantGroup | null>(null);

  // Initialize participant group for a document
  const initializeParticipants = useCallback((
    documentId: string,
    templateId: string,
    count: number
  ) => {
    const group = createParticipantGroup(documentId, templateId, count);
    setParticipantGroup(group);
  }, []);

  // Get all variables for a specific participant
  const getVariablesForParticipant = useCallback((index: number): ParticipantVariable[] => {
    if (!participantGroup) return [];
    return getParticipantVariables(participantGroup, index);
  }, [participantGroup]);

  // Update a variable value
  const updateVariable = useCallback((variableName: string, value: string) => {
    if (!participantGroup) return;
    
    const updatedGroup = updateParticipantVariable(participantGroup, variableName, value);
    setParticipantGroup(updatedGroup);
  }, [participantGroup]);

  // Add a new participant
  const addNewParticipant = useCallback(() => {
    if (!participantGroup) return;
    
    const updatedGroup = addParticipant(participantGroup);
    setParticipantGroup(updatedGroup);
  }, [participantGroup]);

  // Remove a participant by index
  const removeParticipantByIndex = useCallback((index: number) => {
    if (!participantGroup) return;
    
    const updatedGroup = removeParticipant(participantGroup, index);
    setParticipantGroup(updatedGroup);
  }, [participantGroup]);

  // Get flattened variables for document generation
  const getFlattenedVariables = useCallback((): Record<string, string> => {
    if (!participantGroup) return {};
    return flattenParticipantVariables(participantGroup);
  }, [participantGroup]);

  return {
    participantGroup,
    initializeParticipants,
    getVariablesForParticipant,
    updateVariable,
    addNewParticipant,
    removeParticipantByIndex,
    getFlattenedVariables,
    participantCount: participantGroup?.participantCount || 0
  };
};

export default useParticipantVariables;
