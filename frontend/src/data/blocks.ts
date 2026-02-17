import employmentBlocks from './blocks/employment.json';
import programBlocks from './blocks/program_participants.json';
import leaseBlocks from './blocks/shared_residential_lease.json';
import trialBlocks from './blocks/trial_participants.json';
import swinburneBlocks from './blocks/swinburne_acknowledgement.json';
import clientConsentBlocks from './blocks/client_consent_form.json';
import markdownBlocks from './blocks/markdown_blocks.json';
import { masterReferences } from './masterReferences';

// Convert master references to block format
const masterReferenceBlocks = masterReferences.map(ref => ({
  id: ref.id,
  title: ref.title,
  body: ref.content,
  tags: [ref.level, 'master-reference'],
  jurisdiction: 'AU-VIC',
  version: ref.version
}));

export const allBlocks = [
  ...employmentBlocks,
  ...programBlocks,
  ...leaseBlocks,
  ...trialBlocks,
  ...swinburneBlocks,
  ...clientConsentBlocks,
  ...markdownBlocks,
  ...masterReferenceBlocks
];

export default allBlocks;