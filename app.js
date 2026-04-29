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
//  FORM VALIDATION
// ══════════════════════════════════════════════════════════
const FormValidator = {
    validateEmail(input) {
        const value = input.value.trim();
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        this.showFieldError(input, isValid, 'Please enter a valid email address');
        return isValid || value === '';
    },

    validatePhone(input) {
        const value = input.value.trim();
        const isValid = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{1,14}$/.test(value);
        this.showFieldError(input, isValid, 'Please enter a valid phone number');
        return isValid || value === '';
    },

    validatePin(input) {
        const value = input.value.trim();
        const isValid = /^[1-9][0-9]{5}$/.test(value);
        this.showFieldError(input, isValid, 'Please enter a valid 6-digit PIN code');
        return isValid || value === '';
    },

    showFieldError(input, isValid, message) {
        const parent = input.parentElement;
        let errorEl = parent.querySelector('.field-error');
        
        if (!isValid && input.value.trim() !== '') {
            input.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
            input.classList.remove('border-gray-300', 'dark:border-gray-600');
            
            if (!errorEl) {
                errorEl = document.createElement('p');
                errorEl.className = 'field-error text-red-500 text-xs mt-1';
                parent.appendChild(errorEl);
            }
            errorEl.textContent = message;
        } else {
            input.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
            input.classList.add('border-gray-300', 'dark:border-gray-600');
            if (errorEl) errorEl.remove();
        }
    },

    initValidation() {
        const paymentForm = document.getElementById('payment-form');
        if (!paymentForm) return;

        // Email validation
        const emailInput = paymentForm.querySelector('input[type="email"]');
        if (emailInput) {
            emailInput.addEventListener('blur', () => this.validateEmail(emailInput));
            emailInput.addEventListener('input', () => {
                if (emailInput.value.trim() === '') {
                    const errorEl = emailInput.parentElement.querySelector('.field-error');
                    if (errorEl) errorEl.remove();
                    emailInput.classList.remove('border-red-500', 'focus:border-red-500');
                }
            });
        }

        // Phone validation
        const phoneInputs = paymentForm.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('blur', () => this.validatePhone(input));
            input.addEventListener('input', () => {
                if (input.value.trim() === '') {
                    const errorEl = input.parentElement.querySelector('.field-error');
                    if (errorEl) errorEl.remove();
                    input.classList.remove('border-red-500', 'focus:border-red-500');
                }
            });
        });

        // PIN validation
        const pinInputs = Array.from(paymentForm.querySelectorAll('input')).filter(
            input => input.placeholder && input.placeholder.includes('PIN')
        );
        pinInputs.forEach(input => {
            input.addEventListener('blur', () => this.validatePin(input));
            input.addEventListener('input', () => {
                if (input.value.trim() === '') {
                    const errorEl = input.parentElement.querySelector('.field-error');
                    if (errorEl) errorEl.remove();
                    input.classList.remove('border-red-500', 'focus:border-red-500');
                }
            });
        });
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
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-times text-xl';
    }
    function closeMobileMenu() {
        mobileMenu.classList.add('translate-x-full');
        mobileMenu.classList.remove('translate-x-0');
        mobileOverlay.classList.add('hidden');
        document.body.style.overflow = '';
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-bars text-xl';
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

    // Payment form submission
    const form = document.getElementById('payment-form');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const btn = form.querySelector('[type=submit]');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
            setTimeout(() => {
                Cart.clear();
                document.getElementById('checkout-success').classList.remove('hidden');
                document.getElementById('checkout-form-section').classList.add('hidden');
                document.getElementById('checkout-items-section').classList.add('hidden');
            }, 2000);
        });
    }
}
