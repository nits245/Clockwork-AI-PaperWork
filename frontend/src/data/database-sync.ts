// Auto-generated from database - 2025-10-02T06:43:00.955Z

interface MasterVariable {
  master_var_id: number;
  var_name: string;
  var_description: string;
  var_type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  var_options?: string;
  default_value: string;
  is_active: boolean;
  groups: Array<{
    group_id: number;
    group_name: string;
  }>;
  template_usage_count?: number;
  document_usage_count?: number;
}

export const FALLBACK_VARIABLES: MasterVariable[] = [
  {
    "master_var_id": 1,
    "var_name": "entity.trading.name",
    "var_description": "Entity Trading Name",
    "var_type": "text" as const,
    "default_value": "nLive Program",
    "is_active": true,
    "groups": []
  },
  {
    "master_var_id": 2,
    "var_name": "entity.legal.name",
    "var_description": "Legal Entity Name",
    "var_type": "text" as const,
    "default_value": "",
    "is_active": true,
    "groups": []
  },
  {
    "master_var_id": 3,
    "var_name": "entity.legal.acn",
    "var_description": "Australian Company Number",
    "var_type": "text" as const,
    "default_value": "",
    "is_active": true,
    "groups": []
  },
  {
    "master_var_id": 4,
    "var_name": "location.address.full",
    "var_description": "Full Property Address",
    "var_type": "text" as const,
    "default_value": "",
    "is_active": true,
    "groups": []
  },
  {
    "master_var_id": 5,
    "var_name": "location.country.code",
    "var_description": "Country Code",
    "var_type": "text" as const,
    "default_value": "au",
    "is_active": true,
    "groups": []
  },
  {
    "master_var_id": 6,
    "var_name": "location.state.code",
    "var_description": "State Code",
    "var_type": "text" as const,
    "default_value": "vic",
    "is_active": true,
    "groups": []
  },
  {
    "master_var_id": 7,
    "var_name": "location.premises.classification",
    "var_description": "Building Classification",
    "var_type": "text" as const,
    "default_value": "Class 4",
    "is_active": true,
    "groups": []
  },
  {
    "master_var_id": 8,
    "var_name": "org.coordinator.name",
    "var_description": "Program Coordinator Name",
    "var_type": "text" as const,
    "default_value": "",
    "is_active": true,
    "groups": []
  },
  {
    "master_var_id": 9,
    "var_name": "org.coordinator.role",
    "var_description": "Coordinator Role",
    "var_type": "text" as const,
    "default_value": "Program Coordinator & Site Manager",
    "is_active": true,
    "groups": []
  },
  {
    "master_var_id": 10,
    "var_name": "org.coordinator.phone",
    "var_description": "Coordinator Phone",
    "var_type": "text" as const,
    "default_value": "",
    "is_active": true,
    "groups": []
  },
  {
    "master_var_id": 11,
    "var_name": "org.coordinator.email",
    "var_description": "Coordinator Email",
    "var_type": "text" as const,
    "default_value": "",
    "is_active": true,
    "groups": []
  },
  {
    "master_var_id": 12,
    "var_name": "org.emergency.name",
    "var_description": "Emergency Contact Name",
    "var_type": "text" as const,
    "default_value": "",
    "is_active": true,
    "groups": []
  },
  {
    "master_var_id": 13,
    "var_name": "org.emergency.role",
    "var_description": "Emergency Contact Role",
    "var_type": "text" as const,
    "default_value": "Emergency Response Coordinator",
    "is_active": true,
    "groups": []
  },
  {
    "master_var_id": 14,
    "var_name": "org.emergency.phone",
    "var_description": "Emergency Phone",
    "var_type": "text" as const,
    "default_value": "",
    "is_active": true,
    "groups": []
  },
  {
    "master_var_id": 15,
    "var_name": "org.maintenance.name",
    "var_description": "Maintenance Contact Name",
    "var_type": "text" as const,
    "default_value": "",
    "is_active": true,
    "groups": []
  },
  {
    "master_var_id": 16,
    "var_name": "org.maintenance.phone",
    "var_description": "Maintenance Phone",
    "var_type": "text" as const,
    "default_value": "",
    "is_active": true,
    "groups": []
  },
  {
    "master_var_id": 17,
    "var_name": "finance.accommodation.weekly_rent",
    "var_description": "Weekly Rent Amount",
    "var_type": "text" as const,
    "default_value": "$150",
    "is_active": true,
    "groups": []
  },
  {
    "master_var_id": 18,
    "var_name": "finance.accommodation.bond_amount",
    "var_description": "Bond Amount",
    "var_type": "text" as const,
    "default_value": "$600",
    "is_active": true,
    "groups": []
  },
  {
    "master_var_id": 19,
    "var_name": "finance.commercial.equipment_deposit",
    "var_description": "Commercial Equipment Deposit",
    "var_type": "text" as const,
    "default_value": "$300",
    "is_active": true,
    "groups": []
  },
  {
    "master_var_id": 20,
    "var_name": "finance.penalties.late_notification",
    "var_description": "Late Notification Fee",
    "var_type": "text" as const,
    "default_value": "$50",
    "is_active": true,
    "groups": []
  },
  {
    "master_var_id": 21,
    "var_name": "finance.penalties.cleaning_violations",
    "var_description": "Cleaning Violation Fee",
    "var_type": "text" as const,
    "default_value": "$150",
    "is_active": true,
    "groups": []
  }
];
