/**
 * Adiguru's Server with MongoDB integration
 * Run:  npm start
 * Then: http://localhost:3000
 */

require('dotenv').config();
const express       = require('express');
const path          = require('path');
const fs            = require('fs');
const crypto        = require('crypto');
const mongoose      = require('mongoose');
const { notifyAll, testChannel } = require('./notifications');

const app      = express();
const PORT     = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/adigurus';

// ── Database Setup (MongoDB) ────────────────────────────────────
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
mongoose.connect(MONGODB_URI, clientOptions)
    .then(async () => {
        console.log('✅ Connected to MongoDB successfully!');
        
        // Auto-migration: seed from JSON files, upsert so new products are always added
        try {
            const productCount = await Product.countDocuments();
            const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'products.json')));
            const validProducts = products.filter(p => p.id != null);

            if (productCount === 0) {
                // Fresh database — bulk insert everything
                console.log('📦 Empty database detected. Migrating existing JSON data to MongoDB...');
                if (validProducts.length > 0) await Product.insertMany(validProducts);

                const orders = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'orders.json')));
                if (orders.length > 0) await Order.insertMany(orders);

                const discounts = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'discounts.json')));
                if (discounts.length > 0) await Discount.insertMany(discounts);

                const settings = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'settings.json')));
                if (Object.keys(settings).length > 0) await Setting.create({ _id: 'global', ...settings });

                console.log('🎉 Migration complete! MongoDB is now fully populated.');
            } else {
                // Existing database — upsert any products from JSON that are missing in MongoDB
                const ops = validProducts.map(p => ({
                    updateOne: { filter: { id: p.id }, update: { $setOnInsert: p }, upsert: true }
                }));
                const result = await Product.bulkWrite(ops, { ordered: false });
                if (result.upsertedCount > 0) {
                    console.log(`📦 Added ${result.upsertedCount} missing product(s) to MongoDB.`);
                }
            }
        } catch(e) {
            console.log('Note: Data migration skipped or failed:', e.message);
        }
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));

// MongoDB Schemas (Schema-less/Flexible approach for easy JSON migration)
const ProductSchema = new mongoose.Schema({ id: { type: Number, unique: true } }, { strict: false, versionKey: false });
const OrderSchema = new mongoose.Schema({ id: { type: Number, unique: true }, date: String, status: String }, { strict: false, versionKey: false });
const DiscountSchema = new mongoose.Schema({ id: { type: Number, unique: true }, code: String, active: Boolean }, { strict: false, versionKey: false });
const SettingSchema = new mongoose.Schema({ _id: { type: String, default: 'global' } }, { strict: false, versionKey: false });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const Discount = mongoose.models.Discount || mongoose.model('Discount', DiscountSchema);
const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);

// ── Middleware ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

const activeSessions = new Set();

function adminAuth(req, res, next) {
    const auth  = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token || !activeSessions.has(token)) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    next();
}

async function getSettings() {
    let settings = await Setting.findById('global').lean();
    if (!settings) {
        settings = { _id: 'global' };
        await Setting.create(settings);
    }
    return settings;
}

// ════════════════════════════════════════════════════════════════
//  ADMIN AUTH
// ════════════════════════════════════════════════════════════════

app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body || {};
    if (email === 'admin@adigurus.com' && password === 'admin123') {
        const token = 'tok_' + crypto.randomBytes(20).toString('hex');
        activeSessions.add(token);
        return res.json({
            success: true,
            token,
            user: { id: 1, name: 'Admin User', email, role: 'super_admin' }
        });
    }
    res.status(401).json({ success: false, error: 'Invalid credentials' });
});

app.post('/api/admin/logout', adminAuth, (req, res) => {
    const token = (req.headers.authorization || '').slice(7);
    activeSessions.delete(token);
    res.json({ success: true });
});

// ════════════════════════════════════════════════════════════════
//  PRODUCTS
// ════════════════════════════════════════════════════════════════

