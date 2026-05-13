/**
 * Adiguru's Admin Dashboard - FIXED VERSION
 * Production-ready admin panel with authentication, order management, product management, and analytics
 *
 * Key fixes in this version:
 *  - window.Admin now points DIRECTLY to UI (preserves `this` for all methods)
 *  - Analytics period switching properly destroys/recreates charts
 *  - Analytics labels correctly map daily/weekly/monthly data shapes
 *  - filterProducts actually filters instead of re-rendering everything
 *  - Dashboard charts destroyed on re-render (no leaks/overlap)
 *  - Null-safe notification badge updates
 *  - Image preview cleared properly when opening Add/Edit modal
 *  - Mock analytics built ONCE per call so dashboard + analytics stay in sync
 */

// ============================================
// CONFIGURATION & STATE
// ============================================

const API_BASE = '/api/admin';
const CLOUDINARY_CLOUD_NAME = 'your-cloud-name';
const CLOUDINARY_UPLOAD_PRESET = 'your-preset';

const state = {
    currentUser: null,
    token: null,
    currentPage: 'dashboard',
    orders: [],
    products: [],
    discounts: [],
    notifications: [],
    productCategoryFilter: 'all',
    stats: {
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        pendingOrders: 0
    },
    charts: {
        sales: null,
        topProducts: null,
        revenue: null,
        orders: null
    }
};

// ============================================
// AUTHENTICATION MODULE
// ============================================

const Auth = {
    async login(email, password) {
        try {
            const response = await this.mockLogin(email, password);
            if (response.success) {
                state.token = response.token;
                state.currentUser = response.user;
                localStorage.setItem('admin_token', response.token);
                localStorage.setItem('admin_user', JSON.stringify(response.user));
                return { success: true };
            }
            return { success: false, error: response.error };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Login failed. Please try again.' };
        }
    },

    async mockLogin(email, password) {
        try {
            const res = await fetch('/api/admin/login', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email, password })
            });
            return res.json();
        } catch {
            return { success: false, error: 'Cannot reach server. Is it running?' };
        }
    },

    logout() {
        state.token = null;
        state.currentUser = null;
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.reload();
    },

    checkAuth() {
        const token = localStorage.getItem('admin_token');
        const user = localStorage.getItem('admin_user');
        if (token && user) {
            state.token = token;
            state.currentUser = JSON.parse(user);
            return true;
        }
        return false;
    }
};

// ============================================
// API SERVICE MODULE  (real HTTP calls)
// ============================================

const API = {
    // Shared fetch helper — injects Bearer token and JSON content-type
    async _req(url, options = {}) {
        const headers = { 'Content-Type': 'application/json' };
        if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
        const res = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
            throw new Error(err.error || `HTTP ${res.status}`);
        }
        return res.json();
    },

    async getOrders() {
        try {
            return await this._req('/api/admin/orders');
        } catch (e) {
            console.error('getOrders:', e.message);
            return [];
        }
    },

    async updateOrderStatus(orderId, status) {
        try {
            const data = await this._req(`/api/admin/orders/${orderId}/status`, {
                method: 'PUT',
                body:   JSON.stringify({ status })
            });
            // Sync local state immediately so UI re-renders without a full reload
            const order = state.orders.find(o => o.id === orderId);
            if (order) order.status = status;
            return data;
        } catch (e) {
            console.error('updateOrderStatus:', e.message);
            return { success: false, error: e.message };
        }
    },

    async getProducts() {
        try {
            return await this._req('/api/admin/products');
        } catch (e) {
            console.error('getProducts:', e.message);
            return [];
        }
    },

    async saveProduct(productData) {
        try {
            const url    = productData.id ? `/api/admin/products/${productData.id}` : '/api/admin/products';
            const method = productData.id ? 'PUT' : 'POST';
            const data   = await this._req(url, { method, body: JSON.stringify(productData) });
            if (data.success) {
                if (productData.id) {
                    const idx = state.products.findIndex(p => p.id == productData.id);
                    if (idx !== -1) state.products[idx] = data.product;
                } else {
                    state.products.push(data.product);
                }
            }
            return data;
        } catch (e) {
            console.error('saveProduct:', e.message);
            return { success: false, error: e.message };
        }
    },

    async deleteProduct(productId) {
        try {
            const data = await this._req(`/api/admin/products/${productId}`, { method: 'DELETE' });
            if (data.success) state.products = state.products.filter(p => p.id !== productId);
            return data;
        } catch (e) {
            console.error('deleteProduct:', e.message);
            return { success: false, error: e.message };
        }
    },

    async uploadImage(file) {
        // Local dev: convert to data-URL for preview (no Cloudinary required)
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload  = (e) => resolve({ success: true, url: e.target.result });
            reader.onerror = ()  => resolve({ success: false, error: 'Upload failed' });
            reader.readAsDataURL(file);
        });
    },

    async getDiscounts() {
        try {
            return await this._req('/api/admin/discounts');
        } catch (e) {
            console.error('getDiscounts:', e.message);
            return [];
        }
    },

    async saveDiscount(discountData) {
        try {
            const data = await this._req('/api/admin/discounts', {
                method: 'POST',
                body:   JSON.stringify(discountData)
            });
            if (data.success) state.discounts.push(data.discount);
            return data;
        } catch (e) {
            console.error('saveDiscount:', e.message);
            return { success: false, error: e.message };
        }
    },

    async deleteDiscount(discountId) {
        try {
            const data = await this._req(`/api/admin/discounts/${discountId}`, { method: 'DELETE' });
            if (data.success) state.discounts = state.discounts.filter(d => d.id !== discountId);
            return data;
        } catch (e) {
            console.error('deleteDiscount:', e.message);
            return { success: false, error: e.message };
        }
    },

    async getAnalytics(period = 'weekly') {
        try {
            return await this._req(`/api/admin/analytics?period=${period}`);
        } catch (e) {
            console.error('getAnalytics:', e.message);
            return { daily: [], weekly: [], monthly: [], topProducts: [], currentPeriod: period };
        }
    },

    async getSettings() {
        try { return await this._req('/api/admin/settings'); }
        catch (e) { console.error('getSettings:', e.message); return {}; }
    },

    async saveSettings(data) {
        try { return await this._req('/api/admin/settings', { method: 'PUT', body: JSON.stringify(data) }); }
        catch (e) { return { error: e.message }; }
    },

    async testNotification(channel) {
        try { return await this._req('/api/admin/notifications/test', { method: 'POST', body: JSON.stringify({ channel }) }); }
        catch (e) { return { error: e.message }; }
    }
};

// ============================================
// UI MODULE
// ============================================

