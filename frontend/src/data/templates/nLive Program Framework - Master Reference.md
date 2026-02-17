# nLive Program Framework - Master Reference

## TEMPLATE VARIABLES

### Hierarchical Variable Structure
Variables follow the pattern: `{scope.category.field}` or `{scope.category.subcategory.field}`

### Geographic Hierarchy Variables
```
{location.country.code}                // au, nz, uk, etc.
{location.state.code}                  // vic, nsw, qld, etc.
{location.address.full}                // @secure:address - Complete address
{location.premises.classification}     // Class 4, etc.
```

### Organization Contact Variables
```
{org.coordinator.name}                 // @secure:name - Primary program coordinator
{org.coordinator.role}                 // Program Coordinator & Site Manager
{org.coordinator.phone}                // @secure:phone - Primary contact
{org.coordinator.email}                // @secure:email - Primary email

{org.emergency.name}                   // @secure:name - After-hours emergency contact
{org.emergency.role}                   // Emergency Response Coordinator
{org.emergency.phone}                  // @secure:phone - Emergency phone

{org.maintenance.name}                 // @secure:name - Maintenance contact
{org.maintenance.phone}                // @secure:phone - Maintenance phone
```

### Financial Category Variables
```
{finance.accommodation.weekly_rent}     // Standard tenancy costs
{finance.accommodation.bond_amount}     // Residential bond

{finance.commercial.equipment_deposit}  // Shopfront access deposit
{finance.commercial.damage_liability}   // Equipment damage responsibility

{finance.program.trial_deposit}         // Trial participation deposit
{finance.program.assessment_fees}       // Evaluation costs

{finance.hobby.materials_cost}          // Workshop materials
{finance.coop.profit_sharing}           // Co-op financial benefits
{finance.ndis.service_rates}            // NDIS business unit rates
{finance.employment.wages}              // Staff payments

{finance.penalties.late_notification}   // Administrative penalties
{finance.penalties.cleaning_violations} // Non-compliance fees
```

### Room-Level Variables
```
{room.occupancy.type}                   // mixed, personal, vacant
{room.coordinator.access_enabled}       // true/false based on participant presence
{room.configuration.bed_count}          // Number of beds in room
{room.configuration.bed_types}          // Single, double, flexible
```

### Participant Variables (Single-Party Documents)
```
{participant.personal.full_name}        // @secure:name - Legal full name
{participant.personal.preferred_name}   // @secure:name - Preferred name
{participant.contact.phone}             // @secure:phone - Phone number
{participant.contact.email}             // @secure:email - Email address
{participant.emergency.name}            // @secure:name - Emergency contact
{participant.emergency.phone}           // @secure:phone - Emergency phone
{participant.emergency.relationship}    // Relationship to participant

{agreement.dates.start}                 // Agreement start date
{agreement.dates.end}                   // Agreement end date
{agreement.dates.signed}                // Signature date
```

### Security Annotations
```
@secure:name     - Personal names requiring anonymization/tokenization
@secure:phone    - Phone numbers requiring encryption
@secure:email    - Email addresses requiring encryption  
@secure:address  - Addresses requiring encryption/tokenization
```

---

## SHARED COMPONENTS - "HOME IS MY CASTLE" STRUCTURE

### PERSONAL LEVEL (REF-001 to REF-005)

### REF-001: Organization Details and Primary Contacts
**Entity Name:** {entity.trading.name}  
**Operating Entity:** {entity.legal.name} (ACN: {entity.legal.acn})  
**Property Address:** {location.address.full}  
**Primary Contact:** {org.coordinator.name}, {org.coordinator.role}  
**Phone:** {org.coordinator.phone} | **Email:** {org.coordinator.email}  
**Emergency Contact:** {org.emergency.name}, {org.emergency.role} - {org.emergency.phone}

