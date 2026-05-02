/**
 * Adiguru's Local Dev Server
 * Run:  npm install && node server.js
 * Then: http://localhost:3000  (shop) | http://localhost:3000/admin/ (admin)
 * Login: admin@adigurus.com / admin123
 */

const express       = require('express');
const path          = require('path');
const fs            = require('fs');
const crypto        = require('crypto');
const { notifyAll, testChannel } = require('./notifications');

const app      = express();
const PORT     = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');

// ── Middleware ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));

// Serve the whole project as static files
app.use(express.static(__dirname));

// ── In-memory session store (tokens survive server restarts if you use file store) ──
const activeSessions = new Set();

// ── Auth middleware for all /api/admin/* routes ─────────────────
function adminAuth(req, res, next) {
    const auth  = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token || !activeSessions.has(token)) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    next();
}

// ── JSON file helpers ───────────────────────────────────────────
function readData(file) {
    try {
        return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
    } catch {
        return [];
    }
}

function writeData(file, data) {
    fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf8');
}

function readSettings() {
    return readData('settings.json') || {};
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

// Public — shop pages
app.get('/api/products', (req, res) => {
    res.json(readData('products.json'));
});

// Admin — list
app.get('/api/admin/products', adminAuth, (req, res) => {
    res.json(readData('products.json'));
});

// Admin — create
app.post('/api/admin/products', adminAuth, (req, res) => {
    const products = readData('products.json');
    const product  = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
    products.push(product);
    writeData('products.json', products);
    res.status(201).json({ success: true, product });
});

// Admin — update
app.put('/api/admin/products/:id', adminAuth, (req, res) => {
    const products = readData('products.json');
    const id       = Number(req.params.id);
    const idx      = products.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Product not found' });
    products[idx] = { ...products[idx], ...req.body, id };
    writeData('products.json', products);
    res.json({ success: true, product: products[idx] });
});

// Admin — delete
app.delete('/api/admin/products/:id', adminAuth, (req, res) => {
    const products = readData('products.json');
    const id       = Number(req.params.id);
    writeData('products.json', products.filter(p => p.id !== id));
    res.json({ success: true });
});

// Admin — reorder (accepts ordered array of IDs)
app.post('/api/admin/products/reorder', adminAuth, (req, res) => {
    const { ids } = req.body || {};
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });
    const products = readData('products.json');
    const map      = Object.fromEntries(products.map(p => [p.id, p]));
    const reordered = ids.map(id => map[Number(id)]).filter(Boolean);
    // Append any products missing from ids (safety net)
    const inSet    = new Set(ids.map(Number));
    const leftover = products.filter(p => !inSet.has(p.id));
    writeData('products.json', [...reordered, ...leftover]);
    res.json({ success: true });
});

// ════════════════════════════════════════════════════════════════
//  ORDERS
// ════════════════════════════════════════════════════════════════

// Admin — list all orders
app.get('/api/admin/orders', adminAuth, (req, res) => {
    res.json(readData('orders.json'));
});

// Customer — place order
app.post('/api/orders', (req, res) => {
    const orders = readData('orders.json');
    const order  = {
        id:     1000 + orders.length + 1,
        ...req.body,
        date:   new Date().toISOString(),
        status: 'pending'
    };
    orders.unshift(order); // newest first
    writeData('orders.json', orders);
    res.status(201).json({ success: true, order });

    // Fire notifications asynchronously — don't block the response
    const settings = readSettings();
    notifyAll(settings, order).catch(err => console.error('[notify] fatal:', err));
});

