-- PostgreSQL Database Schema for Requirement & Effort Tracker
-- Version: 1.0
-- Date: 2025-12-19

-- Drop tables if they exist (for clean migrations)
DROP TABLE IF EXISTS requirements CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS preferences CASCADE;

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_modified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT project_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Index for faster lookups
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- ============================================
-- REQUIREMENTS TABLE
-- ============================================
CREATE TABLE requirements (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  description VARCHAR(500) NOT NULL,
  effort DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_modified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT requirement_description_not_empty CHECK (LENGTH(TRIM(description)) > 0),
  CONSTRAINT requirement_effort_positive CHECK (effort > 0 AND effort <= 1000)
);

-- Indexes for faster queries
CREATE INDEX idx_requirements_project_id ON requirements(project_id);
CREATE INDEX idx_requirements_is_active ON requirements(is_active);
CREATE INDEX idx_requirements_created_at ON requirements(created_at DESC);

-- ============================================
-- PREFERENCES TABLE
-- ============================================
CREATE TABLE preferences (
  id SERIAL PRIMARY KEY,
  effort_column_visible BOOLEAN NOT NULL DEFAULT TRUE,
  show_total_when_effort_hidden BOOLEAN NOT NULL DEFAULT TRUE,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT language_valid CHECK (language IN ('en', 'th'))
);

-- Ensure only one preferences row exists (single-user model)
-- We'll enforce this in application code

-- ============================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================

-- Function to update last_modified_at timestamp
CREATE OR REPLACE FUNCTION update_last_modified_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for projects table
CREATE TRIGGER projects_update_last_modified_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_last_modified_at();

-- Trigger for requirements table
CREATE TRIGGER requirements_update_last_modified_at
  BEFORE UPDATE ON requirements
  FOR EACH ROW
  EXECUTE FUNCTION update_last_modified_at();

-- Function to update preferences last_updated_at timestamp
CREATE OR REPLACE FUNCTION update_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for preferences table
CREATE TRIGGER preferences_update_timestamp
  BEFORE UPDATE ON preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_preferences_timestamp();

-- ============================================
-- INITIAL DATA SETUP
-- ============================================

-- Insert default preferences (single-user model)
INSERT INTO preferences (
  effort_column_visible,
  show_total_when_effort_hidden,
  language
) VALUES (
  TRUE,
  TRUE,
  'en'
);

-- ============================================
-- USEFUL QUERIES FOR DEVELOPMENT
-- ============================================

-- Get all requirements with project name
-- SELECT r.*, p.name as project_name
-- FROM requirements r
-- JOIN projects p ON r.project_id = p.id
-- ORDER BY r.created_at DESC;

-- Calculate total active effort for a project
-- SELECT SUM(effort) as total_active_effort
-- FROM requirements
-- WHERE project_id = 1 AND is_active = TRUE;

-- Get requirements count by status
-- SELECT is_active, COUNT(*) as count
-- FROM requirements
-- WHERE project_id = 1
-- GROUP BY is_active;
