import os
import glob
import re

base_dir = r"c:\Users\Pristyn Care.LT-ASUS-671\Desktop\Mediciti\computer-themed-portfolio\AdigurusWebsite"

# ── SHARED MOBILE-FIRST NAV (injected into every page) ──────────────────────
NEW_NAV = '''    <!-- Top accent bar -->
    <div class="bg-earth h-1 w-full relative z-50"></div>

    <!-- ════════════════════════════════════════════════════════
         NAVIGATION  (Mobile-first, sticky)
    ═════════════════════════════════════════════════════════ -->
    <nav class="bg-white dark:bg-[#121A16] border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 shadow-sm transition-colors duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">

                <!-- Logo -->
                <a href="index.html" class="text-2xl md:text-3xl font-serif font-black text-black dark:text-gray-100 tracking-tight shrink-0">
                    ADIGURU\'S&reg;
                </a>

                <!-- Desktop Links (hidden on mobile) -->
                <div class="hidden md:flex items-center gap-6 lg:gap-8 text-black dark:text-gray-200 font-bold text-xs uppercase tracking-wider">

                    <!-- SHOP mega-menu -->
                    <div class="relative group py-5">
                        <a href="shop.html" class="flex items-center gap-1 hover:text-earth dark:hover:text-gold transition">
                            SHOP <i class="fas fa-chevron-down text-[9px] opacity-60 transition-transform duration-300 group-hover:rotate-180"></i>
                        </a>
                        <div class="absolute left-0 top-full pt-2 w-[680px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                            <div class="bg-white dark:bg-[#121A16] border border-gray-200 dark:border-gray-800 shadow-2xl rounded-xl grid grid-cols-3 p-6 gap-6 font-sans normal-case tracking-normal">
                                <div>
                                    <h4 class="font-serif font-bold text-earth text-base mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Main Categories</h4>
                                    <div class="flex flex-col space-y-2 text-[13px] font-medium text-gray-700 dark:text-gray-300">
                                        <a href="hair-care.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Hair Care</a>
                                        <a href="pain-relief-wellness-oils.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Pain Relief &amp; Wellness Oils</a>
                                        <a href="balms-skin-care.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Balms &amp; Skin Care</a>
                                        <a href="inhalers.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Inhalers</a>
                                    </div>
                                </div>
                                <div>
                                    <h4 class="font-serif font-bold text-earth text-base mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Specialty</h4>
                                    <div class="flex flex-col space-y-2 text-[13px] font-medium text-gray-700 dark:text-gray-300">
                                        <a href="headache-sinus-relief.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Headache &amp; Sinus Relief</a>
                                        <a href="joint-muscle-therapy.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Joint &amp; Muscle Therapy</a>
                                        <a href="deep-sleep-aids.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Deep Sleep Aids</a>
                                        <a href="dandruff-hairfall-control.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Dandruff &amp; Hairfall Control</a>
                                        <a href="skin-repair-solutions.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Skin Repair Solutions</a>
                                        <a href="chemical-free-wellness.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Chemical-Free Wellness</a>
                                    </div>
                                </div>
                                <div>
                                    <h4 class="font-serif font-bold text-earth text-base mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">More</h4>
                                    <div class="flex flex-col space-y-2 text-[13px] font-medium text-gray-700 dark:text-gray-300">
                                        <a href="best-sellers.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Best Sellers</a>
                                        <a href="twin-packs-bundles.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Twin Packs &amp; Bundles</a>
                                        <a href="shop.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">All Products</a>
                                        <a href="sale-offers.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Sale &amp; Offers</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- INSIDE ADIGURU'S mega-menu -->
                    <div class="relative group py-5">
                        <a href="about.html" class="flex items-center gap-1 hover:text-earth dark:hover:text-gold transition">
                            INSIDE ADIGURU\'S <i class="fas fa-chevron-down text-[9px] opacity-60 transition-transform duration-300 group-hover:rotate-180"></i>
                        </a>
                        <div class="absolute left-[-200px] top-full pt-2 w-[660px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                            <div class="bg-white dark:bg-[#121A16] border border-gray-200 dark:border-gray-800 shadow-2xl rounded-xl grid grid-cols-3 p-6 gap-6 font-sans normal-case tracking-normal">
                                <div>
                                    <h4 class="font-serif font-bold text-earth text-base mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Company Info</h4>
                                    <div class="flex flex-col space-y-2 text-[13px] font-medium text-gray-700 dark:text-gray-300">
                                        <a href="about.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Who We Are</a>
                                        <a href="about.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Ayurvedic Philosophy</a>
                                        <a href="about.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Sustainable Packaging</a>
                                        <a href="about.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Customer Testimonials</a>
                                        <a href="contact.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Contact Us</a>
                                    </div>
                                </div>
                                <div>
                                    <h4 class="font-serif font-bold text-earth text-base mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Product Info</h4>
                                    <div class="flex flex-col space-y-2 text-[13px] font-medium text-gray-700 dark:text-gray-300">
                                        <a href="about.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">About Our Ingredients</a>
                                        <a href="about.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Handcrafting Process</a>
                                        <a href="about.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">100% Natural Guarantee</a>
                                        <a href="about.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Chemical-Free Promise</a>
                                        <a href="about.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Traditional Infusions</a>
                                    </div>
                                </div>
                                <div>
                                    <h4 class="font-serif font-bold text-earth text-base mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Ayurvedic Wisdom</h4>
                                    <div class="flex flex-col space-y-2 text-[13px] font-medium text-gray-700 dark:text-gray-300">
                                        <a href="about.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Healing Formulations</a>
                                        <a href="about.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Understanding Doshas</a>
                                        <a href="about.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Ancient Text References</a>
                                        <a href="about.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Holistic Healing</a>
                                        <a href="about.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Aromatherapy Benefits</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- BLOG mega-menu -->
                    <div class="relative group py-5">
                        <a href="blog.html" class="flex items-center gap-1 hover:text-earth dark:hover:text-gold transition">
                            BLOG <i class="fas fa-chevron-down text-[9px] opacity-60 transition-transform duration-300 group-hover:rotate-180"></i>
                        </a>
                        <div class="absolute right-0 top-full pt-2 w-[480px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                            <div class="bg-white dark:bg-[#121A16] border border-gray-200 dark:border-gray-800 shadow-2xl rounded-xl grid grid-cols-2 p-6 gap-6 font-sans normal-case tracking-normal">
                                <div>
                                    <h4 class="font-serif font-bold text-earth text-base mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Categories</h4>
                                    <div class="flex flex-col space-y-2 text-[13px] font-medium text-gray-700 dark:text-gray-300">
                                        <a href="blog.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Ayurvedic Lifestyle</a>
                                        <a href="blog.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Natural Remedies</a>
                                        <a href="blog.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Mental Wellness</a>
                                        <a href="blog.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Healthy Diet &amp; Herbs</a>
                                    </div>
                                </div>
                                <div>
                                    <h4 class="font-serif font-bold text-earth text-base mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Recent Posts</h4>
                                    <div class="flex flex-col space-y-2 text-[13px] font-medium text-gray-700 dark:text-gray-300">
                                        <a href="blog.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Treating Dandruff Naturally</a>
                                        <a href="blog.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Benefits of Pain Relief Oils</a>
                                        <a href="blog.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Understanding your Dosha</a>
                                        <a href="blog.html" class="hover:text-earth dark:hover:text-gold transition py-0.5">Ayurveda for Deep Sleep</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Search + Icons -->
                <div class="flex items-center gap-3 md:gap-4">
                    <!-- Search (desktop only) -->
                    <div class="relative hidden md:block">
                        <input type="text" id="searchInput" placeholder="Search products..." class="border border-gray-200 dark:border-gray-700 rounded-full pl-4 pr-10 py-1.5 text-sm outline-none focus:border-earth dark:focus:border-gold w-40 lg:w-56 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#1a2420] placeholder-gray-400 transition-all duration-300 focus:w-48 lg:focus:w-64">
                        <button id="searchBtn" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-earth dark:hover:text-gold transition outline-none">
                            <i class="fas fa-search text-xs"></i>
                        </button>
                    </div>
                    <!-- Theme toggle -->
                    <button id="theme-toggle" class="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-earth dark:hover:text-gold transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <i class="fas fa-moon"></i>
                    </button>
                    <!-- Cart -->
                    <button class="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-earth dark:hover:text-gold transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative">
                        <i class="fas fa-shopping-cart"></i>
                        <span class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-earth text-white text-[9px] rounded-full flex items-center justify-center font-bold">0</span>
                    </button>
                    <!-- User -->
                    <a href="dashboard.html" class="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-earth dark:hover:text-gold transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <i class="far fa-user-circle"></i>
                    </a>
                    <!-- Hamburger (mobile only) -->
                    <button id="mobile-menu-btn" class="md:hidden w-9 h-9 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:text-earth transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <i class="fas fa-bars text-xl"></i>
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- ════════════════════════════════════════════════════════
         MOBILE OVERLAY
    ═════════════════════════════════════════════════════════ -->
    <div id="mobile-overlay" class="hidden fixed inset-0 bg-black/40 z-[90] md:hidden backdrop-blur-sm"></div>

    <!-- ════════════════════════════════════════════════════════
         MOBILE SLIDE-IN DRAWER
    ═════════════════════════════════════════════════════════ -->
    <div id="mobile-menu" class="fixed top-0 right-0 h-full w-[85vw] max-w-[360px] bg-white dark:bg-[#121A16] z-[100] md:hidden transform translate-x-full transition-transform duration-300 ease-in-out overflow-y-auto shadow-2xl">
        <!-- Drawer Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#121A16] z-10">
            <a href="index.html" class="text-xl font-serif font-black text-black dark:text-gray-100">ADIGURU\'S&reg;</a>
            <button id="mobile-close-btn" onclick="document.getElementById(\'mobile-menu-btn\').click()" class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-earth transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <i class="fas fa-times text-lg"></i>
            </button>
        </div>

        <!-- Mobile Search -->
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div class="relative">
                <input type="text" id="mobileSearchInput" placeholder="Search products..." class="w-full border border-gray-200 dark:border-gray-700 rounded-full pl-4 pr-10 py-2.5 text-sm outline-none focus:border-earth bg-gray-50 dark:bg-[#1a2420] text-gray-700 dark:text-gray-300 placeholder-gray-400">
                <button onclick="document.getElementById(\'searchInput\').value = document.getElementById(\'mobileSearchInput\').value; document.getElementById(\'searchBtn\').click();" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-earth transition">
                    <i class="fas fa-search text-sm"></i>
                </button>
            </div>
        </div>

        <!-- Mobile Nav Links -->
        <div class="px-3 py-3 space-y-1">

            <!-- Home -->
            <a href="index.html" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 font-semibold hover:bg-earth/10 hover:text-earth transition text-sm">
                <i class="fas fa-home w-4 text-earth/60"></i> Home
            </a>

            <!-- SHOP accordion -->
            <div>
                <button class="mobile-accordion-btn w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 font-semibold hover:bg-earth/10 hover:text-earth transition text-sm" data-target="mob-shop">
                    <span class="flex items-center gap-3"><i class="fas fa-store w-4 text-earth/60"></i> Shop</span>
                    <i class="fas fa-chevron-down acc-icon text-[10px] transition-transform duration-300"></i>
                </button>
                <div id="mob-shop" class="mobile-accordion-panel hidden pl-10 pb-2 space-y-0.5">
                    <p class="text-[10px] uppercase tracking-widest text-earth/60 font-bold pt-3 pb-1 px-2">Main Categories</p>
                    <a href="hair-care.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">Hair Care</a>
                    <a href="pain-relief-wellness-oils.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">Pain Relief &amp; Wellness Oils</a>
                    <a href="balms-skin-care.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">Balms &amp; Skin Care</a>
                    <a href="inhalers.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">Inhalers</a>
                    <p class="text-[10px] uppercase tracking-widest text-earth/60 font-bold pt-3 pb-1 px-2">Specialty</p>
                    <a href="headache-sinus-relief.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">Headache &amp; Sinus Relief</a>
                    <a href="joint-muscle-therapy.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">Joint &amp; Muscle Therapy</a>
                    <a href="deep-sleep-aids.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">Deep Sleep Aids</a>
                    <a href="dandruff-hairfall-control.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">Dandruff &amp; Hairfall Control</a>
                    <a href="skin-repair-solutions.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">Skin Repair Solutions</a>
                    <a href="chemical-free-wellness.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">Chemical-Free Wellness</a>
                    <p class="text-[10px] uppercase tracking-widest text-earth/60 font-bold pt-3 pb-1 px-2">More</p>
                    <a href="best-sellers.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">Best Sellers</a>
                    <a href="twin-packs-bundles.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">Twin Packs &amp; Bundles</a>
                    <a href="shop.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">All Products</a>
                    <a href="sale-offers.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">Sale &amp; Offers</a>
                </div>
            </div>

            <!-- INSIDE ADIGURU'S accordion -->
            <div>
                <button class="mobile-accordion-btn w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 font-semibold hover:bg-earth/10 hover:text-earth transition text-sm" data-target="mob-inside">
                    <span class="flex items-center gap-3"><i class="fas fa-leaf w-4 text-earth/60"></i> Inside Adiguru\'s</span>
                    <i class="fas fa-chevron-down acc-icon text-[10px] transition-transform duration-300"></i>
                </button>
                <div id="mob-inside" class="mobile-accordion-panel hidden pl-10 pb-2 space-y-0.5">
                    <a href="about.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">Who We Are</a>
                    <a href="about.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">Ayurvedic Philosophy</a>
                    <a href="about.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">About Our Ingredients</a>
                    <a href="about.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">Healing Formulations</a>
                </div>
            </div>

            <!-- BLOG accordion -->
            <div>
                <button class="mobile-accordion-btn w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 font-semibold hover:bg-earth/10 hover:text-earth transition text-sm" data-target="mob-blog">
                    <span class="flex items-center gap-3"><i class="fas fa-book-open w-4 text-earth/60"></i> Blog</span>
                    <i class="fas fa-chevron-down acc-icon text-[10px] transition-transform duration-300"></i>
                </button>
                <div id="mob-blog" class="mobile-accordion-panel hidden pl-10 pb-2 space-y-0.5">
                    <a href="blog.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">Ayurvedic Lifestyle</a>
                    <a href="blog.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">Natural Remedies</a>
                    <a href="blog.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">Mental Wellness</a>
                    <a href="blog.html" class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-earth hover:bg-earth/5 rounded-lg transition">Healthy Diet &amp; Herbs</a>
                </div>
            </div>

            <div class="px-1 pt-2 pb-1"><div class="h-px bg-gray-100 dark:bg-gray-800"></div></div>

            <a href="contact.html" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 font-semibold hover:bg-earth/10 hover:text-earth transition text-sm">
                <i class="fas fa-envelope w-4 text-earth/60"></i> Contact Us
            </a>
            <a href="dashboard.html" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 font-semibold hover:bg-earth/10 hover:text-earth transition text-sm">
                <i class="far fa-user-circle w-4 text-earth/60"></i> My Account
            </a>
        </div>

        <!-- Drawer CTA -->
        <div class="px-5 py-5 mt-2 border-t border-gray-100 dark:border-gray-800">
            <a href="shop.html" class="block w-full text-center bg-earth text-white py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:opacity-90 transition shadow-md">
                Shop All Products
            </a>
        </div>
    </div>'''

def replace_nav(content):
    """Replace everything from the top bar up to and including </nav> + overlay/drawer."""
    # Match: <!-- Global Top Green Bar --> block through </nav>
    pattern = re.compile(
        r'<!-- Global Top Green Bar.*?</nav>',
        re.DOTALL
    )
    if pattern.search(content):
        return pattern.sub(NEW_NAV, content, count=1)
    return None  # signal: nav block not found in expected format

html_files = sorted(glob.glob(os.path.join(base_dir, "*.html")))
updated = 0
skipped = []

for fpath in html_files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    result = replace_nav(content)
    if result is None:
        skipped.append(fname)
        continue

    with open(fpath, "w", encoding="utf-8") as f:
        f.write(result)
    updated += 1
    print(f"  ✓  {fname}")

print(f"\n✅  {updated} pages updated.")
if skipped:
    print(f"⚠️  Skipped (pattern not matched): {', '.join(skipped)}")
