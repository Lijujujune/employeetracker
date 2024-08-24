-- Seeds for departments table
INSERT INTO departments (name) VALUES ('Sales');
INSERT INTO departments (name) VALUES ('Engineering');
INSERT INTO departments (name) VALUES ('Finance');
INSERT INTO departments (name) VALUES ('Legal');

-- Seeds for roles table
INSERT INTO roles (title, salary, department_id) VALUES ('Sales lead', 100000, 1);
INSERT INTO roles (title, salary, department_id) VALUES ('Salesperson', 80000, 1);
INSERT INTO roles (title, salary, department_id) VALUES ('Lead Engineering', 150000, 2);
INSERT INTO roles (title, salary, department_id) VALUES ('Software Engineering', 120000, 2);
INSERT INTO roles (title, salary, department_id) VALUES ('Finance Manager', 160000, 3);
INSERT INTO roles (title, salary, department_id) VALUES ('Accountant', 125000, 3);
INSERT INTO roles (title, salary, department_id) VALUES ('Legal Team Lead', 250000, 4);
INSERT INTO roles (title, salary, department_id) VALUES ('Lawyer', 190000, 4);

-- Seeds for employees table
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ('John', 'Doe', 1, NULL);
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ('Mike', 'Chan', 2, 1);
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ('Ashley', 'Johnson', 3, NULL);
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ('Sarah', 'Williams', 4, 3);
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ('David', 'Brown', 5, NULL);
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ('Emily', 'Davis', 6, 5);
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ('Kevin', 'Lewis', 7, NULL);
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ('Sam', 'Li', 8, 7);

SELECT * FROM departments;
SELECT * FROM roles;
SELECT * FROM employees;