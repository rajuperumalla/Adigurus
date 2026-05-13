const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

let conn = null;
async function getConnection() {
    if (conn && mongoose.connection.readyState === 1) return conn;
    conn = await mongoose.connect(MONGODB_URI);
    return conn;
}

const DiscountSchema = new mongoose.Schema(
    { id: { type: Number, unique: true }, code: String, active: Boolean },
    { strict: false, versionKey: false }
);
const Discount = mongoose.models.Discount || mongoose.model('Discount', DiscountSchema);

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        await getConnection();

        const url = new URL(req.url, `http://${req.headers.host}`);
        const parts = url.pathname.split('/').filter(Boolean);
        const discountId = parts[3] ? Number(parts[3]) : null;

        if (req.method === 'GET') {
            const discounts = await Discount.find().sort({ _id: -1 }).lean();
            return res.status(200).json(discounts);
        }

        if (req.method === 'POST') {
            const body = req.body || {};
            if (!body.id) body.id = Date.now();
            body.createdAt = body.createdAt || new Date().toISOString();
            const discount = new Discount(body);
            await discount.save();
            return res.status(201).json({ success: true, discount });
        }

        if (req.method === 'DELETE' && discountId) {
            await Discount.deleteOne({ id: discountId });
            return res.status(200).json({ success: true });
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('[api/admin/discounts] Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
