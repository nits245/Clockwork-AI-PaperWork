-- =====================================================
-- PAPERWORK-MODULE COMPLETE DATABASE SETUP
-- =====================================================
-- This file contains everything needed to set up the database
-- from scratch including schema, master variables, and test data
--
-- DATABASE INFO:
-- - Database Name: paperwork_module
-- - Master Variables: 49 production variables
-- - Tables: 26 tables (core + cascade + common blocks)
-- - Test Data: 5 templates, 5 identities, 5 parties
--
-- IMPORTANT NOTES:
-- - This matches the ACTUAL production database structure
-- - Updated: October 16, 2025
-- - Master variables include real nLive Program data
-- - If you already have paperwork_module, use ADD_MISSING_TABLES.sql instead
-- - This script will DROP the existing database if it exists
--
-- NOT INCLUDED (requires separate migration):
-- - master_references table (if you use master references)
--
-- Prerequisites:
-- - PostgreSQL 12 or higher installed and running
-- - Database user with superuser privileges (default: postgres)
--
-- Usage:
-- 1. Start PostgreSQL service
-- 2. Run this script in pgAdmin or via command line:
--    psql -U postgres -f COMPLETE_DATABASE_SETUP.sql
--
-- =====================================================

-- =====================================================
-- SECTION 1: DATABASE AND USER CREATION
-- =====================================================

-- Drop existing database if it exists (CAUTION: This will delete all data)
DROP DATABASE IF EXISTS paperwork_module;

-- Create the database
CREATE DATABASE paperwork_module
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Connect to the new database
\c paperwork_module;

-- =====================================================
-- SECTION 2: CORE APPLICATION TABLES
-- =====================================================

-- Document Default Template Table
CREATE TABLE document_default_template (
    type VARCHAR(10) PRIMARY KEY,
    title VARCHAR(50),
    content TEXT
);

-- Identity Table
CREATE TABLE identity (
    identity_id VARCHAR(20) PRIMARY KEY,
    firstname VARCHAR(20),
    lastname VARCHAR(20),
    email VARCHAR(100),
    student_id VARCHAR(200),
    title VARCHAR(20),
    age INT
);

-- Parties Table
CREATE TABLE parties (
    parties_id VARCHAR(20) PRIMARY KEY,
    abn VARCHAR(45),
    parties_name VARCHAR(100),
    parties_address VARCHAR(200),
    parties_email VARCHAR(200),
    parties_company VARCHAR(200) NOT NULL
);

-- FAQ Table
CREATE TABLE faq (
    faq_id SERIAL PRIMARY KEY,
    faq_question VARCHAR(100),
    faq_answer VARCHAR(200)
);

-- Notes Table
CREATE TABLE notes (
    note_id SERIAL PRIMARY KEY,
    date_created DATE NOT NULL,
    person_created VARCHAR(100),
    is_removed BOOLEAN NOT NULL,
    header VARCHAR(100) NOT NULL,
    content TEXT NOT NULL
);

-- Document Template Table
CREATE TABLE document_template (
    document_template_id VARCHAR(20) PRIMARY KEY,
    type VARCHAR(10) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    version DECIMAL(10,1),
    parties_number INT NOT NULL,
    created_date DATE NOT NULL,
    date_modified DATE,
    FOREIGN KEY (type) REFERENCES document_default_template(type)
);

-- Document Container Table
CREATE TABLE document_container (
    document_container_id SERIAL PRIMARY KEY,
    identity_id VARCHAR(200) NOT NULL,
    document_template_id VARCHAR(20) NOT NULL,
    issue_date TIMESTAMP,
    signed_date TIMESTAMP,
    var_list VARCHAR(2000),
    FOREIGN KEY (identity_id) REFERENCES identity(identity_id),
    FOREIGN KEY (document_template_id) REFERENCES document_template(document_template_id)
);

-- Document Default Template Variables Table
CREATE TABLE document_default_template_variables (
    var_id SERIAL PRIMARY KEY,
    var_name VARCHAR(20) NOT NULL,
    var_hint VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    FOREIGN KEY (type) REFERENCES document_default_template(type)
);

