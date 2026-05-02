/**
 * Adiguru's Notification Service
 * Admin channels : Email (SMTP), WhatsApp (Twilio), Telegram Bot, Slack Webhook
 * Customer channels: Order-confirmation email + WhatsApp to customer's own number
 * All channels fail silently — a missing credential skips that channel.
 */

'use strict';

// ── Shared Twilio helper ──────────────────────────────────────────────────────
async function twilioSend(twilioSid, twilioToken, twilioFrom, toNumber, body) {
    const from = twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`;
    const to   = toNumber.startsWith('whatsapp:')   ? toNumber   : `whatsapp:${toNumber}`;
    const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
    const res  = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
            method:  'POST',
            headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body:    new URLSearchParams({ From: from, To: to, Body: body })
        }
    );
    return res.json();
}

// ── Shared Nodemailer transporter ─────────────────────────────────────────────
function makeTransporter(emailUser, emailPass, emailService) {
    const nodemailer = require('nodemailer');
    return nodemailer.createTransport({ service: emailService, auth: { user: emailUser, pass: emailPass } });
}

// ── Item rows HTML helper ──────────────────────────────────────────────────────
function itemRowsHtml(order) {
    return (order.itemDetails || [])
        .map(i => `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">${i.name}</td>
            <td style="padding:8px 12px;text-align:center;border-bottom:1px solid #f3f4f6;">×${i.qty}</td>
            <td style="padding:8px 12px;text-align:right;border-bottom:1px solid #f3f4f6;font-weight:600;">₹${(i.price * i.qty).toFixed(2)}</td>
        </tr>`)
        .join('');
}

// ════════════════════════════════════════════════════════════════
//  ADMIN NOTIFICATIONS
// ════════════════════════════════════════════════════════════════

// ── Admin Email ───────────────────────────────────────────────────────────────
async function sendEmail(settings, order) {
    const { notificationEmail, emailUser, emailPass, emailService = 'gmail' } = settings;
    if (!notificationEmail || !emailUser || !emailPass) return { skipped: true, reason: 'Email not configured' };

    let nodemailer;
    try { nodemailer = require('nodemailer'); }
    catch { return { skipped: true, reason: 'nodemailer not installed — run npm install' }; }

    const transporter = nodemailer.createTransport({ service: emailService, auth: { user: emailUser, pass: emailPass } });
    const itemRows    = itemRowsHtml(order);

    const html = `
    <div style="font-family:sans-serif;max-width:540px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="background:#4A6741;padding:24px 32px;">
        <h2 style="margin:0;color:#fff;font-size:20px;">🛒 New Order Received</h2>
        <p style="margin:4px 0 0;color:#D4AF37;font-size:14px;">Adiguru's Admin Notification</p>
      </div>
      <div style="padding:24px 32px;">
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr><td style="color:#6b7280;padding:4px 0;">Order ID</td><td style="font-weight:700;text-align:right;">#${order.id}</td></tr>
          <tr><td style="color:#6b7280;padding:4px 0;">Customer</td><td style="text-align:right;">${order.customer}</td></tr>
          <tr><td style="color:#6b7280;padding:4px 0;">Email</td><td style="text-align:right;">${order.email}</td></tr>
          <tr><td style="color:#6b7280;padding:4px 0;">Phone</td><td style="text-align:right;">${order.phone}</td></tr>
          <tr><td style="color:#6b7280;padding:4px 0;">Payment</td><td style="text-align:right;text-transform:uppercase;">${order.paymentMethod || 'N/A'}</td></tr>
          <tr><td style="color:#6b7280;padding:4px 0;">Address</td><td style="text-align:right;">${order.address}</td></tr>
        </table>
        ${itemRows ? `
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:16px;">
          <thead><tr style="background:#f9fafb;">
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;">Item</th>
            <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280;">Qty</th>
            <th style="padding:8px 12px;text-align:right;font-size:12px;color:#6b7280;">Amount</th>
          </tr></thead>
          <tbody>${itemRows}</tbody>
        </table>` : ''}
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:600;color:#166534;">Total Amount</span>
          <span style="font-size:20px;font-weight:700;color:#166534;">₹${(order.total || 0).toFixed(2)}</span>
        </div>
        <p style="margin-top:20px;font-size:12px;color:#9ca3af;text-align:center;">
          This is an automated notification from your Adiguru's store.
        </p>
      </div>
    </div>`;

    try {
        await transporter.sendMail({
            from:    `"Adiguru's Store" <${emailUser}>`,
            to:      notificationEmail,
            subject: `🛒 New Order #${order.id} — ₹${(order.total || 0).toFixed(2)} from ${order.customer}`,
            html
        });
        return { success: true, channel: 'email' };
    } catch (err) {
        return { error: err.message, channel: 'email' };
    }
}

