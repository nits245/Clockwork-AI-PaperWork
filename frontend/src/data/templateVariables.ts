// nLive Program Framework - Template Variables
// Hierarchical variable structure: {scope.category.field} or {scope.category.subcategory.field}

export interface TemplateVariable {
  name: string;
  scope: 'location' | 'org' | 'finance' | 'room' | 'participant' | 'agreement' | 'entity';
  category: string;
  subcategory?: string;
  field: string;
  displayName: string;
  dataType: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'phone' | 'email' | 'address';
  securityAnnotation?: '@secure:name' | '@secure:phone' | '@secure:email' | '@secure:address';
  required: boolean;
  defaultValue?: string;
}

export const templateVariables: TemplateVariable[] = [
  // Geographic Hierarchy Variables
  {
    name: 'location.country.code',
    scope: 'location',
    category: 'country',
    field: 'code',
    displayName: 'Country Code',
    dataType: 'text',
    required: true,
    defaultValue: 'au'
  },
  {
    name: 'location.state.code',
    scope: 'location',
    category: 'state',
    field: 'code',
    displayName: 'State Code',
    dataType: 'text',
    required: true,
    defaultValue: 'vic'
  },
  {
    name: 'location.address.full',
    scope: 'location',
    category: 'address',
    field: 'full',
    displayName: 'Full Property Address',
    dataType: 'address',
    securityAnnotation: '@secure:address',
    required: true
  },
  {
    name: 'location.premises.classification',
    scope: 'location',
    category: 'premises',
    field: 'classification',
    displayName: 'Premises Classification',
    dataType: 'text',
    required: true,
    defaultValue: 'Class 4'
  },

  // Organization Contact Variables
  {
    name: 'org.coordinator.name',
    scope: 'org',
    category: 'coordinator',
    field: 'name',
    displayName: 'Program Coordinator Name',
    dataType: 'text',
    securityAnnotation: '@secure:name',
    required: true
  },
  {
    name: 'org.coordinator.role',
    scope: 'org',
    category: 'coordinator',
    field: 'role',
    displayName: 'Coordinator Role',
    dataType: 'text',
    required: true,
    defaultValue: 'Program Coordinator & Site Manager'
  },
  {
    name: 'org.coordinator.phone',
    scope: 'org',
    category: 'coordinator',
    field: 'phone',
    displayName: 'Coordinator Phone',
    dataType: 'phone',
    securityAnnotation: '@secure:phone',
    required: true
  },
  {
    name: 'org.coordinator.email',
    scope: 'org',
    category: 'coordinator',
    field: 'email',
    displayName: 'Coordinator Email',
    dataType: 'email',
    securityAnnotation: '@secure:email',
    required: true
  },
  {
    name: 'org.emergency.name',
    scope: 'org',
    category: 'emergency',
    field: 'name',
    displayName: 'Emergency Contact Name',
    dataType: 'text',
    securityAnnotation: '@secure:name',
    required: true
  },
  {
    name: 'org.emergency.role',
    scope: 'org',
    category: 'emergency',
    field: 'role',
    displayName: 'Emergency Contact Role',
    dataType: 'text',
    required: true,
    defaultValue: 'Emergency Response Coordinator'
  },
  {
    name: 'org.emergency.phone',
    scope: 'org',
    category: 'emergency',
    field: 'phone',
    displayName: 'Emergency Phone',
    dataType: 'phone',
    securityAnnotation: '@secure:phone',
    required: true
  },
  {
    name: 'org.maintenance.name',
    scope: 'org',
    category: 'maintenance',
    field: 'name',
    displayName: 'Maintenance Contact Name',
    dataType: 'text',
    securityAnnotation: '@secure:name',
    required: true
  },
  {
    name: 'org.maintenance.phone',
    scope: 'org',
    category: 'maintenance',
    field: 'phone',
    displayName: 'Maintenance Phone',
    dataType: 'phone',
    securityAnnotation: '@secure:phone',
    required: true
  },

  // Entity Variables
  {
    name: 'entity.trading.name',
    scope: 'entity',
    category: 'trading',
    field: 'name',
    displayName: 'Trading Name',
    dataType: 'text',
    required: true
  },
  {
    name: 'entity.legal.name',
    scope: 'entity',
    category: 'legal',
    field: 'name',
    displayName: 'Legal Entity Name',
    dataType: 'text',
    required: true
  },
  {
    name: 'entity.legal.acn',
    scope: 'entity',
    category: 'legal',
    field: 'acn',
    displayName: 'ACN',
    dataType: 'text',
    required: true
  },

  // Financial Category Variables
  {
    name: 'finance.accommodation.weekly_rent',
    scope: 'finance',
    category: 'accommodation',
    field: 'weekly_rent',
    displayName: 'Weekly Rent',
    dataType: 'currency',
    required: true
  },
  {
    name: 'finance.accommodation.bond_amount',
    scope: 'finance',
    category: 'accommodation',
    field: 'bond_amount',
    displayName: 'Bond Amount',
    dataType: 'currency',
    required: true
  },
  {
    name: 'finance.commercial.equipment_deposit',
    scope: 'finance',
    category: 'commercial',
    field: 'equipment_deposit',
    displayName: 'Equipment Deposit',
    dataType: 'currency',
    required: false
  },
  {
    name: 'finance.commercial.damage_liability',
    scope: 'finance',
    category: 'commercial',
    field: 'damage_liability',
    displayName: 'Damage Liability',
    dataType: 'currency',
    required: false
  },
  {
    name: 'finance.program.trial_deposit',
    scope: 'finance',
    category: 'program',
    field: 'trial_deposit',
    displayName: 'Trial Deposit',
    dataType: 'currency',
    required: false
  },
  {
    name: 'finance.program.assessment_fees',
    scope: 'finance',
    category: 'program',
    field: 'assessment_fees',
    displayName: 'Assessment Fees',
    dataType: 'currency',
    required: false
  },
  {
    name: 'finance.penalties.late_notification',
    scope: 'finance',
    category: 'penalties',
    field: 'late_notification',
    displayName: 'Late Notification Fee',
    dataType: 'currency',
    required: true,
    defaultValue: '$50'
  },
  {
    name: 'finance.penalties.cleaning_violations',
    scope: 'finance',
    category: 'penalties',
    field: 'cleaning_violations',
    displayName: 'Cleaning Violation Fee',
    dataType: 'currency',
    required: true,
    defaultValue: '$150'
  },

  // Room-Level Variables
  {
    name: 'room.occupancy.type',
    scope: 'room',
    category: 'occupancy',
    field: 'type',
    displayName: 'Room Occupancy Type',
    dataType: 'text',
    required: true
  },
  {
    name: 'room.coordinator.access_enabled',
    scope: 'room',
    category: 'coordinator',
    field: 'access_enabled',
    displayName: 'Coordinator Access Enabled',
    dataType: 'boolean',
    required: true,
    defaultValue: 'false'
  },
  {
    name: 'room.configuration.bed_count',
    scope: 'room',
    category: 'configuration',
    field: 'bed_count',
    displayName: 'Bed Count',
    dataType: 'number',
    required: true
  },
  {
    name: 'room.configuration.bed_types',
    scope: 'room',
    category: 'configuration',
    field: 'bed_types',
    displayName: 'Bed Types',
    dataType: 'text',
    required: true
  },

  // Participant Variables (Single-Party Documents)
  {
    name: 'participant.personal.full_name',
    scope: 'participant',
    category: 'personal',
    field: 'full_name',
    displayName: 'Participant Full Name',
    dataType: 'text',
    securityAnnotation: '@secure:name',
    required: true
  },
  {
    name: 'participant.personal.preferred_name',
    scope: 'participant',
    category: 'personal',
    field: 'preferred_name',
    displayName: 'Preferred Name',
    dataType: 'text',
    securityAnnotation: '@secure:name',
    required: false
  },
  {
    name: 'participant.contact.phone',
    scope: 'participant',
    category: 'contact',
    field: 'phone',
    displayName: 'Participant Phone',
    dataType: 'phone',
    securityAnnotation: '@secure:phone',
    required: true
  },
  {
    name: 'participant.contact.email',
    scope: 'participant',
    category: 'contact',
    field: 'email',
    displayName: 'Participant Email',
    dataType: 'email',
    securityAnnotation: '@secure:email',
    required: true
  },
  {
    name: 'participant.emergency.name',
    scope: 'participant',
    category: 'emergency',
    field: 'name',
    displayName: 'Emergency Contact Name',
    dataType: 'text',
    securityAnnotation: '@secure:name',
    required: true
  },
  {
    name: 'participant.emergency.phone',
    scope: 'participant',
    category: 'emergency',
    field: 'phone',
    displayName: 'Emergency Contact Phone',
    dataType: 'phone',
    securityAnnotation: '@secure:phone',
    required: true
  },
  {
    name: 'participant.emergency.relationship',
    scope: 'participant',
    category: 'emergency',
    field: 'relationship',
    displayName: 'Emergency Contact Relationship',
    dataType: 'text',
    required: true
  },

  // Agreement Variables
  {
    name: 'agreement.dates.start',
    scope: 'agreement',
    category: 'dates',
    field: 'start',
    displayName: 'Agreement Start Date',
    dataType: 'date',
    required: true
  },
  {
    name: 'agreement.dates.end',
    scope: 'agreement',
    category: 'dates',
    field: 'end',
    displayName: 'Agreement End Date',
    dataType: 'date',
    required: false
  },
  {
    name: 'agreement.dates.signed',
    scope: 'agreement',
    category: 'dates',
    field: 'signed',
    displayName: 'Signature Date',
    dataType: 'date',
    required: true
  }
];

export default templateVariables;