### REF-002: Mission Statement and Personal Alignment
{entity.trading.name} operates as a sustainability and lifestyle program focused on:
- Supporting individuals to develop sustainable living practices
- Building skills in domestic management, food safety, and ecological responsibility
- Creating supportive environments that prioritize environmental outcomes
- Facilitating transition from unsustainable lifestyle patterns to regenerative practices
- Supporting local flora, fauna, and ecological systems

### REF-003: Safety and Emergency Procedures (Personal Safety First)
**Emergency Services:** 000 (Police, Fire, Ambulance)  
**Site Emergency Contact:** {org.emergency.name} - {org.emergency.phone}  
**Maintenance Contact:** {org.maintenance.name} - {org.maintenance.phone}

**Personal Safety Notice:** Any emergency situation, personal safety threats, or criminal behavior must be reported immediately to 000 and brought to the attention of management. Participants unfamiliar with Australian Emergency Services must notify management immediately.

### REF-004: Personal Conduct and Hygiene Standards
**Basic Personal Requirements:**
1. **Safety First:** No endangering household or premises safety at any time
2. **Personal Hygiene:** Regular maintenance required for community health and wellbeing
3. **Property Respect:** Care for personal belongings and shared resources
4. **Professional Interaction:** Respectful communication with all household members and staff
5. **Substance-Free Living:** No illicit drugs or addiction-related substances on premises

**REF-004.1: Adult Kitchen Environment Option**
- "Ramsay Kitchen" profanity allowance during intensive cooking/training sessions
- Requires consent from ALL parties participating in kitchen activity
- Automatically disabled when children under 16 present on premises
- Revocable by any participating party with 48-hour notice
- Limited to kitchen area during active cooking/training sessions only
- Special broadcast consent required when educational broadcasting active

### REF-005: Personal Transition Framework
**Progression Pathways:**
- **Trial → Tenant:** Assessment completion and mutual agreement for tenancy
- **Tenant → Team Member:** Skills demonstration and commitment to increased participation
- **Shared Room → Personal Room:** Availability-based transition with rate adjustment
- **Flexible Tenancy → Standard Group Lease:** Group consensus and financial commitment to fixed capacity
- **Program Participation Levels:** Voluntary engagement scaling from basic to advanced training

**Transition Requirements:**
- Written agreement for all status changes
- Financial adjustment calculations and payment arrangements
- Notice periods and effective dates for transitions
- Assessment criteria and approval processes

---

### ROOM LEVEL (REF-006 to REF-010)

### REF-006: Room Standards and Configuration
**Flexible Bed Rules:**
- Flexible beds configured as single beds in shared rooms to prevent jealousy
- Exception: Couples or established bed-sharing partnerships may use double configuration when both parties share same room
- Coordinator approval and roommate consent required for any double bed usage

**Room Maintenance Standards:**
1. **Cleanliness:** Rooms maintained in clean, odor-free condition at all times
2. **Pest Prevention:** No substances likely to attract insects, bugs, or rodents
3. **Personal Storage:** Designated areas for personal belongings within rooms
4. **Condition Reports:** Before and after inspection reports required for all room changes

### REF-007: Room Access and Privacy Rights
**Mixed Occupancy Coordinator Access (when trial/program participants present):**
- Entry permitted 9am-6pm for safety inspections, program delivery, participant setup, maintenance
- Outside hours: 3 knocks over 2.5 minutes for emergencies only
- **EXCLUDED:** Entry during quiet hours except genuine emergencies
- Personal bed areas and storage require 72-hour notice and consent for changes

**Tenant-Only Rooms:** Standard tenant rights apply - no coordinator access
**Personal Room Rights:** Exclusive nighttime occupancy with shared daytime access per Class 4 requirements

### REF-008: Room Conflict Resolution
**Inappropriate Room Access:**
- Written warning for unauthorized entry or harassment of residents
- ${finance.penalties.late_notification} administrative fee for second violation
- Immediate lease termination for third violation or threatening conduct
- Police involvement for intimidation or safety concerns

