const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const SEED_PRODUCTS = [
  { id:1,  name:'Medicated Hair Oil',          category:'Hair Care',   price:250, stock:150, discount:10, badge:'Best Seller',   image:'', description:'Traditional Ayurvedic hair oil with bhringraj and amla',      createdAt:'2025-01-01T00:00:00.000Z' },
  { id:2,  name:'Pain Relief Balm',             category:'Pain Relief', price:180, stock:200, discount:0,  badge:'Hot Sale',       image:'', description:'Herbal pain relief balm for joints and muscles',             createdAt:'2025-01-01T00:00:00.000Z' },
  { id:3,  name:'Neem Face Wash',               category:'Skin Care',   price:220, stock:120, discount:15, badge:'30% Discount',   image:'', description:'Natural neem-based face wash for clear skin',               createdAt:'2025-01-01T00:00:00.000Z' },
  { id:4,  name:'Ashwagandha Capsules',         category:'Wellness',    price:450, stock:80,  discount:0,  badge:'Recently Added', image:'', description:'Pure ashwagandha root extract for stress relief and energy', createdAt:'2025-01-01T00:00:00.000Z' },
  { id:5,  name:'Triphala Churna',              category:'Supplements', price:320, stock:95,  discount:5,  badge:'',               image:'', description:'Classic Ayurvedic digestive and detox powder',               createdAt:'2025-01-01T00:00:00.000Z' },
  { id:6,  name:'Kumkumadi Tailam',             category:'Skin Care',   price:580, stock:60,  discount:0,  badge:'New Product',    image:'', description:'Luxury saffron face oil for glowing skin',                   createdAt:'2025-01-01T00:00:00.000Z' },
  { id:7,  name:'Joint Care Oil',               category:'Pain Relief', price:290, stock:110, discount:10, badge:'',               image:'', description:'Ayurvedic oil for joint pain and arthritis relief',           createdAt:'2025-01-01T00:00:00.000Z' },
  { id:8,  name:'Brahmi Ghee',                  category:'Wellness',    price:520, stock:45,  discount:0,  badge:'Limited Stock',  image:'', description:'Memory enhancer with brahmi and pure ghee',                  createdAt:'2025-01-01T00:00:00.000Z' },
  { id:9,  name:'Medicated Hair Oil (2 Pack)',  category:'Hair Care',   price:250, stock:100, discount:11, badge:'Best Seller',    image:'', description:'Dandruff, Itchy Scalp & Hairfall — double pack value',       createdAt:'2025-01-01T00:00:00.000Z' },
  { id:10, name:'Pain Relief Oil',              category:'Pain Relief', price:220, stock:150, discount:12, badge:'Popular',        image:'', description:'Joint, Muscle & Body Care',                                  createdAt:'2025-01-01T00:00:00.000Z' },
  { id:11, name:'Universal Oil',                category:'Wellness',    price:99,  stock:200, discount:8,  badge:'',               image:'', description:'Headache, Sinus & Cold Relief',                              createdAt:'2025-01-01T00:00:00.000Z' },
  { id:12, name:'Sleep Balm',                   category:'Wellness',    price:90,  stock:180, discount:17, badge:'',               image:'', description:'Deep Sleep & Relaxation',                                    createdAt:'2025-01-01T00:00:00.000Z' },
  { id:13, name:'Herbal Inhaler',               category:'Wellness',    price:135, stock:120, discount:16, badge:'',               image:'', description:'Cold, Sinus & Headaches',                                    createdAt:'2025-01-01T00:00:00.000Z' },
  { id:14, name:'Charcoal Soap',                category:'Skin Care',   price:110, stock:160, discount:27, badge:'',               image:'', description:'Deep Cleansing & Detox',                                     createdAt:'2025-01-01T00:00:00.000Z' },
];

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

async function ensureSeeded() {
    try {
        const ops = SEED_PRODUCTS.map(p => ({
            updateOne: {
                filter: { id: p.id },
                update: { $setOnInsert: p },
                upsert: true
            }
        }));
        await Product.bulkWrite(ops, { ordered: false });
    } catch (_) { /* non-fatal */ }
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        await getConnection();
        await ensureSeeded();
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        const products = await Product.find().sort({ _id: 1 }).lean();
        return res.status(200).json(products);
    } catch (err) {
        console.error('[api/products] Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