// ── Admin WhatsApp ────────────────────────────────────────────────────────────
async function sendWhatsApp(settings, order) {
    const { twilioSid, twilioToken, twilioFrom, whatsappNumber } = settings;
    if (!twilioSid || !twilioToken || !whatsappNumber) return { skipped: true, reason: 'WhatsApp / Twilio not configured' };

    const body = [
        `🛒 *New Order #${order.id}* — Adiguru's`,
        `👤 Customer: ${order.customer}`,
        `📞 Phone: ${order.phone}`,
        `💰 Total: ₹${(order.total || 0).toFixed(2)}`,
        `📦 Items: ${order.items || 0}`,
        `💳 Payment: ${(order.paymentMethod || 'N/A').toUpperCase()}`,
        `📍 ${order.address}`,
        `🔖 Status: *Pending* — log in to admin to update.`
    ].join('\n');

    try {
        const data = await twilioSend(twilioSid, twilioToken, twilioFrom, whatsappNumber, body);
        if (data.sid) return { success: true, channel: 'whatsapp', sid: data.sid };
        return { error: data.message || 'Twilio error', channel: 'whatsapp' };
    } catch (err) {
        return { error: err.message, channel: 'whatsapp' };
    }
}

// ── Telegram Bot ───────────────────────────────────────────────────────────────
async function sendTelegram(settings, order) {
    const { telegramBotToken, telegramChatId } = settings;
    if (!telegramBotToken || !telegramChatId) return { skipped: true, reason: 'Telegram not configured' };

    const text = [
        `🛒 *New Order \\#${order.id}* — Adiguru's`,
        ``,
        `👤 *Customer:* ${order.customer}`,
        `📞 *Phone:* ${order.phone}`,
        `📧 *Email:* ${order.email}`,
        `💰 *Total:* ₹${(order.total || 0).toFixed(2)}`,
        `📦 *Items:* ${order.items || 0}`,
        `💳 *Payment:* ${(order.paymentMethod || 'N/A').toUpperCase()}`,
        `📍 *Address:* ${order.address}`,
        `🔖 *Status:* Pending`
    ].join('\n');

    try {
        const res  = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ chat_id: telegramChatId, text, parse_mode: 'MarkdownV2' })
        });
        const data = await res.json();
        if (data.ok) return { success: true, channel: 'telegram' };
        return { error: data.description || 'Telegram error', channel: 'telegram' };
    } catch (err) {
        return { error: err.message, channel: 'telegram' };
    }
}

// ── Slack Incoming Webhook ─────────────────────────────────────────────────────
async function sendSlack(settings, order) {
    const { slackWebhookUrl } = settings;
    if (!slackWebhookUrl) return { skipped: true, reason: 'Slack not configured' };

    const payload = {
        text: `🛒 *New Order #${order.id}* received on Adiguru's!`,
        blocks: [
            { type: 'header', text: { type: 'plain_text', text: `🛒 New Order #${order.id} — ₹${(order.total || 0).toFixed(2)}` } },
            {
                type: 'section',
                fields: [
                    { type: 'mrkdwn', text: `*Customer:*\n${order.customer}` },
                    { type: 'mrkdwn', text: `*Phone:*\n${order.phone}` },
                    { type: 'mrkdwn', text: `*Email:*\n${order.email}` },
                    { type: 'mrkdwn', text: `*Payment:*\n${(order.paymentMethod || 'N/A').toUpperCase()}` },
                    { type: 'mrkdwn', text: `*Items:*\n${order.items || 0}` },
                    { type: 'mrkdwn', text: `*Total:*\n₹${(order.total || 0).toFixed(2)}` }
                ]
            },
            { type: 'section', text: { type: 'mrkdwn', text: `*Address:* ${order.address}` } },
            { type: 'divider' },
            { type: 'context', elements: [{ type: 'mrkdwn', text: `Status: *Pending* • Adiguru's Admin Notification` }] }
        ]
    };

    try {
        const res = await fetch(slackWebhookUrl, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload)
        });
        if (res.ok) return { success: true, channel: 'slack' };
        return { error: await res.text(), channel: 'slack' };
    } catch (err) {
        return { error: err.message, channel: 'slack' };
    }
}