**Unreasonable Access Denial:**
- Initial discussion to understand stated concerns
- Assessment of whether concerns justify access restrictions
- Written notice that shared residential lease requires reasonable access
- 14-day compliance period followed by lease termination if obstruction continues
- Emergency override: Management retains access rights for safety, maintenance, emergencies

### REF-009: Room Assignment Safety Policy
**Default Safety Considerations:**
- Same-gender assignments as starting point for risk reduction
- Age-appropriate groupings where relevant
- Compatibility assessments for safety and harmony
- Special needs accommodations and accessibility requirements
- Substance abuse history considerations and support needs
- Previous incident history review and risk assessment
- Personal safety concerns, requests, and protective factors
- Vulnerability and at-risk individual identification and support
- Cultural and religious considerations
- Mental health support needs and trigger awareness

### REF-010: Vacant Room Community Activities
**Indoor Activities in Unoccupied Rooms:**
- Music lessons and practice sessions
- Wellness services (massage, meditation, healing practices)
- Skills workshops and repair training
- Art and craft activities
- Study groups and tutoring
- Community meetings and support groups

**Activity Management:**
- All activities cease immediately when room becomes occupied by residential tenant
- Community focus: Activities emphasize skills development and community building
- House rules apply: All activities subject to quiet hours and safety standards

---

### HOUSEHOLD LEVEL (REF-011 to REF-015)

### REF-011: Core House Rules
**Environmental Standards:**
1. **Peaceful Environment:** No significant disruption to household peace or harmony
2. **Quiet Hours:** 
   - Winter/Autumn: 10:00pm - 7:00am
   - Spring/Summer: 10:30pm - 7:00am
   - Exceptions require written request and acceptance from all household members
3. **Child-Friendly Environment:** Appropriate language and behavior required (subject to REF-004.1 kitchen option)
4. **Smoke/Vape Free:** Premises completely smoke and vape free
   - Violations: $150 airing fee plus possible lease termination
   - Activities must occur off-property only
5. **Drug and Addiction Free:** No consumption of illicit drugs or substances on premises

### REF-012: Shared Space Management
**Kitchen Access and Food Safety:**
- Daily evening access 6:00pm - 9:00pm minimum for domestic use
- Commercial priority during business hours for business operations
- Commercial-level food safety standards required for all individuals
- Adult language environment option per REF-004.1 with full participant consent

**Class 4 Building Shared Access:**
- All lease holders have right to access shared residential lease areas
- Common area traversal rights during daytime hours
- Emergency access maintained 24/7 for safety purposes
- Coordination and respectful scheduling for optimal household harmony

### REF-013: Visitor Risk Management and Pet Policies

**Visitor Risk Assessment Framework:**

*Low Risk Visitors (No Additional Screening Required):*
- Family members with no disclosed safety concerns
- Professional contacts (case workers, medical providers, legal representatives)
- Program alumni in good standing with positive departure records
- Community partners, volunteers, and verified support persons
- Current household members' verified professional colleagues

**Alumni Accommodation Program:**
- Compatible program alumni welcome for temporary stays when spare beds available
- Maximum 3 consecutive nights, up to 6 nights per month
- No accommodation fees - food and utility contributions appreciated
- Advance coordination required with household members and management
- Must comply with all current house rules and program standards
- Available during transition periods, travel, or temporary accommodation needs
- Maintains community connection and provides mutual support network
- Alumni status confirmed through positive program completion records

**Staff Accommodation Program (Subject to Financial Viability):**
- Program facilitators and premises coordinators may be eligible for rent-free accommodation
- Availability subject to business financial capacity and spare bed availability
- Precedence order: 1) Aqius owners with significant contributions, 2) Senior program staff
- Staff accommodation agreements separate from standard tenancy arrangements
- Professional conduct standards and enhanced accountability requirements apply
- Accommodation linked to active employment/role performance
- Standard house rules and program participation requirements maintained

