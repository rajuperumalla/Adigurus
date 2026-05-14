// app.js — Adiguru's Full Cart System (SECURED & OPTIMIZED)

// ══════════════════════════════════════════════════════════
//  CONFIGURATION
// ══════════════════════════════════════════════════════════
const CONFIG = {
    currency: '₹',
    currencyCode: 'INR',
    locale: 'en-IN',
    freeShippingThreshold: 499,
    shippingCost: 50
};

// ══════════════════════════════════════════════════════════
//  SECURITY UTILITIES
// ══════════════════════════════════════════════════════════
const Security = {
    // Escape HTML to prevent XSS
    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // CSRF Token management
    csrf: {
        getToken() {
            let token = localStorage.getItem('csrf_token');
            if (!token) {
                const array = new Uint8Array(32);
                crypto.getRandomValues(array);
                token = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
                localStorage.setItem('csrf_token', token);
            }
            return token;
        }
    }
};

// ══════════════════════════════════════════════════════════
//  FORM VALIDATION  (strong — mobile-first, Indian formats)
// ══════════════════════════════════════════════════════════
const FormValidator = {
    rules: {
        email: {
            test:    v => /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(v),
            message: 'Enter a valid email address (e.g. name@example.com)'
        },
        phone: {
            // Indian mobile: 10 digits, starts with 6–9 (with optional +91 / 0 prefix)
            test:    v => /^(?:\+91|0)?[6-9]\d{9}$/.test(v.replace(/[\s\-()]/g, '')),
            message: 'Enter a valid 10-digit Indian mobile number (starts with 6–9)'
        },
        pin: {
            test:    v => /^[1-9][0-9]{5}$/.test(v),
            message: 'Enter a valid 6-digit PIN code'
        },
        name: {
            test:    v => v.trim().length >= 2,
            message: 'Name must be at least 2 characters'
        },
        address: {
            test:    v => v.trim().length >= 10,
            message: 'Please enter a complete address (at least 10 characters)'
        }
    },

    showFieldError(input, isValid, message) {
        const parent = input.closest('div') || input.parentElement;
        let errorEl  = parent.querySelector('.field-error');

        if (!isValid && input.value.trim() !== '') {
            input.classList.add('border-red-500');
            input.classList.remove('border-gray-200', 'border-gray-300', 'dark:border-gray-600', 'dark:border-gray-700');
            if (!errorEl) {
                errorEl = document.createElement('p');
                errorEl.className = 'field-error text-red-500 text-xs mt-1 flex items-center gap-1';
                input.insertAdjacentElement('afterend', errorEl);
            }
            errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        } else {
            input.classList.remove('border-red-500');
            if (errorEl) errorEl.remove();
            // Show green tick on valid non-empty
            if (isValid && input.value.trim() !== '') {
                input.classList.add('border-green-400');
            } else {
                input.classList.remove('border-green-400');
            }
        }
    },

    clearError(input) {
        const parent = input.closest('div') || input.parentElement;
        parent.querySelector('.field-error')?.remove();
        input.classList.remove('border-red-500', 'border-green-400');
    },

    validateField(input, ruleKey) {
        const value = input.value.trim();
        if (value === '') { this.clearError(input); return true; } // empty = skip (required handled by HTML)
        const rule = this.rules[ruleKey];
        if (!rule) return true;
        const ok = rule.test(value);
        this.showFieldError(input, ok, rule.message);
        return ok;
    },

    initValidation() {
        const form = document.getElementById('payment-form');
        if (!form) return;

        const wire = (input, ruleKey) => {
            if (!input) return;
            let touched = false;
            input.addEventListener('blur',  () => { touched = true; this.validateField(input, ruleKey); });
            input.addEventListener('input', () => {
                if (input.value.trim() === '') { this.clearError(input); return; }
                if (touched) this.validateField(input, ruleKey);
            });
        };

        // Text inputs positional: [0]=firstName [1]=lastName [2]=city [3]=state [4]=pin
        const texts = Array.from(form.querySelectorAll('input[type="text"]'));
        wire(texts[0], 'name');
        wire(texts[1], 'name');
        wire(texts[4], 'pin');          // PIN (maxlength=6)
        wire(form.querySelector('input[type="email"]'), 'email');
        wire(form.querySelector('input[type="tel"]'),   'phone');

        // Textarea address
        const addr = form.querySelector('textarea');
        if (addr) {
            let touched = false;
            addr.addEventListener('blur',  () => { touched = true; this.validateField(addr, 'address'); });
            addr.addEventListener('input', () => { if (touched && addr.value.trim()) this.validateField(addr, 'address'); });
        }
    },

    // Run all validations on submit — returns true only if all pass
    validateAll(form) {
        const texts   = Array.from(form.querySelectorAll('input[type="text"]'));
        const email   = form.querySelector('input[type="email"]');
        const phone   = form.querySelector('input[type="tel"]');
        const addr    = form.querySelector('textarea');
        const pin     = texts[4];

        // Force-touch all fields
        [texts[0], texts[1]].forEach(i => i && this.validateField(i, 'name'));
        if (email) this.validateField(email, 'email');
        if (phone) this.validateField(phone, 'phone');
        if (addr)  this.validateField(addr,  'address');
        if (pin)   this.validateField(pin,   'pin');

        // Check for any remaining error elements
        const hasErrors = form.querySelectorAll('.field-error').length > 0;
        if (hasErrors) {
            // Scroll to first error
            const firstErr = form.querySelector('.field-error');
            firstErr?.previousElementSibling?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return !hasErrors;
    }
};

// ══════════════════════════════════════════════════════════
//  CART ENGINE  (localStorage-backed with error handling)
// ══════════════════════════════════════════════════════════
const Cart = {
    _key: 'adiguru_cart',

    get() {
        try { 
            return JSON.parse(localStorage.getItem(this._key)) || []; 
        } catch (e) {
            console.warn('localStorage not available, using session cart');
            return window.sessionCart || [];
        }
    },

    save(items) {
        try {
            localStorage.setItem(this._key, JSON.stringify(items));
        } catch (e) {
            window.sessionCart = items;
            console.warn('Saving to session instead of localStorage');
        }
    },

    add(product) {
        const items = this.get();
        const idx   = items.findIndex(i => i.id === product.id);
        if (idx > -1) {
            items[idx].qty += product.qty || 1;
        } else {
            items.push({ ...product, qty: product.qty || 1 });
        }
        this.save(items);
        CartUI.refresh();
        CartUI.open();
        CartUI.bump();
    },

    updateQty(id, delta) {
        const items = this.get();
        const idx   = items.findIndex(i => i.id === id);
        if (idx === -1) return;
        items[idx].qty += delta;
        if (items[idx].qty <= 0) items.splice(idx, 1);
        this.save(items);
        CartUI.refresh();
    },

    remove(id) {
        this.save(this.get().filter(i => i.id !== id));
        CartUI.refresh();
    },

    clear() {
        localStorage.removeItem(this._key);
        CartUI.refresh();
    },

    total() {
        return this.get().reduce((s, i) => s + i.price * i.qty, 0);
    },

    count() {
        return this.get().reduce((s, i) => s + i.qty, 0);
    },

    formatPrice(amount) {
        return new Intl.NumberFormat(CONFIG.locale, {
            style: 'currency',
            currency: CONFIG.currencyCode
        }).format(amount);
    }
};

// ══════════════════════════════════════════════════════════
//  CART  UI CONTROLLER
// ══════════════════════════════════════════════════════════
const CartUI = {
    drawer:   null,
    overlay:  null,
    badge:    null,
    body:     null,
    emptyMsg: null,
    list:     null,
    totalEl:  null,

    init() {
        this.drawer   = document.getElementById('cart-drawer');
        this.overlay  = document.getElementById('cart-overlay');
        this.badge    = document.getElementById('cart-badge');
        this.body     = document.getElementById('cart-body');
        this.emptyMsg = document.getElementById('cart-empty');
        this.list     = document.getElementById('cart-list');
        this.totalEl  = document.getElementById('cart-total');

        // Cart icon button with accessibility
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => this.toggle());
            // Update aria-expanded when cart state changes
            cartBtn.setAttribute('aria-expanded', 'false');
        }

        // Overlay click closes cart
        if (this.overlay) this.overlay.addEventListener('click', () => this.close());

        // Close button inside drawer
        const closeBtn = document.getElementById('cart-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', () => this.close());

        // Checkout button
        const checkoutBtn = document.getElementById('cart-checkout-btn');
        if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
            window.location.href = 'checkout.html';
        });

        // Swipe to close on mobile (touch gesture support)
        this.initSwipeGesture();

        this.refresh();
    },

    initSwipeGesture() {
        if (!this.drawer) return;
        
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.drawer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.drawer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            // Swipe left to close (finger moves from right to left)
            if (touchStartX - touchEndX > 50) {
                this.close();
            }
        }, { passive: true });
    },

    toggle() {
        this.drawer && this.drawer.classList.contains('translate-x-full') ? this.open() : this.close();
    },

    open() {
        if (!this.drawer) return;
        this.drawer.classList.remove('translate-x-full');
        this.drawer.classList.add('translate-x-0');
        if (this.overlay) this.overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Update aria-expanded on cart button
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn) cartBtn.setAttribute('aria-expanded', 'true');
    },

    close() {
        if (!this.drawer) return;
        this.drawer.classList.add('translate-x-full');
        this.drawer.classList.remove('translate-x-0');
        if (this.overlay) this.overlay.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Update aria-expanded on cart button
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn) cartBtn.setAttribute('aria-expanded', 'false');
    },

    bump() {
        if (!this.badge) return;
        this.badge.classList.add('scale-150');
        setTimeout(() => this.badge.classList.remove('scale-150'), 300);
    },

    refresh() {
        const items = Cart.get();
        const count = Cart.count();
        const total = Cart.total();

        // Badge
        if (this.badge) {
            this.badge.textContent = count;
            this.badge.style.display = count > 0 ? 'flex' : 'none';
        }

        if (!this.list) return;

        // Toggle empty / list
        if (items.length === 0) {
            if (this.emptyMsg) this.emptyMsg.classList.remove('hidden');
            this.list.classList.add('hidden');
        } else {
            if (this.emptyMsg) this.emptyMsg.classList.add('hidden');
            this.list.classList.remove('hidden');
        }

        // Render items with XSS-safe escaping using DocumentFragment
        const fragment = document.createDocumentFragment();
        this.list.innerHTML = '';
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'flex items-start gap-3 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0';
            const iconClass = Security.escapeHtml(item.icon || 'fas fa-leaf');
            const safeName = Security.escapeHtml(item.name);
            const safeId = Security.escapeHtml(item.id);
            div.innerHTML = '<div class="w-14 h-14 rounded-xl bg-gradient-to-br from-earth/10 to-gold/10 flex items-center justify-center shrink-0"><i class="'+iconClass+' text-xl text-earth/50"></i></div><div class="flex-grow min-w-0"><p class="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug truncate" title="'+safeName+'">'+safeName+'</p><p class="text-xs text-gold font-bold mt-0.5">₹'+item.price.toFixed(2)+'</p><div class="flex items-center gap-2 mt-2"><button data-action="decrease" data-id="'+safeId+'" class="qty-btn w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-earth hover:text-earth transition text-sm font-bold" aria-label="Decrease quantity">−</button><span class="text-sm font-bold w-5 text-center text-gray-800 dark:text-gray-200">'+item.qty+'</span><button data-action="increase" data-id="'+safeId+'" class="qty-btn w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-earth hover:text-earth transition text-sm font-bold" aria-label="Increase quantity">+</button><button data-action="remove" data-id="'+safeId+'" class="ml-auto text-gray-300 dark:text-gray-600 hover:text-red-400 transition" aria-label="Remove item"><i class="fas fa-trash-alt text-xs"></i></button></div></div><p class="text-sm font-bold text-gray-700 dark:text-gray-300 shrink-0">₹'+(item.price*item.qty).toFixed(2)+'</p>';
            div.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.action, id = btn.dataset.id;
                    if (action === 'decrease') Cart.updateQty(id, -1);
                    if (action === 'increase') Cart.updateQty(id, 1);
                    if (action === 'remove') Cart.remove(id);
                });
            });
            fragment.appendChild(div);
        });
        this.list.appendChild(fragment);

        // Total
        if (this.totalEl) this.totalEl.textContent = `₹${total.toFixed(2)}`;
    }
};

