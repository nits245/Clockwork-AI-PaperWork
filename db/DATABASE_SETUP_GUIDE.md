# Database Setup Guide for PaperWork-Module

## Overview
This guide provides step-by-step instructions for setting up the PostgreSQL database for the PaperWork-Module application from scratch. The setup includes all schemas, master variables, common blocks, and test data.

---

## Prerequisites

### Required Software
1. **PostgreSQL 12 or higher**

















   - Download: https://www.postgresql.org/download/
   - Default port: 5432
   - Remember the password you set for the 'postgres' user during installation

2. **pgAdmin 4** (optional but recommended)
   - Comes bundled with PostgreSQL installer
   - Provides a graphical interface for database management

3. **Node.js 16 or higher**
   - Required for backend server
   - Download: https://nodejs.org/

4. **Git**
   - For repository access
   - Download: https://git-scm.com/

---

## Setup Method 1: Using the Complete Setup File (Recommended)

This is the fastest method - one file sets up everything.

### Step 1: Start PostgreSQL Service

**Windows:**
```powershell
# Open PowerShell as Administrator
Start-Service postgresql-x64-14  # or your version

# OR start via Services app (services.msc)
# Find "postgresql-x64-14" and click Start
```

**Mac/Linux:**
```bash
# Start PostgreSQL service
sudo service postgresql start

# OR
brew services start postgresql
```

### Step 2: Run the Complete Setup Script

**Method A: Using psql (Command Line)**
```powershell
# Open Command Prompt or PowerShell
cd "path\to\PaperWork-Module\db"

# Run the complete setup script
psql -U postgres -f COMPLETE_DATABASE_SETUP.sql

# Enter postgres password when prompted
```

**Method B: Using pgAdmin (Graphical Interface)**
1. Open pgAdmin 4
2. Connect to your PostgreSQL server (enter postgres password)
3. Right-click on "Databases" in the left sidebar
4. Select "Query Tool"
5. Click "Open File" (folder icon)
6. Navigate to `db/COMPLETE_DATABASE_SETUP.sql`
7. Click "Execute" (play button) or press F5
8. Wait for completion (should take 10-30 seconds)

### Step 3: Verify Database Creation

Run this query in pgAdmin or psql:
```sql
\c paperwork_db

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see 26 tables including:
- document_default_template
- master_variables
- common_blocks
- identity
- parties
- document_container
- etc.

### Step 4: Verify Data Population

Check record counts:
```sql
SELECT 'master_variables' as table_name, COUNT(*) FROM master_variables
UNION ALL
SELECT 'common_blocks', COUNT(*) FROM common_blocks
UNION ALL
SELECT 'identity', COUNT(*) FROM identity
UNION ALL
SELECT 'document_template', COUNT(*) FROM document_template;
```

Expected results:
- master_variables: 49 records
- common_blocks: 3 records
- identity: 5 records
- document_template: 5 records

---

## Setup Method 2: Individual Scripts (Alternative)

If you prefer to run scripts step-by-step:

### Step 1: Create Database
```sql
CREATE DATABASE paperwork_db;
\c paperwork_db;
```

### Step 2: Run Core Schema
```powershell
psql -U postgres -d paperwork_db -f db.sql
```

### Step 3: Run Cascade System Schema
```powershell
psql -U postgres -d paperwork_db -f quick_setup.sql
```

### Step 4: Run Common Blocks and Participants
```powershell
psql -U postgres -d paperwork_db -f cascade_and_participants.sql
```

### Step 5: Add Participant Defaults
```powershell
psql -U postgres -d paperwork_db -f add_participant_defaults.sql
```

### Step 6: Load Test Data
```powershell
psql -U postgres -d paperwork_db -f test_data.sql
```

---

## Backend Configuration

### Step 1: Create Environment File

Navigate to the backend folder:
```powershell
cd backend
```

Create a `.env` file:
```powershell
# Windows PowerShell
New-Item -Path .env -ItemType File

# Mac/Linux
touch .env
```

### Step 2: Add Database Credentials

Open `.env` in a text editor and add:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=paperwork_user
DB_PASSWORD=paperwork2024!
DB_NAME=paperwork_module
PORT=8800
NODE_ENV=development
```