// ════════════════════════════════════════════════════════════════
//  CUSTOMER CONFIRMATION NOTIFICATIONS
// ════════════════════════════════════════════════════════════════

// ── Customer Order-Confirmation Email ─────────────────────────────────────────
async function sendCustomerEmail(settings, order) {
    const { emailUser, emailPass, emailService = 'gmail', customerEmailEnabled } = settings;
    // Skip if customer notifications disabled or email creds missing or no customer email
    if (!customerEmailEnabled) return { skipped: true, reason: 'Customer email notifications disabled' };
    if (!emailUser || !emailPass) return { skipped: true, reason: 'Email SMTP not configured' };
    if (!order.email) return { skipped: true, reason: 'No customer email in order' };

    let nodemailer;
    try { nodemailer = require('nodemailer'); }
    catch { return { skipped: true, reason: 'nodemailer not installed' }; }

    const transporter = makeTransporter(emailUser, emailPass, emailService);
    const itemRows    = itemRowsHtml(order);

    const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:auto;background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#4A6741 0%,#6a9660 100%);padding:28px 32px;text-align:center;">
        <div style="font-size:40px;margin-bottom:8px;">🌿</div>
        <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Order Confirmed!</h1>
        <p style="margin:6px 0 0;color:#d4f0cc;font-size:14px;">Thank you for shopping with Adiguru's</p>
      </div>

      <!-- Body -->
      <div style="padding:28px 32px;">
        <p style="font-size:15px;color:#374151;margin:0 0 20px;">
          Hi <strong>${order.customer}</strong>, your order has been received and is being processed. 🎉
        </p>

        <!-- Order summary box -->
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <span style="font-size:13px;color:#6b7280;">Order ID</span>
            <span style="font-weight:700;color:#1f2937;font-size:15px;">#${order.id}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <span style="font-size:13px;color:#6b7280;">Payment Method</span>
            <span style="font-weight:600;color:#1f2937;text-transform:uppercase;">${order.paymentMethod || 'N/A'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:13px;color:#6b7280;">Delivery Address</span>
            <span style="font-size:13px;color:#1f2937;text-align:right;max-width:280px;">${order.address}</span>
          </div>
        </div>

        <!-- Items table -->
        ${itemRows ? `
        <h3 style="font-size:14px;font-weight:700;color:#374151;margin:0 0 10px;">Your Items</h3>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:16px;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">Product</th>
              <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600;">Qty</th>
              <th style="padding:8px 12px;text-align:right;font-size:12px;color:#6b7280;font-weight:600;">Amount</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>` : ''}

        <!-- Totals -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:13px;">Subtotal</td>
            <td style="text-align:right;font-size:13px;color:#374151;">₹${(order.subtotal || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:13px;">Shipping</td>
            <td style="text-align:right;font-size:13px;color:#374151;">${(order.shipping || 0) === 0 ? '<span style="color:#16a34a;font-weight:600;">FREE</span>' : `₹${(order.shipping || 0).toFixed(2)}`}</td>
          </tr>
          <tr>
            <td colspan="2" style="border-top:1px solid #e5e7eb;padding-top:8px;"></td>
          </tr>
          <tr>
            <td style="font-weight:700;font-size:15px;color:#166534;">Total Paid</td>
            <td style="text-align:right;font-weight:700;font-size:18px;color:#166534;">₹${(order.total || 0).toFixed(2)}</td>
          </tr>
        </table>

        <!-- What's next -->
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin-bottom:20px;">
          <p style="margin:0;font-size:13px;color:#92400e;font-weight:600;">📦 What happens next?</p>
          <p style="margin:6px 0 0;font-size:13px;color:#78350f;">
            Our team will verify your order and dispatch it within 1–2 business days.
            You'll receive a shipping update on this email and your WhatsApp number.
          </p>
        </div>

        <p style="font-size:13px;color:#6b7280;text-align:center;margin:0;">
          Questions? Reply to this email or WhatsApp us at the number on our website.<br>
          <strong style="color:#4A6741;">Adiguru's Ayurvedic Wellness</strong>
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:14px 32px;text-align:center;">
        <p style="margin:0;font-size:11px;color:#9ca3af;">
          This is an automated order confirmation. Please do not reply directly to this email.
        </p>
      </div>
    </div>`;

    try {
        await transporter.sendMail({
            from:    `"Adiguru's Store" <${emailUser}>`,
            to:      order.email,
            subject: `✅ Order Confirmed #${order.id} — Thank you, ${order.customer}!`,
            html
        });
        return { success: true, channel: 'customer_email' };
    } catch (err) {
        return { error: err.message, channel: 'customer_email' };
    }
}

