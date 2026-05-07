// api/admin/products.js — Vercel Serverless Function
// GET    /api/admin/products        — list all products
// POST   /api/admin/products        — create product
// PUT    /api/admin/products/:id    — update product
// DELETE /api/admin/products/:id    — delete product

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

let conn = null;
async function getConnection() {
    if (conn && mongoose.connection.readyState === 1) return conn;
    conn = await mongoose.connect(MONGODB_URI, {
        serverApi: { version: '1', strict: true, deprecationErrors: true }
    });
    return conn;
}

const ProductSchema = new mongoose.Schema(
    { id: { type: Number, unique: true } },
    { strict: false, versionKey: false }
);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        await getConnection();

        if (req.method === 'GET') {
            const products = await Product.find().sort({ _id: 1 }).lean();
            return res.status(200).json(products);
        }

        if (req.method === 'POST') {
            const product = new Product({ id: Date.now(), ...req.body, createdAt: new Date().toISOString() });
            await product.save();
            return res.status(201).json({ success: true, product });
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('[api/admin/products] Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
