import React from 'react';
import { useParticipantVariables } from '../../hooks/useParticipantVariables';
import './ParticipantManager.scss';

interface ParticipantManagerProps {
  documentInstanceId: string;
  templateId: string;
  onVariableUpdate: (allVariables: { [key: string]: any }) => void;
}

const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  documentInstanceId,
  templateId,
  onVariableUpdate
}) => {
  const {
    participantGroup,
    participantCount,
    initializeParticipants,
    getVariablesForParticipant,
    updateVariable,
    addNewParticipant,
    removeParticipantByIndex,
    getFlattenedVariables
  } = useParticipantVariables();

  const currentGroup = participantGroup;

  React.useEffect(() => {
    if (!currentGroup) {
      initializeParticipants(documentInstanceId, templateId, 1);
    }
  }, [documentInstanceId, templateId]);

  React.useEffect(() => {
    const flattened = getFlattenedVariables();
    onVariableUpdate(flattened);
  }, [currentGroup]);

  const handleUpdateVariable = (varName: string, value: string) => {
    updateVariable(varName, value);
    const flattened = getFlattenedVariables();
    onVariableUpdate(flattened);
  };

  const handleAddParticipant = () => {
    addNewParticipant();
    const flattened = getFlattenedVariables();
    onVariableUpdate(flattened);
  };

  const handleRemoveParticipant = (index: number) => {
    removeParticipantByIndex(index);
    const flattened = getFlattenedVariables();
    onVariableUpdate(flattened);
  };

  if (!currentGroup) {
    return null;
  }

  const getParticipantLabel = () => {
    if (templateId.includes('LEASE') || templateId.includes('RESIDENTIAL')) {
      return 'Tenant';
    } else if (templateId.includes('CONSENT') || templateId.includes('RESEARCH')) {
      return 'Participant';
    }
    return 'Person';
  };

  const participantLabel = getParticipantLabel();

  return (
    <div className="participant-manager">
      <div className="manager-header">
        <h3>Multi-{participantLabel} Management</h3>
        <button className="btn-add-participant" onClick={handleAddParticipant}>
          + Add {participantLabel}
        </button>
      </div>

      <div className="participants-list">
        {Array.from({ length: participantCount }, (_, index) => {
          const participantIndex = index + 1;
          const prefix = templateId.includes('LEASE') || templateId.includes('RESIDENTIAL')
            ? 'tenant'
            : 'participant';
          const participantVars = getVariablesForParticipant(participantIndex);

          return (
            <div key={participantIndex} className="participant-card">
              <div className="card-header">
                <h4>
                  {participantLabel} {participantIndex}
                </h4>
                {participantCount > 1 && (
                  <button
                    className="btn-remove"
                    onClick={() => handleRemoveParticipant(participantIndex)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="card-body">
                {participantVars.map(variable => (
                  <div key={variable.fullVariableName} className="form-group">
                    <label>{variable.fullVariableName}</label>
                    <input
                      type="text"
                      value={variable.value || ''}
                      onChange={e =>
                        handleUpdateVariable(
                          variable.fullVariableName,
                          e.target.value
                        )
                      }
                      placeholder={`Enter ${variable.baseVariableName}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="participant-summary">
        <strong>Total {participantLabel}s:</strong> {participantCount}
      </div>
    </div>
  );
};

export default ParticipantManager;
