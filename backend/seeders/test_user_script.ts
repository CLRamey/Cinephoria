// Seeder for the Cinephoria application to create test users in the SQL database
import { user } from '../src/models/init-models';
import { sequelize } from '../src/config/databaseSql';
import { hashPassword } from '../src/utils/userPassword';
import { Role } from '../src/validators/userValidator';

const TEST_USERS = [
  {
    userFirstName: 'Test',
    userLastName: 'Client',
    userUsername: 'testclient',
    userEmail: 'test-client@cinephoria.com',
    userRole: 'client',
  },
  {
    userFirstName: 'Test',
    userLastName: 'Employee',
    userUsername: 'testemployee',
    userEmail: 'test-employee@cinephoria.com',
    userRole: 'employee',
  },
  {
    userFirstName: 'Test',
    userLastName: 'Admin',
    userUsername: 'testadmin',
    userEmail: 'test-admin@cinephoria.com',
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
  console.error('TEST_USER_PASSWORD not set in environment');
  process.exit(1);
}

const insertTestUsers = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    for (const userData of TEST_USERS) {
      const existing = await user.findOne({ where: { userEmail: userData.userEmail } });

      if (existing) {
        console.log(`User already exists`);
        continue;
      }

      const hashed = await hashPassword(sharedPassword);

      await user.create({
        ...userData,
        userRole: userData.userRole as Role,
        userPassword: hashed,
        ...defaultFlags,
      });

      console.log(`Created test ${userData.userRole}: ${userData.userEmail}`);
    }

    console.log('All test users created');
    console.log('Closing sequelize connection...');
    await sequelize.close();
  } catch (err) {
    console.error('Error inserting test users:', err);
    process.exit(1);
  }
};

insertTestUsers();
