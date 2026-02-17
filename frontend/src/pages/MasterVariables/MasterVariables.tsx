import React from 'react';
import MasterVariablesManager from '../../components/MasterVariablesManager/MasterVariablesManager';
import './MasterVariables.scss';

/**
 * Master Variables Page
 * Manages all master variables for the cascade system
 */
const MasterVariables: React.FC = () => {
  return (
    <div className="master-variables-page">
      <div className="page-header">
        <h1>Master Variables Manager</h1>
        <p>Manage cascade variables that can be applied across multiple documents</p>
      </div>
      <div className="page-content">
        <MasterVariablesManager />
      </div>
    </div>
  );
};

export default MasterVariables;