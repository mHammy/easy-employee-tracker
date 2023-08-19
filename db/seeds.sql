USE employee_tracker_db;

-- Seed departments
INSERT INTO departments (name)
VALUES ('Sales'),
       ('Engineering'),
       ('Human Resources'),
       ('Finance');

-- Seed roles with their respective departments
INSERT INTO roles (title, salary, department_id)
VALUES ('Sales Executive', 60000, (SELECT id FROM departments WHERE name='Sales')),
       ('Software Engineer', 80000, (SELECT id FROM departments WHERE name='Engineering')),
       ('HR Manager', 75000, (SELECT id FROM departments WHERE name='Human Resources')),
       ('Accountant', 70000, (SELECT id FROM departments WHERE name='Finance'));

-- Seed employees with their roles and managers
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ('John', 'Doe', (SELECT id FROM roles WHERE title='Sales Executive'), NULL), -- No manager for John
       ('Jane', 'Smith', (SELECT id FROM roles WHERE title='Software Engineer'), 1), -- John is Jane's manager
       ('Emily', 'Johnson', (SELECT id FROM roles WHERE title='HR Manager'), 1),    -- John is Emily's manager
       ('Robert', 'Brown', (SELECT id FROM roles WHERE title='Accountant'), 3);     -- Emily is Robert's manager