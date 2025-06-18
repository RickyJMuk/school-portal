import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Update with your MySQL root password if any
  database: 'school_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const initDatabase = async () => {
  try {
    // Read schema and seed SQL files
    const schemaSql = fs.readFileSync(path.resolve('./server/database/schema.sql'), 'utf-8');
    const seedSql = fs.readFileSync(path.resolve('./server/database/seed.sql'), 'utf-8');

    // Get a connection from the pool
    const connection = await pool.getConnection();

    try {
      // Execute schema SQL to create tables
      await connection.query(schemaSql);

      // Execute seed SQL to insert sample data
      await connection.query(seedSql);

      console.log('Database initialized successfully');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Wrapper functions for query execution to mimic previous API
export const db = {
  getAsync: async (query, params) => {
    const [rows] = await pool.execute(query, params);
    return rows[0];
  },
  allAsync: async (query, params) => {
    const [rows] = await pool.execute(query, params);
    return rows;
  },
  runAsync: async (query, params) => {
    const [result] = await pool.execute(query, params);
    return result;
  }
};

export { pool };
