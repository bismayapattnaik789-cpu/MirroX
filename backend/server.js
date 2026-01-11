/**
 * MirrorX Backend Server
 * Tech Stack: Node.js, Express, Firebase Admin (Firestore), Razorpay, JWT
 * Resilience: Auto-fallback to In-Memory DB if Firebase Credentials missing
 */

import dotenv from 'dotenv';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';

// Initialize Environment and Telemetry
dotenv.config();
enableFirebaseTelemetry();

console.log("Starting MirrorX Backend Service (Firebase Edition)...");

import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const app = express();

// --- CONFIG ---
const JWT_SECRET = process.env.JWT_SECRET || 'mirrorx_super_secret_key_change_in_prod';
// Use Environment Variable or Default to Demo ID
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "1006878217030-lr0053lovhenvbj7l2g5u4jftm4gt0d2.apps.googleusercontent.com"; 
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- RESILIENCE DATA LAYER ---

// 1. In-Memory Store (Fallback)
const memoryDb = {
    users: [],
    credits: [],
    wardrobe: [],
    transactions: []
};

// 2. Firebase Admin Initialization (Primary)
let dbClient = null;
let isFirebaseActive = false;

try {
    // Checks for GOOGLE_APPLICATION_CREDENTIALS env var or default service account path
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT) {
        let cert;
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
             cert = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        }
        
        admin.initializeApp({
            credential: cert ? admin.credential.cert(cert) : admin.credential.applicationDefault()
        });
        dbClient = getFirestore();
        isFirebaseActive = true;
        console.log(">> Firebase Admin SDK Initialized (Firestore Active)");
    } else {
        throw new Error("No Credential provided");
    }
} catch (e) {
    console.warn("!! Firebase Init Failed/Skipped:", e.message);
    console.warn("!! Running in MEMORY MODE. Data will be lost on restart.");
    isFirebaseActive = false;
}

// 3. Data Adapters (The Resilience Logic)
const db = {
    // --- USERS ---
    getUserByEmail: async (email) => {
        if (isFirebaseActive) {
            try {
                const snapshot = await dbClient.collection('users').where('email', '==', email).limit(1).get();
                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    return { id: doc.id, ...doc.data() };
                }
                return null;
            } catch (e) { console.error("FS Error:", e); }
        }
        return memoryDb.users.find(u => u.email === email);
    },
    
    createUser: async (userData) => {
        // Prepare data with timestamps
        const finalData = { ...userData, created_at: new Date().toISOString() };
        
        if (isFirebaseActive) {
            const res = await dbClient.collection('users').add(finalData);
            return { id: res.id, ...finalData };
        }
        // Fallback
        const newUser = { id: 'mem_' + Date.now(), ...finalData };
        memoryDb.users.push(newUser);
        return newUser;
    },

    updateUserGoogleId: async (id, googleId, avatar) => {
        if (isFirebaseActive) {
            await dbClient.collection('users').doc(id).update({ google_id: googleId, avatar_url: avatar });
            return;
        }
        const user = memoryDb.users.find(u => u.id === id);
        if (user) { user.google_id = googleId; user.avatar_url = avatar; }
    },

    // --- CREDITS ---
    getCredits: async (userId) => {
        if (isFirebaseActive) {
            const snapshot = await dbClient.collection('user_credits').where('user_id', '==', userId).limit(1).get();
            if (!snapshot.empty) {
                return snapshot.docs[0].data();
            }
            // Create default if not exists
            const defaultCreds = { user_id: userId, daily_credits: 5, purchased_credits: 0 };
            await dbClient.collection('user_credits').add(defaultCreds);
            return defaultCreds;
        }
        
        let creds = memoryDb.credits.find(c => c.user_id === userId);
        if (!creds) {
            creds = { user_id: userId, daily_credits: 5, purchased_credits: 0 };
            memoryDb.credits.push(creds);
        }
        return creds;
    },

    deductCredit: async (userId) => {
        let creds;
        let docId;

        if (isFirebaseActive) {
            const snapshot = await dbClient.collection('user_credits').where('user_id', '==', userId).limit(1).get();
            if (snapshot.empty) throw new Error("Credits not found");
            creds = snapshot.docs[0].data();
            docId = snapshot.docs[0].id;
        } else {
            creds = memoryDb.credits.find(c => c.user_id === userId);
        }
        
        let updateData = {};
        if (creds.daily_credits > 0) {
            updateData = { daily_credits: creds.daily_credits - 1 };
        } else if (creds.purchased_credits > 0) {
            updateData = { purchased_credits: creds.purchased_credits - 1 };
        } else {
            throw new Error("Insufficient Credits");
        }

        if (isFirebaseActive) {
            await dbClient.collection('user_credits').doc(docId).update(updateData);
            return { ...creds, ...updateData };
        }
        
        // Memory Update
        Object.assign(creds, updateData);
        return creds;
    },

    addPurchasedCredits: async (userId, amount) => {
        if (isFirebaseActive) {
            const snapshot = await dbClient.collection('user_credits').where('user_id', '==', userId).limit(1).get();
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const current = doc.data();
                const newTotal = (current.purchased_credits || 0) + amount;
                await dbClient.collection('user_credits').doc(doc.id).update({ purchased_credits: newTotal });
                return { ...current, purchased_credits: newTotal };
            }
        }
        
        let creds = memoryDb.credits.find(c => c.user_id === userId);
        if (creds) creds.purchased_credits += amount;
        return creds;
    },

    // --- WARDROBE ---
    getWardrobe: async (userId) => {
        if (isFirebaseActive) {
            const snapshot = await dbClient.collection('wardrobe')
                .where('user_id', '==', userId)
                .orderBy('created_at', 'desc')
                .get();
            
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        return memoryDb.wardrobe.filter(w => w.user_id === userId).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    },

    addToWardrobe: async (userId, image) => {
        const item = { user_id: userId, image_data: image, created_at: new Date().toISOString() };
        if (isFirebaseActive) {
            const res = await dbClient.collection('wardrobe').add(item);
            return { id: res.id, ...item };
        }
        const memItem = { id: 'mem_' + Date.now(), ...item };
        memoryDb.wardrobe.push(memItem);
        return memItem;
    },
    
    // --- TRANSACTIONS ---
    logTransaction: async (txData) => {
        const finalData = { ...txData, created_at: new Date().toISOString() };
        if (isFirebaseActive) {
            await dbClient.collection('transactions').add(finalData);
            return;
        }
        memoryDb.transactions.push({ id: 'mem_' + Date.now(), ...finalData });
    }
};

