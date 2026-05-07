// api/orders.js — Vercel Serverless Function
// Handles:  POST /api/orders  (place order)
//           GET  /api/orders  (admin: list all orders)

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

// ── Mongoose singleton (reuse connection across warm invocations) ──────────
let conn = null;
async function getConnection() {
    if (conn && mongoose.connection.readyState === 1) return conn;
    conn = await mongoose.connect(MONGODB_URI, {
        serverApi: { version: '1', strict: true, deprecationErrors: true }
    });
    return conn;
}

// ── Schema ─────────────────────────────────────────────────────────────────
const OrderSchema = new mongoose.Schema(
    { id: { type: Number, unique: true }, date: String, status: String },
    { strict: false, versionKey: false }
);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

// ── Handler ────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
    // CORS headers so the browser on adigurus.vercel.app can call this
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        await getConnection();

        // ── POST /api/orders — customer places a new order ─────────────────
        if (req.method === 'POST') {
            const count = await Order.countDocuments();
            const order = new Order({
                id:     1000 + count + 1,
                ...req.body,
                date:   new Date().toISOString(),
                status: 'pending'
            });
            await order.save();
            return res.status(201).json({ success: true, order });
        }

        // ── GET /api/orders — admin fetches all orders ─────────────────────
        if (req.method === 'GET') {
            const orders = await Order.find().sort({ id: -1 }).lean();
            return res.status(200).json(orders);
        }

        res.status(405).json({ error: 'Method not allowed' });

    } catch (err) {
        console.error('[api/orders] Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
