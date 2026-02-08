require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const { v5: uuidv5 } = require('uuid');
const jwt = require('jsonwebtoken'); // Added
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

const NAMESPACE = process.env.UUID_NAMESPACE;
const JWT_SECRET = process.env.JWT_SECRET;

// Helper to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '24h' });
};

// --- SIGNUP ROUTE ---
app.post('/signup', async (req, res) => {
  const { email, password, role, department_id } = req.body;
  const id = uuidv5(email + password, NAMESPACE);

  try {
    const query = `
      INSERT INTO operators (id, username, role, department_id, join_date)
      VALUES ($1, $2, $3, $4, CURRENT_DATE)
      RETURNING id, username, role;
    `;
    const result = await pool.query(query, [id, email, role, department_id || null]);
    
    // Create token after successful signup
    const token = generateToken(id);

    res.status(201).json({ 
      message: "Operator created", 
      token, 
      user: result.rows[0] 
    });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: "Username already exists" });
    res.status(500).json({ error: err.message });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const attemptId = uuidv5(email + password, NAMESPACE);

  try {
    const result = await pool.query('SELECT id, username, role FROM operators WHERE id = $1', [attemptId]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const token = generateToken(user.id);

      res.json({ 
        message: "Login successful", 
        token, 
        user 
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Example Protected Route
app.get('/me', authenticateToken, async (req, res) => {
  const result = await pool.query('SELECT * FROM operators WHERE id = $1', [req.user.id]);
  res.json(result.rows[0]);
});

app.listen(3000, () => console.log('Server running on port 3000'));