// ══════════════════════════════════════════════════════════
//  PRODUCT CARD  — wire Add to Cart + qty buttons
// ══════════════════════════════════════════════════════════
function wireProductCards() {
    document.querySelectorAll('[data-product-id]').forEach(card => {
        const id    = card.dataset.productId;
        const name  = card.dataset.productName;
        const price = parseFloat(card.dataset.productPrice);
        const icon  = card.dataset.productIcon || 'fas fa-leaf';

        const minusBtn  = card.querySelector('.qty-minus');
        const plusBtn   = card.querySelector('.qty-plus');
        const qtyEl     = card.querySelector('.qty-display');
        const addBtn    = card.querySelector('.add-to-cart-btn');
        const buyNowBtn = card.querySelector('.buy-now-btn');

        let qty = 1;

        if (minusBtn && plusBtn && qtyEl) {
            minusBtn.addEventListener('click', () => {
                if (qty > 1) { qty--; qtyEl.textContent = qty; }
            });
            plusBtn.addEventListener('click', () => {
                qty++; qtyEl.textContent = qty;
            });
        }

        if (addBtn) {
            addBtn.addEventListener('click', () => {
                Cart.add({ id, name, price, icon, qty });
                // Flash button
                addBtn.textContent = '✓ Added!';
                addBtn.classList.add('bg-green-600');
                addBtn.classList.remove('bg-earth');
                setTimeout(() => {
                    addBtn.textContent = 'Add to Cart';
                    addBtn.classList.remove('bg-green-600');
                    addBtn.classList.add('bg-earth');
                }, 1500);
            });
        }

        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', () => {
                Cart.add({ id, name, price, icon, qty });
                window.location.href = 'checkout.html';
            });
        }
    });

    // Product detail page
    const detailAddBtn = document.getElementById('detail-add-cart');
    const detailBuyBtn = document.getElementById('detail-buy-now');
    const detailMinus  = document.getElementById('detail-qty-minus');
    const detailPlus   = document.getElementById('detail-qty-plus');
    const detailQty    = document.getElementById('detail-qty-display');
    const detailPage   = document.getElementById('detail-product-section');

    if (detailPage) {
        let qty = 1;
        const name  = detailPage.dataset.productName  || 'Product';
        const price = parseFloat(detailPage.dataset.productPrice) || 0;
        const id    = detailPage.dataset.productId    || 'product-1';
        const icon  = detailPage.dataset.productIcon  || 'fas fa-leaf';

        if (detailMinus) detailMinus.addEventListener('click', () => { if(qty>1){qty--; detailQty.textContent=qty;} });
        if (detailPlus)  detailPlus.addEventListener('click',  () => { qty++; detailQty.textContent=qty; });
        if (detailAddBtn) detailAddBtn.addEventListener('click', () => {
            Cart.add({id, name, price, icon, qty});
        });
        if (detailBuyBtn) detailBuyBtn.addEventListener('click', () => {
            Cart.add({id, name, price, icon, qty});
            window.location.href = 'checkout.html';
        });
    }
}

