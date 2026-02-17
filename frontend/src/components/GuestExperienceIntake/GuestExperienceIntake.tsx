import React, { useState, useEffect } from 'react';
import './GuestExperienceIntake.scss';

interface GuestIntakeData {
  // Personal Details
  full_name: string;
  preferred_name: string;
  phone: string;
  email: string;
  emergency_name: string;
  emergency_phone: string;
  emergency_relationship: string;
  
  // Alternative Accommodation
  accommodation_status: 'rental' | 'family' | 'transitional' | 'crisis';
  accommodation_details: string;
  accommodation_confirmed: boolean;
  
  // Criminal History
  criminal_history: 'none' | 'minor' | 'serious' | 'current';
  criminal_details: string;
  references: Array<{
    name: string;
    contact: string;
    relationship: string;
  }>;
  
  // Vulnerability Assessment
  mental_health: 'none' | 'stable' | 'crisis' | 'ongoing';
  substance_use: 'none' | 'stable' | 'current' | 'recent';
  safety_concerns: 'none' | 'intervention' | 'risk' | 'protective';
  support_worker: {
    name: string;
    agency: string;
    phone: string;
  };
  
  // Assessment Areas
  skills_assessment: {
    day1_safety: boolean;
    day1_cleaning: boolean;
    day1_communication: boolean;
    day3_kitchen: boolean;
    day3_cooperation: boolean;
    day3_sustainability: boolean;
    day5_reliability: boolean;
    day5_integration: boolean;
    day5_mission: boolean;
  };
  
  // Session Schedule
  sessions: Array<{
    date: string;
    time: string;
    focus: string;
    completed: boolean;
    notes: string;
  }>;
  
  // Consents
  audio_recording_consent: boolean;
  information_sharing_consent: boolean;
  professional_safeguarding_consent: boolean;
}

interface GuestExperienceIntakeProps {
  onSubmit: (data: GuestIntakeData) => void;
  onSave: (data: GuestIntakeData) => void;
  existingData?: Partial<GuestIntakeData>;
  masterVariables?: any; // Integration with cascade system
}