// Admin — update order status
app.put('/api/admin/orders/:id/status', adminAuth, (req, res) => {
    const orders = readData('orders.json');
    const id     = Number(req.params.id);
    const order  = orders.find(o => o.id === id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    order.status = req.body.status;
    writeData('orders.json', orders);
    res.json({ success: true, order });
});

// ════════════════════════════════════════════════════════════════
//  DISCOUNTS
// ════════════════════════════════════════════════════════════════

// Admin — list
app.get('/api/admin/discounts', adminAuth, (req, res) => {
    res.json(readData('discounts.json'));
});

// Admin — create
app.post('/api/admin/discounts', adminAuth, (req, res) => {
    const discounts = readData('discounts.json');
    const discount  = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
    discounts.push(discount);
    writeData('discounts.json', discounts);
    res.status(201).json({ success: true, discount });
});

// Admin — delete
app.delete('/api/admin/discounts/:id', adminAuth, (req, res) => {
    const discounts = readData('discounts.json');
    const id        = Number(req.params.id);
    writeData('discounts.json', discounts.filter(d => d.id !== id));
    res.json({ success: true });
});

// Customer — validate coupon code
app.post('/api/discounts/validate', (req, res) => {
    const { code = '' } = req.body || {};
    const discounts     = readData('discounts.json');
    const discount      = discounts.find(d =>
        d.active && d.code && d.code.toLowerCase() === code.trim().toLowerCase()
    );
    if (discount) return res.json({ success: true, discount });
    res.json({ success: false, error: 'Invalid or expired coupon code' });
});

// ════════════════════════════════════════════════════════════════
//  ANALYTICS
// ════════════════════════════════════════════════════════════════

app.get('/api/admin/analytics', adminAuth, (req, res) => {
    const { period = 'weekly' } = req.query;
    const orders   = readData('orders.json');
    const products = readData('products.json');

    const activeOrders = orders.filter(o => o.status !== 'cancelled');
    const now          = new Date();

    // Helper: build an array of {label, sales, orders} for N slots
    function buildSlots(count, labelFn, startFn, endFn) {
        return Array.from({ length: count }, (_, i) => {
            const start  = startFn(i);
            const end    = endFn(i);
            const subset = activeOrders.filter(o => {
                const d = new Date(o.date);
                return d >= start && d <= end;
            });
            return {
                label:  labelFn(i),
                sales:  subset.reduce((s, o) => s + (o.total || 0), 0),
                orders: subset.length
            };
        });
    }

    const daily = buildSlots(7,
        i => new Date(now.getTime() - (6 - i) * 86400000)
                 .toLocaleDateString('en-IN', { weekday: 'short' }),
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

    // Top products: aggregate from itemDetails saved with each order
    const productSales = {};
    activeOrders.forEach(order => {
        (order.itemDetails || []).forEach(item => {
            if (!productSales[item.name]) {
                productSales[item.name] = { name: item.name, sales: 0, revenue: 0 };
            }
            productSales[item.name].sales   += item.qty || 1;
            productSales[item.name].revenue += (item.price || 0) * (item.qty || 1);
        });
    });

    let topProducts = Object.values(productSales)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

    // Fallback to product-catalog estimates when no real order item data exists
    if (!topProducts.length) {
        topProducts = products.slice(0, 5).map(p => ({
            name:    p.name,
            sales:   Math.max(0, 150 - (p.stock || 100)),
            revenue: p.price * Math.max(0, 150 - (p.stock || 100))
        }));
    }

    res.json({
        stats: {
            totalRevenue:  activeOrders.reduce((s, o) => s + (o.total || 0), 0),
            totalOrders:   orders.length,
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

// Get settings (strip sensitive pass from response)
app.get('/api/admin/settings', adminAuth, (req, res) => {
    const s = readSettings();
    // Mask stored password so it isn't sent to browser (show placeholder)
    const safe = { ...s, emailPass: s.emailPass ? '••••••••' : '' };
    res.json(safe);
});

// Save settings — if emailPass is the placeholder, keep existing value
app.put('/api/admin/settings', adminAuth, (req, res) => {
    const existing = readSettings();
    const incoming = req.body || {};
    if (incoming.emailPass === '••••••••') incoming.emailPass = existing.emailPass;
    const merged = { ...existing, ...incoming };
    writeData('settings.json', merged);
    res.json({ success: true });
});

// Test a single notification channel
app.post('/api/admin/notifications/test', adminAuth, async (req, res) => {
    const { channel } = req.body || {};
    if (!channel) return res.status(400).json({ error: 'channel required' });
    const settings = readSettings();
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
    console.log(`\n🌿  Adiguru's Dev Server`);
    console.log(line);
    console.log(`  Shop    →  http://localhost:${PORT}`);
    console.log(`  Admin   →  http://localhost:${PORT}/admin/`);
    console.log(`  Login      admin@adigurus.com / admin123`);
    console.log(line + '\n');
});
