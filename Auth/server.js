// --- Updated generateToken Function ---
// Now accepts id AND name to store in the JWT payload
const generateToken = (userId, name) => {
  return jwt.sign(
    { 
      id: userId, 
      name: name // Including name in the token
    }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

// --- SIGNUP ---
app.post('/signup', async (req, res) => {
  console.log('>>> [SIGNUP START]');
  const { email, password, role, department_id, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  try {
    const id = uuidv5(email + password, NAMESPACE);
    const displayName = name || 'Anonymous'; // Variable to hold the name

    const query = `
      INSERT INTO operators (id, username, role, department_id, join_date)
      VALUES ($1, $2, $3, $4, CURRENT_DATE) 
      RETURNING id, username as name, role, department_id;
    `;
    
    const values = [id, displayName, role || 'user', department_id ? parseInt(department_id) : null];
    const result = await pool.query(query, values);
    
    // Pass displayName to the token generator
    const token = generateToken(id, displayName);
    
    console.log('Step: Signup Success!');
    res.status(201).json({ token, ...result.rows[0] });

  } catch (err) {
    console.error('!!! SIGNUP FAILED !!!', err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- LOGIN ---
app.post('/login', async (req, res) => {
  console.log('>>> [LOGIN START]');
  const { email, password } = req.body;

  try {
    if (!email || !password) throw new Error("Missing credentials");
    
    const attemptId = uuidv5(email + password, NAMESPACE);

    const result = await pool.query(
      'SELECT id, username as name, role, department_id FROM operators WHERE id = $1', 
      [attemptId]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      
      // Pass the name from the database result to the token generator
      const token = generateToken(user.id, user.name);
      
      console.log('Login Success');
      res.json({ token, ...user });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    console.error('!!! LOGIN FAILED !!!', err.message);
    res.status(500).json({ error: err.message });
  }
});