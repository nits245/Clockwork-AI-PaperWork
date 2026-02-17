import employmentTemplates from './templates/employment.json';
import programTemplates from './templates/program_participants.json';
import leaseTemplates from './templates/shared_residential_lease.json';
import trialTemplates from './templates/trial_participants.json';
import swinburneTemplates from './templates/swinburne_acknowledgement.json';
import clientConsentTemplates from './templates/client_consent_form.json';
import markdownTemplates from './templates/markdown_templates.json';
import nliveProgramTemplates from './templates/nlive_program.json';

export const allTemplates = [
  ...employmentTemplates,
  ...programTemplates,
  ...leaseTemplates,
  ...trialTemplates,
  ...swinburneTemplates,
  ...clientConsentTemplates,
  ...markdownTemplates,
  ...nliveProgramTemplates
];

export default allTemplates;