// ══════════════════════════════════════════════════════════
//  DOMContentLoaded — boot everything
// ══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

    // ── Loader ─────────────────────────────────────────────
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 400);
        }, 900);
    }

    // ── Dark Mode ──────────────────────────────────────────
    const themeBtn = document.getElementById('theme-toggle');
    const htmlEl   = document.documentElement;
    if (localStorage.getItem('theme') === 'dark') htmlEl.classList.add('dark');
    if (themeBtn) {
        const icon = themeBtn.querySelector('i');
        if (icon && htmlEl.classList.contains('dark')) icon.className = 'fas fa-sun';
        themeBtn.addEventListener('click', () => {
            htmlEl.classList.toggle('dark');
            const dark = htmlEl.classList.contains('dark');
            localStorage.setItem('theme', dark ? 'dark' : 'light');
            if (icon) icon.className = dark ? 'fas fa-sun' : 'fas fa-moon';
        });
    }

    // ── Mobile Menu ────────────────────────────────────────
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu    = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');

    function openMobileMenu() {
        mobileMenu.classList.remove('translate-x-full');
        mobileMenu.classList.add('translate-x-0');
        mobileOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        mobileMenuBtn.classList.add('menu-open');
    }
    function closeMobileMenu() {
        mobileMenu.classList.add('translate-x-full');
        mobileMenu.classList.remove('translate-x-0');
        mobileOverlay.classList.add('hidden');
        document.body.style.overflow = '';
        mobileMenuBtn.classList.remove('menu-open');
    }

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.contains('translate-x-full') ? openMobileMenu() : closeMobileMenu();
        });
    }
    if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

    // Mobile accordion
    document.querySelectorAll('.mobile-accordion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.dataset.target);
            const icon   = btn.querySelector('.acc-icon');
            if (!target) return;
            const isOpen = !target.classList.contains('hidden');
            document.querySelectorAll('.mobile-accordion-panel').forEach(p => p.classList.add('hidden'));
            document.querySelectorAll('.acc-icon').forEach(i => i.style.transform = 'rotate(0deg)');
            if (!isOpen) {
                target.classList.remove('hidden');
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // ── Cart System ────────────────────────────────────────
    CartUI.init();
    wireProductCards();

    // ── Search ─────────────────────────────────────────────
    const searchInput = document.getElementById('searchInput');
    const searchBtn   = document.getElementById('searchBtn');

    function handleSearch() {
        if (!searchInput) return;
        const query = searchInput.value.trim().toLowerCase();
        if (!window.location.pathname.includes('shop.html')) {
            window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
            return;
        }
        document.querySelectorAll('[data-product-id]').forEach(p => {
            const title = p.querySelector('h4')?.textContent.toLowerCase() || '';
            const desc  = p.querySelector('p')?.textContent.toLowerCase()  || '';
            p.style.display = (title.includes(query) || desc.includes(query) || query === '') ? '' : 'none';
        });
    }

    if (window.location.pathname.includes('shop.html')) {
        const q = new URLSearchParams(window.location.search).get('search');
        if (q && searchInput) { searchInput.value = q; handleSearch(); }
    }

    if (searchBtn)   searchBtn.addEventListener('click', handleSearch);
    if (searchInput) searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleSearch(); });
    if (searchInput) searchInput.addEventListener('input', e => {
        if (!e.target.value.trim()) document.querySelectorAll('[data-product-id]').forEach(p => p.style.display = '');
    });

    // ── Dynamic product badges from admin ─────────────────
    injectProductBadges();

    // ── Load admin-uploaded products on shop page ────────
    loadDynamicProducts();

    // ── Checkout page init ────────────────────────────────
    initCheckoutPage();
});

