// Common Text Blocks System - Master Reference Blocks
// These blocks are shared across multiple documents and cascade updates

export interface CommonBlock {
  id: string;
  title: string;
  content: string;
  version: string;
  lastUpdated: string;
  usedIn: string[]; // List of template IDs that use this block
  tags: string[];
}

export interface BlockVersion {
  version: string;
  content: string;
  timestamp: string;
  changeDescription: string;
}

export interface ForkedBlock {
  originalBlockId: string;
  documentInstanceId: string;
  modifiedContent: string;
  forkDate: string;
  needsReview: boolean;
  reviewNote?: string;
}

// Common Blocks that cascade across documents
export const commonBlocks: CommonBlock[] = [
  {
    id: "common.house_rules",
    title: "House Rules",
    content: `**HOUSE RULES**

1. **Respect and Safety**
   - Treat all residents with respect and dignity
   - No violence, threats, or aggressive behavior
   - Report safety concerns immediately to facilitators

2. **Cleanliness and Maintenance**
   - Clean up after yourself in all shared spaces
   - Complete assigned cleaning duties on time
   - Report maintenance issues promptly

3. **Noise and Quiet Hours**
   - Quiet hours: 10:00 PM - 7:00 AM on weekdays
   - Quiet hours: 11:00 PM - 8:00 AM on weekends
   - Be considerate of others at all times

4. **Kitchen Use**
   - Clean dishes and surfaces immediately after use
   - Label and store food properly
   - Follow food safety guidelines
   - No swearing in shared kitchen spaces (3+ people present)

5. **Guests and Visitors**
   - Overnight guests must be pre-approved by residents
   - Maximum 2 guests per resident at a time
   - Residents are responsible for their guests' behavior

6. **Prohibited Items and Behaviors**
   - No illegal drugs or substances
   - No weapons or dangerous items
   - No smoking inside the premises
   - No theft or unauthorized use of others' property

7. **Shared Spaces**
   - Return items to their designated locations
   - Book shared spaces in advance when required
   - Respect others' privacy and personal space

8. **Dispute Resolution**
   - Address conflicts respectfully and directly when possible
   - Involve facilitators for mediation if needed
   - Follow the formal complaint process for serious issues`,
    version: "1.0.0",
    lastUpdated: "2025-10-10",
    usedIn: [
      "TRIAL_LICENSE_AGREEMENT",
      "PROBATION_TENANCY",
      "SHARED_RESIDENTIAL_LEASE",
      "TEAM_MEMBER_AGREEMENT"
    ],
    tags: ["common", "house-rules", "behavior", "shared"]
  },
  {
    id: "common.confidentiality",
    title: "Confidentiality and Privacy",
    content: `**CONFIDENTIALITY AND PRIVACY**

All participants must respect the privacy and confidentiality of other residents:

1. **Personal Information**
   - Do not share other residents' personal details without permission
   - Respect others' privacy in shared and private spaces
   - Keep program-related discussions confidential

2. **Surveillance and Monitoring**
   - Common areas may have CCTV for safety purposes
   - Private rooms are not monitored
   - Recording others without consent is prohibited

3. **Social Media and External Communication**
   - Do not post photos/videos of other residents without permission
   - Do not publicly identify others as program participants
   - Maintain the program's reputation in external communications

4. **Documentation and Records**
   - Personal files are kept secure and confidential
   - Access to your own records available upon request
   - Information shared only as required by law or with consent`,
    version: "1.0.0",
    lastUpdated: "2025-10-10",
    usedIn: [
      "TRIAL_LICENSE_AGREEMENT",
      "TEAM_MEMBER_AGREEMENT",
      "FACILITATOR_AGREEMENT"
    ],
    tags: ["common", "confidentiality", "privacy"]
  },
  {
    id: "common.emergency_procedures",
    title: "Emergency Procedures",
    content: `**EMERGENCY PROCEDURES**

1. **Fire Emergency**
   - Activate nearest fire alarm
   - Evacuate immediately via nearest safe exit
   - Assemble at designated meeting point
   - Call 000 once safe

2. **Medical Emergency**
   - Call 000 immediately
   - Notify facilitators/residents if safe to do so
   - Provide first aid only if trained
   - Do not move injured person unless necessary

3. **Security Threat**
   - Remove yourself from danger if possible
   - Call 000 for immediate threats
   - Notify facilitators once safe
   - Follow lockdown procedures if applicable

4. **Emergency Contacts**
   - Emergency Services: 000
   - Poisons Information: 13 11 26
   - Mental Health Crisis: Lifeline 13 11 14
   - Program Facilitator: [Emergency contact number]

5. **Evacuation Routes**
   - Familiarize yourself with all exit routes
   - Know the location of fire extinguishers
   - Never use elevators during fire evacuation
   - Assist others if safe to do so`,
    version: "1.0.0",
    lastUpdated: "2025-10-10",
    usedIn: [
      "TRIAL_LICENSE_AGREEMENT",
      "PROBATION_TENANCY",
      "SHARED_RESIDENTIAL_LEASE",
      "GUEST_EXPERIENCE_AGREEMENT"
    ],
    tags: ["common", "emergency", "safety", "procedures"]
  }
];

// Version history for tracking changes
export const blockVersionHistory: Record<string, BlockVersion[]> = {
  "common.house_rules": [
    {
      version: "1.0.0",
      content: commonBlocks[0].content,
      timestamp: "2025-10-10T00:00:00Z",
      changeDescription: "Initial version"
    }
  ],
  "common.confidentiality": [
    {
      version: "1.0.0",
      content: commonBlocks[1].content,
      timestamp: "2025-10-10T00:00:00Z",
      changeDescription: "Initial version"
    }
  ],
  "common.emergency_procedures": [
    {
      version: "1.0.0",
      content: commonBlocks[2].content,
      timestamp: "2025-10-10T00:00:00Z",
      changeDescription: "Initial version"
    }
  ]
};

// Track forked/modified blocks that need review when master updates
export const forkedBlocks: ForkedBlock[] = [];

// Helper function to get common block by ID
export const getCommonBlock = (blockId: string): CommonBlock | undefined => {
  return commonBlocks.find(block => block.id === blockId);
};

// Helper function to check if a template uses a common block
export const getTemplatesUsingBlock = (blockId: string): string[] => {
  const block = getCommonBlock(blockId);
  return block ? block.usedIn : [];
};

// Helper function to track block forks
export const createBlockFork = (
  blockId: string,
  documentInstanceId: string,
  modifiedContent: string
): ForkedBlock => {
  const fork: ForkedBlock = {
    originalBlockId: blockId,
    documentInstanceId,
    modifiedContent,
    forkDate: new Date().toISOString(),
    needsReview: false
  };
  
  forkedBlocks.push(fork);
  return fork;
};

// Helper function to flag forked blocks for review when master updates
export const flagForksForReview = (blockId: string): ForkedBlock[] => {
  const affectedForks = forkedBlocks.filter(
    fork => fork.originalBlockId === blockId
  );
  
  affectedForks.forEach(fork => {
    fork.needsReview = true;
    fork.reviewNote = `Master block ${blockId} has been updated. Review required.`;
  });
  
  return affectedForks;
};

export default commonBlocks;
