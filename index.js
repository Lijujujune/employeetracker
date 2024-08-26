const { Pool } = require('pg');
const inquirer = require('inquirer');

const PORT = process.env.PORT || 3001;

const { Console } = require('console');
const { Transform } = require('stream');

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
        'Update an Employee Manager',
        // 'View employees by Manager',
        'View employees by Department',
        'Delete Department Role and Employee',
        'View Department Budget',
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
        //bonus
        case 'Update an Employee Manager':
          updateEmployeeManager();
        break;
        // case 'View employees by manager':
        //     viewEmployeesbyManager();
        // break;
        case 'View employees by Department':
            viewEmployeesbyDepartment();
        break;
        case 'Delete Department Role and Employee':
            deleteDepartmentRoleEmployee();
        break;
        case 'View Department Budget':
            viewDepartmentBudget();
        break;
        //end bonus
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

//Bonus Functions
// Function to update an employee manager
function updateEmployeeManager() {
    pool.query('SELECT * FROM employees')
        .then(res => {
            const employees = res.rows.map(employee => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id
            }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employeeId',
                    message: "Which employee's manager do you want to update?",
                    choices: employees
                },
                {
                    type: 'list',
                    name: 'managerId',
                    message: "Who is the employee's new manager?",
                    choices: employees.concat([{ name: 'None', value: null }])
                }
            ]).then(answers => {
                const { employeeId, managerId } = answers;
                pool.query('UPDATE employees SET manager_id = $1 WHERE id = $2', [managerId, employeeId])
                    .then(() => {
                        console.log('Employee manager updated successfully!');
                        startApp();
                    })
                    .catch(err => console.error('Error updating employee manager', err.stack));
            });
        })
        .catch(err => console.error('Error fetching employees', err.stack));
}

// // Function to view employees by manager
// function viewEmployeesbyManager() {
//     const query = `
//         SELECT DISTINCT m.id, CONCAT(m.first_name, ' ', m.last_name) AS manager 
//         FROM employees e
//         JOIN employees m ON e.manager_id = m.id`;

//     pool.query(query)
//         .then(res => {
//             if (res.rows.length === 0) {
//                 console.log('No managers found. Please ensure that employees have managers assigned.');
//                 return startApp();  // Restart the app if no managers are found
//             }

//             const managers = res.rows.map(manager => ({
//                 name: manager.manager,
//                 value: manager.id
//             }));

//             console.log('Managers available:', managers);  // Debugging log

//             inquirer.prompt([
//                 {
//                     type: 'list',
//                     name: 'managerId',
//                     message: 'Select a manager to view their employees:',
//                     choices: managers
//                 }
//             ]).then(answer => {
//                 const { managerId } = answer;
//                 const employeeQuery = `
//                     SELECT e.id, e.first_name, e.last_name, r.title 
//                     FROM employees e 
//                     LEFT JOIN roles r ON e.role_id = r.id 
//                     WHERE e.manager_id = $1`;

//                 pool.query(employeeQuery, [managerId])
//                     .then(res => {
//                         if (res.rows.length === 0) {
//                             console.log('No employees found under this manager.');
//                         } else {
//                             console.table(res.rows);
//                         }
//                         startApp();
//                     })
//                     .catch(err => console.error('Error fetching employees by manager:', err.stack));
//             }).catch(err => {
//                 console.error('Error with inquirer prompt:', err);
//                 startApp();
//             });
//         })
//         .catch(err => console.error('Error fetching managers:', err.stack));
// }

// Function to view employees by department
function viewEmployeesbyDepartment() {
    const query = 'SELECT * FROM departments';
    
    pool.query(query)
        .then(res => {
            const departments = res.rows.map(department => ({
                name: department.name,
                value: department.id
            }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'departmentId',
                    message: 'Select a department to view its employees:',
                    choices: departments
                }
            ]).then(answer => {
                const { departmentId } = answer;
                const query = `
                    SELECT e.id, e.first_name, e.last_name, r.title 
                    FROM employees e 
                    LEFT JOIN roles r ON e.role_id = r.id 
                    LEFT JOIN departments d ON r.department_id = d.id 
                    WHERE d.id = $1`;
                pool.query(query, [departmentId])
                    .then(res => {
                        console.table(res.rows);
                        startApp();
                    })
                    .catch(err => console.error('Error fetching employees by department', err.stack));
            });
        })
        .catch(err => console.error('Error fetching departments', err.stack));
}
//delete department, role, employee
function deleteDepartmentRoleEmployee() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'deleteChoice',
            message: 'What would you like to delete?',
            choices: ['Department', 'Role', 'Employee']
        }
    ]).then(answer => {
        switch (answer.deleteChoice) {
            case 'Department':
                deleteDepartment();
                break;
            case 'Role':
                deleteRole();
                break;
            case 'Employee':
                deleteEmployee();
                break;
        }
    });
}

function deleteDepartment() {
    pool.query('SELECT * FROM departments')
        .then(res => {
            const departments = res.rows.map(department => ({
                name: department.name,
                value: department.id
            }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'departmentId',
                    message: 'Select a department to delete:',
                    choices: departments
                }
            ]).then(answer => {
                const { departmentId } = answer;
                pool.query('DELETE FROM departments WHERE id = $1', [departmentId])
                    .then(() => {
                        console.log('Department deleted successfully!');
                        startApp();
                    })
                    .catch(err => console.error('Error deleting department', err.stack));
            });
        })
        .catch(err => console.error('Error fetching departments', err.stack));
}

function deleteRole() {
    pool.query('SELECT * FROM roles')
        .then(res => {
            const roles = res.rows.map(role => ({
                name: role.title,
                value: role.id
            }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'roleId',
                    message: 'Select a role to delete:',
                    choices: roles
                }
            ]).then(answer => {
                const { roleId } = answer;
                pool.query('DELETE FROM roles WHERE id = $1', [roleId])
                    .then(() => {
                        console.log('Role deleted successfully!');
                        startApp();
                    })
                    .catch(err => console.error('Error deleting role', err.stack));
            });
        })
        .catch(err => console.error('Error fetching roles', err.stack));
}

function deleteEmployee() {
    pool.query('SELECT * FROM employees')
        .then(res => {
            const employees = res.rows.map(employee => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id
            }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employeeId',
                    message: 'Select an employee to delete:',
                    choices: employees
                }
            ]).then(answer => {
                const { employeeId } = answer;
                pool.query('DELETE FROM employees WHERE id = $1', [employeeId])
                    .then(() => {
                        console.log('Employee deleted successfully!');
                        startApp();
                    })
                    .catch(err => console.error('Error deleting employee', err.stack));
            });
        })
        .catch(err => console.error('Error fetching employees', err.stack));
}
//Function to view department budget
function viewDepartmentBudget() {
    const query = 'SELECT * FROM departments';
    
    pool.query(query)
        .then(res => {
            const departments = res.rows.map(department => ({
                name: department.name,
                value: department.id
            }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'departmentId',
                    message: 'Select a department to view its budget:',
                    choices: departments
                }
            ]).then(answer => {
                const { departmentId } = answer;
                const query = `
                    SELECT SUM(r.salary) AS total_budget 
                    FROM employees e 
                    LEFT JOIN roles r ON e.role_id = r.id 
                    WHERE r.department_id = $1`;
                pool.query(query, [departmentId])
                    .then(res => {
                        console.log(`Total budget for department: $${res.rows[0].total_budget}`);
                        startApp();
                    })
                    .catch(err => console.error('Error calculating department budget', err.stack));
            });
        })
        .catch(err => console.error('Error fetching departments', err.stack));
}