// ══════════════════════════════════════════════════════════
//  CHECKOUT PAGE
// ══════════════════════════════════════════════════════════
function initCheckoutPage() {
    const page = document.getElementById('checkout-page');
    if (!page) return;

    const itemsEl = document.getElementById('checkout-items');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const totalEl = document.getElementById('checkout-total');
    const emptyEl = document.getElementById('checkout-empty');
    const formSection = document.getElementById('checkout-form-section');

    function renderCheckout() {
        const items = Cart.get();
        if (items.length === 0) {
            if (emptyEl) emptyEl.classList.remove('hidden');
            if (formSection) formSection.classList.add('hidden');
            return;
        }
        if (emptyEl) emptyEl.classList.add('hidden');
        if (formSection) formSection.classList.remove('hidden');

        if (itemsEl) {
            itemsEl.innerHTML = items.map(item => `
                <div class="flex items-center gap-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-earth/10 to-gold/10 flex items-center justify-center shrink-0">
                        <i class="${item.icon || 'fas fa-leaf'} text-xl text-earth/50"></i>
                    </div>
                    <div class="flex-grow">
                        <p class="font-semibold text-gray-800 dark:text-gray-200 text-sm">${item.name}</p>
                        <p class="text-xs text-gold font-bold">₹${item.price.toFixed(2)} × ${item.qty}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="Cart.updateQty('${item.id}', -1); initCheckoutPage();"
                            class="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-earth hover:text-earth transition text-sm font-bold">−</button>
                        <span class="text-sm font-bold w-5 text-center">${item.qty}</span>
                        <button onclick="Cart.updateQty('${item.id}', 1); initCheckoutPage();"
                            class="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-earth hover:text-earth transition text-sm font-bold">+</button>
                    </div>
                    <p class="font-bold text-gray-700 dark:text-gray-300 text-sm shrink-0 w-20 text-right">₹${(item.price * item.qty).toFixed(2)}</p>
                    <button onclick="Cart.remove('${item.id}'); initCheckoutPage();" class="text-gray-300 hover:text-red-400 transition">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        }
        const subtotal = Cart.total();
        const shipping = subtotal >= 499 ? 0 : 50;
        const total    = subtotal + shipping;
        if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
        if (totalEl)    totalEl.textContent    = `₹${total.toFixed(2)}`;
        const shippingEl = document.getElementById('checkout-shipping');
        if (shippingEl)  shippingEl.textContent = shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`;
    }

    renderCheckout();

    FormValidator.initValidation();

    // Payment form submission
    const form = document.getElementById('payment-form');
    if (form) {
        form.addEventListener('submit', async e => {
            e.preventDefault();

            // Strong validation gate
            if (!FormValidator.validateAll(form)) {
                const btn = form.querySelector('[type=submit]');
                btn.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i> Fix errors above';
                btn.classList.add('bg-red-500');
                btn.classList.remove('bg-earth');
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-lock text-xs"></i> Place Order Securely';
                    btn.classList.remove('bg-red-500');
                    btn.classList.add('bg-earth');
                    btn.disabled = false;
                }, 2500);
                return;
            }

            const btn = form.querySelector('[type=submit]');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';

            // Collect form field values by type/position (fields have no name attrs)
            const textInputs = Array.from(form.querySelectorAll('input[type="text"]'));
            const firstName  = textInputs[0]?.value.trim() || '';
            const lastName   = textInputs[1]?.value.trim() || '';
            const city       = textInputs[2]?.value.trim() || '';
            const stateVal   = textInputs[3]?.value.trim() || '';
            const pin        = textInputs[4]?.value.trim() || '';
            const email      = form.querySelector('input[type="email"]')?.value.trim() || '';
            const phone      = form.querySelector('input[type="tel"]')?.value.trim() || '';
            const address    = form.querySelector('textarea')?.value.trim() || '';
            const payment    = form.querySelector('input[name="payment"]:checked')?.value || 'upi';

            const cartItems = Cart.get();
            const subtotal  = Cart.total();
            const shipping  = subtotal >= CONFIG.freeShippingThreshold ? 0 : CONFIG.shippingCost;

            const order = {
                customer:     [firstName, lastName].filter(Boolean).join(' ') || 'Customer',
                email,
                phone,
                address:      [address, city, stateVal, pin].filter(Boolean).join(', '),
                items:        cartItems.length,
                itemDetails:  cartItems.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
                subtotal,
                shipping,
                total:        subtotal + shipping,
                paymentMethod: payment
            };

            try {
                await fetch('/api/orders', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(order)
                });
            } catch (err) {
                // Offline / server not running — order still "succeeds" locally
                console.warn('Server not reachable, order not persisted:', err.message);
            }

            Cart.clear();
            document.getElementById('checkout-success').classList.remove('hidden');
            document.getElementById('checkout-form-section').classList.add('hidden');
            document.getElementById('checkout-items-section').classList.add('hidden');
        });
    }
}