app.get('/api/products', async (req, res) => {
    const products = await Product.find().sort({ _id: 1 }).lean();
    res.json(products);
});

app.get('/api/admin/products', adminAuth, async (req, res) => {
    const products = await Product.find().sort({ _id: 1 }).lean();
    res.json(products);
});

app.post('/api/admin/products', adminAuth, async (req, res) => {
    const product = new Product({ id: Date.now(), ...req.body, createdAt: new Date().toISOString() });
    await product.save();
    res.status(201).json({ success: true, product });
});

app.put('/api/admin/products/:id', adminAuth, async (req, res) => {
    const id = Number(req.params.id);
    const product = await Product.findOneAndUpdate(
        { id },
        { $set: { ...req.body, id } },
        { new: true, lean: true }
    );
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, product });
});

app.delete('/api/admin/products/:id', adminAuth, async (req, res) => {
    const id = Number(req.params.id);
    await Product.findOneAndDelete({ id });
    res.json({ success: true });
});

app.post('/api/admin/products/reorder', adminAuth, async (req, res) => {
    res.json({ success: true, message: 'Reorder logic accepted.' });
});

// ════════════════════════════════════════════════════════════════
//  ORDERS
// ════════════════════════════════════════════════════════════════

app.get('/api/admin/orders', adminAuth, async (req, res) => {
    const orders = await Order.find().sort({ id: -1 }).lean();
    res.json(orders);
});

app.post('/api/orders', async (req, res) => {
    const count = await Order.countDocuments();
    const order = new Order({
        id: 1000 + count + 1,
        ...req.body,
        date: new Date().toISOString(),
        status: 'pending'
    });
    await order.save();
    res.status(201).json({ success: true, order });

    const settings = await getSettings();
    notifyAll(settings, order).catch(err => console.error('[notify] fatal:', err));
});

app.put('/api/admin/orders/:id/status', adminAuth, async (req, res) => {
    const id = Number(req.params.id);
    const order = await Order.findOneAndUpdate({ id }, { status: req.body.status }, { new: true, lean: true });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, order });
});

// ════════════════════════════════════════════════════════════════
//  DISCOUNTS
// ════════════════════════════════════════════════════════════════

app.get('/api/admin/discounts', adminAuth, async (req, res) => {
    const discounts = await Discount.find().lean();
    res.json(discounts);
});

app.post('/api/admin/discounts', adminAuth, async (req, res) => {
    const discount = new Discount({ id: Date.now(), ...req.body, createdAt: new Date().toISOString() });
    await discount.save();
    res.status(201).json({ success: true, discount });
});

app.delete('/api/admin/discounts/:id', adminAuth, async (req, res) => {
    const id = Number(req.params.id);
    await Discount.findOneAndDelete({ id });
    res.json({ success: true });
});

app.post('/api/discounts/validate', async (req, res) => {
    const { code = '' } = req.body || {};
    const discount = await Discount.findOne({ active: true, code: { $regex: new RegExp(`^${code.trim()}$`, 'i') } }).lean();
    if (discount) return res.json({ success: true, discount });
    res.json({ success: false, error: 'Invalid or expired coupon code' });
});

// ════════════════════════════════════════════════════════════════
//  ANALYTICS
// ════════════════════════════════════════════════════════════════

