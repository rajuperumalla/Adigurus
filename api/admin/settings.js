const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

let conn = null;
async function getConnection() {
    if (conn && mongoose.connection.readyState === 1) return conn;
    conn = await mongoose.connect(MONGODB_URI);
    return conn;
}

const SettingSchema = new mongoose.Schema(
    { _id: { type: String, default: 'global' } },
    { strict: false, versionKey: false }
);
const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        await getConnection();

        if (req.method === 'GET') {
            const settings = await Setting.findById('global').lean() || {};
            const safe = { ...settings, emailPass: settings.emailPass ? '••••••••' : '' };
            delete safe._id;
            return res.status(200).json(safe);
        }

        if (req.method === 'PUT') {
            const existing = await Setting.findById('global').lean() || {};
            const incoming = req.body || {};
            if (incoming.emailPass === '••••••••') incoming.emailPass = existing.emailPass;
            const merged = { ...existing, ...incoming, _id: 'global' };
            await Setting.findByIdAndUpdate('global', merged, { upsert: true });
            return res.status(200).json({ success: true });
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('[api/admin/settings] Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
