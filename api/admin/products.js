const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

let conn = null;
async function getConnection() {
    if (conn && mongoose.connection.readyState === 1) return conn;
    conn = await mongoose.connect(MONGODB_URI);
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

        const url = new URL(req.url, `http://${req.headers.host}`);
        const parts = url.pathname.split('/').filter(Boolean);
        // parts: ['api','admin','products'] or ['api','admin','products','123'] or ['api','admin','products','reorder']
        const subPath = parts[3] || null;

        if (req.method === 'GET') {
            const products = await Product.find().sort({ _id: 1 }).lean();
            return res.status(200).json(products);
        }

        if (req.method === 'POST' && subPath === 'reorder') {
            const { ids } = req.body || {};
            if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });
            const products = await Product.find().lean();
            const map = Object.fromEntries(products.map(p => [p.id, p]));
            const reordered = ids.map(id => map[Number(id)]).filter(Boolean);
            const inSet = new Set(ids.map(Number));
            const leftover = products.filter(p => !inSet.has(p.id));
            const finalOrder = [...reordered, ...leftover];
            await Product.deleteMany({});
            if (finalOrder.length) await Product.insertMany(finalOrder);
            return res.status(200).json({ success: true });
        }

        if (req.method === 'POST') {
            const body = req.body || {};
            if (!body.id) body.id = Date.now();
            body.createdAt = body.createdAt || new Date().toISOString();
            const product = new Product(body);
            await product.save();
            return res.status(201).json({ success: true, product });
        }

        if (req.method === 'PUT' && subPath) {
            const id = Number(subPath);
            const updated = await Product.findOneAndUpdate(
                { id },
                { $set: { ...req.body, id } },
                { new: true, lean: true }
            );
            if (!updated) return res.status(404).json({ success: false, error: 'Product not found' });
            return res.status(200).json({ success: true, product: updated });
        }

        if (req.method === 'DELETE' && subPath) {
            const id = Number(subPath);
            await Product.deleteOne({ id });
            return res.status(200).json({ success: true });
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('[api/admin/products] Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
