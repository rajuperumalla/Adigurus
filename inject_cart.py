import os, glob, re

base_dir = r"c:\Users\Pristyn Care.LT-ASUS-671\Desktop\Mediciti\computer-themed-portfolio\AdigurusWebsite"

# ── 1. CART DRAWER HTML (injected before </body>) ──────────────────────────
CART_DRAWER = '''
    <!-- ════════ CART OVERLAY ════════ -->
    <div id="cart-overlay" class="hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"></div>

    <!-- ════════ CART DRAWER ════════ -->
    <div id="cart-drawer" class="fixed top-0 right-0 h-full w-[90vw] max-w-[400px] bg-white dark:bg-[#121A16] z-[120] transform translate-x-full transition-transform duration-300 ease-in-out shadow-2xl flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div class="flex items-center gap-3">
                <i class="fas fa-shopping-cart text-earth"></i>
                <h2 class="font-serif font-bold text-lg text-gray-800 dark:text-gray-200">Your Cart</h2>
            </div>
            <button id="cart-close-btn" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-earth rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <!-- Empty state -->
        <div id="cart-empty" class="hidden flex-grow flex flex-col items-center justify-center gap-4 px-8 text-center">
            <div class="w-20 h-20 rounded-full bg-earth/10 flex items-center justify-center">
                <i class="fas fa-shopping-basket text-3xl text-earth/40"></i>
            </div>
            <p class="font-serif text-xl text-gray-700 dark:text-gray-300">Your cart is empty</p>
            <p class="text-sm text-gray-400">Add some Ayurvedic goodness!</p>
            <a href="shop.html" class="mt-2 bg-earth text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 transition">Browse Products</a>
        </div>

        <!-- Cart Items -->
        <div id="cart-list" class="hidden flex-grow overflow-y-auto px-5 py-2"></div>

        <!-- Footer -->
        <div class="shrink-0 border-t border-gray-100 dark:border-gray-800 px-5 py-4 space-y-3">
            <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500 dark:text-gray-400">Subtotal</span>
                <span id="cart-total" class="font-bold text-gray-800 dark:text-gray-200 text-base">₹0.00</span>
            </div>
            <p class="text-[11px] text-green-600 font-semibold"><i class="fas fa-truck mr-1"></i> Free shipping on orders above ₹499</p>
            <button id="cart-checkout-btn" class="w-full bg-earth text-white py-3.5 rounded-full font-bold uppercase tracking-widest text-sm hover:opacity-90 transition shadow-md">
                Proceed to Checkout <i class="fas fa-arrow-right ml-2"></i>
            </button>
            <a href="shop.html" class="block w-full text-center text-earth text-xs font-semibold hover:underline transition py-1">Continue Shopping</a>
        </div>
    </div>'''

# ── 2. PRODUCT CARD TEMPLATE (replaces old glass product cards) ──────────────
def make_product_card(prod_id, icon, name, desc, price, mrp, badge):
    return f'''
                    <div class="glass rounded-xl overflow-hidden card-shadow group relative flex flex-col h-full product-card" data-product-id="{prod_id}" data-product-name="{name}" data-product-price="{price}" data-product-icon="{icon}">
                        <div class="w-full h-52 flex items-center justify-center bg-gradient-to-br from-earth/10 to-gold/10 relative overflow-hidden">
                            <i class="{icon} text-6xl text-earth/30 group-hover:scale-110 transition-transform duration-500"></i>
                            <div class="absolute top-3 right-3">
                                <span class="bg-gold/20 text-earth text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">{badge}</span>
                            </div>
                        </div>
                        <div class="p-5 flex flex-col flex-grow">
                            <h4 class="font-serif text-base text-earth mb-1 leading-snug">{name}</h4>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed flex-grow">{desc}</p>
                            <p class="font-bold text-gold mb-4">₹{price} <span class="text-xs font-normal opacity-50 line-through ml-1">₹{mrp}</span></p>
                            <!-- Qty Selector -->
                            <div class="flex items-center justify-center gap-3 mb-3">
                                <button class="qty-minus w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-earth hover:text-earth transition text-lg font-bold leading-none text-gray-500">−</button>
                                <span class="qty-display text-sm font-bold w-5 text-center text-gray-800 dark:text-gray-200">1</span>
                                <button class="qty-plus w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-earth hover:text-earth transition text-lg font-bold leading-none text-gray-500">+</button>
                            </div>
                            <!-- Action Buttons -->
                            <div class="flex gap-2">
                                <button class="add-to-cart-btn flex-grow bg-earth text-white py-2.5 rounded-full text-xs font-bold uppercase tracking-wide hover:opacity-90 transition">Add to Cart</button>
                                <button class="buy-now-btn px-4 py-2.5 border border-earth text-earth rounded-full text-xs font-bold uppercase tracking-wide hover:bg-earth hover:text-white transition whitespace-nowrap">Buy Now</button>
                            </div>
                        </div>
                    </div>'''