*Medium Risk Visitors (Code of Conduct Agreement Required):*
- New personal acquaintances or dating partners not known to household
- Visitors with minor criminal history (non-violent offenses over 2 years ago)
- Previous program participants with resolved conflicts but no serious breaches
- Workplace associates or friends not well-known to resident
- Anyone causing mild concern to household members but no immediate safety risk

*High Risk Visitors (Enhanced Screening + Restricted Access):*
- Criminal associates or individuals with current legal proceedings
- History of violence, drug dealing, serious property crimes, or intimidation
- Previous program participants removed for serious breaches or safety violations
- Anyone causing significant concern to household members or management
- Individuals under intervention orders or restraining orders

**Visitor Code of Conduct Requirements:**

*Standard Visitor Agreement (Medium Risk):*
```
I acknowledge and agree to:
- Comply with all house rules during visit including quiet hours and smoke-free policies
- Bring no prohibited substances, weapons, or illegal items onto premises
- Interact respectfully with all residents, staff, and any customers or community members
- Not interfere with program activities, business operations, or household functioning
- Accept that access may be revoked immediately for any rule violations
- Take personal responsibility and liability for any damages or incidents I cause
- Understand that my behavior reflects on the resident who invited me
```

*Enhanced Visitor Restrictions (High Risk):*
- Access limited to common areas only - no entry to bedrooms or private spaces
- Maximum visit duration 2 hours with advance approval required
- Resident must remain present and supervising at all times during visit
- Written incident report required if any concerns arise during visit
- Permanent ban possible for any violations of visitor agreement

**Shopfront Public Access Protocol:**
- General public welcome during business hours unless actively disrupting operations
- No extended loitering, aggressive behavior, or intimidation of customers/residents
- Management retains absolute discretion to remove disruptive individuals
- Police involvement for threatening behavior, refusal to leave, or criminal activity
- Banned individuals forfeit all premises access including shopfront areas

**Resident Accountability for Visitor Behavior:**
- Residents fully responsible for all visitor actions, behavior, and consequences
- Enhanced accountability framework applies: residents face penalties for serious visitor violations
- Advance notification required for all medium and high risk visitors (24-48 hours)
- Immediate visitor removal required if household member requests or rules violated
- Resident may face accommodation penalties including potential lease termination for repeated visitor violations

**Pet Approval and Management:**
- Written consent required from management before keeping pets on premises
- Pet behavior assessment and compatibility evaluation with existing animals
- Resident responsible for all pet care, behavior, damages, and veterinary costs
- Pets must comply with local council registration and vaccination requirements
- Immediate removal required if pet poses safety risk or causes significant household disruption

### REF-014: Household Conflict Resolution
**Escalation Framework:**
1. **Level 1:** Direct discussion between affected parties within 24 hours
2. **Level 2:** Coordinator mediation within 48 hours of written complaint
3. **Level 3:** External mediation within 7 days if internal resolution unsuccessful
4. **Level 4:** VCAT for tenancy disputes, Magistrates Court for serious misconduct/damages
5. **Level 5:** District Court for complex commercial disputes, Supreme Court for precedent-setting matters

### REF-015: Staff Professional Safeguarding
**Audio Recording Protocols:**
- Encrypted local storage only - no internet access
- 3-week retention limit for routine interactions
- Access only for incident investigation or legal proceedings
- Applies to all program roles: coordinators, facilitators, supervisors, support workers
- Participant consent required as part of program participation

**Professional Conduct Standards:**
- Professional courtesy and ethical conduct mandatory
- Respect for personal boundaries, space, opinions, and limitations
- No abuse of any kind (physical, emotional, sexual, financial, verbal, neglect)
- Clear professional boundaries with participants maintained at all times

---

### PREMISES LEVEL (REF-016 to REF-020)

