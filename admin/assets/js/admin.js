/**
 * Adiguru's Admin Dashboard
 * Production-ready admin panel with authentication, order management, product management, and analytics
 */

// ============================================
// CONFIGURATION & STATE
// ============================================

const API_BASE = '/api/admin'; // Replace with your actual API endpoint
const CLOUDINARY_CLOUD_NAME = 'your-cloud-name'; // Replace with your Cloudinary details
const CLOUDINARY_UPLOAD_PRESET = 'your-preset';

const state = {
    currentUser: null,
    token: null,
    currentPage: 'dashboard',
    orders: [],
    products: [],
    discounts: [],
    notifications: [],
    stats: {
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        pendingOrders: 0
    },
    charts: {}
};

// ============================================
// AUTHENTICATION MODULE
// ============================================

const Auth = {
    async login(email, password) {
        try {
            // In production, replace with actual API call
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
        // Mock authentication for demo - replace with real API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (email === 'admin@adigurus.com' && password === 'admin123') {
            return {
                success: true,
                token: 'mock_jwt_token_' + Date.now(),
                user: {
                    id: 1,
                    name: 'Admin User',
                    email: email,
                    role: 'super_admin'
                }
            };
        }
        return { success: false, error: 'Invalid credentials' };
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
    },

    async validateToken() {
        // In production, validate token with backend
        return state.token !== null;
    }
};

// ============================================
// API SERVICE MODULE
// ============================================