IMPORTANT: Replace `your_postgres_password` with your actual PostgreSQL password.

### Step 3: Install Backend Dependencies

```powershell
npm install
```

This installs all required packages including:
- express
- pg (PostgreSQL client)
- cors
- dotenv
- body-parser

### Step 4: Start Backend Server

```powershell
npm start
```

You should see:
```
Server running on port 8800
Database connected successfully
```

### Step 5: Test Backend API

Open a browser and visit:
- http://localhost:8800/master-variables
- http://localhost:8800/common-blocks
- http://localhost:8800/homepage/documents/total

You should see JSON responses with data.

---

## Frontend Configuration

### Step 1: Navigate to Frontend

```powershell
cd ..\frontend
```

### Step 2: Install Frontend Dependencies

```powershell
npm install
```

### Step 3: Configure Environment

Create `.env` file in frontend folder:
```env
REACT_APP_BACKEND_URL=http://localhost:8800
```

### Step 4: Start Frontend Development Server

```powershell
npm start
```

The application will open at http://localhost:3000

---

## Database Structure Overview

### Core Application Tables (10 tables)
- `document_default_template` - Template definitions
- `document_template` - Document template instances
- `document_container` - Saved documents
- `identity` - User identity data
- `parties` - External parties/organizations
- `notes` - User notes
- `faq` - FAQ entries
- `configuration` - Document configurations
- `identity_high_sensitive` - Sensitive user data
- `identity_less_sensitive` - Less sensitive user data
- `guest_identity` - Guest user data

### Master Variables System (5 tables)
- `master_variables` - 43 hierarchical variables
- `variable_groups` - 7 variable categories
- `master_variable_groups` - Many-to-many relationships
- `template_master_variables` - Template-variable links
- `document_master_variable_values` - Document variable values
- `cascade_update_log` - Audit trail for updates

### Common Blocks System (5 tables)
- `common_blocks` - Reusable text blocks
- `block_versions` - Version history
- `forked_blocks` - Modified block instances
- `cascade_tasks` - Update tasks
- `participant_groups` - Multi-participant documents
- `participant_variables` - Participant-specific variables

---

## Master Variables Reference (49 Variables)

### Agreement Variables (3 variables)
- agreement.dates.end - Agreement End Date
- agreement.dates.signed - Signature Date
- agreement.dates.start - Agreement Start Date

### Entity Variables (3 variables)
- entity.legal.acn - Australian Company Number: "143948341"
- entity.legal.name - Legal Entity Name: "nLive Program"
- entity.trading.name - Entity Trading Name: "nLive Program"

### Financial Variables (12 variables)
- finance.accommodation.bond_amount - Bond Amount: "$600"
- finance.accommodation.weekly_rent - Weekly Rent: "$150"
- finance.commercial.damage_liability - Damage Liability: "100%"
- finance.commercial.equipment_deposit - Equipment Deposit: "$300"
- finance.coop.profit_sharing - Profit Sharing: "0%"
- finance.employment.wages - Wages: "$0"
- finance.hobby.materials_cost - Materials Cost: "$0"
- finance.ndis.service_rates - NDIS Rates: "$0"
- finance.penalties.cleaning_violations - Cleaning Fee: "$150"
- finance.penalties.late_notification - Late Fee: "$50"
- finance.program.assessment_fees - Assessment Fees: "$0"
- finance.program.trial_deposit - Trial Deposit: "$300"

### Location Variables (4 variables)
- location.address.full - Full Property Address
- location.country.code - Country Code: "au"
- location.premises.classification - Building Class: "Class 4"
- location.state.code - State Code: "vic"

### Organization Variables (8 variables)
- org.coordinator.email - Coordinator Email: "tkanij@swin.edu.au"
- org.coordinator.name - Coordinator Name: "Tanjila Kanij"
- org.coordinator.phone - Coordinator Phone: "+61 468032905"
- org.coordinator.role - Coordinator Role: "Program Coordinator & Site Manager"
- org.emergency.name - Emergency Contact: "Tharindu Newgon"
- org.emergency.phone - Emergency Phone: "+61 458538571"
- org.emergency.role - Emergency Role: "Emergency Response Coordinator"
- org.maintenance.name - Maintenance Contact: "CruiseCtrl"
- org.maintenance.phone - Maintenance Phone: "+61 470520305"