# Products for shop pages
SHOP_PRODUCTS = {
    'shop.html': [
        ('hair-oil-2pack', 'fas fa-tint', 'Medicated Hair Oil (2 Pack)', 'Dandruff, Itchy Scalp & Hairfall', '250.00', '280.00', 'Best Seller'),
        ('pain-relief-oil', 'fas fa-hand-holding-heart', 'Pain Relief Oil', 'Joint, Muscle & Body Care', '220.00', '250.00', 'Popular'),
        ('universal-oil', 'fas fa-fire', 'Universal Oil', 'Headache, Sinus & Cold Relief', '99.00', '108.00', 'Value'),
        ('sleep-balm', 'fas fa-moon', 'Sleep Balm', 'Deep Sleep & Relaxation', '90.00', '108.00', 'Calm'),
        ('herbal-inhaler', 'fas fa-wind', 'Herbal Inhaler', 'Cold, Sinus & Headaches', '135.00', '160.00', 'Fast Act'),
        ('charcoal-soap', 'fas fa-spa', 'Charcoal Soap', 'Deep Cleansing & Detox', '110.00', '150.00', 'Pure'),
    ],
    'hair-care.html': [
        ('hair-oil-2pack', 'fas fa-tint', 'Medicated Hair Oil (2 Pack)', 'Dandruff, Itchy Scalp & Hairfall Control', '250.00', '280.00', 'Best Seller'),
        ('bhringraj-serum', 'fas fa-spa', 'Bhringraj Growth Serum', 'Stimulates roots, reduces hair loss naturally', '320.00', '380.00', 'New'),
        ('amla-hair-mask', 'fas fa-leaf', 'Amla Hair Mask', 'Deep conditioning & scalp nourishment', '180.00', '210.00', 'Popular'),
        ('neem-cleanser', 'fas fa-wind', 'Neem Scalp Cleanser', 'Anti-fungal, anti-bacterial scalp purifier', '145.00', '175.00', 'Natural'),
        ('warm-herb-oil', 'fas fa-fire', 'Warm Herb Scalp Oil', 'Improves blood circulation & hair thickness', '220.00', '260.00', 'Organic'),
        ('herbal-hair-combo', 'fas fa-mortar-pestle', 'Herbal Hair Pack Combo', 'Complete hair care kit with 3 products', '480.00', '580.00', 'Bundle'),
    ],
    'pain-relief-wellness-oils.html': [
        ('pain-relief-oil', 'fas fa-tint', 'Pain Relief Oil', 'Joint, Muscle & Body Care', '220.00', '250.00', 'Best Seller'),
        ('deep-heat-oil', 'fas fa-fire-alt', 'Deep Heat Wellness Oil', 'Concentrated warming formula for chronic pain', '290.00', '340.00', 'Popular'),
        ('mahanarayan-taila', 'fas fa-spa', 'Mahanarayan Taila', 'Classical Ayurvedic joint & nerve oil', '350.00', '420.00', 'Authentic'),
        ('ashwagandha-balm', 'fas fa-leaf', 'Ashwagandha Relief Balm', 'Adaptogen-rich balm for muscular fatigue', '195.00', '230.00', 'Natural'),
        ('cooling-oil', 'fas fa-bolt', 'Instant Cooling Oil', 'Eucalyptus & Peppermint for quick relief', '165.00', '195.00', 'Fast Act'),
        ('wellness-oil-combo', 'fas fa-mortar-pestle', 'Wellness Oil Combo', 'Hot + Cold therapy oils bundle', '420.00', '500.00', 'Bundle'),
    ],
    'balms-skin-care.html': [
        ('turmeric-balm', 'fas fa-spa', 'Turmeric Glow Balm', 'Anti-inflammatory & brightening daily balm', '210.00', '250.00', 'Best Seller'),
        ('sandalwood-cream', 'fas fa-feather', 'Sandalwood Face Cream', 'Cooling, soothing & clearing skin tonic', '280.00', '320.00', 'Popular'),
        ('rose-elixir', 'fas fa-tint', 'Rose Skin Elixir', 'Hydrating & anti-aging floral serum', '340.00', '400.00', 'Premium'),
        ('charcoal-soap', 'fas fa-fire', 'Charcoal Detox Soap', 'Deep cleansing & pore purification', '110.00', '150.00', 'Natural'),
        ('night-repair-balm', 'fas fa-moon', 'Night Repair Balm', 'Neem & aloe overnight rejuvenation balm', '265.00', '310.00', 'Repair'),
        ('day-shield-cream', 'fas fa-sun', 'Day Shield Cream', 'Herbal SPF alternative with zinc & herbs', '230.00', '270.00', 'Protect'),
    ],
    'inhalers.html': [
        ('herbal-inhaler', 'fas fa-wind', 'Herbal Inhaler', 'Eucalyptus & Peppermint for sinus & cold', '135.00', '160.00', 'Best Seller'),
        ('tulsi-inhaler', 'fas fa-leaf', 'Tulsi Breath Inhaler', 'Immunity boosting & respiratory clearing', '120.00', '145.00', 'Immunity'),
        ('camphor-stick', 'fas fa-bolt', 'Camphor Clarity Stick', 'Instant cooling & decongestant action', '99.00', '120.00', 'Fast Act'),
        ('sleep-inhaler', 'fas fa-moon', 'Sleep Inhaler', 'Lavender & Chamomile for bedtime calm', '145.00', '170.00', 'Sleep'),
        ('headache-inhaler', 'fas fa-fire', 'Headache Relief Inhaler', 'Mint & Basil complex for tension relief', '115.00', '140.00', 'Relief'),
        ('inhaler-combo', 'fas fa-star', 'Inhaler Combo Pack', 'Day + Night inhalers — best value', '240.00', '300.00', 'Bundle'),
    ],
    'headache-sinus-relief.html': [
        ('universal-oil', 'fas fa-tint', 'Universal Relief Oil', 'Headache, Sinus & Cold multi-formula', '99.00', '108.00', 'Best Seller'),
        ('sinus-inhaler', 'fas fa-wind', 'Sinus Clear Inhaler', 'Targeted menthol & eucalyptus blend', '135.00', '160.00', 'Popular'),
        ('migraine-balm', 'fas fa-spa', 'Migraine Balm', 'Apply on temples - Brahmi & Lavender', '190.00', '225.00', 'Specialist'),
        ('shankhpushpi-drops', 'fas fa-leaf', 'Shankhpushpi Head Drops', '2-drop nasal therapy for sinus relief', '165.00', '200.00', 'Ayurvedic'),
        ('camphor-rub', 'fas fa-fire', 'Camphor Cooling Rub', 'Forehead application for instant coolness', '110.00', '135.00', 'Cooling'),
        ('head-relief-combo', 'fas fa-mortar-pestle', 'Head Relief Combo', 'Oil + Inhaler + Balm trio pack', '340.00', '400.00', 'Bundle'),
    ],
    'joint-muscle-therapy.html': [
        ('pain-relief-oil', 'fas fa-tint', 'Pain Relief Oil', 'Joint & Muscle deep therapy oil', '220.00', '250.00', 'Best Seller'),
        ('nirgundi-oil', 'fas fa-fire-alt', 'Nirgundi Arthritis Oil', 'Classical herb for arthritic joints', '310.00', '370.00', 'Specialist'),
        ('sports-recovery', 'fas fa-thumbs-up', 'Sports Recovery Balm', 'Post-workout muscle repair formula', '240.00', '285.00', 'Athletes'),
        ('back-care-oil', 'fas fa-leaf', 'Back Care Oil', 'Targeted lumbar & spine support oil', '265.00', '310.00', 'Popular'),
        ('knee-oil', 'fas fa-spa', 'Kneecap Relief Wrap Oil', 'Meniscus & knee joint nourishment', '280.00', '330.00', 'Targeted'),
        ('joint-combo', 'fas fa-mortar-pestle', 'Joint Therapy Combo', 'Complete 3-product joint care system', '580.00', '700.00', 'Bundle'),
    ],
    'deep-sleep-aids.html': [
        ('sleep-balm', 'fas fa-spa', 'Sleep Balm', 'Apply on wrists & temples before bed', '90.00', '108.00', 'Best Seller'),
        ('pillow-spray', 'fas fa-moon', 'Jatamasi Pillow Spray', 'Mist on pillow for instant calm', '155.00', '185.00', 'Popular'),
        ('sleep-inhaler', 'fas fa-leaf', 'Sleep Inhaler', 'Lavender & Chamomile bedtime inhaler', '145.00', '170.00', 'Aromatic'),
        ('ashwagandha-oil', 'fas fa-fire', 'Ashwagandha Night Oil', 'Scalp massage oil for deep relaxation', '210.00', '255.00', 'Premium'),
        ('brahmi-drops', 'fas fa-tint', 'Brahmi Calm Drops', '3-drop under-tongue nervine tonic', '175.00', '210.00', 'Potent'),
        ('sleep-kit', 'fas fa-mortar-pestle', 'Sleep Ritual Kit', 'Balm + Spray + Inhaler complete set', '350.00', '430.00', 'Bundle'),
    ],
    'dandruff-hairfall-control.html': [
        ('hair-oil-2pack', 'fas fa-tint', 'Medicated Hair Oil (2 Pack)', 'Dandruff, Itchy Scalp & Hairfall', '250.00', '280.00', 'Best Seller'),
        ('neem-dandruff-oil', 'fas fa-leaf', 'Neem Anti-Dandruff Oil', 'Concentrated anti-fungal scalp therapy', '195.00', '230.00', 'Targeted'),
        ('bhringraj-serum', 'fas fa-spa', 'Bhringraj Root Serum', 'Follicle-anchoring & hairfall reduction', '285.00', '340.00', 'Popular'),
        ('scalp-detox-mask', 'fas fa-fire', 'Scalp Detox Mask', 'Weekly deep-cleanse with clay & herbs', '160.00', '195.00', 'Weekly'),
        ('hairfall-control', 'fas fa-cut', 'Hairfall Control Pack', '3-month comprehensive growth protocol', '620.00', '750.00', 'Protocol'),
        ('anti-dandruff-combo', 'fas fa-mortar-pestle', 'Anti-Dandruff Combo', 'Oil + Mask + Serum bundle', '560.00', '680.00', 'Bundle'),
    ],
    'skin-repair-solutions.html': [
        ('kumkumadi-serum', 'fas fa-spa', 'Kumkumadi Glow Serum', 'Saffron-based skin brightening elixir', '380.00', '450.00', 'Premium'),
        ('manjistha-balm', 'fas fa-sun', 'Manjistha Scar Balm', 'Targets blemishes, dark spots & scars', '260.00', '310.00', 'Best Seller'),
        ('aloe-gel', 'fas fa-leaf', 'Aloe Repair Gel', 'Sunburn, redness & irritation calmer', '140.00', '170.00', 'Soothing'),
        ('lodhra-mask', 'fas fa-fire', 'Lodhra Face Pack', 'Astringent firming mask for all skins', '175.00', '210.00', 'Firming'),
        ('rose-toner', 'fas fa-tint', 'Rose & Sandalwood Toner', 'pH-balancing herbal skin tonic', '155.00', '185.00', 'Toning'),
        ('skin-repair-kit', 'fas fa-mortar-pestle', 'Skin Repair Ritual Kit', 'Serum + Balm + Toner complete set', '660.00', '800.00', 'Bundle'),
    ],
    'chemical-free-wellness.html': [
        ('neem-body-oil', 'fas fa-leaf', 'Pure Neem Body Oil', '100% cold-pressed neem - no additives', '165.00', '195.00', 'Pure'),
        ('clay-herb-mask', 'fas fa-spa', 'Clay + Herb Face Mask', 'Multani mitti & herbal detox mask', '145.00', '180.00', 'Natural'),
        ('castor-oil', 'fas fa-tint', 'Castor Growth Oil', 'Unrefined, cold-pressed castor for hair & skin', '120.00', '145.00', 'Organic'),
        ('charcoal-soap', 'fas fa-fire', 'Herbal Charcoal Soap', 'Deep cleanse soap - SLS free', '110.00', '150.00', 'Chemical-Free'),
        ('zero-chem-moisturizer', 'fas fa-feather', 'Zero-Chemical Moisturizer', 'Shea + Kokum + Aloe natural moisturizer', '190.00', '230.00', 'Clean Beauty'),
        ('clean-living-kit', 'fas fa-mortar-pestle', 'Clean Living Starter Kit', '6-product chemical-free wellness bundle', '720.00', '900.00', 'Bundle'),
    ],
    'best-sellers.html': [
        ('hair-oil-2pack', 'fas fa-tint', 'Medicated Hair Oil (2 Pack)', 'Dandruff, Itchy Scalp & Hairfall', '250.00', '280.00', '#1 Best Seller'),
        ('pain-relief-oil', 'fas fa-hand-holding-heart', 'Pain Relief Oil', 'Joint, Muscle & Body Care', '220.00', '250.00', '#2 Best Seller'),
        ('sleep-balm', 'fas fa-moon', 'Sleep Balm', 'Deep Sleep & Relaxation', '90.00', '108.00', '#3 Best Seller'),
        ('herbal-inhaler', 'fas fa-wind', 'Herbal Inhaler', 'Cold, Sinus & Headaches', '135.00', '160.00', '#4 Best Seller'),
        ('universal-oil', 'fas fa-fire', 'Universal Oil', 'Headache, Sinus & Cold multi-use', '99.00', '108.00', '#5 Best Seller'),
        ('charcoal-soap', 'fas fa-spa', 'Charcoal Soap', 'Deep Cleansing & Skin Detox', '110.00', '150.00', '#6 Best Seller'),
    ],
    'twin-packs-bundles.html': [
        ('hair-duo', 'fas fa-box', 'Hair Care Duo', 'Hair Oil + Bhringraj Serum - 2 Pack', '430.00', '550.00', 'Save ₹120'),
        ('pain-bundle', 'fas fa-box', 'Pain Relief Bundle', 'Pain Oil + Deep Heat Oil - twin pack', '380.00', '490.00', 'Save ₹110'),
        ('sleep-calm-kit', 'fas fa-box', 'Sleep + Calm Kit', 'Sleep Balm + Brahmi Oil + Inhaler', '350.00', '430.00', 'Save ₹80'),
        ('wellness-box', 'fas fa-box-open', 'Complete Wellness Box', '7 bestselling products in one premium box', '980.00', '1280.00', 'Save ₹300'),
        ('gift-hamper', 'fas fa-gift', 'Gift Hamper', 'Curated gift box - beautifully wrapped', '750.00', '950.00', 'Gift'),
        ('skin-repair-duo', 'fas fa-box', 'Skin Repair Duo', 'Kumkumadi Serum + Manjistha Balm', '560.00', '710.00', 'Save ₹150'),
    ],
    'sale-offers.html': [
        ('hair-mega-pack', 'fas fa-tint', 'Hair Oil Mega Pack', '3-pack deal - save big on bulk', '590.00', '840.00', '30% OFF'),
        ('pain-offer', 'fas fa-hand-holding-heart', 'Pain Relief Oil Offer', 'Joint & Muscle - limited stock deal', '165.00', '250.00', '34% OFF'),
        ('sleep-2pack', 'fas fa-moon', 'Sleep Balm 2 Pack', 'Buy 2 sleep balms at special price', '155.00', '216.00', '28% OFF'),
        ('universal-clearance', 'fas fa-fire', 'Universal Oil Clearance', 'Last few bottles at discounted price', '69.00', '108.00', '36% OFF'),
        ('inhaler-festival', 'fas fa-wind', 'Inhaler Festival Pack', '5 inhalers at near-cost price', '450.00', '675.00', '33% OFF'),
        ('mix-match', 'fas fa-box-open', 'Mix & Match Bundle', 'Choose any 4 products - flat rate', '680.00', '980.00', '31% OFF'),
    ],
}