-- Document Parties Table
CREATE TABLE document_parties (
    document_template_id VARCHAR(20) NOT NULL,
    parties_id VARCHAR(45) NOT NULL,
    parties_approval BOOLEAN,
    FOREIGN KEY (document_template_id) REFERENCES document_template(document_template_id),
    FOREIGN KEY (parties_id) REFERENCES parties(parties_id)
);

-- Identity High Sensitive Table
CREATE TABLE identity_high_sensitive (
    identity_id VARCHAR(20) NOT NULL,
    street_number VARCHAR(20),
    apartment_unit VARCHAR(20),
    city VARCHAR(200),
    post_code VARCHAR(20),
    surburb VARCHAR(20),
    gender VARCHAR(20),
    FOREIGN KEY (identity_id) REFERENCES identity(identity_id)
);

-- Identity Less Sensitive Table
CREATE TABLE identity_less_sensitive (
    identity_id VARCHAR(20) NOT NULL,
    state VARCHAR(20),
    email VARCHAR(100),
    FOREIGN KEY (identity_id) REFERENCES identity(identity_id)
);

-- Guest Identity Table
CREATE TABLE guest_identity (
    identity_guest_id VARCHAR(20) PRIMARY KEY,
    document_container_id INT NOT NULL,
    firstname VARCHAR(50),
    lastname VARCHAR(50),
    student_id VARCHAR(50),
    address VARCHAR(200),
    title VARCHAR(20),
    age INT,
    email VARCHAR(200) NOT NULL,
    FOREIGN KEY (document_container_id) REFERENCES document_container(document_container_id)
);

-- Configuration Table
CREATE TABLE configuration (
    document_template_id VARCHAR(20) NOT NULL,
    student_id BOOLEAN NOT NULL,
    address BOOLEAN NOT NULL,
    title BOOLEAN NOT NULL,
    age BOOLEAN NOT NULL,
    email BOOLEAN NOT NULL,
    FOREIGN KEY (document_template_id) REFERENCES document_template(document_template_id)
);

-- =====================================================
-- SECTION 3: MASTER VARIABLE CASCADE SYSTEM
-- =====================================================