// --- ROUTES ---

app.get('/', (req, res) => res.send('MirrorX Backend Active (Firebase Edition)'));

// Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    
    // Allow our custom tokens or verify proper JWT
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// 1. SIGNUP
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, name, phone } = req.body;
    try {
        const existing = await db.getUserByEmail(email);
        if (existing) return res.status(409).json({ error: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D4AF37&color=000`;

        const user = await db.createUser({
            email,
            password_hash: hash,
            name,
            phone,
            avatar_url: avatar
        });

        // Init credits
        await db.getCredits(user.id);

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ user: { ...user, credits: { daily: 5, purchased: 0 } }, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Signup Failed" });
    }
});

// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.getUserByEmail(email);
        if (!user) return res.status(400).json({ error: "User not found" });
        
        if (!user.password_hash) return res.status(400).json({ error: "Please login with Google" });
        
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(400).json({ error: "Invalid password" });

        const credits = await db.getCredits(user.id);
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

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
        console.error(err);
        res.status(500).json({ error: "Login failed" });
    }
});

// 3. GOOGLE AUTH
app.post('/api/auth/google', async (req, res) => {
    const { credential } = req.body;
    try {
        let payload;
        // Verify or Decode
        if (GOOGLE_CLIENT_ID) {
            try {
                const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
                payload = ticket.getPayload();
            } catch (e) {
                payload = jwt.decode(credential);
            }
        } else {
            payload = jwt.decode(credential);
        }

        if (!payload) return res.status(400).json({ error: "Invalid Token" });

        const { sub: googleId, email, name, picture } = payload;
        let user = await db.getUserByEmail(email);

        if (!user) {
            user = await db.createUser({
                google_id: googleId,
                email,
                name,
                avatar_url: picture
            });
        } else if (!user.google_id) {
            await db.updateUserGoogleId(user.id, googleId, picture);
            user.avatar_url = picture; // update local ref
        }

        const credits = await db.getCredits(user.id);
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

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
        console.error(err);
        res.status(500).json({ error: "Google Auth Failed" });
    }
});

// 4. WARDROBE
app.get('/api/wardrobe', authenticateToken, async (req, res) => {
    try {
        const items = await db.getWardrobe(req.user.id);
        // Normalize for frontend
        const normalized = items.map(i => ({
            id: i.id.toString(),
            image: i.image_data,
            timestamp: new Date(i.created_at).getTime()
        }));
        res.json(normalized);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Fetch failed" });
    }
});

app.post('/api/wardrobe', authenticateToken, async (req, res) => {
    const { image } = req.body;
    try {
        const item = await db.addToWardrobe(req.user.id, image);
        res.json({ id: item.id.toString(), image: item.image_data, timestamp: new Date(item.created_at).getTime() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Save failed" });
    }
});

// 5. CREDITS
app.post('/api/credits/deduct', authenticateToken, async (req, res) => {
    try {
        const updated = await db.deductCredit(req.user.id);
        res.json({ daily: updated.daily_credits, purchased: updated.purchased_credits });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
});

// 6. PAYMENTS (Razorpay)
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
            receipt: "rcpt_" + Date.now()
        });
        res.json(order);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/api/payment/verify', authenticateToken, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, creditsToAdd, amount } = req.body;
    
    // In demo/test mode we can be lenient or use the real secret verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret').update(body.toString()).digest('hex');

    // Allow mock signature for demo resilience
    const isValid = (razorpay_signature === expectedSignature) || (razorpay_signature === 'mock_sig');

    if (isValid) {
        try {
            await db.logTransaction({
                user_id: req.user.id,
                razorpay_order_id,
                razorpay_payment_id,
                amount,
                credits_purchased: creditsToAdd,
                status: 'success',
                created_at: new Date()
            });
            const newCreds = await db.addPurchasedCredits(req.user.id, creditsToAdd);
            res.json({ 
                success: true, 
                credits: { daily: newCreds.daily_credits, purchased: newCreds.purchased_credits } 
            });
        } catch (e) {
            console.error(e);
            res.status(500).json({ success: false, error: "Tx Log Failed" });
        }
    } else {
        res.status(400).json({ success: false, error: "Invalid Signature" });
    }
});

// START
const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`MirrorX Backend listening on port ${PORT}`);
    if(!isFirebaseActive) console.log("!! NOTE: GOOGLE_APPLICATION_CREDENTIALS missing. Using Memory Mode.");
});