const API = {
    async request(endpoint, options = {}) {
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`,
                ...options.headers
            }
        };

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, config);
            
            if (!response.ok) {
                if (response.status === 401) {
                    Auth.logout();
                    throw new Error('Unauthorized');
                }
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Orders API
    async getOrders(filters = {}) {
        // Mock data - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        return this.mockOrders();
    },

    async updateOrderStatus(orderId, status) {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 300));
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            return { success: true, order };
        }
        return { success: false, error: 'Order not found' };
    },

    // Products API
    async getProducts() {
        // Mock data - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        return this.mockProducts();
    },

    async saveProduct(productData) {
        // Replace with actual API call including image upload
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (productData.id) {
            // Update existing
            const index = state.products.findIndex(p => p.id === productData.id);
            if (index !== -1) {
                state.products[index] = { ...state.products[index], ...productData };
                return { success: true, product: state.products[index] };
            }
        } else {
            // Create new
            const newProduct = {
                id: Date.now(),
                ...productData,
                createdAt: new Date().toISOString()
            };
            state.products.push(newProduct);
            return { success: true, product: newProduct };
        }
        return { success: false, error: 'Failed to save product' };
    },

    async deleteProduct(productId) {
        await new Promise(resolve => setTimeout(resolve, 300));
        state.products = state.products.filter(p => p.id !== productId);
        return { success: true };
    },

    // Image Upload to Cloudinary
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );
            const data = await response.json();
            return { success: true, url: data.secure_url };
        } catch (error) {
            console.error('Upload error:', error);
            return { success: false, error: 'Upload failed' };
        }
    },

    // Discounts API
    async getDiscounts() {
        await new Promise(resolve => setTimeout(resolve, 300));
        return this.mockDiscounts();
    },

    async saveDiscount(discountData) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const newDiscount = {
            id: Date.now(),
            ...discountData,
            createdAt: new Date().toISOString()
        };
        state.discounts.push(newDiscount);
        return { success: true, discount: newDiscount };
    },

    async deleteDiscount(discountId) {
        state.discounts = state.discounts.filter(d => d.id !== discountId);
        return { success: true };
    },

    // Analytics API
    async getAnalytics(period = 'weekly') {
        await new Promise(resolve => setTimeout(resolve, 500));
        return this.mockAnalytics(period);
    },

    // Mock Data Generators
    mockOrders() {
        return [
            { id: 1001, customer: 'Rajesh Kumar', email: 'rajesh@email.com', phone: '+91 9876543210', total: 1250, status: 'pending', items: 3, date: '2025-01-15T10:30:00Z', address: '123 MG Road, Bangalore, 560001' },
            { id: 1002, customer: 'Priya Sharma', email: 'priya@email.com', phone: '+91 9876543211', total: 890, status: 'shipped', items: 2, date: '2025-01-14T14:20:00Z', address: '45 Park Street, Kolkata, 700016' },
            { id: 1003, customer: 'Amit Patel', email: 'amit@email.com', phone: '+91 9876543212', total: 2100, status: 'delivered', items: 5, date: '2025-01-13T09:15:00Z', address: '78 CG Road, Ahmedabad, 380009' },
            { id: 1004, customer: 'Sneha Reddy', email: 'sneha@email.com', phone: '+91 9876543213', total: 650, status: 'pending', items: 1, date: '2025-01-15T16:45:00Z', address: '12 Banjara Hills, Hyderabad, 500034' },
            { id: 1005, customer: 'Vikram Singh', email: 'vikram@email.com', phone: '+91 9876543214', total: 3200, status: 'cancelled', items: 4, date: '2025-01-12T11:00:00Z', address: '56 Civil Lines, Delhi, 110054' },
            { id: 1006, customer: 'Ananya Das', email: 'ananya@email.com', phone: '+91 9876543215', total: 1450, status: 'shipped', items: 3, date: '2025-01-14T08:30:00Z', address: '89 Salt Lake, Kolkata, 700091' },
            { id: 1007, customer: 'Rahul Verma', email: 'rahul@email.com', phone: '+91 9876543216', total: 780, status: 'pending', items: 2, date: '2025-01-15T13:20:00Z', address: '34 Hazratganj, Lucknow, 226001' },
            { id: 1008, customer: 'Deepika Iyer', email: 'deepika@email.com', phone: '+91 9876543217', total: 1890, status: 'delivered', items: 4, date: '2025-01-11T15:45:00Z', address: '67 Anna Nagar, Chennai, 600040' }
        ];
    },

    mockProducts() {
        return [
            { id: 1, name: 'Medicated Hair Oil', category: 'Hair Care', price: 250, stock: 150, discount: 10, image: 'images/products/hair-oil.jpg', description: 'Traditional Ayurvedic hair oil with bhringraj and amla' },
            { id: 2, name: 'Pain Relief Balm', category: 'Pain Relief', price: 180, stock: 200, discount: 0, image: 'images/products/pain-balm.jpg', description: 'Fast-acting pain relief balm with wintergreen oil' },
            { id: 3, name: 'Neem Face Wash', category: 'Skin Care', price: 220, stock: 120, discount: 15, image: 'images/products/face-wash.jpg', description: 'Natural neem-based face wash for clear skin' },
            { id: 4, name: 'Ashwagandha Capsules', category: 'Wellness', price: 450, stock: 80, discount: 0, image: 'images/products/ashwagandha.jpg', description: 'Pure ashwagandha extract for stress relief' },
            { id: 5, name: 'Triphala Churna', category: 'Supplements', price: 320, stock: 95, discount: 5, image: 'images/products/triphala.jpg', description: 'Digestive health supplement with three fruits' },
            { id: 6, name: 'Kumkumadi Tailam', category: 'Skin Care', price: 580, stock: 60, discount: 0, image: 'images/products/kumkumadi.jpg', description: 'Premium face oil for glowing skin' },
            { id: 7, name: 'Joint Care Oil', category: 'Pain Relief', price: 290, stock: 110, discount: 10, image: 'images/products/joint-oil.jpg', description: 'Ayurvedic oil for joint pain and stiffness' },
            { id: 8, name: 'Brahmi Ghee', category: 'Wellness', price: 520, stock: 45, discount: 0, image: 'images/products/brahmi-ghee.jpg', description: 'Memory enhancer with brahmi and pure ghee' }
        ];
    },

    mockDiscounts() {
        return [
            { id: 1, name: 'Diwali Dhamaka 2024', type: 'percentage', value: 25, scope: 'store', startDate: '2024-11-01', endDate: '2024-11-15', active: false },
            { id: 2, name: 'New Year Sale', type: 'percentage', value: 30, scope: 'category', target: 'Hair Care', startDate: '2025-01-01', endDate: '2025-01-10', active: true },
            { id: 3, name: 'Winter Wellness', type: 'fixed', value: 100, scope: 'product', target: 'Ashwagandha Capsules', startDate: '2024-12-15', endDate: '2025-02-28', active: true },
            { id: 4, name: 'Spring Special', type: 'percentage', value: 20, scope: 'store', startDate: '2025-03-01', endDate: '2025-03-31', active: false }
        ];
    },

    mockAnalytics(period) {
        const dailySales = Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'short' }),
            sales: Math.floor(Math.random() * 5000) + 3000,
            orders: Math.floor(Math.random() * 50) + 20
        }));

        const weeklySales = Array.from({ length: 4 }, (_, i) => ({
            week: `Week ${i + 1}`,
            sales: Math.floor(Math.random() * 20000) + 15000,
            orders: Math.floor(Math.random() * 200) + 100
        }));

        const monthlySales = Array.from({ length: 12 }, (_, i) => ({
            month: new Date(2024, i).toLocaleDateString('en-IN', { month: 'short' }),
            sales: Math.floor(Math.random() * 80000) + 50000,
            orders: Math.floor(Math.random() * 800) + 400
        }));

        const topProducts = state.products.slice(0, 5).map((p, i) => ({
            name: p.name,
            sales: Math.floor(Math.random() * 100) + 20,
            revenue: p.price * Math.floor(Math.random() * 100) + 5000
        }));

        return {
            daily: dailySales,
            weekly: weeklySales,
            monthly: monthlySales,
            topProducts: topProducts,
            currentPeriod: period
        };
    }
};

// ============================================
// UI RENDERING MODULE
// ============================================

const UI = {
    init() {
        this.setupEventListeners();
        this.checkAuthentication();
    },

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });

        // Navigation
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateTo(page);
            });
        });

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
        });

        // Mobile menu toggle
        document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });

        // Notification dropdown
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationDropdown = document.getElementById('notificationDropdown');
        
        if (notificationBtn && notificationDropdown) {
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationDropdown.classList.toggle('hidden');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
                    notificationDropdown.classList.add('hidden');
                }
            });
        }

        // Product form
        document.getElementById('productForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSaveProduct();
        });

        // Product image preview
        document.getElementById('productImage')?.addEventListener('change', (e) => {
            this.previewImage(e.target.files[0]);
        });

        // Discount form
        document.getElementById('discountForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSaveDiscount();
        });

        // Discount scope change
        document.getElementById('discountScope')?.addEventListener('change', (e) => {
            this.handleDiscountScopeChange(e.target.value);
        });

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    },

    async checkAuthentication() {
        const isAuthenticated = Auth.checkAuth();
        
        if (isAuthenticated) {
            document.getElementById('loginModal').classList.remove('active');
            document.getElementById('dashboard').classList.remove('hidden');
            document.getElementById('adminName').textContent = state.currentUser.name;
            
            // Load initial data
            await this.loadDashboard();
        } else {
            document.getElementById('loginModal').classList.add('active');
            document.getElementById('dashboard').classList.add('hidden');
        }

        // Load theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
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
            await this.loadDashboard();
        } else {
            errorDiv.textContent = result.error;
            errorDiv.classList.remove('hidden');
        }
    },

    navigateTo(page) {
        state.currentPage = page;
        
        // Update active nav item
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // Update page title
        const titles = {
            dashboard: 'Dashboard Overview',
            orders: 'Order Management',
            products: 'Product Management',
            discounts: 'Discount & Offers',
            analytics: 'Analytics & Reports',
            settings: 'Settings'
        };
        document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';

        // Render page content
        this.renderPage(page);

        // Close mobile menu if open
        document.getElementById('sidebar').classList.remove('open');
    },

    async renderPage(page) {
        const content = document.getElementById('pageContent');
        content.innerHTML = '<div class="flex items-center justify-center h-64"><i class="fas fa-spinner fa-spin text-4xl text-[#4A6741]"></i></div>';

        switch(page) {
            case 'dashboard':
                await this.loadDashboard();
                break;
            case 'orders':
                await this.loadOrders();
                break;
            case 'products':
                await this.loadProducts();
                break;
            case 'discounts':
                await this.loadDiscounts();
                break;
            case 'analytics':
                await this.loadAnalytics();
                break;
            case 'settings':
                this.renderSettings();
                break;
        }
    },

    async loadDashboard() {
        state.orders = await API.getOrders();
        state.products = await API.getProducts();
        state.discounts = await API.getDiscounts();

        // Calculate stats
        state.stats.totalOrders = state.orders.length;
        state.stats.totalRevenue = state.orders.reduce((sum, o) => sum + o.total, 0);
        state.stats.totalProducts = state.products.length;
        state.stats.pendingOrders = state.orders.filter(o => o.status === 'pending').length;

        // Update notification badge
        this.updateNotifications();

        const html = `
            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                ${this.renderStatCard('Total Orders', state.stats.totalOrders, 'fa-shopping-bag', 'bg-blue-500', '+12% from last month')}
                ${this.renderStatCard('Total Revenue', '₹' + state.stats.totalRevenue.toLocaleString('en-IN'), 'fa-rupee-sign', 'bg-green-500', '+8.5% from last month')}
                ${this.renderStatCard('Total Products', state.stats.totalProducts, 'fa-box', 'bg-purple-500', 'Active products')}
                ${this.renderStatCard('Pending Orders', state.stats.pendingOrders, 'fa-clock', 'bg-orange-500', 'Needs attention')}
            </div>

            <!-- Charts Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Sales Overview</h3>
                    <canvas id="salesChart" height="250"></canvas>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Top Products</h3>
                    <canvas id="topProductsChart" height="250"></canvas>
                </div>
            </div>

            <!-- Recent Orders -->
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

        // Initialize charts
        this.initCharts();
    },

    renderStatCard(title, value, icon, colorClass, subtitle) {
        return `
            <div class="stat-card bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center">
                        <i class="fas ${icon} text-white text-xl"></i>
                    </div>
                    <span class="text-green-500 text-sm font-semibold">${subtitle.split(' ')[0]}</span>
                </div>
                <h4 class="text-gray-500 dark:text-gray-400 text-sm mb-1">${title}</h4>
                <p class="text-2xl font-bold text-gray-800 dark:text-white">${value}</p>
                <p class="text-xs text-gray-400 mt-1">${subtitle.split(' ').slice(1).join(' ')}</p>
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
        return `<span class="badge ${badges[status]}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
    },

    initCharts() {
        const salesCtx = document.getElementById('salesChart');
        const topProductsCtx = document.getElementById('topProductsChart');

        if (salesCtx) {
            const analytics = API.mockAnalytics('daily');
            state.charts.sales = new Chart(salesCtx, {
                type: 'line',
                data: {
                    labels: analytics.daily.map(d => d.date),
                    datasets: [{
                        label: 'Sales (₹)',
                        data: analytics.daily.map(d => d.sales),
                        borderColor: '#4A6741',
                        backgroundColor: 'rgba(74, 103, 65, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: false }
                    }
                }
            });
        }

        if (topProductsCtx) {
            const analytics = API.mockAnalytics('daily');
            state.charts.topProducts = new Chart(topProductsCtx, {
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
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }
    },

    async loadOrders() {
        state.orders = await API.getOrders();
        
        const html = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div class="flex items-center gap-4">
                        <select id="orderFilter" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4A6741] dark:bg-gray-700 dark:text-white">
                            <option value="all">All Orders</option>
                            <option value="pending">Pending</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
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

        // Add filter listeners
        document.getElementById('orderFilter')?.addEventListener('change', (e) => {
            this.filterOrders(e.target.value);
        });

        document.getElementById('orderSearch')?.addEventListener('input', (e) => {
            this.searchOrders(e.target.value);
        });
    },

    renderOrdersTable(orders) {
        if (orders.length === 0) {
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
                    <button onclick="Admin.editOrderStatus(${order.id})" class="text-blue-500 hover:text-blue-700 font-medium text-sm">Update</button>
                </td>
            </tr>
        `).join('');
    },

    filterOrders(status) {
        const filtered = status === 'all' 
            ? state.orders 
            : state.orders.filter(o => o.status === status);
        document.getElementById('ordersTableBody').innerHTML = this.renderOrdersTable(filtered);
    },

    searchOrders(query) {
        const filtered = state.orders.filter(o => 
            o.customer.toLowerCase().includes(query.toLowerCase()) ||
            o.email.toLowerCase().includes(query.toLowerCase()) ||
            o.id.toString().includes(query)
        );
        document.getElementById('ordersTableBody').innerHTML = this.renderOrdersTable(filtered);
    },

    async viewOrder(orderId) {
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return;

        this.showOrderDetails(order);
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
                    <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Order Summary</h4>
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p class="text-lg"><span class="text-gray-500">Total Amount:</span> <span class="font-bold text-[#4A6741]">₹${order.total.toLocaleString('en-IN')}</span></p>
                    </div>
                </div>

                <div>
                    <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Update Status</h4>
                    <div class="flex gap-2">
                        ${['pending', 'shipped', 'delivered', 'cancelled'].map(status => `
                            <button onclick="Admin.updateOrderStatus(${order.id}, '${status}')" 
                                    class="px-4 py-2 rounded-lg font-medium transition ${order.status === status ? 'bg-[#4A6741] text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'}">
                                ${status.charAt(0).toUpperCase() + status.slice(1)}
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
            alert('Order status updated successfully!');
            this.loadOrders();
            closeOrderModal();
            this.updateNotifications();
        } else {
            alert('Failed to update order status');
        }
    },

    async loadProducts() {
        state.products = await API.getProducts();

        const html = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div class="flex items-center gap-4">
                        <select id="productCategoryFilter" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4A6741] dark:bg-gray-700 dark:text-white">
                            <option value="all">All Categories</option>
                            <option value="Hair Care">Hair Care</option>
                            <option value="Pain Relief">Pain Relief</option>
                            <option value="Skin Care">Skin Care</option>
                            <option value="Wellness">Wellness</option>
                            <option value="Supplements">Supplements</option>
                        </select>
                    </div>
                    <button onclick="Admin.openProductModal()" class="btn-primary text-white font-semibold px-6 py-2 rounded-lg hover:shadow-lg transition flex items-center gap-2">
                        <i class="fas fa-plus"></i>
                        Add Product
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    ${state.products.map(product => `
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden group">
                            <div class="aspect-square bg-gradient-to-br from-[#4A6741]/10 to-[#D4AF37]/10 flex items-center justify-center relative">
                                <i class="fas fa-box text-6xl text-gray-300 dark:text-gray-600"></i>
                                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onclick="Admin.editProduct(${product.id})" class="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition">
                                        <i class="fas fa-edit text-gray-700"></i>
                                    </button>
                                    <button onclick="Admin.deleteProduct(${product.id})" class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition">
                                        <i class="fas fa-trash text-white"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="p-4">
                                <span class="text-xs font-semibold text-[#4A6741] dark:text-[#D4AF37]">${product.category}</span>
                                <h4 class="font-bold text-gray-800 dark:text-white mt-1">${product.name}</h4>
                                <div class="flex items-center justify-between mt-3">
                                    <div>
                                        <span class="text-lg font-bold text-[#4A6741] dark:text-[#D4AF37]">₹${product.price}</span>
                                        ${product.discount > 0 ? `<span class="text-xs text-gray-400 line-through ml-1">₹${Math.round(product.price / (1 - product.discount/100))}</span>` : ''}
                                    </div>
                                    <span class="text-xs ${product.stock > 20 ? 'text-green-500' : product.stock > 5 ? 'text-orange-500' : 'text-red-500'}">${product.stock} in stock</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById('pageContent').innerHTML = html;

        document.getElementById('productCategoryFilter')?.addEventListener('change', (e) => {
            this.filterProducts(e.target.value);
        });
    },

    filterProducts(category) {
        const filtered = category === 'all' 
            ? state.products 
            : state.products.filter(p => p.category === category);
        this.loadProducts(); // Re-render with filtered data (simplified for demo)
    },

    openProductModal(product = null) {
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        const form = document.getElementById('productForm');

        form.reset();
        document.getElementById('imagePreview').classList.add('hidden');

        if (product) {
            title.textContent = 'Edit Product';
            document.getElementById('editProductId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productDiscount').value = product.discount;
        } else {
            title.textContent = 'Add New Product';
            document.getElementById('editProductId').value = '';
        }

        modal.classList.add('active');
    },

    closeProductModal() {
        document.getElementById('productModal').classList.remove('active');
    },

    previewImage(file) {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.getElementById('imagePreview');
                img.src = e.target.result;
                img.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    },

    async handleSaveProduct() {
        const btn = document.getElementById('saveProductBtn');
        btn.classList.add('loading');

        const productData = {
            id: document.getElementById('editProductId').value || null,
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            discount: parseInt(document.getElementById('productDiscount').value) || 0
        };

        // Handle image upload
        const imageFile = document.getElementById('productImage').files[0];
        if (imageFile) {
            const uploadResult = await API.uploadImage(imageFile);
            if (uploadResult.success) {
                productData.image = uploadResult.url;
            }
        }

        const result = await API.saveProduct(productData);
        btn.classList.remove('loading');

        if (result.success) {
            alert('Product saved successfully!');
            closeProductModal();
            this.loadProducts();
        } else {
            alert('Failed to save product: ' + result.error);
        }
    },

    editProduct(productId) {
        const product = state.products.find(p => p.id === productId);
        if (product) {
            this.openProductModal(product);
        }
    },

    async deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            const result = await API.deleteProduct(productId);
            if (result.success) {
                alert('Product deleted successfully!');
                this.loadProducts();
            }
        }
    },

    async loadDiscounts() {
        state.discounts = await API.getDiscounts();

        const html = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-gray-800 dark:text-white">Active Offers</h3>
                        <p class="text-sm text-gray-500">${state.discounts.filter(d => d.active).length} offers currently active</p>
                    </div>
                    <button onclick="Admin.openDiscountModal()" class="btn-primary text-white font-semibold px-6 py-2 rounded-lg hover:shadow-lg transition flex items-center gap-2">
                        <i class="fas fa-plus"></i>
                        Create Offer
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

                            <div class="flex gap-2">
                                <button onclick="Admin.deleteDiscount(${discount.id})" class="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById('pageContent').innerHTML = html;
    },

    openDiscountModal() {
        document.getElementById('discountModal').classList.add('active');
        
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        document.getElementById('discountStart').value = today;
        document.getElementById('discountEnd').value = nextMonth;
    },

    closeDiscountModal() {
        document.getElementById('discountModal').classList.remove('active');
    },

    handleDiscountScopeChange(scope) {
        const container = document.getElementById('discountTargetContainer');
        const select = document.getElementById('discountTarget');

        if (scope === 'store') {
            container.classList.add('hidden');
        } else if (scope === 'category') {
            container.classList.remove('hidden');
            select.innerHTML = `
                <option value="">Select Category</option>
                <option value="Hair Care">Hair Care</option>
                <option value="Pain Relief">Pain Relief</option>
                <option value="Skin Care">Skin Care</option>
                <option value="Wellness">Wellness</option>
                <option value="Supplements">Supplements</option>
            `;
        } else if (scope === 'product') {
            container.classList.remove('hidden');
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
            alert('Discount created successfully!');
            closeDiscountModal();
            this.loadDiscounts();
        } else {
            alert('Failed to create discount: ' + result.error);
        }
    },

    async deleteDiscount(discountId) {
        if (confirm('Are you sure you want to delete this discount?')) {
            const result = await API.deleteDiscount(discountId);
            if (result.success) {
                alert('Discount deleted successfully!');
                this.loadDiscounts();
            }
        }
    },

    async loadAnalytics(period = 'weekly') {
        this.currentAnalyticsPeriod = period;
        const analytics = await API.getAnalytics(period);

        const html = `
            <div class="space-y-6">
                <!-- Period Selector -->
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-bold text-gray-800 dark:text-white">Sales Analytics</h3>
                        <div class="flex gap-2" id="periodSelector">
                            <button onclick="Admin.switchAnalyticsPeriod('daily')" class="period-btn px-4 py-2 rounded-lg text-sm font-medium transition ${period === 'daily' ? 'bg-[#4A6741] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}">Daily</button>
                            <button onclick="Admin.switchAnalyticsPeriod('weekly')" class="period-btn px-4 py-2 rounded-lg text-sm font-medium transition ${period === 'weekly' ? 'bg-[#4A6741] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}">Weekly</button>
                            <button onclick="Admin.switchAnalyticsPeriod('monthly')" class="period-btn px-4 py-2 rounded-lg text-sm font-medium transition ${period === 'monthly' ? 'bg-[#4A6741] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}">Monthly</button>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                            <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-4">Revenue Trend</h4>
                            <canvas id="revenueChart" height="300"></canvas>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                            <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-4">Orders Trend</h4>
                            <canvas id="ordersChart" height="300"></canvas>
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
                                    <th class="pb-3">Performance</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                ${analytics.topProducts.map((product, index) => `
                                    <tr class="table-row">
                                        <td class="py-4">
                                            <div class="w-8 h-8 rounded-full ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'} flex items-center justify-center text-white font-bold text-sm">
                                                ${index + 1}
                                            </div>
                                        </td>
                                        <td class="py-4 font-medium text-gray-800 dark:text-white">${product.name}</td>
                                        <td class="py-4 text-gray-600 dark:text-gray-300">${product.sales}</td>
                                        <td class="py-4 font-semibold text-[#4A6741]">₹${product.revenue.toLocaleString('en-IN')}</td>
                                        <td class="py-4">
                                            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div class="bg-[#4A6741] h-2 rounded-full" style="width: ${Math.min(100, (product.sales / analytics.topProducts[0].sales) * 100)}%"></div>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('pageContent').innerHTML = html;

        // Initialize analytics charts
        this.initAnalyticsCharts(analytics);
    },

    initAnalyticsCharts(analytics) {
        // Destroy existing charts if they exist
        if (this.revenueChartInstance) {
            this.revenueChartInstance.destroy();
        }
        if (this.ordersChartInstance) {
            this.ordersChartInstance.destroy();
        }

        const data = analytics[analytics.currentPeriod] || analytics.weekly;

        const revenueCtx = document.getElementById('revenueChart');
        const ordersCtx = document.getElementById('ordersChart');

        if (revenueCtx) {
            this.revenueChartInstance = new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: data.map(d => d.date || d.week || d.month),
                    datasets: [{
                        label: 'Revenue (₹)',
                        data: data.map(d => d.sales),
                        borderColor: '#4A6741',
                        backgroundColor: 'rgba(74, 103, 65, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: value => '₹' + value.toLocaleString('en-IN')
                            }
                        }
                    }
                }
            });
        }

        if (ordersCtx) {
            this.ordersChartInstance = new Chart(ordersCtx, {
                type: 'bar',
                data: {
                    labels: data.map(d => d.date || d.week || d.month),
                    datasets: [{
                        label: 'Orders',
                        data: data.map(d => d.orders),
                        backgroundColor: '#D4AF37',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    },

    switchAnalyticsPeriod(period) {
        // Reload analytics with new period
        this.loadAnalytics(period);
    },

    renderSettings() {
        const html = `
            <div class="max-w-4xl">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-6">Store Settings</h3>
                    
                    <form class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Store Name</label>
                                <input type="text" value="Adiguru's" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4A6741] dark:bg-gray-700 dark:text-white">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Email</label>
                                <input type="email" value="admin@adigurus.com" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4A6741] dark:bg-gray-700 dark:text-white">
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                            <select class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4A6741] dark:bg-gray-700 dark:text-white">
                                <option value="INR">Indian Rupee (₹)</option>
                                <option value="USD">US Dollar ($)</option>
                                <option value="EUR">Euro (€)</option>
                            </select>
                        </div>

                        <div class="pt-4">
                            <button type="submit" class="btn-primary text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition">Save Settings</button>
                        </div>
                    </form>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-6">Admin Profile</h3>
                    
                    <div class="flex items-center gap-4 mb-6">
                        <div class="w-20 h-20 bg-[#4A6741] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            ${state.currentUser?.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                            <h4 class="font-bold text-gray-800 dark:text-white">${state.currentUser?.name || 'Admin User'}</h4>
                            <p class="text-gray-500">${state.currentUser?.email || 'admin@adigurus.com'}</p>
                            <p class="text-sm text-[#4A6741] font-semibold">Super Admin</p>
                        </div>
                    </div>

                    <form class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Change Password</label>
                            <input type="password" placeholder="New password" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4A6741] dark:bg-gray-700 dark:text-white">
                        </div>

                        <div class="pt-4">
                            <button type="submit" class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">Update Password</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('pageContent').innerHTML = html;
    },

    updateNotifications() {
        const pendingOrders = state.orders.filter(o => o.status === 'pending');
        state.notifications = pendingOrders.map(order => ({
            id: order.id,
            title: 'New Order Received',
            message: `Order #${order.id} from ${order.customer}`,
            time: new Date(order.date).toLocaleString('en-IN'),
            type: 'order'
        }));

        const badge = document.getElementById('notificationBadge');
        const pendingBadge = document.getElementById('pendingBadge');
        const list = document.getElementById('notificationList');

        if (state.notifications.length > 0) {
            badge.textContent = state.notifications.length;
            badge.classList.remove('hidden');
            
            if (pendingBadge) {
                pendingBadge.textContent = state.notifications.length;
                pendingBadge.classList.remove('hidden');
            }

            list.innerHTML = state.notifications.map(notif => `
                <div class="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onclick="viewOrderFromNotification(${notif.id})">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-shopping-bag text-blue-500"></i>
                        </div>
                        <div class="flex-grow">
                            <p class="text-sm font-semibold text-gray-800 dark:text-white">${notif.title}</p>
                            <p class="text-xs text-gray-500 mt-1">${notif.message}</p>
                            <p class="text-xs text-gray-400 mt-2">${notif.time}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            badge.classList.add('hidden');
            if (pendingBadge) pendingBadge.classList.add('hidden');
            
            list.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <i class="fas fa-bell-slash text-3xl mb-2"></i>
                    <p>No new notifications</p>
                </div>
            `;
        }
    }
};

// ============================================
// GLOBAL FUNCTIONS (for HTML onclick handlers)
// ============================================

window.Admin = {
    ...UI,
    currentAnalyticsPeriod: 'weekly',
    revenueChartInstance: null,
    ordersChartInstance: null
};

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

function closeDiscountModal() {
    document.getElementById('discountModal').classList.remove('active');
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
}

// View order from notification click
function viewOrderFromNotification(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (order) {
        UI.showOrderDetails(order);
        // Close notification dropdown
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});
