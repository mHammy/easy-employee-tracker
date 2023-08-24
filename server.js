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
        choices: ['Add', 'View department budget', 'Update', 'Delete', 'Back to main menu']
      });
    })
    .then((answer) => {
      switch (answer.action) {
        case 'Add':
          addDepartment(); // You need to have a function named addDepartment
          break;
        case 'View department budget':
          viewDepartmentBudget(); // You need to have a function named viewDepartmentBudget
          break;
        case 'Update':
          updateDepartment(); // You need to have a function named updateDepartment
          break;
        case 'Delete':
          deleteDepartment(); // You need to have a function named deleteDepartment
          break;
        case 'Back to main menu':
          mainMenu();
          break;
      }
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
        plain.roleTitle = plain.role.title;
        plain.manager = plain.manager ? plain.manager.fullName : '';
        delete plain.role;
        return plain;
      });

      console.table(plainResults);

      // Prompt for next action
      return inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do next?',
        choices: [
          'View employees by manager',
          'Add an employee',
          'Update an employee',
          'Update an employee\'s manager',
          'Delete an employee',
          'Back to main menu'
        ]
      });
    })
    .then((answer) => {
      switch (answer.action) {
        case 'View employees by manager':
          viewEmployeesByManager();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee':
          updateEmployee();
          break;
        case 'Update an employee\'s manager':
          updateEmployeeManager();
          break;
        case 'Delete an employee':
          deleteEmployee();
          break;
        case 'Back to main menu':
          mainMenu();
          break;
      }
    })
    .catch(err => {
      console.error("Error:", err);
    });
};

const viewRoles = () => {
  Role.findAll({
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['name'],
      }
    ]
  })
    .then(results => {
      // Map results to flatten the department name
      const tableData = results.map(result => {
        const data = result.get({ plain: true });
        // replace department object with just the name
        data.department = data.department.name;
        return data;
      });
      console.table(tableData);

      // Prompt for next action
      return inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do next?',
        choices: [
          'Add a role',
          'Update a role',
          'Delete a role',
          'Back to main menu'
        ]
      });
    })
    .then((answer) => {
      switch (answer.action) {
        case 'Add a role':
          addRole();
          break;
        case 'Update a role':
          updateEmployeeRole();
          break;
        case 'Delete a role':
          deleteRole();
          break;
        case 'Back to main menu':
          mainMenu();
          break;
      }
    })
    .catch(err => {
      console.error("Error:", err);
    });
};

const addRole = () => {
  Department.findAll()
    .then(departments => {
      return inquirer.prompt([
        {
          name: 'roleName',
          type: 'input',
          message: 'Enter the role title:',
          validate: value => {
            if (value) {
              return true;
            } else {
              return 'Please enter a role title.';
            }
          }
        },
        {
          name: 'salary',
          type: 'input',
          message: 'Enter the salary for this role:',
          validate: value => {
            if (!isNaN(value) && value > 0) {
              return true;
            } else {
              return 'Please enter a valid salary (a positive number).';
            }
          }
        },
        {
          name: 'department',
          type: 'list',
          message: 'Choose the department for this role:',
          choices: departments.map(department => ({
            name: department.name,
            value: department.id
          }))
        }
      ]);
    })
    .then((answers) => {
      return Role.create({
        title: answers.roleName,
        salary: parseFloat(answers.salary),  // Ensure salary is a number
        department_id: answers.department
      });
    })
    .then(() => {
      console.log("Role added successfully!");
      mainMenu();
    })
    .catch(err => {
      console.error("Error:", err);
    });
};

