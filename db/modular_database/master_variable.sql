-- =====================================================
-- PAPERWORK-MODULE DATABASE SETUP SCRIPT
-- =====================================================

-- Create database (run this as postgres superuser)
CREATE DATABASE paperwork_module
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_Australia.1252'
    LC_CTYPE = 'English_Australia.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Connect to the new database
\c paperwork_module;

-- Create application user
CREATE USER paperwork_user WITH ENCRYPTED PASSWORD 'paperwork2024!';

-- Grant privileges to application user
GRANT CONNECT ON DATABASE paperwork_module TO paperwork_user;
GRANT USAGE ON SCHEMA public TO paperwork_user;
GRANT CREATE ON SCHEMA public TO paperwork_user;

-- Create cascade system schema (from your existing cascade_schema.sql)
-- =====================================================
-- MASTER VARIABLE CASCADE SYSTEM TABLES
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
    var_options TEXT, -- JSON array for select options
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
    template_id INTEGER NOT NULL, -- References templates in your existing system
    master_var_id INTEGER REFERENCES master_variables(master_var_id) ON DELETE CASCADE,
    position_in_template INTEGER,
    is_required BOOLEAN DEFAULT false,
    custom_label VARCHAR(200), -- Override default label if needed
    custom_placeholder VARCHAR(200), -- Override default placeholder if needed
    validation_rules TEXT, -- JSON object for additional validation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(template_id, master_var_id)
);

-- Document instance variable values
CREATE TABLE document_master_variable_values (
    doc_var_id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL, -- References documents in your existing system
    master_var_id INTEGER REFERENCES master_variables(master_var_id) ON DELETE CASCADE,
    var_value TEXT, -- Stored as text, converted based on var_type
    override_source VARCHAR(50), -- 'template', 'document', 'cascade'
    is_locked BOOLEAN DEFAULT false, -- Prevents cascade updates if true
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
    affected_documents INTEGER[], -- Array of document IDs affected
    affected_templates INTEGER[], -- Array of template IDs affected
    update_reason TEXT,
    performed_by VARCHAR(100),
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cascade_batch_id UUID -- Groups related cascade updates
);

-- Indexes for performance
CREATE INDEX idx_master_variables_name ON master_variables(var_name);
CREATE INDEX idx_master_variables_type ON master_variables(var_type);
CREATE INDEX idx_master_variables_active ON master_variables(is_active);
CREATE INDEX idx_template_master_variables_template ON template_master_variables(template_id);
CREATE INDEX idx_template_master_variables_master ON template_master_variables(master_var_id);
CREATE INDEX idx_document_values_document ON document_master_variable_values(document_id);
CREATE INDEX idx_document_values_master ON document_master_variable_values(master_var_id);
CREATE INDEX idx_cascade_log_master_var ON cascade_update_log(master_var_id);
CREATE INDEX idx_cascade_log_batch ON cascade_update_log(cascade_batch_id);

-- Grant all privileges on cascade tables to application user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO paperwork_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO paperwork_user;

-- Insert sample variable groups
INSERT INTO variable_groups (group_name, group_description) VALUES
('Entity Information', 'Basic entity and organization details'),
('Location Data', 'Address and location information'),
('Participant Details', 'Individual participant information'),
('Assessment Data', 'Assessment and evaluation information'),
('Financial Information', 'Fees, deposits, and financial details'),
('Legal and Compliance', 'Legal reviewer and compliance information'),
('nLive Program', 'nLive program specific variables');

-- Note: Master variables should be populated using complete_migration_pgadmin.sql
-- which includes all 43 hierarchical variables and 27 master references (REF-001 to REF-027)
-- 
-- To populate master variables and references, run:
-- \i complete_migration_pgadmin.sql
--
-- This will create:
-- - 43 hierarchical variables (entity.*, location.*, org.*, finance.*, room.*, agreement.*, participant.*)
-- - 27 master references organized across 5 hierarchy levels (personal, room, household, premises, legal)

-- Create update trigger for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_master_variables_updated_at BEFORE UPDATE
    ON master_variables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_master_variables_updated_at BEFORE UPDATE
    ON template_master_variables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_values_updated_at BEFORE UPDATE
    ON document_master_variable_values FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Display setup completion message
SELECT 'Database setup completed successfully!' as status,
       count(*) as master_variables_count
FROM master_variables;

SELECT 'Variable groups created:' as info, group_name 
FROM variable_groups 
ORDER BY group_id;