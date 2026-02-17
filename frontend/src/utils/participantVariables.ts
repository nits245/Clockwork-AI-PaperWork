// Multi-Participant Variable Management System
// Handles document-level participant variables while maintaining master variable integrity

export interface ParticipantVariable {
  participantIndex: number; // 1, 2, 3, etc.
  baseVariableName: string; // e.g., "tenant.name"
  fullVariableName: string; // e.g., "tenant1.name"
  value: string;
  inheritedFrom?: string; // Master variable ID if applicable
}

export interface ParticipantGroup {
  documentInstanceId: string;
  templateId: string;
  participants: ParticipantVariable[];
  participantCount: number;
  created: string;
  lastModified: string;
}

export interface VariableScope {
  master: string[]; // Master-level variables (global across all documents)
  template: string[]; // Template-level variables (specific to template type)
  document: string[]; // Document-level variables (specific to this instance)
  participant: string[]; // Participant-level variables (indexed per participant)
}

// Define which variables can be multi-participant
export const multiParticipantVariables = [
  'tenant.name',
  'tenant.email',
  'tenant.phone',
  'tenant.emergency_contact',
  'tenant.room_number',
  'tenant.move_in_date',
  'tenant.share_percentage',
  'participant.name',
  'participant.email',
  'participant.phone',
  'participant.address',
  'participant.date_of_birth',
  'participant.emergency_contact',
  'team_member.name',
  'team_member.role',
  'team_member.email',
  'team_member.start_date'
];

// Variable scope definitions
export const variableScopes: Record<string, 'master' | 'template' | 'document' | 'participant'> = {
  // Master-level variables (global across all documents)
  'entity.trading.name': 'master',
  'entity.legal.name': 'master',
  'entity.legal.acn': 'master',
  'location.address.full': 'master',
  'location.country.code': 'master',
  'location.state.code': 'master',
  'location.premises.classification': 'master',
  'org.coordinator.name': 'master',
  'org.coordinator.role': 'master',
  'org.coordinator.phone': 'master',
  'org.coordinator.email': 'master',
  'org.emergency.name': 'master',
  'org.emergency.role': 'master',
  'org.emergency.phone': 'master',
  'org.maintenance.name': 'master',
  'org.maintenance.phone': 'master',
  'finance.accommodation.weekly_rent': 'master',
  'finance.accommodation.bond_amount': 'master',
  'finance.commercial.equipment_deposit': 'master',
  'finance.penalties.late_notification': 'master',
  'finance.penalties.cleaning_violations': 'master',
  
  // Template-level (shared by template type)
  'lease.term_months': 'template',
  'lease.rent_amount': 'template',
  'employment.position': 'template',
  'employment.salary': 'template',
  'room.occupancy.type': 'template',
  'room.coordinator.access_enabled': 'template',
  'room.configuration.bed_count': 'template',
  'room.configuration.bed_types': 'template',
  
  // Document-level (unique per document instance)
  'document.created_date': 'document',
  'document.agreement_number': 'document',
  'document.version': 'document',
  'agreement.dates.start': 'document',
  'agreement.dates.end': 'document',
  'agreement.dates.signed': 'document',
  
  // Participant-level (indexed per participant)
  'tenant.name': 'participant',
  'tenant.email': 'participant',
  'tenant.phone': 'participant',
  'tenant.emergency_contact': 'participant',
  'tenant.room_number': 'participant',
  'tenant.move_in_date': 'participant',
  'tenant.share_percentage': 'participant',
  'participant.personal.full_name': 'participant',
  'participant.personal.preferred_name': 'participant',
  'participant.contact.phone': 'participant',
  'participant.contact.email': 'participant',
  'participant.emergency.name': 'participant',
  'participant.emergency.phone': 'participant',
  'participant.emergency.relationship': 'participant',
  'team_member.name': 'participant',
  'team_member.role': 'participant',
  'team_member.email': 'participant',
  'team_member.start_date': 'participant'
};

/**
 * Generate participant-indexed variables for a document
 * @param baseVariables - Base variable definitions
 * @param participantCount - Number of participants (e.g., 3 for 3 tenants)
 * @returns Expanded list with indexed variables (tenant1.name, tenant2.name, etc.)
 */
