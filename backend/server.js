
/**
 * MirrorX Backend Server
 * Tech Stack: Node.js, Express, Postgres (AlloyDB), Razorpay, JWT, Bcrypt
 */

require('dotenv').config();
console.log("Starting MirrorX Backend Service...");

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const app = express();

// --- CONFIG ---
const JWT_SECRET = process.env.JWT_SECRET || 'mirrorx_super_secret_key_change_in_prod';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID; 
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Enable CORS for all origins (Update this in production)
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- HEALTH CHECK ---
app.get('/', (req, res) => {
  res.status(200).send('MirrorX Backend is active');
});

// --- DATABASE CONNECTION ---
const pool = new Pool({
  host: process.env.DB_HOST || '10.0.0.2',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'mirrorx',
  ssl: { rejectUnauthorized: false } 
});

// Create Tables if not exist (Bootstrapping)
const initDb = async () => {
    try {
        const client = await pool.connect();
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255),
                name VARCHAR(255),
                phone VARCHAR(50),
                avatar_url TEXT,
                google_id VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS user_credits (
                user_id INTEGER REFERENCES users(id),
                daily_credits INTEGER DEFAULT 5,
                purchased_credits INTEGER DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS wardrobe (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                image_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                razorpay_order_id VARCHAR(255),
                razorpay_payment_id VARCHAR(255),
                amount INTEGER,
                credits_purchased INTEGER,
                status VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        client.release();
        console.log("Database tables verified/created.");
    } catch (err) {
        console.error("DB Init Error:", err);
    }
};
initDb();

// --- MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---

// 1. Sign Up (Email/Password/Phone)
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, name, phone } = req.body;
    
    if (!email || !password || !name) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const client = await pool.connect();
        
        // Check existing
        const check = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) {
            client.release();
            return res.status(409).json({ error: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D4AF37&color=000`;

        // Insert
        const result = await client.query(
            'INSERT INTO users (email, password_hash, name, phone, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, avatar_url, phone',
            [email, hash, name, phone, avatar]
        );
        const user = result.rows[0];
        
        // Init Credits
        await client.query('INSERT INTO user_credits (user_id) VALUES ($1)', [user.id]);
        
        // Generate Token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        client.release();
        
        // Return user + token + credits
        res.json({ 
            user: { ...user, credits: { daily: 5, purchased: 0 } }, 
            token 
        });

    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 2. Login (Email/Password)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            client.release();
            return res.status(400).json({ error: "User not found" });
        }

        const user = result.rows[0];
        
        // If user signed up via Google but tries password login (and has no password set)
        if (!user.password_hash) {
             client.release();
             return res.status(400).json({ error: "Please login with Google" });
        }

        const validPass = await bcrypt.compare(password, user.password_hash);
        if (!validPass) {
            client.release();
            return res.status(400).json({ error: "Invalid password" });
        }

        // Get credits
        const credRes = await client.query('SELECT * FROM user_credits WHERE user_id = $1', [user.id]);
        const credits = credRes.rows[0] || { daily_credits: 5, purchased_credits: 0 };

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        client.release();
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar_url,
                phone: user.phone,
                credits: { daily: credits.daily_credits, purchased: credits.purchased_credits }
            },
            token
        });

    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

// 3. Google Login (Real Verification)
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body; // The ID token from client
  
  try {
    let payload;
    
    // Verify Token if Client ID is configured
    if (GOOGLE_CLIENT_ID) {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    } else {
        // Fallback for development/demo without GCP credentials setup
        // Decode JWT without signature verification just to extract info (NOT SECURE FOR PROD)
        console.warn("GOOGLE_CLIENT_ID not set. Skipping signature verification.");
        payload = jwt.decode(credential); 
    }

    if (!payload) throw new Error("Invalid Token");

    const { sub: googleId, email, name, picture } = payload;
    
    const client = await pool.connect();
    let userRes = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;
    
    if (userRes.rows.length === 0) {
      // Create new user via Google
      const insertRes = await client.query(
        'INSERT INTO users (google_id, email, name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
        [googleId, email, name, picture]
      );
      user = insertRes.rows[0];
      await client.query('INSERT INTO user_credits (user_id) VALUES ($1)', [user.id]);
    } else {
      user = userRes.rows[0];
      // Link Google ID if not linked
      if (!user.google_id) {
          await client.query('UPDATE users SET google_id = $1, avatar_url = $2 WHERE id = $3', [googleId, picture, user.id]);
      }
      await client.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    }
    
    const credRes = await client.query('SELECT * FROM user_credits WHERE user_id = $1', [user.id]);
    const credits = credRes.rows[0];

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    client.release();
    res.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar_url,
            credits: { daily: credits.daily_credits, purchased: credits.purchased_credits }
        },
        token
    });

  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});


// --- PROTECTED ROUTES (Require Token) ---

// 1. Wardrobe: Get
app.get('/api/wardrobe', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM wardrobe WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wardrobe' });
  }
});

// 2. Wardrobe: Save
app.post('/api/wardrobe', authenticateToken, async (req, res) => {
  const { image } = req.body;
  try {
    const result = await pool.query('INSERT INTO wardrobe (user_id, image_data) VALUES ($1, $2) RETURNING *', [req.user.id, image]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save item' });
  }
});

// 3. Credits: Deduct
app.post('/api/credits/deduct', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM user_credits WHERE user_id = $1', [req.user.id]);
    const creds = result.rows[0];
    
    if (creds.daily_credits > 0) {
      await client.query('UPDATE user_credits SET daily_credits = daily_credits - 1 WHERE user_id = $1', [req.user.id]);
    } else if (creds.purchased_credits > 0) {
      await client.query('UPDATE user_credits SET purchased_credits = purchased_credits - 1 WHERE user_id = $1', [req.user.id]);
    } else {
      client.release();
      return res.status(403).json({ error: 'Insufficient credits' });
    }
    const updated = await client.query('SELECT * FROM user_credits WHERE user_id = $1', [req.user.id]);
    client.release();
    res.json({ daily: updated.rows[0].daily_credits, purchased: updated.rows[0].purchased_credits });
  } catch (err) {
    res.status(500).json({ error: 'Credit update failed' });
  }
});

// --- RAZORPAY & PAYMENTS ---

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret'
});

app.post('/api/payment/order', authenticateToken, async (req, res) => {
  const { amount, credits } = req.body;
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
      notes: { credits_to_add: credits, user_id: req.user.id }
    });
    res.json(order);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/api/payment/verify', authenticateToken, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, creditsToAdd, amount } = req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest('hex');
    
  if (expectedSignature === razorpay_signature) {
    try {
      const client = await pool.connect();
      await client.query(
        'INSERT INTO transactions (user_id, razorpay_order_id, razorpay_payment_id, amount, credits_purchased, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [req.user.id, razorpay_order_id, razorpay_payment_id, amount, creditsToAdd, 'success']
      );
      await client.query('UPDATE user_credits SET purchased_credits = purchased_credits + $1 WHERE user_id = $2', [creditsToAdd, req.user.id]);
      const updatedCreds = await client.query('SELECT * FROM user_credits WHERE user_id = $1', [req.user.id]);
      client.release();
      res.json({ success: true, credits: { daily: updatedCreds.rows[0].daily_credits, purchased: updatedCreds.rows[0].purchased_credits } });
    } catch (dbErr) {
      res.status(500).json({ success: false, error: "DB Error" });
    }
  } else {
    res.status(400).json({ success: false, error: "Invalid Signature" });
  }
});

// --- SERVER LISTEN ---
const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MirrorX Backend listening on port ${PORT}`);
});