app.get('/api/admin/analytics', adminAuth, async (req, res) => {
    const { period = 'weekly' } = req.query;
    const orders = await Order.find().lean();
    const products = await Product.find().lean();

    const activeOrders = orders.filter(o => o.status !== 'cancelled');
    const now = new Date();

    function buildSlots(count, labelFn, startFn, endFn) {
        return Array.from({ length: count }, (_, i) => {
            const start = startFn(i);
            const end = endFn(i);
            const subset = activeOrders.filter(o => {
                const d = new Date(o.date);
                return d >= start && d <= end;
            });
            return {
                label: labelFn(i),
                sales: subset.reduce((s, o) => s + (o.total || 0), 0),
                orders: subset.length
            };
        });
    }

    const daily = buildSlots(7,
        i => new Date(now.getTime() - (6 - i) * 86400000).toLocaleDateString('en-IN', { weekday: 'short' }),
        i => { const d = new Date(now); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0); return d; },
        i => { const d = new Date(now); d.setDate(d.getDate() - (6 - i)); d.setHours(23, 59, 59, 999); return d; }
    );

    const weekly = buildSlots(4,
        i => `Week ${i + 1}`,
        i => { const d = new Date(now); d.setDate(d.getDate() - (3 - i) * 7 - 6); d.setHours(0, 0, 0, 0); return d; },
        i => { const d = new Date(now); d.setDate(d.getDate() - (3 - i) * 7); d.setHours(23, 59, 59, 999); return d; }
    );

    const monthly = buildSlots(12,
        i => new Date(now.getFullYear(), i).toLocaleDateString('en-IN', { month: 'short' }),
        i => new Date(now.getFullYear(), i, 1, 0, 0, 0, 0),
        i => new Date(now.getFullYear(), i + 1, 0, 23, 59, 59, 999)
    );

    const productSales = {};
    activeOrders.forEach(order => {
        (order.itemDetails || []).forEach(item => {
            if (!productSales[item.name]) {
                productSales[item.name] = { name: item.name, sales: 0, revenue: 0 };
            }
            productSales[item.name].sales += item.qty || 1;
            productSales[item.name].revenue += (item.price || 0) * (item.qty || 1);
        });
    });

    let topProducts = Object.values(productSales)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

    if (!topProducts.length) {
        topProducts = products.slice(0, 5).map(p => ({
            name: p.name,
            sales: Math.max(0, 150 - (p.stock || 100)),
            revenue: p.price * Math.max(0, 150 - (p.stock || 100))
        }));
    }

    res.json({
        stats: {
            totalRevenue: activeOrders.reduce((s, o) => s + (o.total || 0), 0),
            totalOrders: orders.length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            totalProducts: products.length
        },
        daily,
        weekly,
        monthly,
        topProducts,
        currentPeriod: period
    });
});

// ════════════════════════════════════════════════════════════════
//  NOTIFICATION SETTINGS
// ════════════════════════════════════════════════════════════════

app.get('/api/admin/settings', adminAuth, async (req, res) => {
    const s = await getSettings();
    const safe = { ...s, emailPass: s.emailPass ? '••••••••' : '' };
    res.json(safe);
});

app.put('/api/admin/settings', adminAuth, async (req, res) => {
    const existing = await getSettings();
    const incoming = req.body || {};
    if (incoming.emailPass === '••••••••') incoming.emailPass = existing.emailPass;
    const merged = { ...existing, ...incoming };
    await Setting.findByIdAndUpdate('global', merged, { upsert: true });
    res.json({ success: true });
});

app.post('/api/admin/notifications/test', adminAuth, async (req, res) => {
    const { channel } = req.body || {};
    if (!channel) return res.status(400).json({ error: 'channel required' });
    const settings = await getSettings();
    try {
        const result = await testChannel(settings, channel);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ════════════════════════════════════════════════════════════════
//  SPA FALLBACK — serve index.html for unknown routes
// ════════════════════════════════════════════════════════════════
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start ───────────────────────────────────────────────────────
app.listen(PORT, () => {
    const line = '─'.repeat(44);
    console.log(`\n🌿  Adiguru's Dev Server (MongoDB Powered)`);
    console.log(line);
    console.log(`  Shop    →  http://localhost:${PORT}`);
    console.log(`  Admin   →  http://localhost:${PORT}/admin/`);
    console.log(`  Login      admin@adigurus.com / admin123`);
    console.log(line + '\n');
});