// ══════════════════════════════════════════════════════════
//  DYNAMIC PRODUCT BADGES  (set by admin, rendered on cards)
// ══════════════════════════════════════════════════════════
function _badgeClass(text) {
    const t = text.toLowerCase();
    if (t.includes('hot') || t.includes('sale'))         return 'background:#ef4444;color:#fff';
    if (t.includes('new'))                               return 'background:#10b981;color:#fff';
    if (t.includes('discount') || t.includes('%'))       return 'background:#f97316;color:#fff';
    if (t.includes('recent') || t.includes('added'))     return 'background:#3b82f6;color:#fff';
    if (t.includes('best') || t.includes('seller'))      return 'background:#8b5cf6;color:#fff';
    if (t.includes('limited'))                           return 'background:#e11d48;color:#fff';
    return 'background:#4A6741;color:#fff';
}

async function injectProductBadges() {
    try {
        const products = await fetch('/api/products').then(r => r.json());

        // Build name → badge map (normalised key)
        const badgeMap = {};
        products.forEach(p => {
            if (p.badge) badgeMap[p.name.toLowerCase().trim()] = p.badge;
        });
        if (!Object.keys(badgeMap).length) return;

        document.querySelectorAll('[data-product-name]').forEach(card => {
            const cardName = (card.dataset.productName || '').toLowerCase().trim();

            // Match: find any API product name that is contained in (or contains) the card name
            let badge = null;
            for (const [apiName, b] of Object.entries(badgeMap)) {
                const base = apiName.split('(')[0].trim(); // strip "(2 Pack)" etc.
                if (cardName.includes(base) || base.includes(cardName)) {
                    badge = b;
                    break;
                }
            }
            if (!badge) return;

            // Find the image area (first child div that has relative/overflow or h-52)
            const imageArea = card.querySelector('.h-52, [class*="aspect-"], [class*="h-48"], [class*="h-44"]')
                           || card.querySelector('div');
            if (!imageArea) return;

            // Remove any previous dynamic badge on this card
            imageArea.querySelector('.dynamic-badge-label')?.remove();

            const span = document.createElement('span');
            span.className = 'dynamic-badge-label';
            span.style.cssText = `
                position:absolute; top:10px; left:10px; z-index:20;
                font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.08em;
                padding:3px 8px; border-radius:999px; white-space:nowrap;
                box-shadow:0 1px 4px rgba(0,0,0,.25);
                ${_badgeClass(badge)}
            `;
            span.textContent = badge;

            // Ensure positioning context
            if (getComputedStyle(imageArea).position === 'static') {
                imageArea.style.position = 'relative';
            }
            imageArea.appendChild(span);
        });
    } catch {
        // Server offline — silently skip badge injection
    }
}