const addDepartment = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'departmentName',
      message: 'Enter the name of the new department:',
      validate: value => value ? true : "Name cannot be empty!"
    }
  ])
    .then(answer => {
      // Use Sequelize to add the new department to the database
      Department.create({ name: answer.departmentName })
        .then(() => {
          console.log(`Added new department: ${answer.departmentName}`);
          mainMenu();  // Return to the main menu or whatever flow you want after adding
        })
        .catch(err => {
          console.error("Error adding department:", err);
          mainMenu();
        });
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
          choices: [
            ...employees.map(employee => ({
              name: `${employee.first_name} ${employee.last_name}`, // format the name
              value: employee.id
            })),
            { name: "No Manager", value: null }  // option for no manager
          ]
        }
      ])
        .then((answers) => {
          Employee.create({
            first_name: answers.firstName,
            last_name: answers.lastName,
            role_id: answers.role,
            manager_id: answers.manager === null ? null : answers.manager  // handle null manager
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

      // Inquirer prompts
      return inquirer.prompt([
        {
          name: 'employee',
          type: 'list',
          message: 'Which employee\'s role would you like to update?',
          choices: employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
          }))
        },
        {
          name: 'role',
          type: 'list',
          message: 'What is the new role for this employee?',
          choices: roles.map(role => ({
            name: role.title,
            value: role.id
          }))
        }
      ]);
    })
    .then((answers) => {
      return Employee.update(
        { role_id: answers.role },
        { where: { id: answers.employee } }
      );
    })
    .then(() => {
      console.log("Employee's role updated successfully!");
      mainMenu();
    })
    .catch(err => {
      console.error("Error:", err);
    });
};

const updateDepartment = () => {
  Department.findAll()
    .then(departments => {
      return inquirer.prompt([
        {
          name: 'departmentId',
          type: 'list',
          message: 'Which department would you like to update?',
          choices: departments.map(dept => ({
            name: dept.name,
            value: dept.id
          }))
        },
        {
          name: 'newDepartmentName',
          type: 'input',
          message: 'Enter the new name for the department:'
        }
      ]);
    })
    .then(answers => {
      return Department.update(
        { name: answers.newDepartmentName },
        { where: { id: answers.departmentId } }
      );
    })
    .then(() => {
      console.log("Department updated successfully!");
      mainMenu();
    })
    .catch(err => {
      console.error("Error:", err);
    });
};

const updateEmployee = () => {
  // First, let's get all employees
  Employee.findAll()
    .then(employees => {
      return inquirer.prompt([
        {
          name: 'employeeId',
          type: 'list',
          message: 'Choose an employee to update:',
          choices: employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
          }))
        },
        {
          name: 'attribute',
          type: 'list',
          message: 'What would you like to update?',
          choices: ['first_name', 'last_name', 'role_id']
        }
      ]);
    })
    .then(answers => {
      const attributeToUpdate = answers.attribute;

      // If updating the role, fetch roles from the database
      if (attributeToUpdate === 'role_id') {
        return Role.findAll().then(roles => {
          const roleChoices = roles.map(role => ({
            name: role.title,
            value: role.id
          }));

          return inquirer.prompt({
            name: 'newValue',
            type: 'list',
            message: 'Select the new role:',
            choices: roleChoices
          }).then(response => ({
            ...answers,
            newValue: response.newValue
          }));
        });
      } else {
        // For other attributes, get a simple input
        return inquirer.prompt({
          name: 'newValue',
          type: 'input',
          message: `Enter new value for ${attributeToUpdate}:`
        }).then(response => ({
          ...answers,
          newValue: response.newValue
        }));
      }
    })
    .then(answers => {
      // Finally, we update the employee with the new value
      const updateData = {};
      updateData[answers.attribute] = answers.newValue;

      return Employee.update(updateData, {
        where: {
          id: answers.employeeId
        }
      });
    })
    .then(() => {
      console.log("Employee updated successfully!");
      mainMenu();
    })
    .catch(err => {
      console.error("Error:", err);
    });
};




