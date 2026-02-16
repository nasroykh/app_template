-- PostgreSQL initialization script for app_template
-- This script runs automatically when the container is first created

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grant necessary privileges
GRANT ALL PRIVILEGES ON DATABASE app_template_db TO app_template_user;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully';
END$$;
