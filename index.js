const { Pool } = require('pg');
const inquirer = require('inquirer');

const PORT = process.env.PORT || 3001;

// Create a PostgreSQL Pool
const pool = new Pool({
  user: 'postgres',  
  host: 'localhost',
  database: 'employees_db',
  password: 'happy123', 
});

// Connect to the PostgreSQL pool
pool.connect()
  .then(() => {
    console.log('Connected to the employees_db database.');
    startApp();
  })
  .catch(err => console.error('Connection error', err.stack));

// Function to start the application
function startApp() {
  inquirer
    .prompt({
      name: 'action',
      type: 'list',
      message: 'What would you like to do?',
      choices: [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'Add a Department',
        'Add a Role',
        'Add an Employee',
        'Update an Employee Role',
        'Exit'
      ]
    })
    .then(answer => {
      switch (answer.action) {
        case 'View All Departments':
          viewAllDepartments();
          break;
        case 'View All Roles':
          viewAllRoles();
          break;
        case 'View All Employees':
          viewAllEmployees();
          break;
        case 'Add a Department':
          addDepartment();
          break;
        case 'Add a Role':
          addRole();
          break;
        case 'Add an Employee':
          addEmployee();
          break;
        case 'Update an Employee Role':
          updateEmployeeRole();
          break;
        case 'Exit':
          pool.end();
          break;
        default:
          break;
      }
    });
}

// Function to view all departments
function viewAllDepartments() {
  const query = 'SELECT * FROM departments';
  pool.query(query)
    .then(res => {
      console.table(res.rows);
      startApp();
    })
    .catch(err => console.error('Error executing query', err.stack));
}

// Function to view all roles
function viewAllRoles() {
  const query = `
    SELECT roles.id, roles.title, roles.salary, departments.name AS department 
    FROM roles 
    LEFT JOIN departments ON roles.department_id = departments.id`;
  pool.query(query)
    .then(res => {
      console.table(res.rows);
      startApp();
    })
    .catch(err => console.error('Error executing query', err.stack));
}

// Function to view all employees
function viewAllEmployees() {
  const query = `
    SELECT employees.id, employees.first_name, employees.last_name, roles.title AS role, roles.salary, 
    departments.name AS department, 
    (SELECT CONCAT(manager.first_name, ' ', manager.last_name) FROM employees manager WHERE manager.id = employees.manager_id) AS manager
    FROM employees 
    LEFT JOIN roles ON employees.role_id = roles.id 
    LEFT JOIN departments ON roles.department_id = departments.id`;
  pool.query(query)
    .then(res => {
      console.table(res.rows);
      startApp();
    })
    .catch(err => console.error('Error executing query', err.stack));
}

// Function to add a department
function addDepartment() {
  inquirer
    .prompt({
      name: 'name',
      type: 'input',
      message: 'Enter the name of the department:'
    })
    .then(answer => {
      const query = 'INSERT INTO departments (name) VALUES ($1)';
      pool.query(query, [answer.name])
        .then(() => {
          console.log(`Added ${answer.name} to the database.`);
          startApp();
        })
        .catch(err => console.error('Error executing query', err.stack));
    });
}

// Function to add a role
function addRole() {
  pool.query('SELECT * FROM departments')
    .then(res => {
      inquirer
        .prompt([
          {
            name: 'title',
            type: 'input',
            message: 'Enter the title of the role:'
          },
          {
            name: 'salary',
            type: 'input',
            message: 'Enter the salary for the role:'
          },
          {
            name: 'department_id',
            type: 'list',
            message: 'Select the department for the role:',
            choices: res.rows.map(department => ({
              name: department.name,
              value: department.id
            }))
          }
        ])
        .then(answer => {
          const query = 'INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)';
          pool.query(query, [answer.title, answer.salary, answer.department_id])
            .then(() => {
              console.log(`Added ${answer.title} to the database.`);
              startApp();
            })
            .catch(err => console.error('Error executing query', err.stack));
        });
    })
    .catch(err => console.error('Error executing query', err.stack));
}

// Function to add an employee
function addEmployee() {
  pool.query('SELECT * FROM roles')
    .then(roleRes => {
      pool.query('SELECT * FROM employees')
        .then(employeeRes => {
          inquirer
            .prompt([
              {
                name: 'first_name',
                type: 'input',
                message: 'Enter the first name of the employee:'
              },
              {
                name: 'last_name',
                type: 'input',
                message: 'Enter the last name of the employee:'
              },
              {
                name: 'role_id',
                type: 'list',
                message: 'Select the role for the employee:',
                choices: roleRes.rows.map(role => ({
                  name: role.title,
                  value: role.id
                }))
              },
              {
                name: 'manager_id',
                type: 'list',
                message: 'Select the manager for the employee:',
                choices: [{ name: 'None', value: null }].concat(
                  employeeRes.rows.map(employee => ({
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id
                  }))
                )
              }
            ])
            .then(answer => {
              const query = 'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)';
              pool.query(query, [answer.first_name, answer.last_name, answer.role_id, answer.manager_id])
                .then(() => {
                  console.log(`Added ${answer.first_name} ${answer.last_name} to the database.`);
                  startApp();
                })
                .catch(err => console.error('Error executing query', err.stack));
            });
        })
        .catch(err => console.error('Error executing query', err.stack));
    })
    .catch(err => console.error('Error executing query', err.stack));
}

// Function to update an employee role
function updateEmployeeRole() {
  pool.query('SELECT * FROM employees')
    .then(employeeRes => {
      pool.query('SELECT * FROM roles')
        .then(roleRes => {
          inquirer
            .prompt([
              {
                name: 'employee_id',
                type: 'list',
                message: 'Select the employee to update:',
                choices: employeeRes.rows.map(employee => ({
                  name: `${employee.first_name} ${employee.last_name}`,
                  value: employee.id
                }))
              },
              {
                name: 'role_id',
                type: 'list',
                message: 'Select the new role for the employee:',
                choices: roleRes.rows.map(role => ({
                  name: role.title,
                  value: role.id
                }))
              }
            ])
            .then(answer => {
              const query = 'UPDATE employees SET role_id = $1 WHERE id = $2';
              pool.query(query, [answer.role_id, answer.employee_id])
                .then(() => {
                  console.log('Updated employee role in the database.');
                  startApp();
                })
                .catch(err => console.error('Error executing query', err.stack));
            });
        })
        .catch(err => console.error('Error executing query', err.stack));
    })
    .catch(err => console.error('Error executing query', err.stack));
}