-- Variable Groups for organization
CREATE TABLE variable_groups (
    group_id SERIAL PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL UNIQUE,
    group_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Master Variables table
CREATE TABLE master_variables (
    master_var_id SERIAL PRIMARY KEY,
    var_name VARCHAR(200) NOT NULL UNIQUE,
    var_description TEXT NOT NULL,
    var_type VARCHAR(20) NOT NULL CHECK (var_type IN ('text', 'number', 'date', 'boolean', 'select')),
    var_options TEXT,
    default_value TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Many-to-many relationship between variables and groups
CREATE TABLE master_variable_groups (
    master_var_id INTEGER REFERENCES master_variables(master_var_id) ON DELETE CASCADE,
    group_id INTEGER REFERENCES variable_groups(group_id) ON DELETE CASCADE,
    PRIMARY KEY (master_var_id, group_id)
);

-- Template-Variable relationships
CREATE TABLE template_master_variables (
    template_var_id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL,
    master_var_id INTEGER REFERENCES master_variables(master_var_id) ON DELETE CASCADE,
    position_in_template INTEGER,
    is_required BOOLEAN DEFAULT false,
    custom_label VARCHAR(200),
    custom_placeholder VARCHAR(200),
    validation_rules TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(template_id, master_var_id)
);

-- Document instance variable values
CREATE TABLE document_master_variable_values (
    doc_var_id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL,
    master_var_id INTEGER REFERENCES master_variables(master_var_id) ON DELETE CASCADE,
    var_value TEXT,
    override_source VARCHAR(50),
    is_locked BOOLEAN DEFAULT false,
    last_cascade_update TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_id, master_var_id)
);

-- Cascade update audit log
CREATE TABLE cascade_update_log (
    log_id SERIAL PRIMARY KEY,
    master_var_id INTEGER REFERENCES master_variables(master_var_id) ON DELETE CASCADE,
    update_type VARCHAR(20) NOT NULL CHECK (update_type IN ('value_change', 'cascade_trigger', 'bulk_update')),
    old_value TEXT,
    new_value TEXT,
    affected_documents INTEGER[],
    affected_templates INTEGER[],
    update_reason TEXT,
    performed_by VARCHAR(100),
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cascade_batch_id UUID
);

-- =====================================================
-- SECTION 4: COMMON BLOCKS AND PARTICIPANTS SYSTEM
-- =====================================================

-- Common Blocks Table
CREATE TABLE IF NOT EXISTS common_blocks (
  id SERIAL PRIMARY KEY,
  block_id VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tags TEXT[],
  used_in TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Block Versions Table
CREATE TABLE IF NOT EXISTS block_versions (
  id SERIAL PRIMARY KEY,
  block_id VARCHAR(255) NOT NULL REFERENCES common_blocks(block_id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  change_description TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  changed_by VARCHAR(255),
  UNIQUE(block_id, version)
);

-- Forked Blocks Table
CREATE TABLE IF NOT EXISTS forked_blocks (
  id SERIAL PRIMARY KEY,
  document_instance_id INTEGER NOT NULL,
  block_id VARCHAR(255) NOT NULL REFERENCES common_blocks(block_id) ON DELETE CASCADE,
  original_version VARCHAR(50) NOT NULL,
  modified_content TEXT NOT NULL,
  needs_review BOOLEAN DEFAULT TRUE,
  reviewed_at TIMESTAMP,
  reviewed_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(document_instance_id, block_id)
);

-- Participant Groups Table
CREATE TABLE IF NOT EXISTS participant_groups (
  id SERIAL PRIMARY KEY,
  document_instance_id INTEGER NOT NULL,
  template_id VARCHAR(255) NOT NULL,
  participant_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(document_instance_id, template_id)
);

-- Participant Variables Table
CREATE TABLE IF NOT EXISTS participant_variables (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES participant_groups(id) ON DELETE CASCADE,
  participant_index INTEGER NOT NULL,
  base_variable_name VARCHAR(255) NOT NULL,
  full_variable_name VARCHAR(255) NOT NULL,
  value TEXT,
  inherited_from VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, full_variable_name)
);

-- Cascade Tasks Table
CREATE TABLE IF NOT EXISTS cascade_tasks (
  id SERIAL PRIMARY KEY,
  task_id VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL,
  block_id VARCHAR(255) REFERENCES common_blocks(block_id) ON DELETE CASCADE,
  affected_items TEXT[],
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  completed_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SECTION 5: INDEXES FOR PERFORMANCE
-- =====================================================

-- Master Variables Indexes
CREATE INDEX idx_master_variables_name ON master_variables(var_name);
CREATE INDEX idx_master_variables_type ON master_variables(var_type);
CREATE INDEX idx_master_variables_active ON master_variables(is_active);
CREATE INDEX idx_template_master_variables_template ON template_master_variables(template_id);
CREATE INDEX idx_template_master_variables_master ON template_master_variables(master_var_id);
CREATE INDEX idx_document_values_document ON document_master_variable_values(document_id);
CREATE INDEX idx_document_values_master ON document_master_variable_values(master_var_id);
CREATE INDEX idx_cascade_log_master_var ON cascade_update_log(master_var_id);
CREATE INDEX idx_cascade_log_batch ON cascade_update_log(cascade_batch_id);

-- Common Blocks Indexes
CREATE INDEX IF NOT EXISTS idx_block_versions_block_id ON block_versions(block_id);
CREATE INDEX IF NOT EXISTS idx_forked_blocks_document_id ON forked_blocks(document_instance_id);
CREATE INDEX IF NOT EXISTS idx_forked_blocks_needs_review ON forked_blocks(needs_review);
CREATE INDEX IF NOT EXISTS idx_participant_groups_document_id ON participant_groups(document_instance_id);
CREATE INDEX IF NOT EXISTS idx_participant_variables_group_id ON participant_variables(group_id);
CREATE INDEX IF NOT EXISTS idx_cascade_tasks_completed ON cascade_tasks(completed);
CREATE INDEX IF NOT EXISTS idx_cascade_tasks_type ON cascade_tasks(type);

-- =====================================================
-- SECTION 6: TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function for updating modified timestamps
CREATE OR REPLACE FUNCTION update_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.modified_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for master variables
CREATE TRIGGER update_master_variables_updated_at BEFORE UPDATE
    ON master_variables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_master_variables_updated_at BEFORE UPDATE
    ON template_master_variables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_values_updated_at BEFORE UPDATE
    ON document_master_variable_values FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers for common blocks
CREATE TRIGGER update_common_blocks_timestamp
BEFORE UPDATE ON common_blocks
FOR EACH ROW
EXECUTE FUNCTION update_modified_timestamp();

CREATE TRIGGER update_participant_groups_timestamp
BEFORE UPDATE ON participant_groups
FOR EACH ROW
EXECUTE FUNCTION update_modified_timestamp();

CREATE TRIGGER update_participant_variables_timestamp
BEFORE UPDATE ON participant_variables
FOR EACH ROW
EXECUTE FUNCTION update_modified_timestamp();

-- =====================================================
-- SECTION 7: VARIABLE GROUPS DATA
-- =====================================================

INSERT INTO variable_groups (group_name, group_description) VALUES
('Entity Information', 'Basic entity and organization details'),
('Location Data', 'Address and location information'),
('Participant Details', 'Individual participant information'),
('Assessment Data', 'Assessment and evaluation information'),
('Financial Information', 'Fees, deposits, and financial details'),
('Legal and Compliance', 'Legal reviewer and compliance information'),
('nLive Program', 'nLive program specific variables');

-- =====================================================
-- SECTION 8: MASTER VARIABLES DATA (49 VARIABLES)
-- =====================================================
-- This data reflects the actual production database structure
-- Updated: October 16, 2025

-- Agreement Variables
INSERT INTO master_variables (var_name, var_description, var_type, default_value, is_active) VALUES
('agreement.dates.end', 'Agreement End Date', 'date', '2025-10-10', true),
('agreement.dates.signed', 'Signature Date', 'date', '2025-10-10', true),
('agreement.dates.start', 'Agreement Start Date', 'date', '2025-10-10', true);

-- Entity Variables
INSERT INTO master_variables (var_name, var_description, var_type, default_value, is_active) VALUES
('entity.legal.acn', 'Australian Company Number', 'text', '143948341', true),
('entity.legal.name', 'Legal Entity Name', 'text', 'nLive Program', true),
('entity.trading.name', 'Entity Trading Name', 'text', 'nLive Program', true);

-- Financial Variables
INSERT INTO master_variables (var_name, var_description, var_type, default_value, is_active) VALUES
('finance.accommodation.bond_amount', 'Bond Amount', 'text', '$600', true),
('finance.accommodation.weekly_rent', 'Weekly Rent Amount', 'text', '$150', true),
('finance.commercial.damage_liability', 'Commercial Damage Liability', 'text', '100%', true),
('finance.commercial.equipment_deposit', 'Commercial Equipment Deposit', 'text', '$300', true),
('finance.coop.profit_sharing', 'Co-op Profit Sharing', 'text', '0%', true),
('finance.employment.wages', 'Employment Wages', 'text', '$0', true),
('finance.hobby.materials_cost', 'Hobby Materials Cost', 'text', '$0', true),
('finance.ndis.service_rates', 'NDIS Service Rates', 'text', '$0', true),
('finance.penalties.cleaning_violations', 'Cleaning Violation Fee', 'text', '$150', true),
('finance.penalties.late_notification', 'Late Notification Fee', 'text', '$50', true),
('finance.program.assessment_fees', 'Assessment Fees', 'text', '$0', true),
('finance.program.trial_deposit', 'Trial Deposit', 'text', '$300', true);

-- Location Variables
INSERT INTO master_variables (var_name, var_description, var_type, default_value, is_active) VALUES
('location.address.full', 'Full Property Address', 'text', NULL, true),
('location.country.code', 'Country Code', 'text', 'au', true),
('location.premises.classification', 'Building Classification', 'text', 'Class 4', true),
('location.state.code', 'State Code', 'text', 'vic', true);

-- Organization Variables
INSERT INTO master_variables (var_name, var_description, var_type, default_value, is_active) VALUES
('org.coordinator.email', 'Coordinator Email', 'text', 'tkanij@swin.edu.au', true),
('org.coordinator.name', 'Program Coordinator Name', 'text', 'Tanjila Kanij ', true),
('org.coordinator.phone', 'Coordinator Phone', 'text', '+61 468032905', true),
('org.coordinator.role', 'Coordinator Role', 'text', 'Program Coordinator & Site Manager', true),
('org.emergency.name', 'Emergency Contact Name', 'text', 'Tharindu Newgon', true),
('org.emergency.phone', 'Emergency Phone', 'text', '+61 458538571', true),
('org.emergency.role', 'Emergency Contact Role', 'text', 'Emergency Response Coordinator', true),
('org.maintenance.name', 'Maintenance Contact Name', 'text', 'CruiseCtrl', true),
('org.maintenance.phone', 'Maintenance Phone', 'text', '+61 470520305', true);

-- Participant Variables
INSERT INTO master_variables (var_name, var_description, var_type, default_value, is_active) VALUES
('participant.address', 'Participant street address', 'text', '123 Main Street', true),
('participant.contact.address', 'Participant Address', 'text', '1234 Main Street', true),
('participant.contact.email', 'Participant Email', 'text', NULL, true),
('participant.contact.phone', 'Participant Phone', 'text', '+61 483022328', true),
('participant.email', 'Participant email address', 'text', 'jason.alexander@example.com', true),
('participant.emergency.name', 'Emergency Contact Name', 'text', 'Billy', true),
('participant.emergency.phone', 'Emergency Contact Phone', 'text', '+61 494050182', true),
('participant.emergency.relationship', 'Emergency Contact Relationship', 'text', 'Uncle', true),
('participant.name', 'Participant full name', 'text', 'Jason Alexander', true),
('participant.organization', 'Participant organization name', 'text', 'Swinburne University of Technology', true),
('participant.personal.full_name', 'Participant Full Name', 'text', 'Jason Alexander', true),
('participant.personal.preferred_name', 'Preferred Name', 'text', 'JA', true),
('participant.phone', 'Participant phone number', 'text', '+61 412 345 678', true),
('participant.signature_date', 'Date of participant signature', 'date', '2025-10-10', true);

-- Room Variables
INSERT INTO master_variables (var_name, var_description, var_type, default_value, is_active) VALUES
('room.configuration.bed_count', 'Bed Count', 'text', '2', true),
('room.configuration.bed_types', 'Bed Types', 'text', 'Single', true),
('room.coordinator.access_enabled', 'Coordinator Access Enabled', 'text', 'false', true),
('room.occupancy.type', 'Room Occupancy Type', 'text', 'mixed', true);

-- =====================================================
-- SECTION 9: COMMON BLOCKS DATA
-- =====================================================

INSERT INTO common_blocks (block_id, title, content, version, tags, used_in) VALUES
(
  'common.house_rules',
  'House Rules',
  '<h3>House Rules</h3><ul><li>Respect and safety</li><li>Cleanliness and maintenance</li><li>Noise and quiet hours</li></ul>',
  '1.0.0',
  ARRAY['residential', 'shared-living', 'rules'],
  ARRAY['TRIAL_LICENSE_AGREEMENT', 'PROBATION_TENANCY', 'SHARED_RESIDENTIAL_LEASE', 'TEAM_MEMBER_AGREEMENT']
),
(
  'common.confidentiality',
  'Confidentiality',
  '<h3>Confidentiality</h3><p>All personal information will be kept confidential and used only for program administration purposes.</p>',
  '1.0.0',
  ARRAY['legal', 'privacy', 'security'],
  ARRAY['TRIAL_LICENSE_AGREEMENT', 'TEAM_MEMBER_AGREEMENT', 'FACILITATOR_AGREEMENT']
),
(
  'common.emergency_procedures',
  'Emergency Procedures',
  '<h3>Emergency Procedures</h3><ul><li>Fire safety</li><li>Medical emergencies</li><li>Security threats</li></ul>',
  '1.0.0',
  ARRAY['safety', 'emergency', 'procedures'],
  ARRAY['TRIAL_LICENSE_AGREEMENT', 'PROBATION_TENANCY', 'SHARED_RESIDENTIAL_LEASE', 'GUEST_EXPERIENCE_AGREEMENT']
)
ON CONFLICT (block_id) DO NOTHING;

-- Initial version history for common blocks
INSERT INTO block_versions (block_id, version, content, change_description) VALUES
('common.house_rules', '1.0.0', '<h3>House Rules</h3><ul><li>Respect and safety</li><li>Cleanliness and maintenance</li><li>Noise and quiet hours</li></ul>', 'Initial version'),
('common.confidentiality', '1.0.0', '<h3>Confidentiality</h3><p>All personal information will be kept confidential and used only for program administration purposes.</p>', 'Initial version'),
('common.emergency_procedures', '1.0.0', '<h3>Emergency Procedures</h3><ul><li>Fire safety</li><li>Medical emergencies</li><li>Security threats</li></ul>', 'Initial version')
ON CONFLICT (block_id, version) DO NOTHING;

-- =====================================================
-- SECTION 10: TEST DATA
-- =====================================================

-- Document Default Templates
INSERT INTO document_default_template (type, title, content) VALUES
('TPL01', 'Employment Contract', 'This is a template for an employment contract.'),
('TPL02', 'Lease Agreement', 'This is a template for a residential lease agreement.'),
('TPL03', 'NDA Agreement', 'This is a template for a non-disclosure agreement.'),
('TPL04', 'Service Agreement', 'This is a template for a service agreement.'),
('TPL05', 'Sales Contract', 'This is a template for a sales contract.');

-- Sample Identities
INSERT INTO identity (identity_id, firstname, lastname, email, student_id, title, age) VALUES
('ID001', 'John', 'Doe', 'johndoe@example.com', 'S1001', 'Mr.', 30),
('ID002', 'Jane', 'Smith', 'janesmith@example.com', 'S1002', 'Ms.', 28),
('ID003', 'Alice', 'Johnson', 'alicej@example.com', 'S1003', 'Dr.', 35),
('ID004', 'Bob', 'Lee', 'boblee@example.com', 'S1004', 'Prof.', 40),
('ID005', 'Charlie', 'Brown', 'charlieb@example.com', 'S1005', 'Mr.', 25);

-- Sample Parties
INSERT INTO parties (parties_id, abn, parties_name, parties_address, parties_email, parties_company) VALUES
('PRT01', 'ABN201', 'Company A', '1234 Street, City A', 'contact@companya.com', 'Company A Inc.'),
('PRT02', 'ABN202', 'Company B', '2345 Avenue, City B', 'info@companyb.com', 'Company B LLC'),
('PRT03', 'ABN203', 'Company C', '3456 Blvd, City C', 'support@companyc.com', 'Company C Group'),
('PRT04', 'ABN204', 'Company D', '4567 Road, City D', 'hello@companyd.com', 'Company D Corp.'),
('PRT05', 'ABN205', 'Company E', '5678 Lane, City E', 'service@companye.com', 'Company E Ltd.');

-- Sample FAQs
INSERT INTO faq (faq_question, faq_answer) VALUES
('What is the return policy?', 'The return policy is 30 days.'),
('How do I contact support?', 'You can contact support via email at support@example.com.'),
('Where is your company located?', 'Our company is located at 1234 Business Rd, Business City.'),
('Do you offer international shipping?', 'Yes, we offer international shipping to select countries.'),
('What payment methods do you accept?', 'We accept all major credit cards and PayPal.');

-- Sample Notes
INSERT INTO notes (date_created, person_created, is_removed, header, content) VALUES
('2023-04-01', 'Admin', FALSE, 'Meeting notes', 'Discuss the project updates and milestones.'),
('2023-04-02', 'Manager', FALSE, 'Budget Review', 'Review the budget for the next quarter.'),
('2023-04-03', 'Developer', FALSE, 'Development Plan', 'Plan for the new features in the application.'),
('2023-04-04', 'Designer', FALSE, 'Design Specs', 'Update the design specifications for the new interface.'),
('2023-04-05', 'Tester', FALSE, 'Testing Schedule', 'Schedule for testing the new application release.');

-- Sample Document Templates
INSERT INTO document_template (document_template_id, type, title, content, version, parties_number, created_date, date_modified) VALUES
('DT001', 'TPL01', 'Employment Contract 2020', 'Content of Employment Contract', 1.0, 2, '2023-01-01', '2023-01-02'),
('DT002', 'TPL02', 'Lease Agreement 2020', 'Content of Lease Agreement', 1.0, 3, '2023-02-01', '2023-02-02'),
('DT003', 'TPL03', 'NDA Agreement 2020', 'Content of NDA Agreement', 1.0, 2, '2023-03-01', '2023-03-02'),
('DT004', 'TPL04', 'Service Agreement 2020', 'Content of Service Agreement', 1.0, 4, '2023-04-01', '2023-04-02'),
('DT005', 'TPL05', 'Sales Contract 2020', 'Content of Sales Contract', 1.0, 5, '2023-05-01', '2023-05-02');

-- Sample Document Containers
INSERT INTO document_container (identity_id, document_template_id, issue_date, signed_date, var_list) VALUES
('ID001', 'DT001', '2023-04-10 10:00:00', '2023-04-11 10:00:00', '{"field1":"value1","field2":"value2"}'),
('ID002', 'DT002', '2023-04-10 11:00:00', '2023-04-11 11:00:00', '{"field3":"value3","field4":"value4"}'),
('ID003', 'DT003', '2023-04-10 12:00:00', '2023-04-11 12:00:00', '{"field5":"value5","field6":"value6"}'),
('ID004', 'DT004', '2023-04-10 13:00:00', '2023-04-11 13:00:00', '{"field7":"value7","field8":"value8"}'),
('ID005', 'DT005', '2023-04-10 14:00:00', '2023-04-11 14:00:00', '{"field9":"value9","field10":"value10"}');

-- Sample Document Variables
INSERT INTO document_default_template_variables (var_name, var_hint, type) VALUES
('EmployeeName', 'Name of the employee', 'TPL01'),
('EmployeeAddress', 'Address of the employee', 'TPL01'),
('EmployerName', 'Name of the employer', 'TPL01'),
('EmployerAddress', 'Address of the employer', 'TPL01'),
('Salary', 'Monthly salary', 'TPL01');

-- Sample Document Parties
INSERT INTO document_parties (document_template_id, parties_id, parties_approval) VALUES
('DT001', 'PRT01', TRUE),
('DT001', 'PRT02', FALSE),
('DT002', 'PRT03', TRUE),
('DT003', 'PRT04', TRUE),
('DT004', 'PRT05', TRUE);

-- Sample Sensitive Data
INSERT INTO identity_high_sensitive (identity_id, street_number, apartment_unit, city, post_code, surburb, gender) VALUES
('ID001', '123', 'Unit 1', 'City A', '12345', 'Suburb A', 'Male'),
('ID002', '234', 'Unit 2', 'City B', '23456', 'Suburb B', 'Female'),
('ID003', '345', 'Unit 3', 'City C', '34567', 'Suburb C', 'Male'),
('ID004', '456', 'Unit 4', 'City D', '45678', 'Suburb D', 'Female'),
('ID005', '567', 'Unit 5', 'City E', '56789', 'Suburb E', 'Male');

INSERT INTO identity_less_sensitive (identity_id, state, email) VALUES
('ID001', 'State A', 'johndoe@example.com'),
('ID002', 'State B', 'janesmith@example.com'),
('ID003', 'State C', 'alicej@example.com'),
('ID004', 'State D', 'boblee@example.com'),
('ID005', 'State E', 'charlieb@example.com');

-- Sample Guest Identities
INSERT INTO guest_identity (identity_guest_id, document_container_id, firstname, lastname, student_id, address, title, age, email) VALUES
('GID001', 1, 'Guest1', 'GuestLast1', 'G1001', '123 Guest Street', 'Mr.', 22, 'guest1@example.com'),
('GID002', 2, 'Guest2', 'GuestLast2', 'G1002', '234 Guest Avenue', 'Ms.', 23, 'guest2@example.com'),
('GID003', 3, 'Guest3', 'GuestLast3', 'G1003', '345 Guest Blvd', 'Dr.', 24, 'guest3@example.com'),
('GID004', 4, 'Guest4', 'GuestLast4', 'G1004', '456 Guest Road', 'Prof.', 25, 'guest4@example.com'),
('GID005', 5, 'Guest5', 'GuestLast5', 'G1005', '567 Guest Lane', 'Mr.', 26, 'guest5@example.com');

-- Sample Configurations
INSERT INTO configuration (document_template_id, student_id, address, title, age, email) VALUES
('DT001', TRUE, TRUE, TRUE, TRUE, TRUE),
('DT002', FALSE, TRUE, FALSE, FALSE, TRUE),
('DT003', FALSE, TRUE, TRUE, FALSE, TRUE),
('DT004', FALSE, TRUE, FALSE, FALSE, TRUE),
('DT005', FALSE, FALSE, FALSE, FALSE, TRUE);

-- =====================================================
-- SECTION 11: VERIFICATION AND COMPLETION
-- =====================================================

-- Display table counts
SELECT 'Database setup completed successfully.' as status;

SELECT 
    'document_default_template' as table_name, 
    COUNT(*) as record_count 
FROM document_default_template
UNION ALL
SELECT 'master_variables', COUNT(*) FROM master_variables
UNION ALL
SELECT 'variable_groups', COUNT(*) FROM variable_groups
UNION ALL
SELECT 'common_blocks', COUNT(*) FROM common_blocks
UNION ALL
SELECT 'identity', COUNT(*) FROM identity
UNION ALL
SELECT 'parties', COUNT(*) FROM parties
UNION ALL
SELECT 'notes', COUNT(*) FROM notes
UNION ALL
SELECT 'document_template', COUNT(*) FROM document_template
UNION ALL
SELECT 'document_container', COUNT(*) FROM document_container
ORDER BY table_name;

-- Display master variables by group
SELECT 
    'Master Variables Summary' as info,
    var_type,
    COUNT(*) as count
FROM master_variables
GROUP BY var_type
ORDER BY var_type;

-- Display all tables
SELECT 'All Tables Created:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Success message
SELECT '
========================================
DATABASE SETUP COMPLETE
========================================
Database Name: paperwork_module
Master Variables: 49 variables
Common Blocks: 3 blocks
Test Data: 5 templates, 5 identities, 5 parties

Next Steps:
1. Update backend/.env with database credentials:
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=paperwork_user
   DB_PASSWORD=paperwork2024!
   DB_NAME=paperwork_module

2. Install backend dependencies:
   cd backend
   npm install

3. Start backend server:
   npm start

4. Backend will be available at:
   http://localhost:8800

5. Test endpoints:
   http://localhost:8800/master-variables
   http://localhost:8800/common-blocks
   http://localhost:8800/homepage/documents/total

NOTES:
- This setup includes the complete nLive Program configuration
- Master variables reflect production values
- Common blocks system ready for template integration
- All 26 tables created with proper relationships

For existing installations:
- If you already have a paperwork_module database
- Run ADD_MISSING_TABLES.sql to add common blocks only
- Do NOT run this script as it will DROP your database

========================================
' as instructions;
