// Seeder for the Cinephoria application to create test users in the SQL database
import { user } from '../src/models/init-models';
import { sequelize } from '../src/config/databaseSql';
import { hashPassword } from '../src/utils/userPassword';
import { Role } from '../src/validators/userValidator';
import { log, logerror } from '../src/utils/logger';

const ClientEmail = process.env['CLIENT_TEST_USER_EMAIL'];
const EmployeeEmail = process.env['EMPLOYEE_TEST_USER_EMAIL'];
const AdminEmail = process.env['ADMIN_TEST_USER_EMAIL'];

const TEST_USERS = [
  {
    userFirstName: 'Test',
    userLastName: 'Client',
    userUsername: 'testclient',
    userEmail: ClientEmail,
    userRole: 'client',
  },
  {
    userFirstName: 'Test',
    userLastName: 'Employee',
    userUsername: 'testemployee',
    userEmail: EmployeeEmail,
    userRole: 'employee',
  },
  {
    userFirstName: 'Test',
    userLastName: 'Admin',
    userUsername: 'testadmin',
    userEmail: AdminEmail,
    userRole: 'admin',
  },
];

const sharedPassword = process.env['TEST_USER_PASSWORD'];
const defaultFlags = {
  mustChangePassword: false,
  isVerified: true,
  agreedPolicy: true,
  agreedCgvCgu: true,
};

if (!sharedPassword) {
  logerror('TEST_USER_PASSWORD not set in environment');
  process.exit(1);
}

const insertTestUsers = async () => {
  try {
    await sequelize.authenticate();
    log('Connected to DB');

    for (const userData of TEST_USERS) {
      if (!userData.userEmail) {
        logerror(`User email for role ${userData.userRole} is not set in environment variables.`);
        continue;
      }

      const existing = await user.findOne({ where: { userEmail: userData.userEmail } });

      if (existing) {
        log(`User already exists`);
        continue;
      }

      const hashed = await hashPassword(sharedPassword);

      await user.create({
        ...userData,
        userEmail: userData.userEmail as string,
        userRole: userData.userRole as Role,
        userPassword: hashed,
        ...defaultFlags,
      });

      log(`Created test ${userData.userRole}: ${userData.userEmail}`);
    }

    log('All test users created');
    log('Closing sequelize connection...');
    await sequelize.close();
  } catch (err) {
    logerror('Error inserting test users:', err);
    process.exit(1);
  }
};

insertTestUsers();
