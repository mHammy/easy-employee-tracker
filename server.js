const inquirer = require('inquirer');
const db = require('./db/database');
const mysql = require('mysql2');

const mainMenu = () => {
  inquirer.prompt({
    name: 'action',
    type: 'list',
    message: 'What would you like to do?',
    choices: [
      'View all departments',
      'View all roles',
      'View all employees',
      'Add a department',
      'Add a role',
      'Add an employee',
      'Update an employee role',
      'Exit'
    ]
  })
  .then((answer) => {
    switch (answer.action) {
      case 'View all departments':
        viewDepartments();
        break;
      case 'View all roles':
        viewRoles();
        break;
      case 'Add employee':
        addEmployee();
        break;
      case 'View employees':
        viewEmployees();
        break;
      case 'Add a department':
        addDepartment();
        break;
      case 'Add a role':
        addRole();
        break;
      case 'Update an employee role':
        updateEmployeeRole();
        break;
      case 'Exit':
        db.end();
        break;
    }
  });
};

const viewDepartments = () => {
  const query = "SELECT id AS 'Department ID', name AS 'Department Name' FROM departments";
  db.query(query, (err, results) => {
    if (err) throw err;
    console.table(results);
    mainMenu();
  });
};

const addDepartment = () => {
  inquirer.prompt([
    {
      name: 'departmentName',
      type: 'input',
      message: 'Enter the name of the department:'
    }
  ])
  .then((answer) => {
    const query = "INSERT INTO departments (name) VALUES (?)";
    db.query(query, [answer.departmentName], (err, result) => {
      if (err) throw err;
      console.log("Department added successfully!");
      mainMenu();
    });
  });
};

const viewRoles = () => {
  const query = `
    SELECT r.id AS 'Role ID', 
           r.title AS 'Job Title', 
           r.salary AS 'Salary',
           d.name AS 'Department Name' 
    FROM roles r
    JOIN departments d ON r.department_id = d.id;
  `;
  db.query(query, (err, results) => {
    if (err) throw err;
    console.table(results);
    mainMenu();
  });
};

const addRole = () => {
    const queryDepartments = "SELECT id, name FROM departments";
  
    db.query(queryDepartments, (err, departments) => {
      if (err) throw err;
  
      inquirer.prompt([
        {
          name: 'roleName',
          type: 'input',
          message: 'Enter the role name:'
        },
        {
          name: 'salary',
          type: 'input',
          message: 'Enter the salary for the role:',
          validate: value => {
            if (isNaN(value)) {
              return 'Please enter a numeric value for salary.';
            }
            return true;
          }
        },
        {
          name: 'department',
          type: 'list',
          message: 'Choose the department for the role:',
          choices: departments.map(department => ({
            name: department.name,
            value: department.id
          }))
        }
      ])
      .then((answers) => {
        const query = "INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)";
        db.query(query, [answers.roleName, answers.salary, answers.department], (err, result) => {
          if (err) throw err;
          console.log("Role added successfully!");
          mainMenu();
        });
      });
    });
  };

const updateEmployeeRole = () => {
  let roles = [];
  let employees = [];

  const queryRoles = "SELECT id, title FROM roles";
  const queryEmployees = "SELECT id, CONCAT(first_name, ' ', last_name) AS employee_name FROM employees";

  db.query(queryRoles, (err, results) => {
    if (err) throw err;
    roles = results;
    db.query(queryEmployees, (err, results) => {
      if (err) throw err;
      employees = results;

      inquirer.prompt([
        {
          name: 'employee',
          type: 'list',
          message: 'Choose the employee to update:',
          choices: employees.map(employee => ({
            name: employee.employee_name,
            value: employee.id
          }))
        },
        {
          name: 'role',
          type: 'list',
          message: 'Choose the new role for the employee:',
          choices: roles.map(role => ({
            name: role.title,
            value: role.id
          }))
        }
      ])
      .then((answers) => {
        const query = "UPDATE employees SET role_id = ? WHERE id = ?";
        db.query(query, [answers.role, answers.employee], (err, result) => {
          if (err) throw err;
          console.log("Employee's role updated successfully!");
          mainMenu();
        });
      });
    });
  });
};

const addEmployee = () => {
  let roles = [];
  let employees = [];

  const queryRoles = "SELECT id, title FROM roles";
  const queryEmployees = "SELECT id, CONCAT(first_name, ' ', last_name) AS employee_name FROM employees";

  db.query(queryRoles, (err, results) => {
    if (err) throw err;
    roles = results;
    db.query(queryEmployees, (err, results) => {
      if (err) throw err;
      employees = results;

      inquirer.prompt([
        {
          name: 'firstName',
          type: 'input',
          message: 'Enter the first name:'
        },
        {
          name: 'lastName',
          type: 'input',
          message: 'Enter the last name:'
        },
        {
          name: 'role',
          type: 'list',
          message: 'Choose the role:',
          choices: roles.map(role => ({
            name: role.title,
            value: role.id
          }))
        },
        {
          name: 'manager',
          type: 'list',
          message: 'Choose the manager:',
          choices: employees.map(employee => ({
            name: employee.employee_name,
            value: employee.id
          }))
        }
      ])
      .then((answers) => {
        const query = "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
        db.query(query, [answers.firstName, answers.lastName, answers.role, answers.manager], (err, result) => {
          if (err) throw err;
          console.log("Employee added successfully!");
          mainMenu();
        });
      });
    });
  });
};

const viewEmployees = () => {
  const query = `
    SELECT e.id AS 'Employee ID', 
           CONCAT(e.first_name, ' ', e.last_name) AS 'Full Name',
           r.title AS 'Role',
           r.salary AS 'Salary',
           d.name AS 'Department',
           CONCAT(m.first_name, ' ', m.last_name) AS 'Manager'
    FROM employees e
    LEFT JOIN roles r ON e.role_id = r.id
    LEFT JOIN departments d ON r.department_id = d.id
    LEFT JOIN employees m ON e.manager_id = m.id;
  `;
  db.query(query, (err, results) => {
    if (err) throw err;
    console.table(results);
    mainMenu();
  });
};

// start the application
mainMenu();