### Participant Variables (14 variables)
- participant.address - Street Address: "123 Main Street"
- participant.contact.address - Contact Address: "1234 Main Street"
- participant.contact.email - Contact Email
- participant.contact.phone - Contact Phone: "+61 483022328"
- participant.email - Email: "jason.alexander@example.com"
- participant.emergency.name - Emergency Contact: "Billy"
- participant.emergency.phone - Emergency Phone: "+61 494050182"
- participant.emergency.relationship - Relationship: "Uncle"
- participant.name - Full Name: "Jason Alexander"
- participant.organization - Organization: "Swinburne University of Technology"
- participant.personal.full_name - Full Name: "Jason Alexander"
- participant.personal.preferred_name - Preferred Name: "JA"
- participant.phone - Phone: "+61 412 345 678"
- participant.signature_date - Signature Date: "2025-10-10"

### Room Variables (4 variables)
- room.configuration.bed_count - Bed Count: "2"
- room.configuration.bed_types - Bed Types: "Single"
- room.coordinator.access_enabled - Coordinator Access: "false"
- room.occupancy.type - Occupancy Type: "mixed"

---

## Troubleshooting

### Problem: Cannot connect to PostgreSQL
**Solution:**
1. Check if PostgreSQL service is running
2. Verify port 5432 is not blocked by firewall
3. Confirm postgres user password is correct
4. Try connecting via pgAdmin first

### Problem: Database already exists error
**Solution:**
```sql
DROP DATABASE IF EXISTS paperwork_db;
CREATE DATABASE paperwork_db;
```

### Problem: Permission denied errors
**Solution:**
Run the script as postgres superuser:
```powershell
psql -U postgres -f COMPLETE_DATABASE_SETUP.sql
```

### Problem: Backend cannot connect to database
**Solution:**
1. Check `.env` file has correct credentials
2. Verify database name is `paperwork_db`
3. Test connection manually:
```powershell
psql -U postgres -d paperwork_db -c "SELECT 1;"
```

### Problem: Tables already exist error
**Solution:**
The COMPLETE_DATABASE_SETUP.sql script drops existing tables. If you still get errors:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
Then re-run the setup script.

### Problem: Frontend shows "Network Error"
**Solution:**
1. Verify backend is running on port 8800
2. Check REACT_APP_BACKEND_URL in frontend/.env
3. Test backend directly in browser: http://localhost:8800/master-variables

---

## Maintenance Commands

### Backup Database
```powershell
pg_dump -U postgres -d paperwork_db -F c -f paperwork_db_backup.dump
```

### Restore Database
```powershell
pg_restore -U postgres -d paperwork_db -c paperwork_db_backup.dump
```

### View All Tables
```sql
\dt
```

### View Table Structure
```sql
\d table_name
```

### Clear All Data (Keep Structure)
```sql
TRUNCATE TABLE document_container CASCADE;
TRUNCATE TABLE document_template CASCADE;
-- etc.
```

### Reset Auto-Increment Sequences
```sql
ALTER SEQUENCE document_container_document_container_id_seq RESTART WITH 1;
ALTER SEQUENCE master_variables_master_var_id_seq RESTART WITH 1;
```

---

## Security Notes

1. **Never commit .env files to Git**
   - Already in .gitignore
   - Contains sensitive database credentials

2. **Use strong passwords**
   - Change default postgres password
   - Use different passwords for production

3. **Limit database access**
   - Only grant necessary permissions
   - Use application-specific database user in production

4. **Regular backups**
   - Schedule daily backups
   - Store backups securely off-site

---

## Additional Resources

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- pgAdmin Documentation: https://www.pgadmin.org/docs/
- Node.js PostgreSQL Guide: https://node-postgres.com/
- Project Repository: https://github.com/CruiseCtrl2025/PaperWork-Module

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check PostgreSQL logs:
   - Windows: `C:\Program Files\PostgreSQL\14\data\log`
   - Mac: `/usr/local/var/log/postgres.log`

2. Check backend console output for error messages

3. Verify all prerequisites are installed correctly

4. Contact team lead or refer to project documentation

---

Last Updated: October 16, 2025
Database Schema Version: 2.0
