// nLive Program Framework - Master Reference Components
// Hierarchical structure: Personal → Room → Household → Premises → Legal/External

export interface MasterReference {
  id: string;
  level: 'personal' | 'room' | 'household' | 'premises' | 'legal';
  title: string;
  content: string;
  variables: string[];
  version: string;
  lastUpdated: string;
}

export const masterReferences: MasterReference[] = [
  // PERSONAL LEVEL (REF-001 to REF-005)
  {
    id: 'REF-001',
    level: 'personal',
    title: 'Organization Details and Primary Contacts',
    content: `
<h3>Organization Details and Primary Contacts</h3>
<p><strong>Entity Name:</strong> {{entity.trading.name}}</p>
<p><strong>Operating Entity:</strong> {{entity.legal.name}} (ACN: {{entity.legal.acn}})</p>
<p><strong>Property Address:</strong> {{location.address.full}}</p>
<p><strong>Primary Contact:</strong> {{org.coordinator.name}}, {{org.coordinator.role}}</p>
<p><strong>Phone:</strong> {{org.coordinator.phone}} | <strong>Email:</strong> {{org.coordinator.email}}</p>
<p><strong>Emergency Contact:</strong> {{org.emergency.name}}, {{org.emergency.role}} - {{org.emergency.phone}}</p>
    `,
    variables: [
      'entity.trading.name',
      'entity.legal.name',
      'entity.legal.acn',
      'location.address.full',
      'org.coordinator.name',
      'org.coordinator.role',
      'org.coordinator.phone',
      'org.coordinator.email',
      'org.emergency.name',
      'org.emergency.role',
      'org.emergency.phone'
    ],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-002',
    level: 'personal',
    title: 'Mission Statement and Personal Alignment',
    content: `
<h3>Mission Statement and Personal Alignment</h3>
<p>{{entity.trading.name}} operates as a sustainability and lifestyle program focused on:</p>
<ul>
  <li>Supporting individuals to develop sustainable living practices</li>
  <li>Building skills in domestic management, food safety, and ecological responsibility</li>
  <li>Creating supportive environments that prioritize environmental outcomes</li>
  <li>Facilitating transition from unsustainable lifestyle patterns to regenerative practices</li>
  <li>Supporting local flora, fauna, and ecological systems</li>
</ul>
    `,
    variables: ['entity.trading.name'],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-003',
    level: 'personal',
    title: 'Safety and Emergency Procedures (Personal Safety First)',
    content: `
<h3>Safety and Emergency Procedures</h3>
<p><strong>Emergency Services:</strong> 000 (Police, Fire, Ambulance)</p>
<p><strong>Site Emergency Contact:</strong> {{org.emergency.name}} - {{org.emergency.phone}}</p>
<p><strong>Maintenance Contact:</strong> {{org.maintenance.name}} - {{org.maintenance.phone}}</p>
<p><strong>Personal Safety Notice:</strong> Any emergency situation, personal safety threats, or criminal behavior must be reported immediately to 000 and brought to the attention of management. Participants unfamiliar with Australian Emergency Services must notify management immediately.</p>
    `,
    variables: [
      'org.emergency.name',
      'org.emergency.phone',
      'org.maintenance.name',
      'org.maintenance.phone'
    ],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-004',
    level: 'personal',
    title: 'Personal Conduct and Hygiene Standards',
    content: `
<h3>Personal Conduct and Hygiene Standards</h3>
<h4>Basic Personal Requirements:</h4>
<ul>
  <li><strong>Safety First:</strong> No endangering household or premises safety at any time</li>
  <li><strong>Personal Hygiene:</strong> Regular maintenance required for community health and wellbeing</li>
  <li><strong>Property Respect:</strong> Care for personal belongings and shared resources</li>
  <li><strong>Professional Interaction:</strong> Respectful communication with all household members and staff</li>
  <li><strong>Substance-Free Living:</strong> No illicit drugs or addiction-related substances on premises</li>
</ul>
<h4>REF-004.1: Adult Kitchen Environment Option</h4>
<ul>
  <li>"Ramsay Kitchen" profanity allowance during intensive cooking/training sessions</li>
  <li>Requires consent from ALL parties participating in kitchen activity</li>
  <li>Automatically disabled when children under 16 present on premises</li>
  <li>Revocable by any participating party with 48-hour notice</li>
  <li>Limited to kitchen area during active cooking/training sessions only</li>
  <li>Special broadcast consent required when educational broadcasting active</li>
</ul>
    `,
    variables: [],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-005',
    level: 'personal',
    title: 'Personal Transition Framework',
    content: `
<h3>Personal Transition Framework</h3>
<h4>Progression Pathways:</h4>
<ul>
  <li>Trial → Tenant: Assessment completion and mutual agreement for tenancy</li>
  <li>Tenant → Team Member: Skills demonstration and commitment to increased participation</li>
  <li>Shared Room → Personal Room: Availability-based transition with rate adjustment</li>
  <li>Flexible Tenancy → Standard Group Lease: Group consensus and financial commitment to fixed capacity</li>
  <li>Program Participation Levels: Voluntary engagement scaling from basic to advanced training</li>
</ul>
<h4>Transition Requirements:</h4>
<ul>
  <li>Written agreement for all status changes</li>
  <li>Financial adjustment calculations and payment arrangements</li>
  <li>Notice periods and effective dates for transitions</li>
  <li>Assessment criteria and approval processes</li>
</ul>
    `,
    variables: [],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },

  // ROOM LEVEL (REF-006 to REF-010)
  {
    id: 'REF-006',
    level: 'room',
    title: 'Room Standards and Configuration',
    content: `
<h3>Room Standards and Configuration</h3>
<h4>Flexible Bed Rules:</h4>
<ul>
  <li>Flexible beds configured as single beds in shared rooms to prevent jealousy</li>
  <li>Exception: Couples or established bed-sharing partnerships may use double configuration when both parties share same room</li>
  <li>Coordinator approval and roommate consent required for any double bed usage</li>
</ul>
<h4>Room Maintenance Standards:</h4>
<ul>
  <li><strong>Cleanliness:</strong> Rooms maintained in clean, odor-free condition at all times</li>
  <li><strong>Pest Prevention:</strong> No substances likely to attract insects, bugs, or rodents</li>
  <li><strong>Personal Storage:</strong> Designated areas for personal belongings within rooms</li>
  <li><strong>Condition Reports:</strong> Before and after inspection reports required for all room changes</li>
</ul>
    `,
    variables: [],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-007',
    level: 'room',
    title: 'Room Access and Privacy Rights',
    content: `
<h3>Room Access and Privacy Rights</h3>
<h4>Mixed Occupancy Coordinator Access (when trial/program participants present):</h4>
<ul>
  <li>Entry permitted 9am-6pm for safety inspections, program delivery, participant setup, maintenance</li>
  <li>Outside hours: 3 knocks over 2.5 minutes for emergencies only</li>
  <li>EXCLUDED: Entry during quiet hours except genuine emergencies</li>
  <li>Personal bed areas and storage require 72-hour notice and consent for changes</li>
</ul>
<p><strong>Tenant-Only Rooms:</strong> Standard tenant rights apply - no coordinator access</p>
<p><strong>Personal Room Rights:</strong> Exclusive nighttime occupancy with shared daytime access per Class 4 requirements</p>
    `,
    variables: [],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-008',
    level: 'room',
    title: 'Room Conflict Resolution',
    content: `
<h3>Room Conflict Resolution</h3>
<h4>Inappropriate Room Access:</h4>
<ul>
  <li>Written warning for unauthorized entry or harassment of residents</li>
  <li>{{finance.penalties.late_notification}} administrative fee for second violation</li>
  <li>Immediate lease termination for third violation or threatening conduct</li>
  <li>Police involvement for intimidation or safety concerns</li>
</ul>
<h4>Unreasonable Access Denial:</h4>
<ul>
  <li>Initial discussion to understand stated concerns</li>
  <li>Assessment of whether concerns justify access restrictions</li>
  <li>Written notice that shared residential lease requires reasonable access</li>
  <li>14-day compliance period followed by lease termination if obstruction continues</li>
  <li>Emergency override: Management retains access rights for safety, maintenance, emergencies</li>
</ul>
    `,
    variables: ['finance.penalties.late_notification'],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-009',
    level: 'room',
    title: 'Room Assignment Safety Policy',
    content: `
<h3>Room Assignment Safety Policy</h3>
<h4>Default Safety Considerations:</h4>
<ul>
  <li>Same-gender assignments as starting point for risk reduction</li>
  <li>Age-appropriate groupings where relevant</li>
  <li>Compatibility assessments for safety and harmony</li>
  <li>Special needs accommodations and accessibility requirements</li>
  <li>Substance abuse history considerations and support needs</li>
  <li>Previous incident history review and risk assessment</li>
  <li>Personal safety concerns, requests, and protective factors</li>
  <li>Vulnerability and at-risk individual identification and support</li>
  <li>Cultural and religious considerations</li>
  <li>Mental health support needs and trigger awareness</li>
</ul>
    `,
    variables: [],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-010',
    level: 'room',
    title: 'Vacant Room Community Activities',
    content: `
<h3>Vacant Room Community Activities</h3>
<h4>Indoor Activities in Unoccupied Rooms:</h4>
<ul>
  <li>Music lessons and practice sessions</li>
  <li>Wellness services (massage, meditation, healing practices)</li>
  <li>Skills workshops and repair training</li>
  <li>Art and craft activities</li>
  <li>Study groups and tutoring</li>
  <li>Community meetings and support groups</li>
</ul>
<h4>Activity Management:</h4>
<ul>
  <li>All activities cease immediately when room becomes occupied by residential tenant</li>
  <li>Community focus: Activities emphasize skills development and community building</li>
  <li>House rules apply: All activities subject to quiet hours and safety standards</li>
</ul>
    `,
    variables: [],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },

  // HOUSEHOLD LEVEL (REF-011 to REF-015)
  {
    id: 'REF-011',
    level: 'household',
    title: 'Core House Rules',
    content: `
<h3>Core House Rules</h3>
<h4>Environmental Standards:</h4>
<ul>
  <li><strong>Peaceful Environment:</strong> No significant disruption to household peace or harmony</li>
  <li><strong>Quiet Hours:</strong>
    <ul>
      <li>Winter/Autumn: 10:00pm - 7:00am</li>
      <li>Spring/Summer: 10:30pm - 7:00am</li>
      <li>Exceptions require written request and acceptance from all household members</li>
    </ul>
  </li>
  <li><strong>Child-Friendly Environment:</strong> Appropriate language and behavior required (subject to REF-004.1 kitchen option)</li>
  <li><strong>Smoke/Vape Free:</strong> Premises completely smoke and vape free
    <ul>
      <li>Violations: $150 airing fee plus possible lease termination</li>
      <li>Activities must occur off-property only</li>
    </ul>
  </li>
  <li><strong>Drug and Addiction Free:</strong> No consumption of illicit drugs or substances on premises</li>
</ul>
    `,
    variables: [],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-012',
    level: 'household',
    title: 'Shared Space Management',
    content: `
<h3>Shared Space Management</h3>
<h4>Kitchen Access and Food Safety:</h4>
<ul>
  <li>Daily evening access 6:00pm - 9:00pm minimum for domestic use</li>
  <li>Commercial priority during business hours for business operations</li>
  <li>Commercial-level food safety standards required for all individuals</li>
  <li>Adult language environment option per REF-004.1 with full participant consent</li>
</ul>
<h4>Class 4 Building Shared Access:</h4>
<ul>
  <li>All lease holders have right to access shared residential lease areas</li>
  <li>Common area traversal rights during daytime hours</li>
  <li>Emergency access maintained 24/7 for safety purposes</li>
  <li>Coordination and respectful scheduling for optimal household harmony</li>
</ul>
    `,
    variables: [],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-013',
    level: 'household',
    title: 'Visitor Risk Management and Pet Policies',
    content: `
<h3>Visitor Risk Management and Pet Policies</h3>
<h4>Visitor Risk Assessment Framework:</h4>
<p><strong>Low Risk Visitors (No Additional Screening Required):</strong></p>
<ul>
  <li>Family members with no disclosed safety concerns</li>
  <li>Professional contacts (case workers, medical providers, legal representatives)</li>
  <li>Program alumni in good standing with positive departure records</li>
  <li>Community partners, volunteers, and verified support persons</li>
  <li>Current household members' verified professional colleagues</li>
</ul>
<p><strong>Medium Risk Visitors (Code of Conduct Agreement Required):</strong></p>
<ul>
  <li>New personal acquaintances or dating partners not known to household</li>
  <li>Visitors with minor criminal history (non-violent offenses over 2 years ago)</li>
  <li>Previous program participants with resolved conflicts but no serious breaches</li>
</ul>
<p><strong>High Risk Visitors (Enhanced Screening + Restricted Access):</strong></p>
<ul>
  <li>Criminal associates or individuals with current legal proceedings</li>
  <li>History of violence, drug dealing, serious property crimes, or intimidation</li>
  <li>Previous program participants removed for serious breaches or safety violations</li>
</ul>
<h4>Pet Approval and Management:</h4>
<ul>
  <li>Written consent required from management before keeping pets on premises</li>
  <li>Pet behavior assessment and compatibility evaluation with existing animals</li>
  <li>Resident responsible for all pet care, behavior, damages, and veterinary costs</li>
  <li>Pets must comply with local council registration and vaccination requirements</li>
  <li>Immediate removal required if pet poses safety risk or causes significant household disruption</li>
</ul>
    `,
    variables: [],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-014',
    level: 'household',
    title: 'Household Conflict Resolution',
    content: `
<h3>Household Conflict Resolution</h3>
<h4>Escalation Framework:</h4>
<ol>
  <li><strong>Level 1:</strong> Direct discussion between affected parties within 24 hours</li>
  <li><strong>Level 2:</strong> Coordinator mediation within 48 hours of written complaint</li>
  <li><strong>Level 3:</strong> External mediation within 7 days if internal resolution unsuccessful</li>
  <li><strong>Level 4:</strong> VCAT for tenancy disputes, Magistrates Court for serious misconduct/damages</li>
  <li><strong>Level 5:</strong> District Court for complex commercial disputes, Supreme Court for precedent-setting matters</li>
</ol>
    `,
    variables: [],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-015',
    level: 'household',
    title: 'Staff Professional Safeguarding',
    content: `
<h3>Staff Professional Safeguarding</h3>
<h4>Audio Recording Protocols:</h4>
<ul>
  <li>Encrypted local storage only - no internet access</li>
  <li>3-week retention limit for routine interactions</li>
  <li>Access only for incident investigation or legal proceedings</li>
  <li>Applies to all program roles: coordinators, facilitators, supervisors, support workers</li>
  <li>Participant consent required as part of program participation</li>
</ul>
<h4>Professional Conduct Standards:</h4>
<ul>
  <li>Professional courtesy and ethical conduct mandatory</li>
  <li>Respect for personal boundaries, space, opinions, and limitations</li>
  <li>No abuse of any kind (physical, emotional, sexual, financial, verbal, neglect)</li>
  <li>Clear professional boundaries with participants maintained at all times</li>
</ul>
    `,
    variables: [],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },

  // PREMISES LEVEL (REF-016 to REF-020)
  {
    id: 'REF-016',
    level: 'premises',
    title: 'Building Classification and Compliance',
    content: `
<h3>Building Classification and Compliance</h3>
<h4>Class 4 Residential Requirements:</h4>
<ul>
  <li>{{location.premises.classification}} residential building in commercial zone</li>
  <li>Shared residential accommodation classification required for terms over 30 days</li>
  <li>Council requirements: Ongoing compliance with local authority approvals</li>
</ul>
<h4>Commercial Kitchen Historical Precedent:</h4>
<ul>
  <li>Established right to commercial food service operations</li>
  <li>Court precedent supporting commercial activities in this premises</li>
  <li>Commercial operations take priority during designated business hours</li>
</ul>
    `,
    variables: ['location.premises.classification'],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-017',
    level: 'premises',
    title: 'Business Operations Integration',
    content: `
<h3>Business Operations Integration</h3>
<h4>Shopfront Access Rights:</h4>
<ul>
  <li>Clean up immediately after use - return to original condition</li>
  <li>Book via system when available or seek permission at time of use</li>
  <li>No interference with business operations or customer service</li>
  <li>Comply with quiet hours restrictions during use</li>
</ul>
<h4>Commercial Equipment Liability:</h4>
<ul>
  <li>Tenants 100% liable for damages to commercial equipment and areas</li>
  <li>{{finance.commercial.equipment_deposit}} refundable deposit required</li>
  <li>Residential bond may be applied to commercial area damages</li>
  <li>Full replacement cost liability for specialized equipment</li>
</ul>
    `,
    variables: ['finance.commercial.equipment_deposit'],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-018',
    level: 'premises',
    title: 'Excluded Areas Framework',
    content: `
<h3>Excluded Areas Framework</h3>
<h4>Company Reserved Spaces:</h4>
<ul>
  <li><strong>Shareholder/Director Room:</strong> Reserved for {{entity.legal.name}} shareholders, directors, and authorized associates</li>
  <li><strong>Shed Area:</strong> Business storage, garage sales, repair workshops, and community activities</li>
  <li><strong>Shopfront:</strong> Commercial operations with limited tenant access per REF-017</li>
</ul>
<h4>Usage Governance:</h4>
<ul>
  <li>Excluded areas governed by company board decisions and director discretion</li>
  <li>All parties must comply with quiet hours and basic safety standards</li>
  <li>No tenant rights or claims extend to excluded areas</li>
</ul>
    `,
    variables: ['entity.legal.name'],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-019',
    level: 'premises',
    title: 'Community and Educational Broadcasting',
    content: `
<h3>Community and Educational Broadcasting</h3>
<h4>Educational Broadcasting Areas:</h4>
<ul>
  <li>Kitchen area for cooking demonstrations and sustainability education</li>
  <li>Shopfront for community engagement and skills development showcase</li>
  <li>Other areas only with specific occasion-based consent</li>
</ul>
<h4>Adult Content Integration:</h4>
<ul>
  <li>Clear content warnings for broadcast audience when adult kitchen mode active</li>
  <li>Separate consent required for broadcasting adult language content</li>
  <li>Age-restricted broadcast channels/times during adult mode</li>
  <li>Immediate broadcast suspension if minors enter kitchen area</li>
</ul>
    `,
    variables: [],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-020',
    level: 'premises',
    title: 'Utilities and Environmental Standards',
    content: `
<h3>Utilities and Environmental Standards</h3>
<h4>Shared Usage Practices:</h4>
<ul>
  <li>Encouraged for all utilities where practical and economical</li>
  <li>Energy-efficient appliance use and sustainable living practices</li>
  <li>Coordinate laundry with weather forecasts for environmental efficiency</li>
</ul>
<h4>Cost Allocation:</h4>
<ul>
  <li>Utilities included if business operations profitable</li>
  <li>Shared among residents if business cannot cover overhead</li>
  <li>Individual meters available for excess usage monitoring and billing</li>
</ul>
    `,
    variables: [],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },

  // LEGAL/EXTERNAL LEVEL (REF-021 to REF-027)
  {
    id: 'REF-021',
    level: 'legal',
    title: 'Legal Compliance Framework',
    content: `
<h3>Legal Compliance Framework</h3>
<ul>
  <li><strong>Tenancy Law Compliance:</strong> All accommodation arrangements comply with Victorian Residential Tenancies Act 1997</li>
  <li><strong>Privacy Compliance:</strong> Operations comply with Australian Privacy Principles</li>
  <li><strong>Building Compliance:</strong> Class 4 residential building requirements under Building Act 1993</li>
  <li><strong>Consumer Protection:</strong> Consumer Affairs Victoria resources and VCAT jurisdiction available</li>
</ul>
    `,
    variables: [],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-022',
    level: 'legal',
    title: 'Two-Model Framework',
    content: `
<h3>Two-Model Framework</h3>
<h4>Flexible Tenancy Model:</h4>
<ul>
  <li>Pay per occupied bed: {{finance.accommodation.weekly_rent}} per person per week</li>
  <li>Rolling tenant ledger with individual agreements</li>
  <li>Coordinator access rights when participants present in shared rooms</li>
  <li>Individual liability for personal accommodation costs</li>
</ul>
<h4>Standard Group Lease:</h4>
<ul>
  <li>Fixed capacity cost: 6 beds × {{finance.accommodation.weekly_rent}} = total weekly cost</li>
  <li>Collective responsibility for full amount regardless of occupancy</li>
  <li>Standard tenant rights with no coordinator access</li>
  <li>Group decision-making for room arrangements and new members</li>
</ul>
<h4>Conversion Requirements:</h4>
<ul>
  <li>Unanimous consent from all current tenants required</li>
  <li>Formal lease variation to transition between models</li>
  <li>No reversion to Flexible model during Standard Group fixed term</li>
</ul>
    `,
    variables: ['finance.accommodation.weekly_rent'],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-023',
    level: 'legal',
    title: 'Criminal History and Vulnerability Screening',
    content: `
<h3>Criminal History and Vulnerability Screening</h3>
<h4>Pre-Trial Assessment Requirements:</h4>
<ul>
  <li>Complete police records disclosure (all Australian states)</li>
  <li>18-month behavioral change evidence with professional references</li>
  <li>Character assessment and detailed accommodation history</li>
  <li>Group evaluation meeting with current participants</li>
  <li>Enhanced supervision protocols for at-risk individuals during trial period</li>
</ul>
<h4>Vulnerability and At-Risk Identification:</h4>
<ul>
  <li>Mental health support needs and crisis risk factors</li>
  <li>Substance abuse history and recovery support requirements</li>
  <li>Physical safety concerns and protective measure needs</li>
  <li>Social isolation risks and community integration support</li>
  <li>Financial vulnerability and exploitation prevention measures</li>
</ul>
    `,
    variables: [],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-024',
    level: 'legal',
    title: 'Mission Protection and Anti-Elite Capture',
    content: `
<h3>Mission Protection and Anti-Elite Capture</h3>
<h4>Minimum Occupancy Requirements:</h4>
<ul>
  <li>Standard Group Lease must maintain minimum 4 people within 60 days of departure</li>
  <li>If below minimum, 60-day recruitment period or revert to Flexible Tenancy</li>
  <li>Management retains right to advertise vacant beds if group fails to recruit</li>
</ul>
<h4>Eligible Refusal Reasons for New Members:</h4>
<ul>
  <li><strong>Valid:</strong> Criminal violence history, substance abuse risks, safety concerns, fundamental mission conflicts</li>
  <li><strong>Invalid:</strong> Race, religion, disability (unless safety risk), social class, personal preferences</li>
  <li><strong>Documentation Required:</strong> Written explanation within 48 hours with supporting evidence</li>
</ul>
<h4>Financial Accessibility Protection:</h4>
<ul>
  <li>Cannot exclude candidates based solely on financial status</li>
  <li>Group agreements must remain compatible with sustainability mission</li>
  <li>Conversion back to Flexible Tenancy if group operates contrary to program values</li>
</ul>
    `,
    variables: [],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-025',
    level: 'legal',
    title: 'Damage Liability and Fee Structure',
    content: `
<h3>Damage Liability and Fee Structure</h3>
<h4>Notification Requirements:</h4>
<ul>
  <li>Immediate notification preferred for all damages and incidents</li>
  <li>24-hour notification mandatory with written documentation</li>
  <li>Failure to notify within deadline incurs {{finance.penalties.late_notification}} administrative fee</li>
</ul>
<h4>Fee Schedule:</h4>
<ul>
  <li>Basic non-compliance: $30-$60 minimum for cleaning violations</li>
  <li>Professional cleaning required: $100-$300 (full cost passed through)</li>
  <li>Management incidents: $50 per incident (excluding maintenance, pest, or external reports)</li>
  <li>Termination processing: $250/hour for time spent on removal procedures</li>
</ul>
<h4>Court Escalation Pathways:</h4>
<ul>
  <li>VCAT for standard tenancy disputes and damage claims</li>
  <li>Magistrates Court for serious misconduct causing significant damages</li>
  <li>District Court for complex commercial or employment disputes</li>
  <li>Supreme Court for constitutional challenges or precedent-setting cases</li>
</ul>
    `,
    variables: ['finance.penalties.late_notification'],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-026',
    level: 'legal',
    title: 'Progressive Skills Mastery and Mentorship Pathway',
    content: `
<h3>Progressive Skills Mastery and Mentorship Pathway</h3>
<h4>Trial Period: 14 days maximum (genuine guest status)</h4>
<ul>
  <li>Emergency, safety, and clean room standards established Day 1</li>
  <li>Basic cleaning mastery required before kitchen access (Day 1-2)</li>
  <li>Kitchen safety and food handling competency demonstrated (Day 2-3)</li>
  <li>Assessment decision required within 14 days maximum</li>
</ul>
<h4>Probation Tenancy: 8 weeks minimum to 12 weeks maximum</h4>
<ul>
  <li>Full residential tenancy rights with program participation elements</li>
  <li>Skills progression through domestic systems, kitchen operations, team coordination</li>
  <li>Weekly assessment checkpoints and competency documentation</li>
  <li>Extension to 12 weeks available if skills development requires additional time</li>
  <li>Minimum 8-week completion required before team member advancement consideration</li>
</ul>
<h4>Team Member Advancement: Week 8+ earliest possible</h4>
<ul>
  <li>Skills competency demonstration across all domestic and kitchen operations</li>
  <li>Positive group evaluation and household compatibility confirmation</li>
  <li>Commitment to mentoring and leadership development responsibilities</li>
  <li>Financial benefits: profit-sharing eligibility and accommodation cost reductions</li>
  <li>Management Discretion: Team member advancement optional, not automatic progression</li>
</ul>
<h4>Advanced Roles: 12-18+ months minimum program participation</h4>
<ul>
  <li><strong>Trainer:</strong> Skills mentorship and new member orientation leadership</li>
  <li><strong>Facilitator/Coordinator:</strong> Site management and program delivery responsibilities</li>
  <li>Enhanced screening requirements: Working with vulnerable people clearances</li>
  <li>Professional conduct standards and accountability measures</li>
</ul>
    `,
    variables: [],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  },
  {
    id: 'REF-027',
    level: 'legal',
    title: 'AI-Assisted Complaint and Process Management',
    content: `
<h3>AI-Assisted Complaint and Process Management</h3>
<h4>Formal Complaint Intake System:</h4>
<ul>
  <li>Guided step-through process for comprehensive concern documentation</li>
  <li>Automatic categorization: safety issues, harassment, accommodation problems, program concerns</li>
  <li>Timeline tracking with automated follow-up reminders and deadline monitoring</li>
  <li>Escalation triggers for serious safety concerns requiring immediate human intervention</li>
  <li>Mandatory human review within 24 hours for all submitted complaints</li>
</ul>
<h4>AI Process Integration:</h4>
<ul>
  <li>Initial AI-guided intake with standardized questions ensuring comprehensive documentation</li>
  <li>Automatic document generation with timestamps and appropriate categorization</li>
  <li>Immediate notification to relevant human oversight for review and action</li>
  <li>Follow-up scheduling and progress tracking throughout resolution process</li>
  <li>Resolution documentation and participant satisfaction confirmation protocols</li>
</ul>
<h4>Human Oversight Requirements:</h4>
<ul>
  <li>All safety-related complaints require immediate human assessment</li>
  <li>AI serves supplementary role only - cannot replace human judgment for vulnerable person oversight</li>
  <li>Pattern recognition in audio recordings for concerning interaction trends</li>
  <li>Early warning system triggers requiring mandatory human investigation</li>
  <li>Documentation analysis for consistency and completeness verification</li>
</ul>
    `,
    variables: [],
    version: '1.0.0',
    lastUpdated: '2025-10-10'
  }
];

export default masterReferences;