### REF-016: Building Classification and Compliance
**Class 4 Residential Requirements:**
- {location.premises.classification} residential building in commercial zone
- Shared residential accommodation classification required for terms over 30 days
- Council requirements: Ongoing compliance with local authority approvals

**Commercial Kitchen Historical Precedent:**
- Established right to commercial food service operations
- Court precedent supporting commercial activities in this premises
- Commercial operations take priority during designated business hours

### REF-017: Business Operations Integration
**Shopfront Access Rights:**
- Clean up immediately after use - return to original condition
- Book via system when available or seek permission at time of use
- No interference with business operations or customer service
- Comply with quiet hours restrictions during use

**Commercial Equipment Liability:**
- Tenants 100% liable for damages to commercial equipment and areas
- ${finance.commercial.equipment_deposit} refundable deposit required
- Residential bond may be applied to commercial area damages
- Full replacement cost liability for specialized equipment

### REF-018: Excluded Areas Framework
**Company Reserved Spaces:**
- **Shareholder/Director Room:** Reserved for {entity.legal.name} shareholders, directors, and authorized associates
- **Shed Area:** Business storage, garage sales, repair workshops, and community activities
- **Shopfront:** Commercial operations with limited tenant access per REF-017

**Usage Governance:**
- Excluded areas governed by company board decisions and director discretion
- All parties must comply with quiet hours and basic safety standards
- No tenant rights or claims extend to excluded areas

### REF-019: Community and Educational Broadcasting
**Educational Broadcasting Areas:**
- Kitchen area for cooking demonstrations and sustainability education
- Shopfront for community engagement and skills development showcase
- Other areas only with specific occasion-based consent

**Adult Content Integration:**
- Clear content warnings for broadcast audience when adult kitchen mode active
- Separate consent required for broadcasting adult language content
- Age-restricted broadcast channels/times during adult mode
- Immediate broadcast suspension if minors enter kitchen area

### REF-020: Utilities and Environmental Standards
**Shared Usage Practices:**
- Encouraged for all utilities where practical and economical
- Energy-efficient appliance use and sustainable living practices
- Coordinate laundry with weather forecasts for environmental efficiency

**Cost Allocation:**
- Utilities included if business operations profitable
- Shared among residents if business cannot cover overhead
- Individual meters available for excess usage monitoring and billing

---

### LEGAL/EXTERNAL LEVEL (REF-021 to REF-025)

### REF-021: Legal Compliance Framework
**Tenancy Law Compliance:** All accommodation arrangements comply with Victorian Residential Tenancies Act 1997  
**Privacy Compliance:** Operations comply with Australian Privacy Principles  
**Building Compliance:** Class 4 residential building requirements under Building Act 1993  
**Consumer Protection:** Consumer Affairs Victoria resources and VCAT jurisdiction available

### REF-022: Two-Model Framework
**Flexible Tenancy Model:**
- Pay per occupied bed: ${finance.accommodation.weekly_rent} per person per week
- Rolling tenant ledger with individual agreements
- Coordinator access rights when participants present in shared rooms
- Individual liability for personal accommodation costs

**Standard Group Lease:**
- Fixed capacity cost: 6 beds × ${finance.accommodation.weekly_rent} = total weekly cost
- Collective responsibility for full amount regardless of occupancy
- Standard tenant rights with no coordinator access
- Group decision-making for room arrangements and new members

**Conversion Requirements:**
- Unanimous consent from all current tenants required
- Formal lease variation to transition between models
- No reversion to Flexible model during Standard Group fixed term

### REF-023: Criminal History and Vulnerability Screening
**Pre-Trial Assessment Requirements:**
- Complete police records disclosure (all Australian states)
- 18-month behavioral change evidence with professional references
- Character assessment and detailed accommodation history
- Group evaluation meeting with current participants
- Enhanced supervision protocols for at-risk individuals during trial period

