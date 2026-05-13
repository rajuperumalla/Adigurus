const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

let conn = null;
async function getConnection() {
    if (conn && mongoose.connection.readyState === 1) return conn;
    conn = await mongoose.connect(MONGODB_URI);
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

        const url = new URL(req.url, `http://${req.headers.host}`);
        const parts = url.pathname.split('/').filter(Boolean);
        // ['api','admin','orders'] or ['api','admin','orders','123','status']
        const orderId = parts[3] ? Number(parts[3]) : null;
        const action = parts[4] || null;

        if (req.method === 'GET') {
            const orders = await Order.find().sort({ id: -1 }).lean();
            return res.status(200).json(orders);
        }

        if (req.method === 'PUT' && orderId && action === 'status') {
            const { status } = req.body || {};
            const order = await Order.findOneAndUpdate(
                { id: orderId },
                { $set: { status } },
                { new: true, lean: true }
            );
            if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
            return res.status(200).json({ success: true, order });
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('[api/admin/orders] Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
