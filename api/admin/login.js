// api/admin/login.js — Vercel Serverless Function
// POST /api/admin/login — admin authentication

const crypto = require('crypto');

// In-memory session store (reused across warm lambda invocations)
global._adminSessions = global._adminSessions || new Set();

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, password } = req.body || {};

    const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@adigurus.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const token = 'tok_' + crypto.randomBytes(20).toString('hex');
        global._adminSessions.add(token);
        return res.json({
            success: true,
            token,
            user: { id: 1, name: 'Admin User', email, role: 'super_admin' }
        });
    }

    return res.status(401).json({ success: false, error: 'Invalid credentials' });
};
