import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

// Database configuration
const setupConfig = {
  user: 'postgres',
  host: 'localhost',
  password: 'your_postgres_password', // Change this to your PostgreSQL password
  port: 5432,
};

const dbConfig = {
  user: 'school_user',
  host: 'localhost',
  database: 'school_portal',
  password: 'school_password123',
  port: 5432,
};

async function setupDatabase() {
  console.log('🚀 Setting up PostgreSQL database for School Portal...\n');

  // Connect to PostgreSQL as superuser
  const client = new Client(setupConfig);
  
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Create database
    try {
      await client.query('CREATE DATABASE school_portal');
      console.log('✅ Created database: school_portal');
    } catch (error) {
      if (error.code === '42P04') {
        console.log('ℹ️  Database school_portal already exists');
      } else {
        throw error;
      }
    }

    // Create user
    try {
      await client.query(`CREATE USER school_user WITH PASSWORD 'school_password123'`);
      console.log('✅ Created user: school_user');
    } catch (error) {
      if (error.code === '42710') {
        console.log('ℹ️  User school_user already exists');
      } else {
        throw error;
      }
    }

    // Grant privileges
    await client.query('GRANT ALL PRIVILEGES ON DATABASE school_portal TO school_user');
    console.log('✅ Granted privileges to school_user');

    await client.end();

    // Connect to the new database and create tables
    const dbClient = new Client(dbConfig);
    await dbClient.connect();
    console.log('✅ Connected to school_portal database');

    // Grant schema privileges
    await dbClient.query('GRANT ALL ON SCHEMA public TO school_user');
    await dbClient.query('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO school_user');
    await dbClient.query('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO school_user');

    // Read and execute schema
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'server/database/schema.sql'), 'utf8');
    await dbClient.query(schemaSQL);
    console.log('✅ Created database schema');

    // Read and execute seed data
    const seedSQL = fs.readFileSync(path.join(__dirname, 'server/database/seed.sql'), 'utf8');
    await dbClient.query(seedSQL);
    console.log('✅ Inserted seed data');

    await dbClient.end();

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Database Connection Details:');
    console.log('Host: localhost');
    console.log('Port: 5432');
    console.log('Database: school_portal');
    console.log('Username: school_user');
    console.log('Password: school_password123');
    
    console.log('\n👥 Test Accounts:');
    console.log('Admin: admin@school.com / password123');
    console.log('Teacher: john.teacher@school.com / password123');
    console.log('Student: alice.student@school.com / password123');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Update the password in setup-database.js');
    console.log('3. Check if you can connect: psql -U postgres -h localhost');
  }
}

setupDatabase();