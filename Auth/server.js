require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const { v5: uuidv5, parse: uuidParse } = require('uuid');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// UUID Namespace - ensures email+pass always creates the same UUID
const NAMESPACE = uuidParse(process.env.UUID_NAMESPACE || '6ba7b810-9dad-11d1-80b4-00c04fd430c8');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_anon_key';

// JWT contains ONLY the UUID for full anonymity
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '24h' });
};

// --- SIGNUP ---
app.post('/signup', async (req, res) => {
  const { email, password, role, department_id, name } = req.body;
  const id = uuidv5(email + password, NAMESPACE);

  try {
    const query = `
      INSERT INTO operators (id, username, email, role, department_id, join_date)
      VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
      RETURNING id, username as name, role, department_id;
    `;
    const values = [id, name, email, role, department_id || null];
    const result = await pool.query(query, values);
    
    const token = generateToken(id);
    res.status(201).json({ token, ...result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: "User already exists" });
    res.status(500).json({ error: err.message });
  }
});

// --- LOGIN ---
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const attemptId = uuidv5(email + password, NAMESPACE);

  try {
    const result = await pool.query(
      'SELECT id, username as name, role, department_id FROM operators WHERE id = $1', 
      [attemptId]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const token = generateToken(user.id);
      res.json({ token, ...user });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Backend running on port 3000'));