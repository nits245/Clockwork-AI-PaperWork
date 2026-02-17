-- Quick setup script - paste this into pgAdmin or VS Code SQL query window
-- This will create all your cascade system tables

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

-- Sample data
INSERT INTO variable_groups (group_name, group_description) VALUES
('Entity Information', 'Basic entity and organization details'),
('Location Data', 'Address and location information'),
('Participant Details', 'Individual participant information'),
('Assessment Data', 'Assessment and evaluation information'),
('Financial Information', 'Fees, deposits, and financial details'),
('Legal and Compliance', 'Legal reviewer and compliance information'),
('nLive Program', 'nLive program specific variables');

-- Note: Master variables should be populated using complete_migration_pgadmin.sql
-- which includes all 43 hierarchical variables and 27 master references

-- Verify setup
SELECT 'Setup completed! Tables created:' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;