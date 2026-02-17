import { useState, useEffect } from 'react';
import { masterReferences, MasterReference } from '../data/masterReferences';

interface UseMasterReferencesReturn {
  references: MasterReference[];
  getReference: (refId: string) => MasterReference | undefined;
  getReferencesByLevel: (level: string) => MasterReference[];
  getReferencesInRange: (startRef: string, endRef: string) => MasterReference[];
  insertReferenceIntoDocument: (refId: string, variables: Record<string, string>) => string;
  getAllVariablesUsed: (refIds: string[]) => string[];
}

export const useMasterReferences = (): UseMasterReferencesReturn => {
  const [references] = useState<MasterReference[]>(masterReferences);

  const getReference = (refId: string): MasterReference | undefined => {
    return references.find(ref => ref.id === refId);
  };

  const getReferencesByLevel = (level: string): MasterReference[] => {
    return references.filter(ref => ref.level === level);
  };

  const getReferencesInRange = (startRef: string, endRef: string): MasterReference[] => {
    const startNum = parseInt(startRef.replace('REF-', ''));
    const endNum = parseInt(endRef.replace('REF-', ''));
    
    return references.filter(ref => {
      const refNum = parseInt(ref.id.replace('REF-', ''));
      return refNum >= startNum && refNum <= endNum;
    });
  };

  const insertReferenceIntoDocument = (
    refId: string,
    variables: Record<string, string>
  ): string => {
    const reference = getReference(refId);
    if (!reference) {
      return `<!-- Reference ${refId} not found -->`;
    }

    let content = reference.content;

    // Replace all variable placeholders with actual values
    reference.variables.forEach(varName => {
      const regex = new RegExp(`{{${varName}}}`, 'g');
      const value = variables[varName] || `[${varName}]`;
      content = content.replace(regex, value);
    });

    return content;
  };

  const getAllVariablesUsed = (refIds: string[]): string[] => {
    const variableSet = new Set<string>();
    
    refIds.forEach(refId => {
      const reference = getReference(refId);
      if (reference) {
        reference.variables.forEach(varName => {
          variableSet.add(varName);
        });
      }
    });

    return Array.from(variableSet);
  };

  return {
    references,
    getReference,
    getReferencesByLevel,
    getReferencesInRange,
    insertReferenceIntoDocument,
    getAllVariablesUsed
  };
};

export default useMasterReferences;