// ── Customer WhatsApp Confirmation ────────────────────────────────────────────
async function sendCustomerWhatsApp(settings, order) {
    const { twilioSid, twilioToken, twilioFrom, customerWhatsAppEnabled } = settings;
    if (!customerWhatsAppEnabled) return { skipped: true, reason: 'Customer WhatsApp notifications disabled' };
    if (!twilioSid || !twilioToken || !twilioFrom) return { skipped: true, reason: 'Twilio not configured' };
    if (!order.phone) return { skipped: true, reason: 'No customer phone in order' };

    // Normalise Indian number to E.164 for Twilio
    const rawPhone  = order.phone.replace(/\s/g, '');
    const e164Phone = rawPhone.startsWith('+') ? rawPhone
                    : rawPhone.startsWith('0')  ? '+91' + rawPhone.slice(1)
                    : '+91' + rawPhone;

    const itemList = (order.itemDetails || [])
        .map(i => `  • ${i.name} ×${i.qty}  ₹${(i.price * i.qty).toFixed(2)}`)
        .join('\n');

    const body = [
        `✅ *Order Confirmed — Adiguru's!*`,
        ``,
        `Hi ${order.customer}, your order is placed.`,
        ``,
        `🆔 *Order ID:* #${order.id}`,
        `💳 *Payment:* ${(order.paymentMethod || 'N/A').toUpperCase()}`,
        `📍 *Deliver to:* ${order.address}`,
        ``,
        `🛍️ *Items:*`,
        itemList,
        ``,
        `${order.shipping === 0 ? '🚚 Shipping: FREE' : `🚚 Shipping: ₹${(order.shipping||0).toFixed(2)}`}`,
        `💰 *Total: ₹${(order.total || 0).toFixed(2)}*`,
        ``,
        `We'll dispatch within 1–2 business days. Thank you! 🌿`
    ].join('\n');

    try {
        const data = await twilioSend(twilioSid, twilioToken, twilioFrom, e164Phone, body);
        if (data.sid) return { success: true, channel: 'customer_whatsapp', sid: data.sid };
        return { error: data.message || 'Twilio error', channel: 'customer_whatsapp' };
    } catch (err) {
        return { error: err.message, channel: 'customer_whatsapp' };
    }
}

// ════════════════════════════════════════════════════════════════
//  FIRE ALL
// ════════════════════════════════════════════════════════════════

async function notifyAll(settings, order) {
    const results = await Promise.allSettled([
        // Admin channels
        sendEmail(settings, order),
        sendWhatsApp(settings, order),
        sendTelegram(settings, order),
        sendSlack(settings, order),
        // Customer confirmation channels
        sendCustomerEmail(settings, order),
        sendCustomerWhatsApp(settings, order),
    ]);
    results.forEach(r => {
        const v = r.value || r.reason;
        if (v?.error)        console.error(`[notify] ${v.channel}: ${v.error}`);
        else if (v?.skipped) console.log(`[notify] ${v.channel || '?'} skipped — ${v.reason}`);
        else if (v?.success) console.log(`[notify] ${v.channel} ✓`);
    });
    return results.map(r => r.value || { error: String(r.reason) });
}

// ── Test a single channel with a dummy order ──────────────────────────────────
async function testChannel(settings, channel) {
    const dummy = {
        id: 9999, customer: 'Test Customer', email: 'test@adigurus.com',
        phone: '+919999999999', total: 499, subtotal: 449, shipping: 50, items: 2,
        itemDetails: [{ name: 'Medicated Hair Oil', price: 250, qty: 2 }],
        address: '123 Test Street, Hyderabad, Telangana, 500001',
        paymentMethod: 'upi'
    };
    switch (channel) {
        case 'email':            return sendEmail(settings, dummy);
        case 'whatsapp':         return sendWhatsApp(settings, dummy);
        case 'telegram':         return sendTelegram(settings, dummy);
        case 'slack':            return sendSlack(settings, dummy);
        case 'customer_email':   return sendCustomerEmail(settings, dummy);
        case 'customer_whatsapp':return sendCustomerWhatsApp(settings, dummy);
        default:                 return { error: 'Unknown channel' };
    }
}

module.exports = { notifyAll, testChannel };
