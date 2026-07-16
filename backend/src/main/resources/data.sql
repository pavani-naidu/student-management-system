-- Sample seed data. Safe to re-run: skips rows that already exist by name.
-- NOTE: No user accounts are seeded here on purpose — since passwords must be BCrypt
-- hashed, create your first ADMIN account through POST /api/auth/register instead
-- of trying to hand-craft a password hash in SQL.

INSERT INTO departments (name, code, description)
SELECT * FROM (SELECT 'Computer Science' AS name, 'CSE' AS code, 'Department of Computer Science and Engineering' AS description) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Computer Science') LIMIT 1;

INSERT INTO departments (name, code, description)
SELECT * FROM (SELECT 'Electronics & Communication' AS name, 'ECE' AS code, 'Department of Electronics and Communication Engineering' AS description) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Electronics & Communication') LIMIT 1;

INSERT INTO departments (name, code, description)
SELECT * FROM (SELECT 'Business Administration' AS name, 'MBA' AS code, 'Department of Business Administration' AS description) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Business Administration') LIMIT 1;

INSERT INTO courses (name, code, department_id, duration_years)
SELECT 'B.Tech Computer Science', 'BTCS', d.id, 4
FROM departments d WHERE d.name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE name = 'B.Tech Computer Science') LIMIT 1;

INSERT INTO courses (name, code, department_id, duration_years)
SELECT 'B.Tech Electronics', 'BTECE', d.id, 4
FROM departments d WHERE d.name = 'Electronics & Communication'
AND NOT EXISTS (SELECT 1 FROM courses WHERE name = 'B.Tech Electronics') LIMIT 1;

INSERT INTO courses (name, code, department_id, duration_years)
SELECT 'MBA General', 'MBAG', d.id, 2
FROM departments d WHERE d.name = 'Business Administration'
AND NOT EXISTS (SELECT 1 FROM courses WHERE name = 'MBA General') LIMIT 1;
