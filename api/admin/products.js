const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

// Canonical product list — single source of truth for seeding
const SEED_PRODUCTS = [
  { id:1,  name:'Medicated Hair Oil',          category:'Hair Care',   price:250, stock:150, discount:10, badge:'Best Seller',   image:'', description:'Traditional Ayurvedic hair oil with bhringraj and amla',      createdAt:'2025-01-01T00:00:00.000Z' },
  { id:2,  name:'Pain Relief Balm',             category:'Pain Relief', price:180, stock:200, discount:0,  badge:'Hot Sale',       image:'', description:'Herbal pain relief balm for joints and muscles',             createdAt:'2025-01-01T00:00:00.000Z' },
  { id:3,  name:'Neem Face Wash',               category:'Skin Care',   price:220, stock:120, discount:15, badge:'30% Discount',   image:'', description:'Natural neem-based face wash for clear skin',               createdAt:'2025-01-01T00:00:00.000Z' },
  { id:4,  name:'Ashwagandha Capsules',         category:'Wellness',    price:450, stock:80,  discount:0,  badge:'Recently Added', image:'', description:'Pure ashwagandha root extract for stress relief and energy', createdAt:'2025-01-01T00:00:00.000Z' },
  { id:5,  name:'Triphala Churna',              category:'Supplements', price:320, stock:95,  discount:5,  badge:'',               image:'', description:'Classic Ayurvedic digestive and detox powder',               createdAt:'2025-01-01T00:00:00.000Z' },
  { id:6,  name:'Kumkumadi Tailam',             category:'Skin Care',   price:580, stock:60,  discount:0,  badge:'New Product',    image:'', description:'Luxury saffron face oil for glowing skin',                   createdAt:'2025-01-01T00:00:00.000Z' },
  { id:7,  name:'Joint Care Oil',               category:'Pain Relief', price:290, stock:110, discount:10, badge:'',               image:'', description:'Ayurvedic oil for joint pain and arthritis relief',           createdAt:'2025-01-01T00:00:00.000Z' },
  { id:8,  name:'Brahmi Ghee',                  category:'Wellness',    price:520, stock:45,  discount:0,  badge:'Limited Stock',  image:'', description:'Memory enhancer with brahmi and pure ghee',                  createdAt:'2025-01-01T00:00:00.000Z' },
  { id:9,  name:'Medicated Hair Oil (2 Pack)',  category:'Hair Care',   price:250, stock:100, discount:11, badge:'Best Seller',   image:'', description:'Dandruff, Itchy Scalp & Hairfall — double pack value',       createdAt:'2025-01-01T00:00:00.000Z' },
  { id:10, name:'Pain Relief Oil',              category:'Pain Relief', price:220, stock:150, discount:12, badge:'Popular',        image:'', description:'Joint, Muscle & Body Care',                                  createdAt:'2025-01-01T00:00:00.000Z' },
  { id:11, name:'Universal Oil',                category:'Wellness',    price:99,  stock:200, discount:8,  badge:'',               image:'', description:'Headache, Sinus & Cold Relief',                              createdAt:'2025-01-01T00:00:00.000Z' },
  { id:12, name:'Sleep Balm',                   category:'Wellness',    price:90,  stock:180, discount:17, badge:'',               image:'', description:'Deep Sleep & Relaxation',                                    createdAt:'2025-01-01T00:00:00.000Z' },
  { id:13, name:'Herbal Inhaler',               category:'Wellness',    price:135, stock:120, discount:16, badge:'',               image:'', description:'Cold, Sinus & Headaches',                                    createdAt:'2025-01-01T00:00:00.000Z' },
  { id:14, name:'Charcoal Soap',                category:'Skin Care',   price:110, stock:160, discount:27, badge:'',               image:'', description:'Deep Cleansing & Detox',                                     createdAt:'2025-01-01T00:00:00.000Z' },
];

let conn = null;
let seeded = false;

async function getConnection() {
    if (conn && mongoose.connection.readyState === 1) return conn;
    conn = await mongoose.connect(MONGODB_URI);
    return conn;
}

async function ensureSeeded() {
    if (seeded) return;
    seeded = true;
    try {
        const ops = SEED_PRODUCTS.map(p => ({
            updateOne: { filter: { id: p.id }, update: { $setOnInsert: p }, upsert: true }
        }));
        await Product.bulkWrite(ops, { ordered: false });
    } catch (_) { /* non-fatal */ }
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
        await ensureSeeded();

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
