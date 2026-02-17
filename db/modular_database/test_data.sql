-- Inserting sample data into 'document_default_template'
INSERT INTO document_default_template (type, title, content) VALUES
('TPL01', 'Employment Contract', 'This is a template for an employment contract.'),
('TPL02', 'Lease Agreement', 'This is a template for a residential lease agreement.'),
('TPL03', 'NDA Agreement', 'This is a template for a non-disclosure agreement.'),
('TPL04', 'Service Agreement', 'This is a template for a service agreement.'),
('TPL05', 'Sales Contract', 'This is a template for a sales contract.');

-- Inserting sample data into 'identity'
INSERT INTO identity (identity_id, firstname, lastname, email, student_id, title, age) VALUES
('ID001', 'John', 'Doe', 'johndoe@example.com', 'S1001', 'Mr.', 30),
('ID002', 'Jane', 'Smith', 'janesmith@example.com', 'S1002', 'Ms.', 28),
('ID003', 'Alice', 'Johnson', 'alicej@example.com', 'S1003', 'Dr.', 35),
('ID004', 'Bob', 'Lee', 'boblee@example.com', 'S1004', 'Prof.', 40),
('ID005', 'Charlie', 'Brown', 'charlieb@example.com', 'S1005', 'Mr.', 25);

-- Inserting sample data into 'parties'
INSERT INTO parties (parties_id, abn, parties_name, parties_address, parties_email, parties_company) VALUES
('PRT01', 'ABN201', 'Company A', '1234 Street, City A', 'contact@companya.com', 'Company A Inc.'),
('PRT02', 'ABN202', 'Company B', '2345 Avenue, City B', 'info@companyb.com', 'Company B LLC'),
('PRT03', 'ABN203', 'Company C', '3456 Blvd, City C', 'support@companyc.com', 'Company C Group'),
('PRT04', 'ABN204', 'Company D', '4567 Road, City D', 'hello@companyd.com', 'Company D Corp.'),
('PRT05', 'ABN205', 'Company E', '5678 Lane, City E', 'service@companye.com', 'Company E Ltd.');

-- Inserting sample data into 'faq'
INSERT INTO faq (faq_question, faq_answer) VALUES
('What is the return policy?', 'The return policy is 30 days.'),
('How do I contact support?', 'You can contact support via email at support@example.com.'),
('Where is your company located?', 'Our company is located at 1234 Business Rd, Business City, BC.'),
('Do you offer international shipping?', 'Yes, we offer international shipping to select countries.'),
('What payment methods do you accept?', 'We accept all major credit cards and PayPal.');

-- Inserting sample data into 'notes'
INSERT INTO notes (date_created, person_created, is_removed, header, content) VALUES
('2023-04-01', 'Admin', FALSE, 'Meeting notes', 'Discuss the project updates and milestones.'),
('2023-04-02', 'Manager', FALSE, 'Budget Review', 'Review the budget for the next quarter.'),
('2023-04-03', 'Developer', FALSE, 'Development Plan', 'Plan for the new features in the application.'),
('2023-04-04', 'Designer', FALSE, 'Design Specs', 'Update the design specifications for the new interface.'),
('2023-04-05', 'Tester', FALSE, 'Testing Schedule', 'Schedule for testing the new application release.');

-- Inserting sample data into 'document_template'
INSERT INTO document_template (document_template_id, type, title, content, version, parties_number, created_date, date_modified) VALUES
('DT001', 'TPL01', 'Employment Contract 2020', 'Content of Employment Contract', 1.0, 2, '2023-01-01', '2023-01-02'),
('DT002', 'TPL02', 'Lease Agreement 2020', 'Content of Lease Agreement', 1.0, 3, '2023-02-01', '2023-02-02'),
('DT003', 'TPL03', 'NDA Agreement 2020', 'Content of NDA Agreement', 1.0, 2, '2023-03-01', '2023-03-02'),
('DT004', 'TPL04', 'Service Agreement 2020', 'Content of Service Agreement', 1.0, 4, '2023-04-01', '2023-04-02'),
('DT005', 'TPL05', 'Sales Contract 2020', 'Content of Sales Contract', 1.0, 5, '2023-05-01', '2023-05-02');