**Vulnerability and At-Risk Identification:**
- Mental health support needs and crisis risk factors
- Substance abuse history and recovery support requirements
- Physical safety concerns and protective measure needs
- Social isolation risks and community integration support
- Financial vulnerability and exploitation prevention measures

### REF-024: Mission Protection and Anti-Elite Capture
**Minimum Occupancy Requirements:**
- Standard Group Lease must maintain minimum 4 people within 60 days of departure
- If below minimum, 60-day recruitment period or revert to Flexible Tenancy
- Management retains right to advertise vacant beds if group fails to recruit

**Eligible Refusal Reasons for New Members:**
- **Valid:** Criminal violence history, substance abuse risks, safety concerns, fundamental mission conflicts
- **Invalid:** Race, religion, disability (unless safety risk), social class, personal preferences
- **Documentation Required:** Written explanation within 48 hours with supporting evidence

**Financial Accessibility Protection:**
- Cannot exclude candidates based solely on financial status
- Group agreements must remain compatible with sustainability mission
- Conversion back to Flexible Tenancy if group operates contrary to program values

### REF-025: Damage Liability and Fee Structure
**Notification Requirements:**
- Immediate notification preferred for all damages and incidents
- 24-hour notification mandatory with written documentation
- Failure to notify within deadline incurs ${finance.penalties.late_notification} administrative fee

**Fee Schedule:**
- Basic non-compliance: $30-$60 minimum for cleaning violations
- Professional cleaning required: $100-$300 (full cost passed through)
- Management incidents: $50 per incident (excluding maintenance, pest, or external reports)
- Termination processing: $250/hour for time spent on removal procedures

**Court Escalation Pathways:**
- VCAT for standard tenancy disputes and damage claims
- Magistrates Court for serious misconduct causing significant damages
- District Court for complex commercial or employment disputes
- Supreme Court for constitutional challenges or precedent-setting cases

### REF-026: Progressive Skills Mastery and Mentorship Pathway

**Trial Period: 14 days maximum (genuine guest status)**
- Emergency, safety, and clean room standards established Day 1
- Basic cleaning mastery required before kitchen access (Day 1-2)
- Kitchen safety and food handling competency demonstrated (Day 2-3)
- Assessment decision required within 14 days maximum

**Probation Tenancy: 8 weeks minimum to 12 weeks maximum (full tenant rights + program evaluation)**
- Full residential tenancy rights with program participation elements
- Skills progression through domestic systems, kitchen operations, team coordination
- Weekly assessment checkpoints and competency documentation
- Extension to 12 weeks available if skills development requires additional time
- Minimum 8-week completion required before team member advancement consideration

**Team Member Advancement: Week 8+ earliest possible (after minimum probation)**
- Skills competency demonstration across all domestic and kitchen operations
- Positive group evaluation and household compatibility confirmation
- Commitment to mentoring and leadership development responsibilities
- Financial benefits: profit-sharing eligibility and accommodation cost reductions
- **Management Discretion:** Team member advancement optional, not automatic progression

**Advanced Roles: 12-18+ months minimum program participation**
- Trainer: Skills mentorship and new member orientation leadership
- Facilitator/Coordinator: Site management and program delivery responsibilities
- Enhanced screening requirements: Working with vulnerable people clearances
- Professional conduct standards and accountability measures

**Skills Progression Framework:**
*Day 1 Prerequisites (Emergency, Safety, Clean Room):*
- Emergency contacts and evacuation procedures mastery
- Personal safety protocols and professional boundary understanding
- Room inspection, organization, and maintenance standards establishment

*Week 1-2 (Foundation Domestic Skills):*
- Daily cleaning responsibilities and shared area maintenance
- Laundry systems, waste management, and basic property care
- Room care requirements and pest prevention protocols

*Week 3-4 (Kitchen Operations and Food Safety):*
- Commercial food safety standards and HACCP implementation
- Equipment care, inventory management, and meal preparation
- Customer service integration and cost control methodologies

