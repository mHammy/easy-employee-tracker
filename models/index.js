// require models
const Role = require('./Role');
const Employee = require('./Employee');
const Department = require('./Department');

// set up associations
Role.belongsTo(Department, {
  foreignKey: 'department_id',
  as: 'department'
});

Role.hasMany(Employee, {
  foreignKey: 'role_id',
  as: 'employees'
});

Role.findAll({
    include: [{
      model: Department,
      as: 'department'
    }]
  });

Employee.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role'
});

Employee.belongsTo(Employee, {
  as: 'manager',
  foreignKey: 'manager_id'
});

Employee.hasMany(Employee, {
  as: 'subordinates',
  foreignKey: 'manager_id'
});

Department.hasMany(Role, {
  foreignKey: 'department_id',
  as: 'roles'
});
// export
module.exports = {
  Role,
  Employee,
  Department
};