-- Inserting sample data into 'document_container'
INSERT INTO document_container (identity_id, document_template_id, issue_date, signed_date, var_list) VALUES
('ID001', 'DT001', '2023-04-10 10:00:00', '2023-04-11 10:00:00', '{"field1":"value1","field2":"value2"}'),
('ID002', 'DT002', '2023-04-10 11:00:00', '2023-04-11 11:00:00', '{"field3":"value3","field4":"value4"}'),
('ID003', 'DT003', '2023-04-10 12:00:00', '2023-04-11 12:00:00', '{"field5":"value5","field6":"value6"}'),
('ID004', 'DT004', '2023-04-10 13:00:00', '2023-04-11 13:00:00', '{"field7":"value7","field8":"value8"}'),
('ID005', 'DT005', '2023-04-10 14:00:00', '2023-04-11 14:00:00', '{"field9":"value9","field10":"value10"}');

-- Inserting sample data into 'document_default_template_variables'
INSERT INTO document_default_template_variables (var_name, var_hint, type) VALUES
('EmployeeName', 'Name of the employee', 'TPL01'),
('EmployeeAddress', 'Address of the employee', 'TPL01'),
('EmployerName', 'Name of the employer', 'TPL01'),
('EmployerAddress', 'Address of the employer', 'TPL01'),
('Salary', 'Monthly salary', 'TPL01');

-- Inserting sample data into 'document_parties'
INSERT INTO document_parties (document_template_id, parties_id, parties_approval) VALUES
('DT001', 'PRT01', TRUE),
('DT001', 'PRT02', FALSE),
('DT002', 'PRT03', TRUE),
('DT003', 'PRT04', TRUE),
('DT004', 'PRT05', TRUE);

-- Inserting sample data into 'identity_high_sensitive'
INSERT INTO identity_high_sensitive (identity_id, street_number, apartment_unit, city, post_code, surburb, gender) VALUES
('ID001', '123', 'Unit 1', 'City A', '12345', 'Suburb A', 'Male'),
('ID002', '234', 'Unit 2', 'City B', '23456', 'Suburb B', 'Female'),
('ID003', '345', 'Unit 3', 'City C', '34567', 'Suburb C', 'Male'),
('ID004', '456', 'Unit 4', 'City D', '45678', 'Suburb D', 'Female'),
('ID005', '567', 'Unit 5', 'City E', '56789', 'Suburb E', 'Male');

-- Inserting sample data into 'identity_less_sensitive'
INSERT INTO identity_less_sensitive (identity_id, state, email) VALUES
('ID001', 'State A', 'johndoe@example.com'),
('ID002', 'State B', 'janesmith@example.com'),
('ID003', 'State C', 'alicej@example.com'),
('ID004', 'State D', 'boblee@example.com'),
('ID005', 'State E', 'charlieb@example.com');

-- Inserting sample data into 'guest_identity'
INSERT INTO guest_identity (identity_guest_id, document_container_id, firstname, lastname, student_id, address, title, age, email) VALUES
('GID001', 1, 'Guest1', 'GuestLast1', 'G1001', '123 Guest Street', 'Mr.', 22, 'guest1@example.com'),
('GID002', 2, 'Guest2', 'GuestLast2', 'G1002', '234 Guest Avenue', 'Ms.', 23, 'guest2@example.com'),
('GID003', 3, 'Guest3', 'GuestLast3', 'G1003', '345 Guest Blvd', 'Dr.', 24, 'guest3@example.com'),
('GID004', 4, 'Guest4', 'GuestLast4', 'G1004', '456 Guest Road', 'Prof.', 25, 'guest4@example.com'),
('GID005', 5, 'Guest5', 'GuestLast5', 'G1005', '567 Guest Lane', 'Mr.', 26, 'guest5@example.com');

-- Inserting sample data into 'configuration'
INSERT INTO configuration (document_template_id, student_id, address, title, age, email) VALUES
('DT001', TRUE, TRUE, TRUE, TRUE, TRUE),  -- Employment Contract might require all fields
('DT002', FALSE, TRUE, FALSE, FALSE, TRUE), -- Lease Agreement might only require address and email
('DT003', FALSE, TRUE, TRUE, FALSE, TRUE),  -- NDA Agreement might require title, address, and email
('DT004', FALSE, TRUE, FALSE, FALSE, TRUE), -- Service Agreement might only require address and email
('DT005', FALSE, FALSE, FALSE, FALSE, TRUE); -- Sales Contract might only require email
