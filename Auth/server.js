require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const { v5: uuidv5, parse: uuidParse } = require('uuid');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Fix for the TypeError: Parse the string namespace into a byte array
const NAMESPACE = uuidParse(process.env.UUID_NAMESPACE || '6ba7b810-9dad-11d1-80b4-00c04fd430c8');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_this';

// Helper: Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '24h' });
};

// --- SIGNUP ---
app.post('/signup', async (req, res) => {
  // Destructure 'name' which is sent by your AuthProvider
  const { email, password, role, department_id, name } = req.body;
  
  // Deterministic ID generation (remains email + password)
  const id = uuidv5(email + password, NAMESPACE);

  try {
    const query = `
      INSERT INTO operators (id, username, role, department_id, join_date)
      VALUES ($1, $2, $3, $4, CURRENT_DATE)
      RETURNING id, username as name, role; 
    `;
    // FIX: Pass 'name' to $2 instead of 'email'
    const values = [id, name, role, department_id || null];
    
    const result = await pool.query(query, values);
    
    const token = generateToken(id);

    // We return 'email' manually in the response since it's not in your DB table
    res.status(201).json({ 
      message: "Signup successful", 
      token, 
      user: { 
        ...result.rows[0], 
        email 
      } 
    });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: "Operator already exists" });
    res.status(500).json({ error: err.message });
  }
});

// --- LOGIN ---
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const attemptId = uuidv5(email + password, NAMESPACE);

  try {
    // Alias 'username' to 'name' to match your Frontend interface
    const result = await pool.query(
      'SELECT id, username as name, role, department_id FROM operators WHERE id = $1', 
      [attemptId]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const token = generateToken(user.id);
      
      res.json({ 
        message: "Login successful", 
        token, 
        user: { ...user, email } // Sending email back so frontend context has it
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});