const updateEmployeeManager = () => {
  let employees = [];

  Employee.findAll()
    .then(employeeResults => {
      employees = employeeResults;

      return inquirer.prompt([
        {
          name: 'employee',
          type: 'list',
          message: 'Which employee\'s manager would you like to update?',
          choices: employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
          }))
        },
        {
          name: 'manager',
          type: 'list',
          message: 'Who is the new manager for this employee?',
          choices: employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
          }))
        }
      ]);
    })
    .then((answers) => {
      return Employee.update(
        { manager_id: answers.manager },
        { where: { id: answers.employee } }
      );
    })
    .then(() => {
      console.log("Employee's manager updated successfully!");
      mainMenu();
    })
    .catch(err => {
      console.error("Error:", err);
    });
};

const viewEmployeesByManager = () => {
  Employee.findAll()
    .then(employees => {
      return inquirer.prompt({
        name: 'manager',
        type: 'list',
        message: 'Choose a manager to view their employees:',
        choices: employees.map(employee => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id
        }))
      });
    })
    .then(answers => {
      return Employee.findAll({
        where: { manager_id: answers.manager },
        include: [
          {
            model: Role,
            as: 'role' 
          },
          {
            model: Employee,
            as: 'manager' 
          }
        ]
      });
    })
    .then(employeesUnderManager => {
      const formattedEmployees = employeesUnderManager.map(emp => {
        return {
          id: emp.id,
          first_name: emp.first_name,
          last_name: emp.last_name,
          role: emp.role.title,
          manager: `${emp.manager.first_name} ${emp.manager.last_name}`
        };
      });
      
      console.table(formattedEmployees);
      mainMenu();
    })
    .catch(err => {
      console.error("Error:", err);
    });
};


const viewDepartmentBudget = () => {
  Department.findAll()
    .then(departments => {
      return inquirer.prompt({
        name: 'departmentName',
        type: 'list',
        message: 'Choose a department to view its budget:',
        choices: departments.map(dept => dept.name)
      });
    })
    .then(answer => {
      const chosenDepartment = answer.departmentName;

      return Department.findOne({
        where: { name: chosenDepartment },
        include: [
          {
            model: Role,
            as: 'roles',
            include: [
              {
                model: Employee,
                as: 'employees'
              }
            ]
          }
        ]
      })
    })
    .then(department => {
      const totalSalary = department.roles.reduce((acc, role) => {
        return acc + (role.salary * role.employees.length);
      }, 0);
      console.log(`Total salary for the ${department.name} department is ${totalSalary}`);
      mainMenu();
    })
    .catch(err => {
      console.error("Error:", err);
    });
};

const deleteEmployee = () => {
  Employee.findAll()
    .then(employees => {
      return inquirer.prompt({
        name: 'employee',
        type: 'list',
        message: 'Choose an employee to delete:',
        choices: employees.map(employee => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id
        }))
      });
    })
    .then(answers => {
      return Employee.destroy({ where: { id: answers.employee } });
    })
    .then(() => {
      console.log("Employee deleted successfully!");
      mainMenu();
    })
    .catch(err => {
      console.error("Error:", err);
    });
};

const deleteRole = () => {
  Role.findAll()
    .then(roles => {
      return inquirer.prompt({
        name: 'role',
        type: 'list',
        message: 'Choose a role to delete:',
        choices: roles.map(role => ({
          name: role.title,
          value: role.id
        }))
      });
    })
    .then(answers => {
      return Role.destroy({ where: { id: answers.role } });
    })
    .then(() => {
      console.log("Role deleted successfully!");
      mainMenu();
    })
    .catch(err => {
      console.error("Error:", err);
    });
};


const deleteDepartment = () => {
  Department.findAll()
    .then(departments => {
      return inquirer.prompt({
        name: 'department',
        type: 'list',
        message: 'Choose a department to delete:',
        choices: departments.map(department => ({
          name: department.name,
          value: department.id
        }))
      });
    })
    .then(answers => {
      return Department.destroy({ where: { id: answers.department } });
    })
    .then(() => {
      console.log("Department deleted successfully!");
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