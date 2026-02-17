DROP TABLE IF EXISTS guest_identity, identity_high_sensitive, identity_less_sensitive, notes, document_container, document_parties, document_default_template_variables, document_template, faq, parties, identity, document_default_template, configuration CASCADE;

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