function _categoryIcon(category) {
    const c = (category || '').toLowerCase();
    if (c.includes('hair'))        return 'fas fa-tint';
    if (c.includes('pain'))        return 'fas fa-hand-holding-heart';
    if (c.includes('skin'))        return 'fas fa-spa';
    if (c.includes('supplement'))  return 'fas fa-pills';
    if (c.includes('wellness'))    return 'fas fa-leaf';
    return 'fas fa-box';
}

function _renderProductCard(p) {
    const posX = p.imagePosX ?? 50;
    const posY = p.imagePosY ?? 50;
    const zoom = p.imageZoom || 100;
    const imgStyle = `object-fit:cover;object-position:${posX}% ${posY}%;transform:scale(${zoom / 100})`;
    const originalPrice = p.discount > 0 ? Math.round(p.price / (1 - p.discount / 100)) : 0;
    const badgeHtml = p.badge
        ? `<div class="absolute top-3 left-3 z-10"><span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:3px 8px;border-radius:999px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.25);${_badgeClass(p.badge)}">${Security.escapeHtml(p.badge)}</span></div>`
        : '';

    const imageInner = p.image
        ? `<img src="${p.image}" alt="${Security.escapeHtml(p.name)}" class="w-full h-full" style="${imgStyle}" loading="lazy">${badgeHtml}`
        : `<i class="${_categoryIcon(p.category)} text-6xl text-earth/30 group-hover:scale-110 transition-transform duration-500"></i>${badgeHtml}`;

    const imageWrap = p.image
        ? 'w-full h-52 bg-gradient-to-br from-earth/10 to-gold/10 relative overflow-hidden'
        : 'w-full h-52 bg-gradient-to-br from-earth/10 to-gold/10 flex items-center justify-center relative overflow-hidden';

    return `
    <div class="glass rounded-xl overflow-hidden card-shadow group relative flex flex-col h-full product-card"
         data-product-id="p-${p.id}" data-product-name="${Security.escapeHtml(p.name)}" data-product-price="${Number(p.price).toFixed(2)}" data-product-icon="${_categoryIcon(p.category)}">
        <div class="${imageWrap}">${imageInner}</div>
        <div class="p-5 flex flex-col flex-grow">
            <span class="text-[10px] font-semibold text-earth/60 uppercase tracking-widest mb-0.5">${Security.escapeHtml(p.category || '')}</span>
            <h4 class="font-serif text-base text-earth mb-1 leading-snug">${Security.escapeHtml(p.name)}</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed flex-grow">${Security.escapeHtml(p.description || '')}</p>
            <p class="font-bold text-gold mb-4">
                ₹${Number(p.price).toFixed(2)}
                ${originalPrice ? `<span class="text-xs font-normal opacity-50 line-through ml-1">₹${originalPrice.toFixed(2)}</span>` : ''}
            </p>
            <div class="flex items-center justify-center gap-3 mb-3">
                <button class="qty-minus w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-earth hover:text-earth transition text-lg font-bold leading-none text-gray-500">−</button>
                <span class="qty-display text-sm font-bold w-5 text-center text-gray-800 dark:text-gray-200">1</span>
                <button class="qty-plus w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-earth hover:text-earth transition text-lg font-bold leading-none text-gray-500">+</button>
            </div>
            <div class="flex gap-2">
                <button class="add-to-cart-btn flex-grow bg-earth text-white py-2.5 rounded-full text-xs font-bold uppercase tracking-wide hover:opacity-90 transition">Add to Cart</button>
                <button class="buy-now-btn px-4 py-2.5 border border-earth text-earth rounded-full text-xs font-bold uppercase tracking-wide hover:bg-earth hover:text-white transition whitespace-nowrap">Buy Now</button>
            </div>
        </div>
    </div>`;
}

