// api/admin/orders.js — Vercel Serverless Function
// GET  /api/admin/orders — returns all orders for the admin panel
// PUT  /api/admin/orders — update order status

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'adigurus-admin-2025';

let conn = null;
async function getConnection() {
    if (conn && mongoose.connection.readyState === 1) return conn;
    conn = await mongoose.connect(MONGODB_URI, {
        serverApi: { version: '1', strict: true, deprecationErrors: true }
    });
    return conn;
}

const OrderSchema = new mongoose.Schema(
    { id: { type: Number, unique: true }, date: String, status: String },
    { strict: false, versionKey: false }
);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        await getConnection();

        // GET — fetch all orders
        if (req.method === 'GET') {
            const orders = await Order.find().sort({ id: -1 }).lean();
            return res.status(200).json(orders);
        }

        res.status(405).json({ error: 'Method not allowed' });

    } catch (err) {
        console.error('[api/admin/orders] Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