const UI = {
    // Used by analytics period switcher
    currentAnalyticsPeriod: 'weekly',

    init() {
        this.setupEventListeners();
        this.checkAuthentication();
    },

    setupEventListeners() {
        document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });

        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(item.dataset.page);
            });
        });

        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
        });

        document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        document.getElementById('themeToggle')?.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });

        const notificationBtn = document.getElementById('notificationBtn');
        const notificationDropdown = document.getElementById('notificationDropdown');
        if (notificationBtn && notificationDropdown) {
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationDropdown.classList.toggle('hidden');
            });
            document.addEventListener('click', (e) => {
                if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
                    notificationDropdown.classList.add('hidden');
                }
            });
        }

        document.getElementById('productForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSaveProduct();
        });

        document.getElementById('productImage')?.addEventListener('change', (e) => {
            this.previewImage(e.target.files[0]);
        });

        document.getElementById('discountForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSaveDiscount();
        });

        document.getElementById('discountScope')?.addEventListener('change', (e) => {
            this.handleDiscountScopeChange(e.target.value);
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('active');
            });
        });

        ['productName', 'productCategory', 'productPrice'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => this.updateCustomerPreview());
        });
    },

    async checkAuthentication() {
        const isAuthenticated = Auth.checkAuth();
        if (isAuthenticated) {
            document.getElementById('loginModal').classList.remove('active');
            document.getElementById('dashboard').classList.remove('hidden');
            document.getElementById('adminName').textContent = state.currentUser.name;
            await this.navigateTo('dashboard');
        } else {
            document.getElementById('loginModal').classList.add('active');
            document.getElementById('dashboard').classList.add('hidden');
        }
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.classList.add('dark');
        }
    },

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const btn = document.getElementById('loginBtn');
        const errorDiv = document.getElementById('loginError');

        btn.classList.add('loading');
        errorDiv.classList.add('hidden');

        const result = await Auth.login(email, password);
        btn.classList.remove('loading');

        if (result.success) {
            document.getElementById('loginModal').classList.remove('active');
            document.getElementById('dashboard').classList.remove('hidden');
            document.getElementById('adminName').textContent = state.currentUser.name;
            await this.navigateTo('dashboard');
        } else {
            errorDiv.textContent = result.error;
            errorDiv.classList.remove('hidden');
        }
    },

    /**
     * Destroy any chart instances currently in state.charts.
     * Called before re-rendering pages that contain charts to prevent
     * Chart.js "Canvas is already in use" errors and ghost overlays.
     */
    destroyCharts() {
        Object.keys(state.charts).forEach(key => {
            if (state.charts[key]) {
                try { state.charts[key].destroy(); } catch (_) { /* noop */ }
                state.charts[key] = null;
            }
        });
    },

    async navigateTo(page) {
        if (this._autoRefreshInterval) {
            clearInterval(this._autoRefreshInterval);
            this._autoRefreshInterval = null;
        }
        state.currentPage = page;

        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        const titles = {
            dashboard: 'Dashboard Overview',
            orders: 'Order Management',
            products: 'Product Management',
            discounts: 'Discount & Offers',
            analytics: 'Analytics & Reports',
            settings: 'Settings'
        };
        document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';

        // Clean up any existing charts before changing page.
        this.destroyCharts();

        await this.renderPage(page);

        document.getElementById('sidebar').classList.remove('open');
    },

    async renderPage(page) {
        const content = document.getElementById('pageContent');
        content.innerHTML = '<div class="flex items-center justify-center h-64"><i class="fas fa-spinner fa-spin text-4xl text-[#4A6741]"></i></div>';

        switch (page) {
            case 'dashboard': await this.loadDashboard(); break;
            case 'orders':
                await this.loadOrders();
                this._autoRefreshInterval = setInterval(() => {
                    if (state.currentPage === 'orders') this.loadOrders();
                    else { clearInterval(this._autoRefreshInterval); this._autoRefreshInterval = null; }
                }, 30000);
                break;
            case 'products':  await this.loadProducts(); break;
            case 'discounts': await this.loadDiscounts(); break;
            case 'analytics': await this.loadAnalytics(this.currentAnalyticsPeriod); break;
            case 'settings':  await this.renderSettings(); break;
        }
    },

    // ---------- DASHBOARD ----------

    async loadDashboard() {
        const [orders, products, discounts, analytics] = await Promise.all([
            API.getOrders(),
            API.getProducts(),
            API.getDiscounts(),
            API.getAnalytics('daily')
        ]);
        state.orders = orders;
        state.products = products;
        state.discounts = discounts;

        state.stats.totalOrders   = state.orders.length;
        state.stats.totalRevenue  = state.orders.reduce((sum, o) => sum + (o.total || 0), 0);
        state.stats.totalProducts = state.products.length;
        state.stats.pendingOrders = state.orders.filter(o => o.status === 'pending').length;

        this.updateNotifications();
        this._dashboardAnalytics = analytics;

        const html = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                ${this.renderStatCard('Total Orders', state.stats.totalOrders, 'fa-shopping-bag', 'bg-blue-500', '+12% from last month')}
                ${this.renderStatCard('Total Revenue', '₹' + state.stats.totalRevenue.toLocaleString('en-IN'), 'fa-rupee-sign', 'bg-green-500', '+8.5% from last month')}
                ${this.renderStatCard('Total Products', state.stats.totalProducts, 'fa-box', 'bg-purple-500', 'Active products')}
                ${this.renderStatCard('Pending Orders', state.stats.pendingOrders, 'fa-clock', 'bg-orange-500', 'Needs attention')}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Sales Overview (Last 7 Days)</h3>
                    <div class="chart-container"><canvas id="salesChart"></canvas></div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Top Products</h3>
                    <div class="chart-container"><canvas id="topProductsChart"></canvas></div>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white">Recent Orders</h3>
                    <button onclick="Admin.navigateTo('orders')" class="text-[#4A6741] hover:underline text-sm font-semibold">View All</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th class="pb-3">Order ID</th>
                                <th class="pb-3">Customer</th>
                                <th class="pb-3">Amount</th>
                                <th class="pb-3">Status</th>
                                <th class="pb-3">Date</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                            ${state.orders.slice(0, 5).map(order => `
                                <tr class="table-row">
                                    <td class="py-3 font-semibold text-gray-800 dark:text-white">#${order.id}</td>
                                    <td class="py-3 text-gray-600 dark:text-gray-300">${order.customer}</td>
                                    <td class="py-3 font-semibold text-gray-800 dark:text-white">₹${order.total.toLocaleString('en-IN')}</td>
                                    <td class="py-3">${this.renderStatusBadge(order.status)}</td>
                                    <td class="py-3 text-gray-500 text-sm">${new Date(order.date).toLocaleDateString('en-IN')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('pageContent').innerHTML = html;
        this.initDashboardCharts();
    },

    renderStatCard(title, value, icon, colorClass, subtitle) {
        const parts = subtitle.split(' ');
        const head = parts[0];
        const tail = parts.slice(1).join(' ');
        return `
            <div class="stat-card bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center">
                        <i class="fas ${icon} text-white text-xl"></i>
                    </div>
                    <span class="text-green-500 text-sm font-semibold">${head}</span>
                </div>
                <h4 class="text-gray-500 dark:text-gray-400 text-sm mb-1">${title}</h4>
                <p class="text-2xl font-bold text-gray-800 dark:text-white">${value}</p>
                <p class="text-xs text-gray-400 mt-1">${tail}</p>
            </div>
        `;
    },

    renderStatusBadge(status) {
        const badges = {
            pending: 'badge-pending',
            shipped: 'badge-shipped',
            delivered: 'badge-delivered',
            cancelled: 'badge-cancelled'
        };
        return `<span class="badge ${badges[status] || ''}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
    },

    initDashboardCharts() {
        const analytics = this._dashboardAnalytics || { daily: [], topProducts: [] };

        const salesCtx = document.getElementById('salesChart');
        if (salesCtx) {
            state.charts.sales = new Chart(salesCtx, {
                type: 'line',
                data: {
                    labels: analytics.daily.map(d => d.label),
                    datasets: [{
                        label: 'Sales (₹)',
                        data: analytics.daily.map(d => d.sales),
                        borderColor: '#4A6741',
                        backgroundColor: 'rgba(74, 103, 65, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2,
                        pointBackgroundColor: '#4A6741',
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { callback: v => '₹' + v.toLocaleString('en-IN') }
                        }
                    }
                }
            });
        }

        const topCtx = document.getElementById('topProductsChart');
        if (topCtx) {
            state.charts.topProducts = new Chart(topCtx, {
                type: 'bar',
                data: {
                    labels: analytics.topProducts.map(p => p.name),
                    datasets: [{
                        label: 'Units Sold',
                        data: analytics.topProducts.map(p => p.sales),
                        backgroundColor: '#D4AF37',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        }
    },

    // ---------- ORDERS ----------

    async loadOrders() {
        state.orders = await API.getOrders();
        const html = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <select id="orderFilter" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4A6741] dark:bg-gray-700 dark:text-white">
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <div class="relative">
                        <input type="text" id="orderSearch" placeholder="Search orders..." class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4A6741] dark:bg-gray-700 dark:text-white w-full md:w-64">
                        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th class="pb-3">Order ID</th>
                                <th class="pb-3">Customer</th>
                                <th class="pb-3">Items</th>
                                <th class="pb-3">Amount</th>
                                <th class="pb-3">Status</th>
                                <th class="pb-3">Date</th>
                                <th class="pb-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="ordersTableBody" class="divide-y divide-gray-200 dark:divide-gray-700">
                            ${this.renderOrdersTable(state.orders)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.getElementById('pageContent').innerHTML = html;

        document.getElementById('orderFilter').addEventListener('change', (e) => this.filterOrders(e.target.value));
        document.getElementById('orderSearch').addEventListener('input', (e) => this.searchOrders(e.target.value));
    },

    renderOrdersTable(orders) {
        if (!orders.length) {
            return '<tr><td colspan="7" class="py-8 text-center text-gray-500">No orders found</td></tr>';
        }
        return orders.map(order => `
            <tr class="table-row">
                <td class="py-4 font-semibold text-gray-800 dark:text-white">#${order.id}</td>
                <td class="py-4">
                    <div>
                        <p class="font-medium text-gray-800 dark:text-white">${order.customer}</p>
                        <p class="text-sm text-gray-500">${order.email}</p>
                    </div>
                </td>
                <td class="py-4 text-gray-600 dark:text-gray-300">${order.items}</td>
                <td class="py-4 font-semibold text-gray-800 dark:text-white">₹${order.total.toLocaleString('en-IN')}</td>
                <td class="py-4">${this.renderStatusBadge(order.status)}</td>
                <td class="py-4 text-gray-500 text-sm">${new Date(order.date).toLocaleDateString('en-IN')}</td>
                <td class="py-4">
                    <button onclick="Admin.viewOrder(${order.id})" class="text-[#4A6741] hover:text-[#3D5636] font-medium text-sm mr-3">View</button>
                </td>
            </tr>
        `).join('');
    },

    filterOrders(status) {
        const filtered = status === 'all' ? state.orders : state.orders.filter(o => o.status === status);
        document.getElementById('ordersTableBody').innerHTML = this.renderOrdersTable(filtered);
    },

    searchOrders(query) {
        const q = query.toLowerCase();
        const filtered = state.orders.filter(o =>
            o.customer.toLowerCase().includes(q) ||
            o.email.toLowerCase().includes(q) ||
            o.id.toString().includes(q)
        );
        document.getElementById('ordersTableBody').innerHTML = this.renderOrdersTable(filtered);
    },

    viewOrder(orderId) {
        const order = state.orders.find(o => o.id === orderId);
        if (order) this.showOrderDetails(order);
    },

    showOrderDetails(order) {
        const content = document.getElementById('orderDetailsContent');
        if (!content) return;
        content.innerHTML = `
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Order Information</h4>
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                            <p><span class="text-gray-500">Order ID:</span> <span class="font-semibold">#${order.id}</span></p>
                            <p><span class="text-gray-500">Date:</span> ${new Date(order.date).toLocaleString('en-IN')}</p>
                            <p><span class="text-gray-500">Status:</span> ${this.renderStatusBadge(order.status)}</p>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Customer Details</h4>
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                            <p class="font-semibold">${order.customer}</p>
                            <p class="text-gray-600 dark:text-gray-400">${order.email}</p>
                            <p class="text-gray-600 dark:text-gray-400">${order.phone}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Shipping Address</h4>
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p class="text-gray-800 dark:text-white">${order.address}</p>
                    </div>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Products Ordered</h4>
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                        ${order.itemDetails && order.itemDetails.length ? `
                        <table class="w-full text-sm">
                            <thead class="bg-gray-100 dark:bg-gray-600">
                                <tr>
                                    <th class="text-left px-4 py-2.5 font-semibold text-gray-600 dark:text-gray-300">#</th>
                                    <th class="text-left px-4 py-2.5 font-semibold text-gray-600 dark:text-gray-300">Product</th>
                                    <th class="text-center px-4 py-2.5 font-semibold text-gray-600 dark:text-gray-300">Qty</th>
                                    <th class="text-right px-4 py-2.5 font-semibold text-gray-600 dark:text-gray-300">Price</th>
                                    <th class="text-right px-4 py-2.5 font-semibold text-gray-600 dark:text-gray-300">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.itemDetails.map((item, i) => `
                                <tr class="border-t border-gray-200 dark:border-gray-600">
                                    <td class="px-4 py-3 text-gray-500">${i + 1}</td>
                                    <td class="px-4 py-3 font-medium text-gray-800 dark:text-white">${item.name}</td>
                                    <td class="px-4 py-3 text-center text-gray-700 dark:text-gray-300">${item.qty}</td>
                                    <td class="px-4 py-3 text-right text-gray-700 dark:text-gray-300">₹${item.price.toLocaleString('en-IN')}</td>
                                    <td class="px-4 py-3 text-right font-semibold text-gray-800 dark:text-white">₹${(item.price * item.qty).toLocaleString('en-IN')}</td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                        <div class="border-t border-gray-200 dark:border-gray-600 px-4 py-3 space-y-1">
                            <div class="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                                <span>Subtotal</span><span>₹${(order.subtotal || order.total).toLocaleString('en-IN')}</span>
                            </div>
                            <div class="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                                <span>Shipping</span><span>${order.shipping ? '₹' + order.shipping.toLocaleString('en-IN') : 'Free'}</span>
                            </div>
                            <div class="flex justify-between text-lg font-bold text-[#4A6741] pt-1 border-t border-gray-200 dark:border-gray-600">
                                <span>Total</span><span>₹${order.total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                        ` : `<p class="p-4 text-gray-500">No product details available</p>`}
                    </div>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Update Status</h4>
                    <div class="flex flex-wrap gap-2">
                        ${['pending', 'shipped', 'delivered', 'cancelled'].map(s => `
                            <button onclick="Admin.updateOrderStatus(${order.id}, '${s}')"
                                class="px-4 py-2 rounded-lg font-medium transition ${order.status === s ? 'bg-[#4A6741] text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'}">
                                ${s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.getElementById('orderModal').classList.add('active');
    },

    async updateOrderStatus(orderId, status) {
        const result = await API.updateOrderStatus(orderId, status);
        if (result.success) {
            closeOrderModal();
            this.updateNotifications();
            // Re-render orders if currently visible
            if (state.currentPage === 'orders') {
                document.getElementById('ordersTableBody').innerHTML = this.renderOrdersTable(state.orders);
            }
        } else {
            alert('Failed to update order status');
        }
    },

    // ---------- PRODUCTS ----------

    async loadProducts() {
        state.products = await API.getProducts();
        this.renderProductsGrid();
    },

    renderProductsGrid() {
        const filter = state.productCategoryFilter;
        const list = filter === 'all' ? state.products : state.products.filter(p => p.category === filter);

        const html = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <select id="productCategoryFilter" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4A6741] dark:bg-gray-700 dark:text-white">
                        <option value="all">All Categories</option>
                        <option value="Hair Care">Hair Care</option>
                        <option value="Pain Relief">Pain Relief</option>
                        <option value="Skin Care">Skin Care</option>
                        <option value="Wellness">Wellness</option>
                        <option value="Supplements">Supplements</option>
                    </select>
                    <button onclick="Admin.openProductModal()" class="btn-primary text-white font-semibold px-6 py-2 rounded-lg hover:shadow-lg transition flex items-center gap-2">
                        <i class="fas fa-plus"></i> Add Product
                    </button>
                </div>

                ${list.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-box-open"></i>
                        <p class="text-gray-500">No products found in this category</p>
                    </div>
                ` : `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    ${list.map((product, idx) => {
                        const badgeClass = Admin.getBadgeStyle(product.badge);
                        const isFirst = idx === 0;
                        const isLast  = idx === list.length - 1;
                        return `
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden group flex flex-col">
                            <div class="aspect-square bg-gradient-to-br from-[#4A6741]/10 to-[#D4AF37]/10 flex items-center justify-center relative overflow-hidden">
                                ${product.image
                                    ? `<img src="${product.image}" alt="${product.name}" class="w-full h-full" style="object-fit:cover;object-position:${product.imagePosX ?? 50}% ${product.imagePosY ?? 50}%;transform:scale(${(product.imageZoom || 100) / 100})">`
                                    : `<i class="fas fa-box text-6xl text-gray-300 dark:text-gray-600"></i>`}
                                <!-- Dynamic banner label (top-left) -->
                                ${product.badge ? `
                                <div style="position:absolute;top:8px;left:8px;z-index:10;">
                                    <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;
                                        padding:3px 8px;border-radius:999px;white-space:nowrap;
                                        box-shadow:0 1px 4px rgba(0,0,0,.3);${badgeClass}">
                                        ${product.badge}
                                    </span>
                                </div>` : ''}
                                <!-- Edit / Delete overlay -->
                                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onclick="Admin.editProduct(${product.id})" class="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition" title="Edit">
                                        <i class="fas fa-edit text-gray-700"></i>
                                    </button>
                                    <button onclick="Admin.deleteProduct(${product.id})" class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition" title="Delete">
                                        <i class="fas fa-trash text-white"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="p-4 flex flex-col flex-1">
                                <span class="text-xs font-semibold text-[#4A6741] dark:text-[#D4AF37]">${product.category}</span>
                                <h4 class="font-bold text-gray-800 dark:text-white mt-1 flex-1">${product.name}</h4>
                                <div class="flex items-center justify-between mt-2">
                                    <div>
                                        <span class="text-lg font-bold text-[#4A6741] dark:text-[#D4AF37]">₹${product.price}</span>
                                        ${product.discount > 0 ? `<span class="text-xs text-gray-400 line-through ml-1">₹${Math.round(product.price / (1 - product.discount/100))}</span>` : ''}
                                    </div>
                                    <span class="text-xs ${product.stock > 20 ? 'text-green-500' : product.stock > 5 ? 'text-orange-500' : 'text-red-500'}">${product.stock} in stock</span>
                                </div>
                                <!-- Reorder controls -->
                                <div class="flex items-center gap-1 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                    <span class="text-[10px] text-gray-400 mr-auto">Reorder</span>
                                    <button onclick="Admin.reorderProduct(${product.id}, 'up')"
                                        ${isFirst ? 'disabled' : ''}
                                        class="w-7 h-7 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:border-[#4A6741] hover:text-[#4A6741] disabled:opacity-30 disabled:cursor-not-allowed transition"
                                        title="Move up">
                                        <i class="fas fa-chevron-up text-[10px]"></i>
                                    </button>
                                    <button onclick="Admin.reorderProduct(${product.id}, 'down')"
                                        ${isLast ? 'disabled' : ''}
                                        class="w-7 h-7 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:border-[#4A6741] hover:text-[#4A6741] disabled:opacity-30 disabled:cursor-not-allowed transition"
                                        title="Move down">
                                        <i class="fas fa-chevron-down text-[10px]"></i>
                                    </button>
                                </div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>`}
            </div>
        `;
        document.getElementById('pageContent').innerHTML = html;

        const sel = document.getElementById('productCategoryFilter');
        sel.value = filter;
        sel.addEventListener('change', (e) => this.filterProducts(e.target.value));
    },

    filterProducts(category) {
        state.productCategoryFilter = category;
        this.renderProductsGrid();
    },

    openProductModal(product = null) {
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        const form = document.getElementById('productForm');
        const preview = document.getElementById('imagePreview');

        form.reset();
        preview.classList.add('hidden');
        preview.removeAttribute('src');

        // Reset badge fields
        const badgeInput   = document.getElementById('productBadge');
        const badgePreset  = document.getElementById('productBadgePreset');
        const badgePreview = document.getElementById('badgePreview');
        if (badgeInput)   badgeInput.value  = '';
        if (badgePreset)  badgePreset.value = '';
        if (badgePreview) badgePreview.classList.add('hidden');

        if (product) {
            title.textContent = 'Edit Product';
            document.getElementById('editProductId').value     = product.id;
            document.getElementById('productName').value       = product.name;
            document.getElementById('productCategory').value   = product.category;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productPrice').value      = product.price;
            document.getElementById('productStock').value      = product.stock;
            document.getElementById('productDiscount').value   = product.discount;

            // Populate badge
            const badge = product.badge || '';
            if (badgeInput) badgeInput.value = badge;
            const presetVals = ['Recently Added','New Product','Hot Sale','Best Seller','30% Discount','Limited Stock'];
            if (badgePreset) {
                badgePreset.value = presetVals.includes(badge) ? badge : (badge ? '__custom__' : '');
            }
            if (badge && badgePreview) Admin.showBadgePreview(badge);

            if (product.image) {
                preview.src = product.image;
                preview.classList.remove('hidden');
                document.getElementById('imageCropControls').classList.remove('hidden');
                document.getElementById('imageZoom').value = product.imageZoom || 100;
                document.getElementById('imagePosX').value = product.imagePosX ?? 50;
                document.getElementById('imagePosY').value = product.imagePosY ?? 50;
                this.updateImagePreview();
            }
        } else {
            title.textContent = 'Add New Product';
            document.getElementById('editProductId').value = '';
            document.getElementById('imageCropControls').classList.add('hidden');
            document.getElementById('imageZoom').value = 100;
            document.getElementById('imagePosX').value = 50;
            document.getElementById('imagePosY').value = 50;
        }

        modal.classList.add('active');
        this.updateCustomerPreview();
    },

    previewImage(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.getElementById('imagePreview');
            img.src = e.target.result;
            img.classList.remove('hidden');
            document.getElementById('imageZoom').value = 100;
            document.getElementById('imagePosX').value = 50;
            document.getElementById('imagePosY').value = 50;
            document.getElementById('imageCropControls').classList.remove('hidden');
            this.updateImagePreview();
        };
        reader.readAsDataURL(file);
    },

    updateImagePreview() {
        const zoom = document.getElementById('imageZoom').value;
        const posX = document.getElementById('imagePosX').value;
        const posY = document.getElementById('imagePosY').value;
        document.getElementById('zoomVal').textContent = (zoom / 100).toFixed(1) + 'x';
        document.getElementById('posXVal').textContent = posX + '%';
        document.getElementById('posYVal').textContent = posY + '%';
        const cpImg = document.getElementById('customerPreviewImg');
        if (cpImg) {
            const src = document.getElementById('imagePreview').src;
            if (src) cpImg.src = src;
            cpImg.style.objectPosition = `${posX}% ${posY}%`;
            cpImg.style.transform = `scale(${zoom / 100})`;
        }
        this.updateCustomerPreview();
    },

    updateCustomerPreview() {
        const name = document.getElementById('productName')?.value || 'Product Name';
        const cat = document.getElementById('productCategory')?.value || 'Category';
        const price = document.getElementById('productPrice')?.value || '0';
        const el = (id) => document.getElementById(id);
        if (el('customerPreviewName')) el('customerPreviewName').textContent = name;
        if (el('customerPreviewCategory')) el('customerPreviewCategory').textContent = cat;
        if (el('customerPreviewPrice')) el('customerPreviewPrice').textContent = '₹' + parseFloat(price || 0).toLocaleString('en-IN');
    },

    resetImagePosition() {
        document.getElementById('imageZoom').value = 100;
        document.getElementById('imagePosX').value = 50;
        document.getElementById('imagePosY').value = 50;
        this.updateImagePreview();
    },

    async handleSaveProduct() {
        const btn = document.getElementById('saveProductBtn');
        btn.classList.add('loading');

        const idVal = document.getElementById('editProductId').value;
        const productData = {
            id:          idVal ? Number(idVal) : null,
            name:        document.getElementById('productName').value,
            category:    document.getElementById('productCategory').value,
            description: document.getElementById('productDescription').value,
            price:       parseFloat(document.getElementById('productPrice').value),
            stock:       parseInt(document.getElementById('productStock').value),
            discount:    parseInt(document.getElementById('productDiscount').value) || 0,
            badge:       (document.getElementById('productBadge')?.value || '').trim(),
            imageZoom:   parseInt(document.getElementById('imageZoom')?.value) || 100,
            imagePosX:   parseInt(document.getElementById('imagePosX')?.value) ?? 50,
            imagePosY:   parseInt(document.getElementById('imagePosY')?.value) ?? 50
        };

        const imageFile = document.getElementById('productImage').files[0];
        if (imageFile) {
            const upload = await API.uploadImage(imageFile);
            if (upload.success) productData.image = upload.url;
        }

        const result = await API.saveProduct(productData);
        btn.classList.remove('loading');

        if (result.success) {
            closeProductModal();
            this.renderProductsGrid();
        } else {
            alert('Failed to save product: ' + (result.error || 'unknown error'));
        }
    },

    editProduct(productId) {
        const product = state.products.find(p => p.id === productId);
        if (product) this.openProductModal(product);
    },

    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        const result = await API.deleteProduct(productId);
        if (result.success) this.renderProductsGrid();
    },

    async reorderProduct(productId, direction) {
        const idx    = state.products.findIndex(p => p.id === productId);
        if (idx === -1) return;
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= state.products.length) return;
        // Swap in local state
        [state.products[idx], state.products[newIdx]] = [state.products[newIdx], state.products[idx]];
        // Persist to server
        try {
            await API._req('/api/admin/products/reorder', {
                method: 'POST',
                body:   JSON.stringify({ ids: state.products.map(p => p.id) })
            });
        } catch (e) {
            console.error('reorder failed:', e.message);
        }
        this.renderProductsGrid();
    },

    // Returns inline CSS string for badge colour (framework-agnostic)
    getBadgeStyle(badge) {
        if (!badge) return '';
        const b = badge.toLowerCase();
        if (b.includes('hot') || b.includes('sale'))          return 'background:#ef4444;color:#fff';
        if (b.includes('new'))                                 return 'background:#10b981;color:#fff';
        if (b.includes('discount') || b.includes('%'))        return 'background:#f97316;color:#fff';
        if (b.includes('recent') || b.includes('added'))      return 'background:#3b82f6;color:#fff';
        if (b.includes('best') || b.includes('seller'))       return 'background:#8b5cf6;color:#fff';
        if (b.includes('limited'))                            return 'background:#e11d48;color:#fff';
        return 'background:#4A6741;color:#fff';
    },

    showBadgePreview(text) {
        const preview = document.getElementById('badgePreview');
        const chip    = document.getElementById('badgePreviewChip');
        if (!preview || !chip) return;
        if (!text.trim()) { preview.classList.add('hidden'); return; }
        chip.removeAttribute('class');
        chip.style.cssText = `font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;
            padding:3px 10px;border-radius:999px;display:inline-block;${this.getBadgeStyle(text)}`;
        chip.textContent = text;
        preview.classList.remove('hidden');
    },

    // ---------- DISCOUNTS ----------

    async loadDiscounts() {
        state.discounts = await API.getDiscounts();
        if (!state.products.length) state.products = await API.getProducts();

        const html = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-gray-800 dark:text-white">Active Offers</h3>
                        <p class="text-sm text-gray-500">${state.discounts.filter(d => d.active).length} offers currently active</p>
                    </div>
                    <button onclick="Admin.openDiscountModal()" class="btn-primary text-white font-semibold px-6 py-2 rounded-lg hover:shadow-lg transition flex items-center gap-2">
                        <i class="fas fa-plus"></i> Create Offer
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${state.discounts.map(discount => `
                        <div class="border ${discount.active ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'} rounded-xl p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div>
                                    <h4 class="font-bold text-gray-800 dark:text-white">${discount.name}</h4>
                                    <p class="text-sm text-gray-500">${discount.scope === 'store' ? 'Entire Store' : discount.scope === 'category' ? 'Category: ' + discount.target : 'Product: ' + discount.target}</p>
                                </div>
                                <span class="badge ${discount.active ? 'badge-delivered' : 'badge-cancelled'}">${discount.active ? 'Active' : 'Inactive'}</span>
                            </div>
                            <div class="mb-4">
                                <p class="text-3xl font-bold text-[#4A6741]">${discount.type === 'percentage' ? discount.value + '%' : '₹' + discount.value}</p>
                                <p class="text-xs text-gray-500">${discount.type === 'percentage' ? 'Off' : 'Flat Discount'}</p>
                            </div>
                            <div class="text-xs text-gray-500 mb-4">
                                <p>Valid: ${new Date(discount.startDate).toLocaleDateString('en-IN')} - ${new Date(discount.endDate).toLocaleDateString('en-IN')}</p>
                            </div>
                            <button onclick="Admin.deleteDiscount(${discount.id})" class="w-full px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition">Delete</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        document.getElementById('pageContent').innerHTML = html;
    },

    openDiscountModal() {
        document.getElementById('discountForm').reset();
        document.getElementById('discountTargetContainer').classList.add('hidden');
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
        document.getElementById('discountStart').value = today;
        document.getElementById('discountEnd').value = nextMonth;
        document.getElementById('discountModal').classList.add('active');
    },

    handleDiscountScopeChange(scope) {
        const container = document.getElementById('discountTargetContainer');
        const select = document.getElementById('discountTarget');

        if (scope === 'store') {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');

        if (scope === 'category') {
            select.innerHTML = `
                <option value="">Select Category</option>
                <option value="Hair Care">Hair Care</option>
                <option value="Pain Relief">Pain Relief</option>
                <option value="Skin Care">Skin Care</option>
                <option value="Wellness">Wellness</option>
                <option value="Supplements">Supplements</option>
            `;
        } else if (scope === 'product') {
            select.innerHTML = `
                <option value="">Select Product</option>
                ${state.products.map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
            `;
        }
    },

    async handleSaveDiscount() {
        const discountData = {
            name: document.getElementById('discountName').value,
            type: document.getElementById('discountType').value,
            value: parseFloat(document.getElementById('discountValue').value),
            scope: document.getElementById('discountScope').value,
            startDate: document.getElementById('discountStart').value,
            endDate: document.getElementById('discountEnd').value,
            active: true
        };
        if (discountData.scope !== 'store') {
            discountData.target = document.getElementById('discountTarget').value;
        }
        const result = await API.saveDiscount(discountData);
        if (result.success) {
            closeDiscountModal();
            this.loadDiscounts();
        } else {
            alert('Failed to create discount');
        }
    },

    async deleteDiscount(discountId) {
        if (!confirm('Are you sure you want to delete this discount?')) return;
        const result = await API.deleteDiscount(discountId);
        if (result.success) this.loadDiscounts();
    },

    // ---------- ANALYTICS ----------

    async loadAnalytics(period = 'weekly') {
        this.currentAnalyticsPeriod = period;

        if (!state.products.length) state.products = await API.getProducts();
        if (!state.orders.length)   state.orders   = await API.getOrders();

        const analytics = await API.getAnalytics(period);

        // Compute summary metrics from the active series.
        const series = analytics[period] || analytics.weekly;
        const totalRevenue = series.reduce((sum, d) => sum + d.sales, 0);
        const totalOrders  = series.reduce((sum, d) => sum + d.orders, 0);
        const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
        const periodLabels = { daily: 'Last 7 Days', weekly: 'Last 4 Weeks', monthly: 'Last 12 Months' };

        const html = `
            <div class="space-y-6">
                <!-- Period Selector + KPIs -->
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                            <h3 class="text-lg font-bold text-gray-800 dark:text-white">Sales Analytics</h3>
                            <p class="text-sm text-gray-500">${periodLabels[period]}</p>
                        </div>
                        <div class="flex gap-2">
                            ${['daily', 'weekly', 'monthly'].map(p => `
                                <button onclick="Admin.switchAnalyticsPeriod('${p}')"
                                    class="px-4 py-2 rounded-lg text-sm font-medium transition ${period === p ? 'bg-[#4A6741] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}">
                                    ${p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div class="bg-gradient-to-br from-[#4A6741] to-[#3D5636] rounded-xl p-5 text-white">
                            <p class="text-sm opacity-80">Total Revenue</p>
                            <p class="text-2xl font-bold mt-1">₹${totalRevenue.toLocaleString('en-IN')}</p>
                        </div>
                        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
                            <p class="text-sm opacity-80">Total Orders</p>
                            <p class="text-2xl font-bold mt-1">${totalOrders.toLocaleString('en-IN')}</p>
                        </div>
                        <div class="bg-gradient-to-br from-[#D4AF37] to-[#B89628] rounded-xl p-5 text-white">
                            <p class="text-sm opacity-80">Avg Order Value</p>
                            <p class="text-2xl font-bold mt-1">₹${avgOrderValue.toLocaleString('en-IN')}</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                            <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-4">Revenue Trend</h4>
                            <div class="chart-container"><canvas id="revenueChart"></canvas></div>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                            <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-4">Orders Trend</h4>
                            <div class="chart-container"><canvas id="ordersChart"></canvas></div>
                        </div>
                    </div>
                </div>

                <!-- Top Products -->
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-6">Top Selling Products</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="text-left text-xs font-semibold text-gray-500 uppercase">
                                    <th class="pb-3">Rank</th>
                                    <th class="pb-3">Product</th>
                                    <th class="pb-3">Units Sold</th>
                                    <th class="pb-3">Revenue</th>
                                    <th class="pb-3 w-1/3">Performance</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                ${analytics.topProducts.map((product, index) => {
                                    const max = analytics.topProducts[0].sales || 1;
                                    const pct = Math.min(100, (product.sales / max) * 100);
                                    const rankColor = index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600';
                                    return `
                                    <tr class="table-row">
                                        <td class="py-4">
                                            <div class="w-8 h-8 rounded-full ${rankColor} flex items-center justify-center text-white font-bold text-sm">${index + 1}</div>
                                        </td>
                                        <td class="py-4 font-medium text-gray-800 dark:text-white">${product.name}</td>
                                        <td class="py-4 text-gray-600 dark:text-gray-300">${product.sales}</td>
                                        <td class="py-4 font-semibold text-[#4A6741]">₹${product.revenue.toLocaleString('en-IN')}</td>
                                        <td class="py-4">
                                            <div class="progress-bar">
                                                <div class="progress-bar-fill" style="width: ${pct}%"></div>
                                            </div>
                                        </td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('pageContent').innerHTML = html;

        // Render charts AFTER innerHTML so canvases exist.
        this.initAnalyticsCharts(analytics, period);
    },

    initAnalyticsCharts(analytics, period) {
        // Always destroy old instances first - prevents Chart.js re-use errors.
        if (state.charts.revenue) { state.charts.revenue.destroy(); state.charts.revenue = null; }
        if (state.charts.orders)  { state.charts.orders.destroy();  state.charts.orders  = null; }

        const data = analytics[period] || analytics.weekly;
        const labels = data.map(d => d.label);

        const revenueCtx = document.getElementById('revenueChart');
        if (revenueCtx) {
            state.charts.revenue = new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'Revenue (₹)',
                        data: data.map(d => d.sales),
                        borderColor: '#4A6741',
                        backgroundColor: 'rgba(74, 103, 65, 0.15)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2,
                        pointBackgroundColor: '#4A6741',
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: { label: ctx => '₹' + ctx.parsed.y.toLocaleString('en-IN') }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { callback: v => '₹' + v.toLocaleString('en-IN') }
                        }
                    }
                }
            });
        }

        const ordersCtx = document.getElementById('ordersChart');
        if (ordersCtx) {
            state.charts.orders = new Chart(ordersCtx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Orders',
                        data: data.map(d => d.orders),
                        backgroundColor: '#D4AF37',
                        borderRadius: 6,
                        hoverBackgroundColor: '#B89628'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                }
            });
        }
    },

    switchAnalyticsPeriod(period) {
        // destroyCharts first, then re-render.
        this.destroyCharts();
        this.loadAnalytics(period);
    },

    // ---------- SETTINGS ----------

    async renderSettings() {
        let s = {};
        try { s = await API.getSettings(); } catch(e) { s = {}; }

        const field = (id, label, type, val, placeholder='') => `
            <div>
                <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;">${label}</label>
                <input id="${id}" type="${type}" value="${val || ''}" placeholder="${placeholder}"
                    style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none;"
                    onfocus="this.style.borderColor='#4A6741'" onblur="this.style.borderColor='#d1d5db'">
            </div>`;

        const card = (title, color, icon, body) => `
            <div style="background:#fff;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.08);overflow:hidden;margin-bottom:20px;">
                <div style="background:${color};padding:14px 20px;display:flex;align-items:center;gap:10px;">
                    <span style="font-size:20px;">${icon}</span>
                    <span style="font-weight:700;color:#fff;font-size:15px;">${title}</span>
                </div>
                <div style="padding:20px;">${body}</div>
            </div>`;

        const emailBody = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                ${field('s_notifEmail','Notification Recipient Email','email', s.notificationEmail,'orders@yourdomain.com')}
                ${field('s_emailService','SMTP Service (gmail / outlook / yahoo)','text', s.emailService,'gmail')}
                ${field('s_emailUser','Sender Gmail / SMTP Username','email', s.emailUser,'yourstore@gmail.com')}
                <div>
                    <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;">App Password</label>
                    <input id="s_emailPass" type="password" value="${s.emailPass || ''}" placeholder="Gmail App Password (16 chars)"
                        style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none;"
                        onfocus="this.style.borderColor='#4A6741'" onblur="this.style.borderColor='#d1d5db'">
                </div>
            </div>
            <div style="margin-top:12px;text-align:right;">
                <button onclick="Admin.testNotif('email')"
                    style="background:#4A6741;color:#fff;border:none;padding:8px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">
                    ▶ Send Test Email
                </button>
            </div>`;

        const waBody = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                ${field('s_whatsappNumber','Your WhatsApp Number (with country code)','text', s.whatsappNumber,'+919876543210')}
                ${field('s_twilioSid','Twilio Account SID','text', s.twilioSid,'ACxxxxxxxxxxxxxxxx')}
                ${field('s_twilioToken','Twilio Auth Token','password', s.twilioToken,'your_auth_token')}
                ${field('s_twilioFrom','Twilio WhatsApp From Number','text', s.twilioFrom,'whatsapp:+14155238886')}
            </div>
            <div style="margin-top:12px;text-align:right;">
                <button onclick="Admin.testNotif('whatsapp')"
                    style="background:#25D366;color:#fff;border:none;padding:8px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">
                    ▶ Send Test WhatsApp
                </button>
            </div>`;

        const tgBody = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                ${field('s_telegramBotToken','Bot Token (from @BotFather)','text', s.telegramBotToken,'1234567890:ABCdef...')}
                ${field('s_telegramChatId','Chat ID (your personal or group ID)','text', s.telegramChatId,'-100123456789')}
            </div>
            <p style="font-size:12px;color:#6b7280;margin:8px 0 12px;">Get Chat ID: message your bot, then visit<br>
                <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code>
            </p>
            <div style="text-align:right;">
                <button onclick="Admin.testNotif('telegram')"
                    style="background:#229ED9;color:#fff;border:none;padding:8px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">
                    ▶ Send Test Telegram
                </button>
            </div>`;

        const slackBody = `
            <div style="margin-bottom:14px;">
                ${field('s_slackWebhookUrl','Incoming Webhook URL','url', s.slackWebhookUrl,'https://hooks.slack.com/services/...')}
            </div>
            <p style="font-size:12px;color:#6b7280;margin-bottom:12px;">Create a webhook at <strong>api.slack.com/apps</strong> → Incoming Webhooks</p>
            <div style="text-align:right;">
                <button onclick="Admin.testNotif('slack')"
                    style="background:#4A154B;color:#fff;border:none;padding:8px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">
                    ▶ Send Test Slack
                </button>
            </div>`;

        const html = `
            <div style="max-width:860px;">
                <div style="background:#fff;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.08);padding:20px 24px;margin-bottom:20px;display:flex;align-items:center;gap:16px;">
                    <div style="width:64px;height:64px;background:#4A6741;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:26px;font-weight:700;flex-shrink:0;">
                        ${(state.currentUser?.name?.charAt(0) || 'A')}
                    </div>
                    <div>
                        <div style="font-weight:700;font-size:16px;color:#1f2937;">${state.currentUser?.name || 'Admin User'}</div>
                        <div style="color:#6b7280;font-size:13px;">${state.currentUser?.email || 'admin@adigurus.com'}</div>
                        <div style="color:#4A6741;font-size:12px;font-weight:600;margin-top:2px;">Super Admin</div>
                    </div>
                </div>

                <h3 style="font-size:17px;font-weight:700;color:#1f2937;margin:0 0 16px;">Order Notification Channels</h3>
                <p style="font-size:13px;color:#6b7280;margin:-10px 0 18px;">Configure one or more channels. Each fires automatically when a new order is placed. All fields are optional — only filled channels are used.</p>

                ${card('Email Notifications','#4A6741','📧', emailBody)}
                ${card('WhatsApp via Twilio','#25D366','💬', waBody)}
                ${card('Telegram Bot','#229ED9','✈️', tgBody)}
                ${card('Slack Webhook','#4A154B','#', slackBody)}

                <!-- Customer Confirmation Notifications -->
                <div style="background:#fff;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.08);overflow:hidden;margin-bottom:20px;">
                    <div style="background:linear-gradient(135deg,#0ea5e9 0%,#0284c7 100%);padding:14px 20px;display:flex;align-items:center;gap:10px;">
                        <span style="font-size:20px;">👤</span>
                        <span style="font-weight:700;color:#fff;font-size:15px;">Customer Order Confirmations</span>
                        <span style="margin-left:auto;font-size:11px;color:#bae6fd;font-weight:500;">Sent directly to the customer after order</span>
                    </div>
                    <div style="padding:20px;">
                        <p style="font-size:13px;color:#6b7280;margin:0 0 16px;">
                            Enable these to automatically send the customer a confirmation when they place an order.
                            Uses the same Email (SMTP) and Twilio (WhatsApp) credentials configured above.
                        </p>

                        <!-- Toggle: Customer Email -->
                        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;margin-bottom:12px;">
                            <div>
                                <div style="font-weight:600;font-size:14px;color:#0c4a6e;">📧 Order Confirmation Email</div>
                                <div style="font-size:12px;color:#0369a1;margin-top:3px;">Sends a beautiful HTML receipt to the customer's email address</div>
                            </div>
                            <label style="position:relative;display:inline-block;width:48px;height:26px;flex-shrink:0;cursor:pointer;">
                                <input type="checkbox" id="s_customerEmailEnabled" ${s.customerEmailEnabled ? 'checked' : ''}
                                    style="opacity:0;width:0;height:0;position:absolute;">
                                <span id="s_customerEmailToggle"
                                    style="position:absolute;inset:0;border-radius:26px;background:${s.customerEmailEnabled ? '#0ea5e9' : '#d1d5db'};transition:background .2s;cursor:pointer;"
                                    onclick="(function(){var cb=document.getElementById('s_customerEmailEnabled');cb.checked=!cb.checked;this.style.background=cb.checked?'#0ea5e9':'#d1d5db';document.getElementById('s_customerEmailKnob').style.transform=cb.checked?'translateX(22px)':'translateX(2px)';}).call(this)">
                                    <span id="s_customerEmailKnob" style="position:absolute;top:3px;left:0;width:20px;height:20px;background:#fff;border-radius:50%;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2);transform:${s.customerEmailEnabled ? 'translateX(22px)' : 'translateX(2px)'}"></span>
                                </span>
                            </label>
                        </div>
                        <div style="text-align:right;margin-bottom:16px;">
                            <button onclick="Admin.testNotif('customer_email')"
                                style="background:#0ea5e9;color:#fff;border:none;padding:7px 16px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;">
                                ▶ Send Test to Customer Email
                            </button>
                        </div>

                        <!-- Toggle: Customer WhatsApp -->
                        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin-bottom:12px;">
                            <div>
                                <div style="font-weight:600;font-size:14px;color:#14532d;">💬 Order Confirmation WhatsApp</div>
                                <div style="font-size:12px;color:#16a34a;margin-top:3px;">Sends a WhatsApp message to the customer's phone number via Twilio</div>
                            </div>
                            <label style="position:relative;display:inline-block;width:48px;height:26px;flex-shrink:0;cursor:pointer;">
                                <input type="checkbox" id="s_customerWhatsAppEnabled" ${s.customerWhatsAppEnabled ? 'checked' : ''}
                                    style="opacity:0;width:0;height:0;position:absolute;">
                                <span id="s_customerWAToggle"
                                    style="position:absolute;inset:0;border-radius:26px;background:${s.customerWhatsAppEnabled ? '#25D366' : '#d1d5db'};transition:background .2s;cursor:pointer;"
                                    onclick="(function(){var cb=document.getElementById('s_customerWhatsAppEnabled');cb.checked=!cb.checked;this.style.background=cb.checked?'#25D366':'#d1d5db';document.getElementById('s_customerWAKnob').style.transform=cb.checked?'translateX(22px)':'translateX(2px)';}).call(this)">
                                    <span id="s_customerWAKnob" style="position:absolute;top:3px;left:0;width:20px;height:20px;background:#fff;border-radius:50%;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2);transform:${s.customerWhatsAppEnabled ? 'translateX(22px)' : 'translateX(2px)'}"></span>
                                </span>
                            </label>
                        </div>
                        <div style="text-align:right;">
                            <button onclick="Admin.testNotif('customer_whatsapp')"
                                style="background:#25D366;color:#fff;border:none;padding:7px 16px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;">
                                ▶ Send Test to Customer WhatsApp
                            </button>
                        </div>
                    </div>
                </div>

                <div style="text-align:center;margin-top:4px;">
                    <button onclick="Admin.saveAllSettings()"
                        style="background:#4A6741;color:#fff;border:none;padding:14px 40px;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(74,103,65,.3);">
                        💾 Save All Settings
                    </button>
                </div>
            </div>`;

        document.getElementById('pageContent').innerHTML = html;
    },

    async saveAllSettings() {
        const g  = id => (document.getElementById(id)?.value || '').trim();
        const cb = id => document.getElementById(id)?.checked || false;
        const data = {
            notificationEmail:       g('s_notifEmail'),
            emailService:            g('s_emailService') || 'gmail',
            emailUser:               g('s_emailUser'),
            emailPass:               g('s_emailPass'),
            whatsappNumber:          g('s_whatsappNumber'),
            twilioSid:               g('s_twilioSid'),
            twilioToken:             g('s_twilioToken'),
            twilioFrom:              g('s_twilioFrom') || 'whatsapp:+14155238886',
            telegramBotToken:        g('s_telegramBotToken'),
            telegramChatId:          g('s_telegramChatId'),
            slackWebhookUrl:         g('s_slackWebhookUrl'),
            customerEmailEnabled:    cb('s_customerEmailEnabled'),
            customerWhatsAppEnabled: cb('s_customerWhatsAppEnabled'),
        };
        try {
            await API.saveSettings(data);
            this.showToast('Settings saved successfully!', 'success');
        } catch(e) {
            this.showToast('Failed to save settings: ' + e.message, 'error');
        }
    },

    async testNotif(channel) {
        try {
            const result = await API.testNotification(channel);
            if (result.success) {
                this.showToast(`Test ${channel} sent successfully!`, 'success');
            } else if (result.skipped) {
                this.showToast(`${channel} skipped — ${result.reason}`, 'warning');
            } else {
                this.showToast(`${channel} error: ${result.error}`, 'error');
            }
        } catch(e) {
            this.showToast(`Test failed: ${e.message}`, 'error');
        }
    },

    // ---------- TOAST ----------

    showToast(msg, type = 'success') {
        const colors = { success: '#4A6741', error: '#ef4444', warning: '#f97316' };
        const t = document.createElement('div');
        t.textContent = msg;
        t.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;padding:12px 20px;border-radius:10px;`
            + `background:${colors[type] || colors.success};color:#fff;font-size:14px;font-weight:600;`
            + `box-shadow:0 4px 14px rgba(0,0,0,.25);max-width:340px;word-break:break-word;`
            + `animation:fadeInUp .25s ease;`;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3500);
    },

    // ---------- NOTIFICATIONS ----------

    updateNotifications() {
        const pendingOrders = state.orders.filter(o => o.status === 'pending');
        state.notifications = pendingOrders.map(order => ({
            id: order.id,
            title: 'New Order Received',
            message: `Order #${order.id} from ${order.customer}`,
            time: new Date(order.date).toLocaleString('en-IN')
        }));

        const badge = document.getElementById('notificationBadge');
        const pendingBadge = document.getElementById('pendingBadge');
        const list = document.getElementById('notificationList');

        if (state.notifications.length > 0) {
            if (badge) {
                badge.textContent = state.notifications.length;
                badge.classList.remove('hidden');
            }
            if (pendingBadge) {
                pendingBadge.textContent = state.notifications.length;
                pendingBadge.classList.remove('hidden');
            }
            if (list) {
                list.innerHTML = state.notifications.map(n => `
                    <div class="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onclick="viewOrderFromNotification(${n.id})">
                        <div class="flex items-start gap-3">
                            <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-shopping-bag text-blue-500"></i>
                            </div>
                            <div class="flex-grow">
                                <p class="text-sm font-semibold text-gray-800 dark:text-white">${n.title}</p>
                                <p class="text-xs text-gray-500 mt-1">${n.message}</p>
                                <p class="text-xs text-gray-400 mt-2">${n.time}</p>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        } else {
            if (badge) badge.classList.add('hidden');
            if (pendingBadge) pendingBadge.classList.add('hidden');
            if (list) {
                list.innerHTML = `
                    <div class="p-8 text-center text-gray-500">
                        <i class="fas fa-bell-slash text-3xl mb-2"></i>
                        <p>No new notifications</p>
                    </div>
                `;
            }
        }
    }
};

// ============================================
// GLOBAL HANDLES
// ============================================
// IMPORTANT: Point Admin DIRECTLY at UI (not a spread copy) so `this` keeps
// pointing at the same object inside method calls. The previous `{...UI}`
// caused inline onclick handlers to silently fail mid-method.

window.Admin = UI;

function closeProductModal()  { document.getElementById('productModal').classList.remove('active'); }
function closeDiscountModal() { document.getElementById('discountModal').classList.remove('active'); }
function closeOrderModal()    { document.getElementById('orderModal').classList.remove('active'); }

// Badge preset dropdown → fills the text input + shows live preview
function handleBadgePreset(value) {
    const input = document.getElementById('productBadge');
    if (!input) return;
    if (value === '__custom__') {
        input.value = '';
        input.focus();
    } else {
        input.value = value; // '' for "No Label", preset text otherwise
    }
    Admin.showBadgePreview(input.value);
}

// Live preview as admin types a custom label
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('productBadge')?.addEventListener('input', (e) => {
        Admin.showBadgePreview(e.target.value.trim());
    });
});

function viewOrderFromNotification(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (order) {
        UI.showOrderDetails(order);
        document.getElementById('notificationDropdown')?.classList.add('hidden');
    }
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => UI.init());