function _applyShopFilters() {
    const allCb = document.getElementById('filter-all');
    const otherCbs = Array.from(document.querySelectorAll('.shop-filter-checkbox')).filter(cb => cb !== allCb);
    const selected = otherCbs.filter(cb => cb.checked).map(cb => cb.value);

    const products = window._shopProducts || [];
    const filtered = selected.length === 0
        ? products
        : products.filter(p => {
            const cat = (p.category || '').toLowerCase();
            return selected.some(s => cat.includes(s));
        });

    _renderShopGrid(filtered);
}

function _renderShopGrid(products) {
    const container = document.getElementById('products-container');
    if (!container) return;

    if (!products.length) {
        container.innerHTML = '<p class="text-center text-gray-400 col-span-full py-16">No products found in this category.</p>';
        return;
    }

    container.innerHTML = products.map(_renderProductCard).join('');
    wireProductCards();
}

async function loadDynamicProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    try {
        const products = await fetch('/api/products').then(r => r.json());

        // Newest products first within each category — sort by createdAt DESC
        products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        window._shopProducts = products;

        // Hide loading spinner
        const loading = document.getElementById('products-loading');
        if (loading) loading.style.display = 'none';

        _renderShopGrid(products);

        // Wire filter checkboxes
        const allCb = document.getElementById('filter-all');
        document.querySelectorAll('.shop-filter-checkbox').forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb === allCb && cb.checked) {
                    // "All" checked → uncheck others
                    document.querySelectorAll('.shop-filter-checkbox').forEach(o => { if (o !== allCb) o.checked = false; });
                } else if (cb !== allCb && cb.checked) {
                    // specific category checked → uncheck "All"
                    if (allCb) allCb.checked = false;
                } else if (cb !== allCb && !cb.checked) {
                    // if none left checked, re-check "All"
                    const anyChecked = Array.from(document.querySelectorAll('.shop-filter-checkbox')).some(o => o !== allCb && o.checked);
                    if (!anyChecked && allCb) allCb.checked = true;
                }
                _applyShopFilters();
            });
        });
    } catch {
        const loading = document.getElementById('products-loading');
        if (loading) loading.innerHTML = '<p class="text-gray-400 text-sm">Unable to load products. Please try again later.</p>';
    }
}
