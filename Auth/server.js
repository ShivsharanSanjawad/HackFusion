require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const { v5: uuidv5, parse: uuidParse } = require('uuid');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Log DB Config on Startup (Check your terminal for this)
console.log('--- DB Config Check ---');
console.log('User:', process.env.DB_USER);
console.log('DB Name:', process.env.DB_NAME);
console.log('Host:', process.env.DB_HOST);
console.log('-----------------------');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test DB Connection immediately
pool.connect((err, client, release) => {
  if (err) {
    return console.error('CRITICAL: Could not connect to PostgreSQL', err.stack);
  }
  console.log('SUCCESS: Database connected');
  release();
});

const NAMESPACE_STR = process.env.UUID_NAMESPACE || '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
let NAMESPACE;
try {
  NAMESPACE = uuidParse(NAMESPACE_STR);
} catch (e) {
  console.error("CRITICAL: Invalid UUID_NAMESPACE in .env");
}

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_anon_key';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '24h' });
};

// --- SIGNUP ---
app.post('/signup', async (req, res) => {
  console.log('>>> [SIGNUP START]');
  console.log('Payload:', req.body);

  const { email, password, role, department_id, name } = req.body;

  // 1. Check for missing fields that cause crashes
  if (!email || !password) {
    console.error('ERROR: Missing email or password in request');
    return res.status(400).json({ error: "Missing email or password" });
  }

  try {
    // 2. UUID Generation Debug
    console.log('Step: Generating UUID...');
    const id = uuidv5(email + password, NAMESPACE);
    console.log('Generated ID:', id);

    // 3. Database Query Debug
    const query = `
      INSERT INTO operators (id, username, role, department_id, join_date)
      VALUES ($1, $2, $3, $4, CURRENT_DATE) 
      RETURNING id, username as name, role, department_id;
    `;
    
    // Ensure data types are safe
    const values = [
      id, 
      name || 'Anonymous', 
      role || 'user', 
      department_id ? parseInt(department_id) : null 
    ];

    console.log('Step: Executing Query with values:', values);
    const result = await pool.query(query, values);
    
    console.log('Step: Query Success!');
    const token = generateToken(id);
    res.status(201).json({ token, ...result.rows[0] });

  } catch (err) {
    console.error('!!! SIGNUP FAILED !!!');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('Error Code:', err.code); // e.g., '42P01' (table missing) or '42703' (column missing)
    console.error('Error Detail:', err.detail);
    
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: err.message,
      code: err.code 
    });
  }
});

// --- LOGIN ---
app.post('/login', async (req, res) => {
  console.log('>>> [LOGIN START]');
  const { email, password } = req.body;

  try {
    if (!email || !password) throw new Error("Missing credentials");
    
    const attemptId = uuidv5(email + password, NAMESPACE);
    console.log('Searching for ID:', attemptId);

    const result = await pool.query(
      'SELECT id, username as name, role, department_id FROM operators WHERE id = $1', 
      [attemptId]
    );

    if (result.rows.length > 0) {
      console.log('Login Success');
      const user = result.rows[0];
      const token = generateToken(user.id);
      res.json({ token, ...user });
    } else {
      console.log('Login Failed: Invalid credentials');
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    console.error('!!! LOGIN FAILED !!!', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Backend running on port 3000'));