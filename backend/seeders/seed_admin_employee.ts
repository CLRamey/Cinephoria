// Seeder for the Cinephoria application to create admin and employee initial accounts in the SQL database
import { user } from '../src/models/init-models';
import { sequelize } from '../src/config/databaseSql';
import { hashPassword } from '../src/utils/userPassword';
import { Role } from '../src/validators/userValidator';
import { log, logerror } from '../src/utils/logger';

const AdminEmail = process.env['ADMIN_EMAIL'];
const AdminUsername = process.env['ADMIN_USERNAME'];
const AdminPassword = process.env['ADMIN_PASSWORD'];

const EmployeeEmail = process.env['EMPLOYEE_EMAIL'];
const EmployeeUsername = process.env['EMPLOYEE_USERNAME'];
const EmployeePassword = process.env['EMPLOYEE_PASSWORD'];

const STAFF_USERS = [
  {
    userFirstName: 'Admin',
    userLastName: 'Account',
    userUsername: AdminUsername,
    userEmail: AdminEmail,
    userPassword: AdminPassword,
    userRole: 'admin',
  },
  {
    userFirstName: 'Employee',
    userLastName: 'Account',
    userUsername: EmployeeUsername,
    userEmail: EmployeeEmail,
    userPassword: EmployeePassword,
    userRole: 'employee',
  },
];

const defaultFlags = {
  mustChangePassword: false,
  isVerified: true,
  agreedPolicy: true,
  agreedCgvCgu: true,
};

const insertStaffUsers = async () => {
  try {
    await sequelize.authenticate();
    log('Connected to DB');

    for (const userData of STAFF_USERS) {
      if (!userData.userEmail) {
        logerror(`Staff email are not set in environment variables for ${userData.userRole}.`);
        continue;
      }

      const existing = await user.findOne({ where: { userEmail: userData.userEmail } });

      if (existing) {
        log(`A staff member already exists`);
        continue;
      }

      if (!userData.userPassword) {
        logerror(`Staff password is not set for ${userData.userRole}.`);
        continue;
      }
      const hashed = await hashPassword(userData.userPassword);

      await user.create({
        ...userData,
        userEmail: userData.userEmail as string,
        userRole: userData.userRole as Role,
        userPassword: hashed,
        ...defaultFlags,
      });

      log(`Created ${userData.userRole}`);
    }

    log('All staff users created');
    log('Closing sequelize connection...');
    await sequelize.close();
  } catch (err) {
    logerror('Error inserting staff users:', err);
    process.exit(1);
  }
};

insertStaffUsers();