# ── 3. CART BUTTON UPDATE in nav (replace static cart button) ─────────────
OLD_CART_BTN = '''                    <!-- Cart -->
                    <button class="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-earth dark:hover:text-gold transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative">
                        <i class="fas fa-shopping-cart"></i>
                        <span class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-earth text-white text-[9px] rounded-full flex items-center justify-center font-bold">0</span>
                    </button>'''

NEW_CART_BTN = '''                    <!-- Cart -->
                    <button id="cart-btn" class="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-earth dark:hover:text-gold transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative">
                        <i class="fas fa-shopping-cart"></i>
                        <span id="cart-badge" class="hidden absolute -top-1 -right-1 w-5 h-5 bg-earth text-white text-[9px] rounded-full flex items-center justify-center font-bold transition-transform duration-200">0</span>
                    </button>'''

# ── PROCESS ALL FILES ─────────────────────────────────────────────────────
html_files = sorted(glob.glob(os.path.join(base_dir, '*.html')))

for fpath in html_files:
    fname = os.path.basename(fpath)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # A. Fix cart button
    content = content.replace(OLD_CART_BTN, NEW_CART_BTN)

    # B. Inject cart drawer before </body>
    if 'id="cart-drawer"' not in content:
        content = content.replace('</body>', CART_DRAWER + '\n</body>')

    # C. Replace product grid for known pages
    if fname in SHOP_PRODUCTS:
        products = SHOP_PRODUCTS[fname]
        new_grid = '\n'.join([make_product_card(*p) for p in products])

        # Pattern: the product grid div wrapping product cards
        pattern = re.compile(
            r'<div class="grid grid-cols-1 (?:sm:grid-cols-2 )?md:grid-cols-3 gap-6[^"]*">.*?</div>\s*</div>\s*(?:</div>\s*)?(?=(?:<div class="text-center|</section|</main))',
            re.DOTALL
        )
        if pattern.search(content):
            content = pattern.sub(
                f'<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">\n{new_grid}\n                </div>\n            </div>\n',
                content, count=1
            )

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  Updated: {fname}')

print(f'\nAll {len(html_files)} pages processed!')
