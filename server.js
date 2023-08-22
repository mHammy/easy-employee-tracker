// required files/modules
const express = require('express');
const inquirer = require('inquirer');
const sequelize = require('./config/connection.js');
const { Role, Employee, Department } = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log('Now listening'));
});

// main menu within the application
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
          console.log("Viewing all departments...");
          viewDepartments();
          break;
        case 'View all roles':
          console.log("Viewing all roles...");
          viewRoles();
          break;
        case 'View all employees':
          console.log("Viewing all employees...");
          viewEmployees();
          break;
        case 'Add a department':
          console.log("Adding a department...");
          addDepartment();
          break;
        case 'Add a role':
          console.log("Adding a role...");
          addRole();
          break;
        case 'Add an employee':
          console.log("Adding an employee...");
          addEmployee();
          break;
        case 'Update an employee role':
          console.log("Updating an employee's role...");
          updateEmployeeRole();
          break;
        case 'Exit':
          console.log("Exiting...");
          break;
      }
    })
    .catch(err => {
      console.error("Error:", err);
    });
}
// the following functions are called from the main menu
const viewDepartments = () => {
  Department.findAll()
    .then(departments => {
      console.table(departments.map(dept => dept.dataValues));

      return inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do next?',
        choices: ['Back to main menu']
      });
    })
    .then((answer) => {
      if (answer.action === 'Back to main menu') {
        mainMenu();
      }
    })
    .catch(err => {
      console.error("Error:", err);
    });
};

const viewRoles = () => {
  Role.findAll({
    include: [{ model: Department, as: 'department', attributes: ['name'] }]
  })
    .then(roles => {
      console.table(roles.map(role => role.dataValues));

      return inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do next?',
        choices: ['Back to main menu']
      });
    })
    .then((answer) => {
      if (answer.action === 'Back to main menu') {
        mainMenu();
      }
    })
    .catch(err => {
      console.error("Error:", err);
    });
};

const addRole = () => {
  Department.findAll()
    .then(departments => {
      inquirer.prompt([
        // Need to add prompts here
      ])
        .then((answers) => {
          Role.create({
            title: answers.roleName,
            salary: answers.salary,
            department_id: answers.department
          })
            .then(() => {
              console.log("Role added successfully!");
              mainMenu();
            })
            .catch(err => {
              console.error("Error:", err);
            });
        });
    })
    .catch(err => {
      console.error("Error:", err);
    });
};

const updateEmployeeRole = () => {
  let roles = [];
  let employees = [];

  Role.findAll()
    .then(roleResults => {
      roles = roleResults;
      return Employee.findAll();
    })
    .then(employeeResults => {
      employees = employeeResults;

      inquirer.prompt([
        // Need to add prompts here
      ])
        .then((answers) => {
          Employee.update(
            { role_id: answers.role },
            { where: { id: answers.employee } }
          )
            .then(() => {
              console.log("Employee's role updated successfully!");
              mainMenu();
            })
            .catch(err => {
              console.error("Error:", err);
            });
        });
    })
    .catch(err => {
      console.error("Error:", err);
    });
};

const addEmployee = () => {
  let roles = [];
  let employees = [];

  Role.findAll()
    .then(roleResults => {
      roles = roleResults;
      return Employee.findAll();
    })
    .then(employeeResults => {
      employees = employeeResults;

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
          Employee.create({
            first_name: answers.firstName,
            last_name: answers.lastName,
            role_id: answers.role,
            manager_id: answers.manager
          })
            .then(() => {
              console.log("Employee added successfully!");
              mainMenu();
            })
            .catch(err => {
              console.error("Error:", err);
            });
        });
    })
    .catch(err => {
      console.error("Error:", err);
    });
};

const viewEmployees = () => {
  Employee.findAll({
    attributes: [
      'id',
      [sequelize.fn('concat', sequelize.col('employee.first_name'), ' ', sequelize.col('employee.last_name')), 'fullName']
    ],
    include: [
      {
        model: Role,
        as: 'role',  
        attributes: ['title', 'salary'],
        include: {
          model: Department,
          as: 'department',
          attributes: ['name']
        }
      },
      {
        model: Employee,
        as: 'manager',
        attributes: [[sequelize.fn('concat', sequelize.col('manager.first_name'), ' ', sequelize.col('manager.last_name')), 'fullName']]
      }
    ]
  })
  .then(results => {
    const plainResults = results.map(result => {
        const plain = result.get({ plain: true });
        plain.roleTitle = plain.role.title; // Extract role's title
        plain.manager = plain.manager ? plain.manager.fullName : ''; // Format manager's name or set to empty string if null
        delete plain.role; // Remove the role object
        return plain;
    });

    console.table(plainResults);
    mainMenu();
})
  .catch(err => {
    console.error("Error:", err);
  });
};

function connectAndSyncDB() {
  return sequelize.sync();
}

// start the application
async function initialize() {
  // Connect to the database and sync it 
  await connectAndSyncDB();
  mainMenu();
}

// Start the app
initialize();