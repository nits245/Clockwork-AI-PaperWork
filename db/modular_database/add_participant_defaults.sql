-- Add default values for participant variables
-- Run this in pgAdmin or your PostgreSQL client

-- Insert or update participant.name
INSERT INTO master_variables (var_name, var_description, var_type, default_value, is_active)
VALUES ('participant.name', 'Participant full name', 'text', 'Jason Alexander', true)
ON CONFLICT (var_name) 
DO UPDATE SET default_value = 'Jason Alexander', updated_at = CURRENT_TIMESTAMP;

-- Insert or update participant.email
INSERT INTO master_variables (var_name, var_description, var_type, default_value, is_active)
VALUES ('participant.email', 'Participant email address', 'text', 'jason.alexander@example.com', true)
ON CONFLICT (var_name) 
DO UPDATE SET default_value = 'jason.alexander@example.com', updated_at = CURRENT_TIMESTAMP;

-- Insert or update participant.phone
INSERT INTO master_variables (var_name, var_description, var_type, default_value, is_active)
VALUES ('participant.phone', 'Participant phone number', 'text', '+61 412 345 678', true)
ON CONFLICT (var_name) 
DO UPDATE SET default_value = '+61 412 345 678', updated_at = CURRENT_TIMESTAMP;

-- Insert or update participant.organization
INSERT INTO master_variables (var_name, var_description, var_type, default_value, is_active)
VALUES ('participant.organization', 'Participant organization name', 'text', 'Swinburne University of Technology', true)
ON CONFLICT (var_name) 
DO UPDATE SET default_value = 'Swinburne University of Technology', updated_at = CURRENT_TIMESTAMP;

-- Insert or update participant.address
INSERT INTO master_variables (var_name, var_description, var_type, default_value, is_active)
VALUES ('participant.address', 'Participant street address', 'text', '123 Main Street', true)
ON CONFLICT (var_name) 
DO UPDATE SET default_value = '123 Main Street', updated_at = CURRENT_TIMESTAMP;

-- Insert or update participant.signature_date
INSERT INTO master_variables (var_name, var_description, var_type, default_value, is_active)
VALUES ('participant.signature_date', 'Date of participant signature', 'date', '2025-10-10', true)
ON CONFLICT (var_name) 
DO UPDATE SET default_value = '2025-10-10', updated_at = CURRENT_TIMESTAMP;

-- Verify the updates
SELECT var_name, default_value, var_type 
FROM master_variables 
WHERE var_name LIKE 'participant.%'
ORDER BY var_name;

-- Success message
SELECT 'Participant variables updated successfully!' as status;