const GuestExperienceIntake: React.FC<GuestExperienceIntakeProps> = ({
  onSubmit,
  onSave,
  existingData,
  masterVariables
}) => {
  const [formData, setFormData] = useState<GuestIntakeData>({
    full_name: '',
    preferred_name: '',
    phone: '',
    email: '',
    emergency_name: '',
    emergency_phone: '',
    emergency_relationship: '',
    accommodation_status: 'rental',
    accommodation_details: '',
    accommodation_confirmed: false,
    criminal_history: 'none',
    criminal_details: '',
    references: [
      { name: '', contact: '', relationship: '' },
      { name: '', contact: '', relationship: '' }
    ],
    mental_health: 'none',
    substance_use: 'none',
    safety_concerns: 'none',
    support_worker: {
      name: '',
      agency: '',
      phone: ''
    },
    skills_assessment: {
      day1_safety: false,
      day1_cleaning: false,
      day1_communication: false,
      day3_kitchen: false,
      day3_cooperation: false,
      day3_sustainability: false,
      day5_reliability: false,
      day5_integration: false,
      day5_mission: false
    },
    sessions: [
      { date: '', time: '', focus: 'Safety & Orientation', completed: false, notes: '' },
      { date: '', time: '', focus: 'Basic Skills Assessment', completed: false, notes: '' },
      { date: '', time: '', focus: 'Community Integration', completed: false, notes: '' }
    ],
    audio_recording_consent: false,
    information_sharing_consent: false,
    professional_safeguarding_consent: false,
    ...existingData
  });

  const [currentSection, setCurrentSection] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [autoSaving, setAutoSaving] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (Object.values(formData).some(value => value !== '')) {
        setAutoSaving(true);
        onSave(formData);
        setTimeout(() => setAutoSaving(false), 1000);
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [formData, onSave]);

  const sections = [
    { title: 'Personal Information', icon: '👤' },
    { title: 'Accommodation Verification', icon: '🏠' },
    { title: 'Safety & History Screening', icon: '🛡️' },
    { title: 'Vulnerability Assessment', icon: '💚' },
    { title: 'Skills Assessment', icon: '📋' },
    { title: 'Session Planning', icon: '📅' },
    { title: 'Consents & Agreement', icon: '✍️' },
    { title: 'Review & Submit', icon: '✅' }
  ];

  const validateCurrentSection = (): boolean => {
    const errors: string[] = [];

    switch (currentSection) {
      case 0: // Personal Information
        if (!formData.full_name.trim()) errors.push('Full legal name is required');
        if (!formData.preferred_name.trim()) errors.push('Preferred name is required');
        if (!formData.phone.trim()) errors.push('Phone number is required');
        if (!formData.email.trim()) errors.push('Email address is required');
        if (!formData.emergency_name.trim()) errors.push('Emergency contact name is required');
        if (!formData.emergency_phone.trim()) errors.push('Emergency contact phone is required');
        break;

      case 1: // Accommodation Verification
        if (!formData.accommodation_details.trim()) errors.push('Accommodation details are required');
        if (!formData.accommodation_confirmed) errors.push('Must confirm alternative accommodation access');
        break;

      case 2: // Safety & History
        if (formData.criminal_history !== 'none' && !formData.criminal_details.trim()) {
          errors.push('Criminal history details are required when history disclosed');
        }
        break;

      case 6: // Consents
        if (!formData.audio_recording_consent) errors.push('Audio recording consent is required');
        if (!formData.information_sharing_consent) errors.push('Information sharing consent is required');
        if (!formData.professional_safeguarding_consent) errors.push('Professional safeguarding consent is required');
        break;
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentSection() && currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = () => {
    if (validateCurrentSection()) {
      onSubmit(formData);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedFormData = (path: (string | number)[], value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const renderSection = () => {
    switch (currentSection) {
      case 0: // Personal Information
        return (
          <div className="form-section">
            <h3>Personal Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Legal Name *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => updateFormData('full_name', e.target.value)}
                  placeholder="As appears on government ID"
                />
              </div>
              
              <div className="form-group">
                <label>Preferred Name *</label>
                <input
                  type="text"
                  value={formData.preferred_name}
                  onChange={(e) => updateFormData('preferred_name', e.target.value)}
                  placeholder="What you'd like to be called"
                />
              </div>
              
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="Mobile or primary contact"
                />
              </div>
              
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="Primary email for program communication"
                />
              </div>
            </div>

            <h4>Emergency Contact</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Emergency Contact Name *</label>
                <input
                  type="text"
                  value={formData.emergency_name}
                  onChange={(e) => updateFormData('emergency_name', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Emergency Contact Phone *</label>
                <input
                  type="tel"
                  value={formData.emergency_phone}
                  onChange={(e) => updateFormData('emergency_phone', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Relationship</label>
                <input
                  type="text"
                  value={formData.emergency_relationship}
                  onChange={(e) => updateFormData('emergency_relationship', e.target.value)}
                  placeholder="e.g., Parent, Sibling, Friend"
                />
              </div>
            </div>
          </div>
        );

      case 1: // Accommodation Verification
        return (
          <div className="form-section">
            <h3>Alternative Accommodation Verification</h3>
            <div className="warning-box">
              <strong>MANDATORY REQUIREMENT:</strong> All trial candidates must maintain access to stable alternative accommodation throughout the guest experience and potential trial period.
            </div>
            
            <div className="form-group">
              <label>Current Accommodation Status *</label>
              <select
                value={formData.accommodation_status}
                onChange={(e) => updateFormData('accommodation_status', e.target.value)}
              >
                <option value="rental">Stable rental accommodation</option>
                <option value="family">Family/friend accommodation</option>
                <option value="transitional">Transitional housing service</option>
                <option value="crisis">Crisis accommodation</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Accommodation Details *</label>
              <textarea
                value={formData.accommodation_details}
                onChange={(e) => updateFormData('accommodation_details', e.target.value)}
                placeholder="Provide address, contact person, or service details as appropriate"
                rows={3}
              />
            </div>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.accommodation_confirmed}
                  onChange={(e) => updateFormData('accommodation_confirmed', e.target.checked)}
                />
                I confirm that I have stable alternative accommodation available throughout the guest experience and potential trial period, and understand that guest/trial status does not guarantee ongoing accommodation.
              </label>
            </div>
          </div>
        );

      case 2: // Safety & History Screening
        return (
          <div className="form-section">
            <h3>Criminal History and Safety Disclosure</h3>
            <div className="info-box">
              Complete disclosure is required for all Australian states. This information is used for safety assessment and program suitability evaluation.
            </div>
            
            <div className="form-group">
              <label>Criminal History Status</label>
              <div className="radio-group">
                {[
                  { value: 'none', label: 'No criminal convictions or pending charges' },
                  { value: 'minor', label: 'Minor offenses over 2 years ago' },
                  { value: 'serious', label: 'Serious offenses or recent convictions' },
                  { value: 'current', label: 'Current legal proceedings or intervention orders' }
                ].map(option => (
                  <label key={option.value} className="radio-label">
                    <input
                      type="radio"
                      name="criminal_history"
                      value={option.value}
                      checked={formData.criminal_history === option.value}
                      onChange={(e) => updateFormData('criminal_history', e.target.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
            
            {formData.criminal_history !== 'none' && (
              <>
                <div className="form-group">
                  <label>Details (Required when history disclosed)</label>
                  <textarea
                    value={formData.criminal_details}
                    onChange={(e) => updateFormData('criminal_details', e.target.value)}
                    placeholder="Provide details of convictions, charges, or proceedings"
                    rows={4}
                  />
                </div>
                
                <h4>Professional References</h4>
                {formData.references.map((ref, index) => (
                  <div key={index} className="reference-group">
                    <h5>Reference {index + 1}</h5>
                    <div className="form-grid">
                      <input
                        type="text"
                        placeholder="Reference Name"
                        value={ref.name}
                        onChange={(e) => updateNestedFormData(['references', index, 'name'], e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Contact Information"
                        value={ref.contact}
                        onChange={(e) => updateNestedFormData(['references', index, 'contact'], e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Relationship/Role"
                        value={ref.relationship}
                        onChange={(e) => updateNestedFormData(['references', index, 'relationship'], e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        );

      case 3: // Vulnerability Assessment
        return (
          <div className="form-section">
            <h3>Vulnerability and Support Needs Assessment</h3>
            <div className="info-box">
              This information helps us provide appropriate support and ensure program safety for all participants.
            </div>
            
            <div className="assessment-grid">
              <div className="form-group">
                <label>Mental Health Support Needs</label>
                <select
                  value={formData.mental_health}
                  onChange={(e) => updateFormData('mental_health', e.target.value)}
                >
                  <option value="none">No current mental health concerns</option>
                  <option value="stable">Stable with current treatment/medication</option>
                  <option value="crisis">Recent crisis or instability</option>
                  <option value="ongoing">Requires ongoing professional support</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Substance Use History</label>
                <select
                  value={formData.substance_use}
                  onChange={(e) => updateFormData('substance_use', e.target.value)}
                >
                  <option value="none">No substance use concerns</option>
                  <option value="stable">Past issues, currently stable in recovery</option>
                  <option value="current">Current use requiring support or management</option>
                  <option value="recent">Recent rehabilitation program completion</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Physical Safety Concerns</label>
                <select
                  value={formData.safety_concerns}
                  onChange={(e) => updateFormData('safety_concerns', e.target.value)}
                >
                  <option value="none">No current safety concerns</option>
                  <option value="intervention">Intervention orders or restraining orders in place</option>
                  <option value="risk">Risk from specific individuals</option>
                  <option value="protective">Requires protective measures or confidentiality</option>
                </select>
              </div>
            </div>
            
            <h4>Support Worker/Case Manager (if applicable)</h4>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Name"
                value={formData.support_worker.name}
                onChange={(e) => updateNestedFormData(['support_worker', 'name'], e.target.value)}
              />
              <input
                type="text"
                placeholder="Agency/Organization"
                value={formData.support_worker.agency}
                onChange={(e) => updateNestedFormData(['support_worker', 'agency'], e.target.value)}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.support_worker.phone}
                onChange={(e) => updateNestedFormData(['support_worker', 'phone'], e.target.value)}
              />
            </div>
          </div>
        );

      case 4: // Skills Assessment
        return (
          <div className="form-section">
            <h3>Skills Assessment Framework</h3>
            <div className="info-box">
              This assessment tracks competency development across the guest experience sessions.
            </div>
            
            <div className="skills-assessment">
              <div className="assessment-period">
                <h4>Day 1-2 Assessment Areas</h4>
                <div className="skill-checkboxes">
                  {[
                    { key: 'day1_safety', label: 'Personal safety protocols and professional boundary understanding' },
                    { key: 'day1_cleaning', label: 'Basic cleaning standards and equipment care' },
                    { key: 'day1_communication', label: 'Communication skills and respect for household harmony' }
                  ].map(skill => (
                    <label key={skill.key} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.skills_assessment[skill.key as keyof typeof formData.skills_assessment]}
                        onChange={(e) => updateNestedFormData(['skills_assessment', skill.key], e.target.checked)}
                      />
                      {skill.label}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="assessment-period">
                <h4>Day 3-4 Development Areas</h4>
                <div className="skill-checkboxes">
                  {[
                    { key: 'day3_kitchen', label: 'Kitchen safety awareness and food handling basics' },
                    { key: 'day3_cooperation', label: 'Team cooperation and following directions' },
                    { key: 'day3_sustainability', label: 'Sustainable living practice introduction' }
                  ].map(skill => (
                    <label key={skill.key} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.skills_assessment[skill.key as keyof typeof formData.skills_assessment]}
                        onChange={(e) => updateNestedFormData(['skills_assessment', skill.key], e.target.checked)}
                      />
                      {skill.label}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="assessment-period">
                <h4>Day 5-7 Evaluation Areas</h4>
                <div className="skill-checkboxes">
                  {[
                    { key: 'day5_reliability', label: 'Reliability and commitment demonstration' },
                    { key: 'day5_integration', label: 'Integration with existing community members' },
                    { key: 'day5_mission', label: 'Mission alignment and program value compatibility' }
                  ].map(skill => (
                    <label key={skill.key} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.skills_assessment[skill.key as keyof typeof formData.skills_assessment]}
                        onChange={(e) => updateNestedFormData(['skills_assessment', skill.key], e.target.checked)}
                      />
                      {skill.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5: // Session Planning
        return (
          <div className="form-section">
            <h3>Session Schedule Planning</h3>
            <div className="info-box">
              Plan the guest experience sessions. Minimum 3 sessions required, up to 7 sessions available.
            </div>
            
            <div className="sessions-planning">
              {formData.sessions.map((session, index) => (
                <div key={index} className="session-item">
                  <div className="session-header">
                    <h4>Session {index + 1}</h4>
                    <span className="session-status">
                      {session.completed ? '✅ Completed' : '⏳ Scheduled'}
                    </span>
                  </div>
                  
                  <div className="session-details">
                    <div className="form-grid">
                      <input
                        type="date"
                        value={session.date}
                        onChange={(e) => updateNestedFormData(['sessions', index, 'date'], e.target.value)}
                      />
                      <input
                        type="time"
                        value={session.time}
                        onChange={(e) => updateNestedFormData(['sessions', index, 'time'], e.target.value)}
                      />
                      <input
                        type="text"
                        value={session.focus}
                        onChange={(e) => updateNestedFormData(['sessions', index, 'focus'], e.target.value)}
                        placeholder="Session focus area"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Session Notes</label>
                      <textarea
                        value={session.notes}
                        onChange={(e) => updateNestedFormData(['sessions', index, 'notes'], e.target.value)}
                        placeholder="Assessment notes, observations, progress indicators"
                        rows={2}
                      />
                    </div>
                    
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={session.completed}
                        onChange={(e) => updateNestedFormData(['sessions', index, 'completed'], e.target.checked)}
                      />
                      Mark as completed
                    </label>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  const newSession = {
                    date: '',
                    time: '',
                    focus: 'Additional Assessment',
                    completed: false,
                    notes: ''
                  };
                  updateFormData('sessions', [...formData.sessions, newSession]);
                }}
                disabled={formData.sessions.length >= 7}
              >
                Add Additional Session {formData.sessions.length < 7 ? `(${7 - formData.sessions.length} remaining)` : '(Maximum reached)'}
              </button>
            </div>
          </div>
        );

      case 6: // Consents & Agreement
        return (
          <div className="form-section">
            <h3>Consent and Agreement</h3>
            <div className="consent-section">
              <div className="consent-group">
                <h4>Professional Safeguarding Consent</h4>
                <div className="info-box">
                  Audio recording of program sessions for professional safeguarding purposes with encrypted local storage for 3-week retention period.
                </div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.audio_recording_consent}
                    onChange={(e) => updateFormData('audio_recording_consent', e.target.checked)}
                  />
                  I consent to audio recording of program sessions for professional safeguarding purposes *
                </label>
              </div>
              
              <div className="consent-group">
                <h4>Information Sharing Consent</h4>
                <div className="info-box">
                  Information sharing for criminal history verification, emergency contact notification, professional support service coordination, and group evaluation feedback.
                </div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.information_sharing_consent}
                    onChange={(e) => updateFormData('information_sharing_consent', e.target.checked)}
                  />
                  I consent to necessary information sharing for program safety and assessment purposes *
                </label>
              </div>
              
              <div className="consent-group">
                <h4>Professional Safeguarding Standards</h4>
                <div className="info-box">
                  Professional conduct monitoring and accountability measures in accordance with program safeguarding protocols.
                </div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.professional_safeguarding_consent}
                    onChange={(e) => updateFormData('professional_safeguarding_consent', e.target.checked)}
                  />
                  I consent to professional conduct monitoring and accountability measures *
                </label>
              </div>
            </div>
          </div>
        );

      case 7: // Review & Submit
        return (
          <div className="form-section">
            <h3>Review and Submit</h3>
            <div className="review-summary">
              <div className="summary-section">
                <h4>Participant Information</h4>
                <p><strong>Name:</strong> {formData.full_name} ({formData.preferred_name})</p>
                <p><strong>Contact:</strong> {formData.phone} | {formData.email}</p>
                <p><strong>Emergency Contact:</strong> {formData.emergency_name} - {formData.emergency_phone}</p>
              </div>
              
              <div className="summary-section">
                <h4>Assessment Status</h4>
                <p><strong>Alternative Accommodation:</strong> {formData.accommodation_confirmed ? '✅ Verified' : '❌ Not Confirmed'}</p>
                <p><strong>Criminal History:</strong> {formData.criminal_history}</p>
                <p><strong>Sessions Planned:</strong> {formData.sessions.length}</p>
                <p><strong>Sessions Completed:</strong> {formData.sessions.filter(s => s.completed).length}</p>
              </div>
              
              <div className="summary-section">
                <h4>Consents</h4>
                <p><strong>Audio Recording:</strong> {formData.audio_recording_consent ? '✅ Consented' : '❌ Not Consented'}</p>
                <p><strong>Information Sharing:</strong> {formData.information_sharing_consent ? '✅ Consented' : '❌ Not Consented'}</p>
                <p><strong>Professional Safeguarding:</strong> {formData.professional_safeguarding_consent ? '✅ Consented' : '❌ Not Consented'}</p>
              </div>
            </div>
            
            <div className="final-declaration">
              <h4>Final Declaration</h4>
              <p>I acknowledge that I have read and understand the guest experience terms and conditions, my legal status as guest/visitor without tenancy rights, the assessment process and potential progression to trial program, safety requirements, conduct standards, and supervision protocols.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="guest-experience-intake">
      <div className="intake-header">
        <h1>Guest Experience Intake Form</h1>
        <div className="program-info">
          <p><strong>Program:</strong> {masterVariables?.entity_trading_name || 'nLive Program'}</p>
          <p><strong>Location:</strong> {masterVariables?.location_address_full || '[Program Address]'}</p>
          <p><strong>Coordinator:</strong> {masterVariables?.org_coordinator_name || '[Coordinator Name]'}</p>
        </div>
        {autoSaving && <div className="auto-save-indicator">💾 Auto-saving...</div>}
      </div>

      <div className="progress-bar">
        <div className="progress-steps">
          {sections.map((section, index) => (
            <div
              key={index}
              className={`progress-step ${index === currentSection ? 'current' : ''} ${index < currentSection ? 'completed' : ''}`}
              onClick={() => setCurrentSection(index)}
            >
              <span className="step-icon">{section.icon}</span>
              <span className="step-title">{section.title}</span>
            </div>
          ))}
        </div>
        <div 
          className="progress-fill" 
          style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
        />
      </div>

      <div className="form-content">
        {validationErrors.length > 0 && (
          <div className="validation-errors">
            <h4>Please address the following issues:</h4>
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {renderSection()}
      </div>

      <div className="form-navigation">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handlePrevious}
          disabled={currentSection === 0}
        >
          ← Previous
        </button>

        <div className="nav-info">
          Step {currentSection + 1} of {sections.length}
        </div>

        {currentSection < sections.length - 1 ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNext}
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-success"
            onClick={handleSubmit}
          >
            Submit Intake Form
          </button>
        )}
      </div>
    </div>
  );
};

export default GuestExperienceIntake;