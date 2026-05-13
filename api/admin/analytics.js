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

const ProductSchema = new mongoose.Schema(
    { id: { type: Number, unique: true } },
    { strict: false, versionKey: false }
);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        await getConnection();

        const url = new URL(req.url, `http://${req.headers.host}`);
        const period = url.searchParams.get('period') || 'weekly';

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
            i => { const d = new Date(now); d.setDate(d.getDate() - (6 - i)); return d.toLocaleDateString('en-IN', { weekday: 'short' }); },
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
                revenue: (p.price || 0) * Math.max(0, 150 - (p.stock || 100))
            }));
        }

        res.status(200).json({
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
    } catch (err) {
        console.error('[api/admin/analytics] Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
