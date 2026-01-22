#!/usr/bin/env node

/**
 * Admin User Creation Script
 * 
 * Usage:
 *   npm run create-admin -- --email=admin@example.com --password=yourpassword --name="Admin Name"
 * 
 * Or with node directly:
 *   node scripts/createAdmin.js --email=admin@example.com --password=yourpassword --name="Admin Name"
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');

// Load database config from config.json
const configPath = path.join(__dirname, '..', 'config', 'config.json');
const dbConfigs = require(configPath);

// Parse command line arguments
const args = process.argv.slice(2);
const parsedArgs = {};

args.forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, ...valueParts] = arg.slice(2).split('=');
    parsedArgs[key] = valueParts.join('=') || true;
  }
});

// Validate required arguments
const { email, password, name } = parsedArgs;

if (!email || !password) {
  console.error('\n❌ Error: Missing required arguments\n');
  console.log('Usage:');
  console.log('  npm run create-admin -- --email=admin@example.com --password=yourpassword --name="Admin Name"\n');
  console.log('  OR use node directly:');
  console.log('  node scripts/createAdmin.js --email=admin@example.com --password=yourpassword --name="Admin Name"\n');
  console.log('Arguments:');
  console.log('  --email     (required) The admin user\'s email address');
  console.log('  --password  (required) The admin user\'s password (will be hashed)');
  console.log('  --name      (optional) The admin user\'s display name (default: "Admin")\n');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('\n❌ Error: Invalid email format\n');
  process.exit(1);
}

// Validate password length
if (password.length < 6) {
  console.error('\n❌ Error: Password must be at least 6 characters long\n');
  process.exit(1);
}

// Use development environment by default for CLI script
const env = process.env.NODE_ENV || 'development';
const dbConfig = dbConfigs[env];

async function createAdmin() {
  console.log('\n🔧 Admin User Creation Script');
  console.log('================================\n');
  console.log(`📧 Email: ${email}`);
  console.log(`👤 Name: ${name || 'Admin'}`);
  console.log(`🌍 Environment: ${env}`);
  console.log(`🗄️  Database: ${dbConfig.database}\n`);

  // Initialize Sequelize
  const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port || 5432,
      dialect: dbConfig.dialect,
      logging: false,
      dialectOptions: dbConfig.dialectOptions || {}
    }
  );

  try {
    // Test database connection
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Check if user already exists
    console.log('🔍 Checking if user already exists...');
    const [existingUsers] = await sequelize.query(
      'SELECT user_id, email, role FROM users WHERE email = :email',
      {
        replacements: { email },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    if (existingUsers) {
      console.log(`\n⚠️  User with email "${email}" already exists!`);
      
      if (existingUsers.role === 'admin') {
        console.log('ℹ️  This user is already an admin.\n');
      } else {
        console.log('ℹ️  This user is currently a regular user.');
        console.log('🔄 Upgrading to admin role...\n');
        
        await sequelize.query(
          'UPDATE users SET role = :role WHERE email = :email',
          {
            replacements: { role: 'admin', email },
            type: Sequelize.QueryTypes.UPDATE
          }
        );
        
        console.log('✅ User upgraded to admin successfully!\n');
      }
      
      await sequelize.close();
      process.exit(0);
    }

    // Hash the password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin user
    console.log('👤 Creating admin user...');
    const [result] = await sequelize.query(
      `INSERT INTO users (email, password, role) 
       VALUES (:email, :password, :role) 
       RETURNING user_id`,
      {
        replacements: { 
          email, 
          password: hashedPassword, 
          role: 'admin' 
        },
        type: Sequelize.QueryTypes.INSERT
      }
    );

    const userId = result[0]?.user_id;

    // Create profile for the admin user
    console.log('📋 Creating admin profile...');
    await sequelize.query(
      `INSERT INTO profiles (user_id, username, email) 
       VALUES (:user_id, :username, :email)`,
      {
        replacements: { 
          user_id: userId, 
          username: name || 'Admin', 
          email 
        },
        type: Sequelize.QueryTypes.INSERT
      }
    );

    console.log('\n================================');
    console.log('✅ Admin user created successfully!');
    console.log('================================\n');
    console.log('User Details:');
    console.log(`  ID:    ${userId}`);
    console.log(`  Email: ${email}`);
    console.log(`  Name:  ${name || 'Admin'}`);
    console.log(`  Role:  admin\n`);
    console.log('You can now log in with these credentials.\n');

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error creating admin user:');
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('   A user with this email already exists.\n');
    } else if (error.name === 'SequelizeConnectionError') {
      console.error('   Could not connect to the database.');
      console.error('   Please check your database configuration.\n');
    } else {
      console.error(`   ${error.message}\n`);
    }

    await sequelize.close();
    process.exit(1);
  }
}

// Run the script
createAdmin();
