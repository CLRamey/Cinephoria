// Seeder to REMOVE test users from the Cinephoria application in the SQL database
import { user } from '../src/models/init-models';
import { sequelize } from '../src/config/databaseSql';
import { comparePasswords } from '../src/utils/userPassword';
import { log, logerror, logwarn } from '../src/utils/logger';

const ClientEmail = process.env['CLIENT_TEST_USER_EMAIL'];
const EmployeeEmail = process.env['EMPLOYEE_TEST_USER_EMAIL'];
const AdminEmail = process.env['ADMIN_TEST_USER_EMAIL'];
const sharedPassword = process.env['TEST_USER_PASSWORD'];

const TEST_USER_EMAILS = [ClientEmail, EmployeeEmail, AdminEmail];

if (!ClientEmail || !EmployeeEmail || !AdminEmail) {
  logerror('One or more test user emails are not set in environment variables.');
  process.exit(1);
}

if (!sharedPassword) {
  logerror('Test user password is not set in environment variables.');
  process.exit(1);
}

const removeTestUsers = async () => {
  try {
    await sequelize.authenticate();
    log('Connected to DB');

    for (const email of TEST_USER_EMAILS) {
      if (!email) {
        logwarn(`Test user email is not set: ${email}`);
        continue;
      }
      log('Email of test user:', email);
      const existingUser = await user.findOne({
        where: { userEmail: email },
        attributes: ['userId', 'userEmail', 'userPassword'],
      });

      const testUserPassword = existingUser?.get('userPassword');

      if (!testUserPassword) {
        logwarn(`Test user password not found: ${email}`);
        continue;
      }

      if (!existingUser) {
        logwarn(`User not found: ${email}`);
        continue;
      }

      const passwordMatches = await comparePasswords(sharedPassword, testUserPassword);

      if (!passwordMatches) {
        logwarn(`Password does not match for so not removing user: ${email}`);
        continue;
      }

      await existingUser.destroy();
      log(`Removed test user: ${email}`);
    }

    log('All test users removed');
    log('Closing sequelize connection...');
    await sequelize.close();
  } catch (err) {
    logerror('Error removing test users:', err);
    process.exit(1);
  }
};

removeTestUsers();