export const generateParticipantVariables = (
  baseVariables: string[],
  participantCount: number
): ParticipantVariable[] => {
  const participantVars: ParticipantVariable[] = [];
  
  baseVariables.forEach(baseVar => {
    const scope = variableScopes[baseVar];
    
    if (scope === 'participant') {
      // Create indexed variables for each participant
      for (let i = 1; i <= participantCount; i++) {
        const parts = baseVar.split('.');
        const indexedVarName = `${parts[0]}${i}.${parts.slice(1).join('.')}`;
        
        participantVars.push({
          participantIndex: i,
          baseVariableName: baseVar,
          fullVariableName: indexedVarName,
          value: ''
        });
      }
    }
  });
  
  return participantVars;
};

/**
 * Create a participant group for a document instance
 */
export const createParticipantGroup = (
  documentInstanceId: string,
  templateId: string,
  participantCount: number
): ParticipantGroup => {
  // Get template-specific participant variables
  const templateParticipantVars = Object.keys(variableScopes)
    .filter(varName => variableScopes[varName] === 'participant');
  
  const participants = generateParticipantVariables(
    templateParticipantVars,
    participantCount
  );
  
  return {
    documentInstanceId,
    templateId,
    participants,
    participantCount,
    created: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
};

/**
 * Get all variables for a specific participant
 */
export const getParticipantVariables = (
  group: ParticipantGroup,
  participantIndex: number
): ParticipantVariable[] => {
  return group.participants.filter(
    p => p.participantIndex === participantIndex
  );
};

/**
 * Update a participant variable value
 */
export const updateParticipantVariable = (
  group: ParticipantGroup,
  fullVariableName: string,
  value: string
): ParticipantGroup => {
  const updatedParticipants = group.participants.map(p =>
    p.fullVariableName === fullVariableName
      ? { ...p, value }
      : p
  );
  
  return {
    ...group,
    participants: updatedParticipants,
    lastModified: new Date().toISOString()
  };
};

/**
 * Add a new participant to the group
 */
export const addParticipant = (group: ParticipantGroup): ParticipantGroup => {
  const newIndex = group.participantCount + 1;
  const templateVars = Object.keys(variableScopes)
    .filter(varName => variableScopes[varName] === 'participant');
  
  const newParticipantVars = generateParticipantVariables(templateVars, 1)
    .map(v => ({
      ...v,
      participantIndex: newIndex,
      fullVariableName: v.fullVariableName.replace(/1\./, `${newIndex}.`)
    }));
  
  return {
    ...group,
    participants: [...group.participants, ...newParticipantVars],
    participantCount: newIndex,
    lastModified: new Date().toISOString()
  };
};

/**
 * Remove a participant from the group
 */
export const removeParticipant = (
  group: ParticipantGroup,
  participantIndex: number
): ParticipantGroup => {
  const updatedParticipants = group.participants
    .filter(p => p.participantIndex !== participantIndex)
    .map(p => {
      // Re-index remaining participants if needed
      if (p.participantIndex > participantIndex) {
        const newIndex = p.participantIndex - 1;
        const newFullName = p.fullVariableName.replace(
          new RegExp(`${p.participantIndex}\\.`),
          `${newIndex}.`
        );
        return {
          ...p,
          participantIndex: newIndex,
          fullVariableName: newFullName
        };
      }
      return p;
    });
  
  return {
    ...group,
    participants: updatedParticipants,
    participantCount: group.participantCount - 1,
    lastModified: new Date().toISOString()
  };
};

/**
 * Convert participant variables to a flat key-value object for document generation
 */
export const flattenParticipantVariables = (
  group: ParticipantGroup
): Record<string, string> => {
  const flattened: Record<string, string> = {};
  
  group.participants.forEach(p => {
    flattened[p.fullVariableName] = p.value;
  });
  
  return flattened;
};

/**
 * Get variable scope for a given variable name
 */
export const getVariableScope = (variableName: string): 'master' | 'template' | 'document' | 'participant' | 'unknown' => {
  // Check for indexed participant variable (e.g., tenant1.name)
  const participantMatch = variableName.match(/^(\w+)(\d+)\.(.+)$/);
  if (participantMatch) {
    const baseVar = `${participantMatch[1]}.${participantMatch[3]}`;
    return variableScopes[baseVar] || 'unknown';
  }
  
  return variableScopes[variableName] || 'unknown';
};

export default {
  multiParticipantVariables,
  variableScopes,
  generateParticipantVariables,
  createParticipantGroup,
  getParticipantVariables,
  updateParticipantVariable,
  addParticipant,
  removeParticipant,
  flattenParticipantVariables,
  getVariableScope
};
