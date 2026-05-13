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

let notificationsModule = null;
try {
    notificationsModule = require('../../notifications');
} catch (e) {
    // notifications module not available in serverless
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { channel } = req.body || {};
    if (!channel) return res.status(400).json({ error: 'channel required' });

    if (!notificationsModule || !notificationsModule.testChannel) {
        return res.status(200).json({ skipped: true, reason: 'Notification service not available in serverless mode' });
    }

    try {
        await getConnection();
        const settings = await Setting.findById('global').lean() || {};
        const result = await notificationsModule.testChannel(settings, channel);
        res.status(200).json(result);
    } catch (err) {
        console.error('[api/admin/notifications] Error:', err);
        res.status(500).json({ error: err.message });
    }
};