*Week 5-8 (Team Coordination and Leadership Development):*
- Roster management, quality assurance, and new member orientation
- Conflict resolution, communication systems, and mentoring skills
- Environmental stewardship and community engagement activities

**Progression Incentive Structure:**
- Weeks 1-8: Full participation hours required during probation period
- Week 8+: Team member benefits including 25-50% hour reductions based on mentoring contribution
- Week 12+: Profit-sharing eligibility and enhanced leadership responsibilities
- Advanced roles: Specialized training allowances and professional development opportunities

### REF-027: AI-Assisted Complaint and Process Management

**Formal Complaint Intake System:**
- Guided step-through process for comprehensive concern documentation
- Automatic categorization: safety issues, harassment, accommodation problems, program concerns
- Timeline tracking with automated follow-up reminders and deadline monitoring
- Escalation triggers for serious safety concerns requiring immediate human intervention
- Mandatory human review within 24 hours for all submitted complaints

**AI Process Integration:**
- Initial AI-guided intake with standardized questions ensuring comprehensive documentation
- Automatic document generation with timestamps and appropriate categorization
- Immediate notification to relevant human oversight for review and action
- Follow-up scheduling and progress tracking throughout resolution process
- Resolution documentation and participant satisfaction confirmation protocols

**Human Oversight Requirements:**
- All safety-related complaints require immediate human assessment
- AI serves supplementary role only - cannot replace human judgment for vulnerable person oversight
- Pattern recognition in audio recordings for concerning interaction trends
- Early warning system triggers requiring mandatory human investigation
- Documentation analysis for consistency and completeness verification

---

## DOCUMENT-SPECIFIC COMPONENTS

### TRIAL-001: Trial Period Specific Terms
**Duration:** Minimum 14 days, maximum 2 months  
**Status:** Guest status (not tenancy) with comprehensive assessment framework  
**Payment:** No accommodation fees; contributions to food and utilities required  
**Assessment:** Compatibility evaluation for all parties including criminal history screening  
**Alternative Accommodation:** Participant must maintain access to stable alternative accommodation

### LEASE-001: Flexible Tenancy Model Pricing
**Room Options:**
- Shared Room: ${finance.accommodation.weekly_rent} per person per week
- Personal Room options with individual weekly rates based on size and occupancy
- Utilities shared if business cannot cover overhead
- Bond as per Residential Tenancies Act requirements

### LEASE-002: Standard Group Lease Pricing
**Fixed Capacity Model:**
- Total weekly cost: 6 beds × ${finance.accommodation.weekly_rent} = fixed amount
- Group liability regardless of actual occupancy
- Minimum 4 people within 60 days or revert to Flexible model
- Mission protection clauses preventing exclusive arrangements

### PROGRAM-001: Program Participation Framework
**Core Hours:** 10-20 hours per week depending on experience level  
**Skills Development:** Food safety, domestic management, customer service, sustainable living
**Progression:** Trial → Team member → Employment opportunities
**Business Units:** Co-op expense reduction, NDIS proceeds sharing, hobby skills development

---

## REFERENCES USAGE GUIDE

Documents reference components using REF-XXX system following "home is my castle" hierarchy:
- **Personal Level (REF-001 to REF-005):** Individual safety, conduct, transitions
- **Room Level (REF-006 to REF-010):** Room standards, access, conflicts, assignments
- **Household Level (REF-011 to REF-015):** House rules, shared spaces, conflict resolution
- **Premises Level (REF-016 to REF-020):** Building compliance, business operations, utilities
- **Legal/External Level (REF-021 to REF-025):** Compliance, models, screening, protection

**Reserved for Future Expansion:**
- REF-026 through REF-030: Community host network, employment integration, NDIS business units

This system enables single-point updates while maintaining logical progression from personal needs to broader operational and legal frameworks.