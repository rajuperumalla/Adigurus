import os

base_dir = r"c:\Users\Pristyn Care.LT-ASUS-671\Desktop\Mediciti\computer-themed-portfolio\AdigurusWebsite"

# Read shop.html to extract nav + footer (we'll use lines 1-209 and 298-341)
with open(os.path.join(base_dir, "shop.html"), "r", encoding="utf-8") as f:
    shop_content = f.read()

# Extract nav block (before <main>) and footer block (after </main>)
nav_block = shop_content[:shop_content.index("    <!-- MAIN CONTENT AREA -->")]
footer_block = shop_content[shop_content.index("    </main>"):]

# ---- SHARED NAV + FOOTER WRAPPER ----
def make_page(title, slug, hero_icon, hero_tagline, hero_desc, product_cards, benefits):
    products_html = ""
    for p in product_cards:
        products_html += f"""
                    <div class="glass rounded-xl overflow-hidden card-shadow hover-zoom group relative flex flex-col h-full">
                        <div class="w-full h-56 flex items-center justify-center bg-gradient-to-br from-earth/10 to-gold/10 relative overflow-hidden">
                            <i class="{p['icon']} text-6xl text-earth/30 group-hover:scale-110 transition-transform duration-500"></i>
                            <div class="absolute top-3 right-3">
                                <span class="bg-gold/20 text-earth text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">{p.get('badge', 'Natural')}</span>
                            </div>
                        </div>
                        <div class="p-5 text-center flex flex-col flex-grow">
                            <h4 class="font-serif text-lg text-earth mb-1">{p['name']}</h4>
                            <p class="text-sm opacity-70 mb-3 line-clamp-2">{p['desc']}</p>
                            <p class="font-bold text-gold mb-4 mt-auto">₹{p['price']} <span class="text-xs font-normal opacity-50 line-through ml-1">₹{p['mrp']}</span></p>
                            <a href="product.html" class="w-full block border border-earth text-earth py-2 rounded-full uppercase text-xs tracking-widest hover:bg-earth hover:text-white transition">View Detail</a>
                        </div>
                    </div>"""

    benefits_html = ""
    for b in benefits:
        benefits_html += f"""
                    <div class="glass p-6 rounded-2xl flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-transform duration-300">
                        <div class="w-14 h-14 rounded-full bg-earth/10 flex items-center justify-center">
                            <i class="{b['icon']} text-xl text-earth"></i>
                        </div>
                        <h4 class="font-serif font-bold text-earth">{b['title']}</h4>
                        <p class="text-sm opacity-70 leading-relaxed">{b['desc']}</p>
                    </div>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Adiguru's | {title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body class="antialiased relative min-h-screen flex flex-col">

    <!-- Loading Animation -->
    <div id="loader">
        <div class="leaf-loader"></div>
    </div>

    <!-- Nature Background -->
    <div class="fixed inset-0 z-[-2]">
        <img src="images/nature-bg.jpg" class="w-full h-full object-cover opacity-30 dark:opacity-20" alt="Nature Background">
    </div>

    <!-- Background Chakras -->
    <div class="chakra-container">
        <div class="chakra chakra-1"></div>
        <div class="chakra chakra-2"></div>
        <div class="chakra chakra-3"></div>
        <div class="chakra chakra-4"></div>
        <div class="chakra chakra-5"></div>
        <div class="chakra chakra-6"></div>
        <div class="chakra chakra-7"></div>
    </div>

    <!-- Global Top Green Bar -->
    <div class="bg-earth h-1 w-full relative z-50"></div>

    <!-- Navigation -->
    <nav class="bg-white dark:bg-[#121A16] border-b border-white dark:border-gray-800 sticky top-0 z-50 py-4 px-6 md:px-12 flex flex-wrap justify-between items-center shadow-sm w-full transition-colors duration-300">
        <div class="flex items-center gap-8 md:gap-14">
            <a href="index.html" class="text-3xl md:text-4xl font-serif font-black text-black dark:text-gray-200 tracking-tight transition-colors">ADIGURU'S&reg;</a>
            <div class="hidden md:flex items-center gap-8 text-black dark:text-gray-200 font-extrabold text-sm uppercase tracking-wide">
                <!-- Shop Dropdown -->
                <div class="relative group py-4">
                    <a href="shop.html" class="flex items-center gap-1 hover:text-earth dark:hover:text-gold transition">
                        SHOP <i class="fas fa-chevron-down text-[10px] opacity-70 transition-transform duration-300 group-hover:rotate-180"></i>
                    </a>
                    <div class="absolute left-[-40px] top-full pt-1 w-[700px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        <div class="bg-[#FBF9F6] dark:bg-[#121A16] border border-gray-200 dark:border-gray-800 shadow-2xl rounded-xl flex p-8 gap-8 font-sans normal-case tracking-normal">
                            <div class="flex-1">
                                <h4 class="font-serif font-bold text-earth text-xl mb-4">Main Categories</h4>
                                <div class="flex flex-col space-y-3 font-medium text-gray-800 dark:text-gray-300 text-[15px]">
                                    <a href="hair-care.html" class="hover:text-earth dark:hover:text-gold transition">Hair Care</a>
                                    <a href="pain-relief-wellness-oils.html" class="hover:text-earth dark:hover:text-gold transition">Pain Relief &amp; Wellness Oils</a>
                                    <a href="balms-skin-care.html" class="hover:text-earth dark:hover:text-gold transition">Balms &amp; Skin Care</a>
                                    <a href="inhalers.html" class="hover:text-earth dark:hover:text-gold transition">Inhalers</a>
                                </div>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-serif font-bold text-earth text-xl mb-4">Specialty</h4>
                                <div class="flex flex-col space-y-3 font-medium text-gray-800 dark:text-gray-300 text-[15px]">
                                    <a href="headache-sinus-relief.html" class="hover:text-earth dark:hover:text-gold transition">Headache &amp; Sinus Relief</a>
                                    <a href="joint-muscle-therapy.html" class="hover:text-earth dark:hover:text-gold transition">Joint &amp; Muscle Therapy</a>
                                    <a href="deep-sleep-aids.html" class="hover:text-earth dark:hover:text-gold transition">Deep Sleep Aids</a>
                                    <a href="dandruff-hairfall-control.html" class="hover:text-earth dark:hover:text-gold transition">Dandruff &amp; Hairfall Control</a>
                                    <a href="skin-repair-solutions.html" class="hover:text-earth dark:hover:text-gold transition">Skin Repair Solutions</a>
                                    <a href="chemical-free-wellness.html" class="hover:text-earth dark:hover:text-gold transition">Chemical-Free Wellness</a>
                                </div>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-serif font-bold text-earth text-xl mb-4">More</h4>
                                <div class="flex flex-col space-y-3 font-medium text-gray-800 dark:text-gray-300 text-[15px]">
                                    <a href="best-sellers.html" class="hover:text-earth dark:hover:text-gold transition">Best Sellers</a>
                                    <a href="twin-packs-bundles.html" class="hover:text-earth dark:hover:text-gold transition">Twin Packs &amp; Bundles</a>
                                    <a href="shop.html" class="hover:text-earth dark:hover:text-gold transition">All Products</a>
                                    <a href="sale-offers.html" class="hover:text-earth dark:hover:text-gold transition">Sale &amp; Offers</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Inside Adiguru's -->
                <div class="relative group py-4">
                    <a href="about.html" class="flex items-center gap-1 hover:text-earth dark:hover:text-gold transition">
                        INSIDE ADIGURU'S <i class="fas fa-chevron-down text-[10px] opacity-70 transition-transform duration-300 group-hover:rotate-180"></i>
                    </a>
                    <div class="absolute left-[-300px] top-full pt-1 w-[750px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        <div class="bg-[#FBF9F6] dark:bg-[#121A16] border border-gray-200 dark:border-gray-800 shadow-2xl rounded-xl flex p-8 gap-8 font-sans normal-case tracking-normal text-left">
                            <div class="flex-1">
                                <h4 class="font-serif font-bold text-earth text-xl mb-4">Company Info</h4>
                                <div class="flex flex-col space-y-3 font-medium text-gray-800 dark:text-gray-300 text-[15px]">
                                    <a href="about.html" class="hover:text-earth dark:hover:text-gold transition">Who We Are</a>
                                    <a href="about.html" class="hover:text-earth dark:hover:text-gold transition">Ayurvedic Philosophy</a>
                                    <a href="about.html" class="hover:text-earth dark:hover:text-gold transition">Sustainable Packaging</a>
                                    <a href="about.html" class="hover:text-earth dark:hover:text-gold transition">Customer Testimonials</a>
                                    <a href="contact.html" class="hover:text-earth dark:hover:text-gold transition">Contact Us</a>
                                </div>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-serif font-bold text-earth text-xl mb-4">Product Info</h4>
                                <div class="flex flex-col space-y-3 font-medium text-gray-800 dark:text-gray-300 text-[15px]">
                                    <a href="about.html" class="hover:text-earth dark:hover:text-gold transition">About Our Ingredients</a>
                                    <a href="about.html" class="hover:text-earth dark:hover:text-gold transition">Handcrafting Process</a>
                                    <a href="about.html" class="hover:text-earth dark:hover:text-gold transition">100% Natural Guarantee</a>
                                    <a href="about.html" class="hover:text-earth dark:hover:text-gold transition">Chemical-Free Promise</a>
                                    <a href="about.html" class="hover:text-earth dark:hover:text-gold transition">Traditional Infusions</a>
                                </div>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-serif font-bold text-earth text-xl mb-4">Ayurvedic Wisdom</h4>
                                <div class="flex flex-col space-y-3 font-medium text-gray-800 dark:text-gray-300 text-[15px]">
                                    <a href="about.html" class="hover:text-earth dark:hover:text-gold transition">Healing Formulations</a>
                                    <a href="about.html" class="hover:text-earth dark:hover:text-gold transition">Understanding Doshas</a>
                                    <a href="about.html" class="hover:text-earth dark:hover:text-gold transition">Ancient Text References</a>
                                    <a href="about.html" class="hover:text-earth dark:hover:text-gold transition">Holistic Healing</a>
                                    <a href="about.html" class="hover:text-earth dark:hover:text-gold transition">Aromatherapy Benefits</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Blog -->
                <div class="relative group py-4">
                    <a href="blog.html" class="flex items-center gap-1 hover:text-earth dark:hover:text-gold transition">
                        BLOG <i class="fas fa-chevron-down text-[10px] opacity-70 transition-transform duration-300 group-hover:rotate-180"></i>
                    </a>
                    <div class="absolute left-[-150px] top-full pt-1 w-[550px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        <div class="bg-[#FBF9F6] dark:bg-[#121A16] border border-gray-200 dark:border-gray-800 shadow-2xl rounded-xl flex p-8 gap-8 font-sans normal-case tracking-normal text-left">
                            <div class="flex-1">
                                <h4 class="font-serif font-bold text-earth text-xl mb-4">Categories</h4>
                                <div class="flex flex-col space-y-3 font-medium text-gray-800 dark:text-gray-300 text-[15px]">
                                    <a href="blog.html" class="hover:text-earth dark:hover:text-gold transition">Ayurvedic Lifestyle</a>
                                    <a href="blog.html" class="hover:text-earth dark:hover:text-gold transition">Natural Remedies</a>
                                    <a href="blog.html" class="hover:text-earth dark:hover:text-gold transition">Mental Wellness</a>
                                    <a href="blog.html" class="hover:text-earth dark:hover:text-gold transition">Healthy Diet &amp; Herbs</a>
                                </div>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-serif font-bold text-earth text-xl mb-4">Recent Posts</h4>
                                <div class="flex flex-col space-y-3 font-medium text-gray-800 dark:text-gray-300 text-[15px]">
                                    <a href="blog.html" class="hover:text-earth dark:hover:text-gold transition">Treating Dandruff Naturally</a>
                                    <a href="blog.html" class="hover:text-earth dark:hover:text-gold transition">Benefits of Pain Relief Oils</a>
                                    <a href="blog.html" class="hover:text-earth dark:hover:text-gold transition">Understanding your Dosha</a>
                                    <a href="blog.html" class="hover:text-earth dark:hover:text-gold transition">Ayurveda for Deep Sleep</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Right: Search & Icons -->
        <div class="flex items-center gap-6 mt-4 md:mt-0">
            <div class="relative hidden sm:block">
                <input type="text" id="searchInput" placeholder="Search" class="border border-gray-300 dark:border-gray-700 rounded-sm pl-4 pr-10 py-2 text-sm outline-none focus:border-black dark:focus:border-gray-200 w-48 md:w-64 text-gray-700 dark:text-gray-300 bg-white dark:bg-[#121A16] placeholder-gray-400 transition-colors">
                <button id="searchBtn" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-earth dark:hover:text-gold transition outline-none">
                    <i class="fas fa-search text-sm font-light"></i>
                </button>
            </div>
            <button id="theme-toggle" class="text-black dark:text-gray-200 hover:text-earth dark:hover:text-gold transition"><i class="fas fa-moon"></i></button>
            <button class="text-black dark:text-gray-200 hover:text-earth dark:hover:text-gold transition text-xl relative">
                <i class="fas fa-shopping-cart"></i>
            </button>
            <a href="dashboard.html" class="text-black dark:text-gray-200 hover:text-earth dark:hover:text-gold transition text-xl">
                <i class="far fa-user-circle"></i>
            </a>
            <button class="md:hidden text-2xl text-black dark:text-gray-200 transition"><i class="fas fa-bars"></i></button>
        </div>
    </nav>

    <main class="flex-grow">

        <!-- Page Hero Banner -->
        <div class="bg-earth text-white py-16 px-6 md:px-12 relative overflow-hidden">
            <div class="absolute right-0 top-0 w-1/2 h-full bg-no-repeat bg-right opacity-5" style="background-image: url('https://www.transparenttextures.com/patterns/cubes.png');"></div>
            <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>
            <div class="max-w-7xl mx-auto relative z-10">
                <nav class="text-sm text-white/60 mb-6 flex items-center gap-2">
                    <a href="index.html" class="hover:text-gold transition">Home</a>
                    <i class="fas fa-chevron-right text-[9px]"></i>
                    <a href="shop.html" class="hover:text-gold transition">Shop</a>
                    <i class="fas fa-chevron-right text-[9px]"></i>
                    <span class="text-gold font-medium">{title}</span>
                </nav>
                <div class="flex items-center gap-6">
                    <div class="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <i class="{hero_icon} text-2xl text-gold"></i>
                    </div>
                    <div>
                        <h1 class="text-4xl md:text-5xl font-serif font-black leading-tight">{title}</h1>
                        <p class="text-white/70 mt-2 text-lg font-serif italic">{hero_tagline}</p>
                    </div>
                </div>
                <p class="mt-6 text-white/80 max-w-2xl leading-relaxed">{hero_desc}</p>
            </div>
        </div>

        <!-- Benefits Strip -->
        <div class="py-12 px-6 md:px-12 max-w-7xl mx-auto">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
{benefits_html}
            </div>
        </div>

        <!-- Products Section -->
        <div class="pb-20 px-6 md:px-12 max-w-7xl mx-auto">
            <div class="flex items-center gap-4 mb-10">
                <div class="h-px flex-grow bg-gray-200 dark:bg-gray-700"></div>
                <h2 class="text-2xl font-serif text-earth whitespace-nowrap">Our {title} Range</h2>
                <div class="h-px flex-grow bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
{products_html}
            </div>
            <div class="text-center mt-12">
                <a href="shop.html" class="inline-flex items-center gap-3 border border-earth text-earth px-8 py-3 rounded-full uppercase text-xs tracking-widest hover:bg-earth hover:text-white transition font-bold">
                    <i class="fas fa-arrow-left"></i> View All Products
                </a>
            </div>
        </div>

    </main>

    <!-- Footer -->
    <footer class="bg-black/5 dark:bg-white/5 border-t border-gray-200 dark:border-gray-800 mt-20">
        <div class="max-w-7xl mx-auto py-12 px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="col-span-1 md:col-span-2">
                <a href="index.html" class="text-2xl font-serif font-black text-earth mb-4 inline-block tracking-tight">ADIGURU'S&reg;</a>
                <p class="text-earth/80 dark:text-gray-300 font-serif italic text-lg max-w-sm leading-relaxed mb-6">Explore the ancient wisdom of Ayurveda for holistic wellness and balance in life.</p>
                <div class="flex gap-4">
                    <a href="#" class="text-xl hover:text-gold transition"><i class="fab fa-instagram"></i></a>
                    <a href="#" class="text-xl hover:text-gold transition"><i class="fab fa-facebook"></i></a>
                    <a href="#" class="text-xl hover:text-gold transition"><i class="fab fa-youtube"></i></a>
                </div>
            </div>
            <div>
                <h4 class="font-bold mb-4 uppercase text-sm tracking-widest text-earth">Navigation</h4>
                <ul class="space-y-2 text-sm opacity-80">
                    <li><a href="index.html" class="hover:text-gold transition">Home</a></li>
                    <li><a href="shop.html" class="hover:text-gold transition">Shop / Products</a></li>
                    <li><a href="about.html" class="hover:text-gold transition">About</a></li>
                    <li><a href="blog.html" class="hover:text-gold transition">Blog</a></li>
                    <li><a href="contact.html" class="hover:text-gold transition">Contact Us</a></li>
                </ul>
            </div>
            <div>
                <h4 class="font-bold mb-4 uppercase text-sm tracking-widest text-earth">Policies</h4>
                <ul class="space-y-2 text-sm opacity-80">
                    <li><a href="#" class="hover:text-gold transition">Privacy Policy</a></li>
                    <li><a href="#" class="hover:text-gold transition">Terms &amp; Conditions</a></li>
                    <li><a href="#" class="hover:text-gold transition">Refund Policy</a></li>
                    <li><a href="#" class="hover:text-gold transition">Shipping Policy</a></li>
                </ul>
            </div>
        </div>
        <div class="border-t border-gray-200 dark:border-gray-800 text-center py-6 text-xs text-earth/60 dark:text-gray-400 font-medium">
            &copy; 2025 by Adiguru Ayurveda. All rights reserved.
        </div>
    </footer>

    <script src="app.js"></script>
</body>
</html>"""


# ---- PAGE DATA ----
pages = [
    {
        "title": "Hair Care",
        "slug": "hair-care.html",
        "hero_icon": "fas fa-seedling",
        "hero_tagline": "Nature's finest herbs for lustrous, healthy hair",
        "hero_desc": "Restore your hair's natural strength and shine with our ancient Ayurvedic formulations. Crafted using Bhringraj, Amla, Neem, and pure essential oils sourced directly from organic farms.",
        "benefits": [
            {"icon": "fas fa-leaf", "title": "100% Herbal", "desc": "Pure Bhringraj, Amla, Neem — no synthetic additives"},
            {"icon": "fas fa-flask", "title": "Chemical-Free", "desc": "No sulfates, parabens or silicones"},
            {"icon": "fas fa-recycle", "title": "Eco Packed", "desc": "Sustainable, biodegradable packaging"},
            {"icon": "fas fa-star", "title": "50k+ Customers", "desc": "Trusted by families across India"},
        ],
        "products": [
            {"icon": "fas fa-tint", "name": "Medicated Hair Oil (2 Pack)", "desc": "Dandruff, Itchy Scalp & Hairfall Control", "price": "250.00", "mrp": "280.00", "badge": "Best Seller"},
            {"icon": "fas fa-spa", "name": "Bhringraj Growth Serum", "desc": "Stimulates roots, reduces hair loss naturally", "price": "320.00", "mrp": "380.00", "badge": "New"},
            {"icon": "fas fa-leaf", "name": "Amla Hair Mask", "desc": "Deep conditioning & scalp nourishment", "price": "180.00", "mrp": "210.00", "badge": "Popular"},
            {"icon": "fas fa-wind", "name": "Neem Scalp Cleanser", "desc": "Anti-fungal, anti-bacterial scalp purifier", "price": "145.00", "mrp": "175.00", "badge": "Natural"},
            {"icon": "fas fa-fire", "name": "Warm Herb Scalp Oil", "desc": "Improves blood circulation & hair thickness", "price": "220.00", "mrp": "260.00", "badge": "Organic"},
            {"icon": "fas fa-mortar-pestle", "name": "Herbal Hair Pack Combo", "desc": "Complete hair care kit with 3 products", "price": "480.00", "mrp": "580.00", "badge": "Bundle"},
        ]
    },
    {
        "title": "Pain Relief & Wellness Oils",
        "slug": "pain-relief-wellness-oils.html",
        "hero_icon": "fas fa-hand-holding-heart",
        "hero_tagline": "Soothe every ache with time-tested Ayurvedic oils",
        "hero_desc": "Our pain relief oils blend the power of Mahanarayan, Ashwagandha, and warming camphor essential oils to provide deep, long-lasting relief for joints, muscles, and body aches.",
        "benefits": [
            {"icon": "fas fa-fire", "title": "Deep Penetration", "desc": "Reaches joints & muscle tissue effectively"},
            {"icon": "fas fa-om", "title": "Ancient Formula", "desc": "Based on traditional Mahanarayan Taila"},
            {"icon": "fas fa-clock", "title": "Long-Lasting", "desc": "Relief that lasts hours, not minutes"},
            {"icon": "fas fa-certificate", "title": "Lab Tested", "desc": "Purity & potency verified at every batch"},
        ],
        "products": [
            {"icon": "fas fa-tint", "name": "Pain Relief Oil", "desc": "Joint, Muscle & Body Care", "price": "220.00", "mrp": "250.00", "badge": "Best Seller"},
            {"icon": "fas fa-fire-alt", "name": "Deep Heat Wellness Oil", "desc": "Concentrated warming formula for chronic pain", "price": "290.00", "mrp": "340.00", "badge": "Popular"},
            {"icon": "fas fa-spa", "name": "Mahanarayan Taila", "desc": "Classical Ayurvedic joint & nerve oil", "price": "350.00", "mrp": "420.00", "badge": "Authentic"},
            {"icon": "fas fa-leaf", "name": "Ashwagandha Relief Balm", "desc": "Adaptogen-rich balm for muscular fatigue", "price": "195.00", "mrp": "230.00", "badge": "Natural"},
            {"icon": "fas fa-bolt", "name": "Instant Cooling Oil", "desc": "Eucalyptus & Peppermint for quick relief", "price": "165.00", "mrp": "195.00", "badge": "Fast Act"},
            {"icon": "fas fa-mortar-pestle", "name": "Wellness Oil Combo", "desc": "Hot + Cold therapy oils bundle", "price": "420.00", "mrp": "500.00", "badge": "Bundle"},
        ]
    },
    {
        "title": "Balms & Skin Care",
        "slug": "balms-skin-care.html",
        "hero_icon": "fas fa-feather-alt",
        "hero_tagline": "Pure herbs, gentle care — skin that glows naturally",
        "hero_desc": "Our balms and skin care range uses age-old Ayurvedic secrets — Turmeric, Sandalwood, Rose, and Saffron — to nourish, protect, and revitalise your skin without a single chemical.",
        "benefits": [
            {"icon": "fas fa-sun", "title": "Glow Enhancing", "desc": "Natural radiance with turmeric & saffron"},
            {"icon": "fas fa-shield-alt", "title": "Skin Protecting", "desc": "Shields against pollution & dryness"},
            {"icon": "fas fa-water", "title": "Deep Hydration", "desc": "Kokum & shea butter base for moisture lock"},
            {"icon": "fas fa-leaf", "title": "Zero Chemicals", "desc": "No parabens, SLES or artificial fragrance"},
        ],
        "products": [
            {"icon": "fas fa-spa", "name": "Turmeric Glow Balm", "desc": "Anti-inflammatory & brightening daily balm", "price": "210.00", "mrp": "250.00", "badge": "Best Seller"},
            {"icon": "fas fa-feather", "name": "Sandalwood Face Cream", "desc": "Cooling, soothing & clearing skin tonic", "price": "280.00", "mrp": "320.00", "badge": "Popular"},
            {"icon": "fas fa-tint", "name": "Rose Skin Elixir", "desc": "Hydrating & anti-aging floral serum", "price": "340.00", "mrp": "400.00", "badge": "Premium"},
            {"icon": "fas fa-fire", "name": "Charcoal Detox Soap", "desc": "Deep cleansing & pore purification", "price": "110.00", "mrp": "150.00", "badge": "Natural"},
            {"icon": "fas fa-moon", "name": "Night Repair Balm", "desc": "Neem & aloe overnight rejuvenation balm", "price": "265.00", "mrp": "310.00", "badge": "Repair"},
            {"icon": "fas fa-sun", "name": "Day Shield Cream", "desc": "Herbal SPF alternative with zinc & herbs", "price": "230.00", "mrp": "270.00", "badge": "Protect"},
        ]
    },
    {
        "title": "Inhalers",
        "slug": "inhalers.html",
        "hero_icon": "fas fa-wind",
        "hero_tagline": "Instant nasal clarity through pure herbal aromatherapy",
        "hero_desc": "Our herbal inhalers combine the power of Eucalyptus, Peppermint, Camphor, and Tulsi to instantly open blocked nasal passages, relieve sinus pressure, and refresh the mind.",
        "benefits": [
            {"icon": "fas fa-wind", "title": "Instant Relief", "desc": "Opens nasal passages within seconds"},
            {"icon": "fas fa-leaf", "title": "Pure Herbs Only", "desc": "No chemical propellants or additives"},
            {"icon": "fas fa-suitcase", "title": "Pocket Friendly", "desc": "Compact design, carry anywhere"},
            {"icon": "fas fa-infinity", "title": "Long Lasting", "desc": "Up to 6 months of effective use"},
        ],
        "products": [
            {"icon": "fas fa-wind", "name": "Herbal Inhaler", "desc": "Eucalyptus & Peppermint for sinus & cold", "price": "135.00", "mrp": "160.00", "badge": "Best Seller"},
            {"icon": "fas fa-leaf", "name": "Tulsi Breath Inhaler", "desc": "Immunity boosting & respiratory clearing", "price": "120.00", "mrp": "145.00", "badge": "Immunity"},
            {"icon": "fas fa-bolt", "name": "Camphor Clarity Stick", "desc": "Instant cooling & decongestant action", "price": "99.00", "mrp": "120.00", "badge": "Fast Act"},
            {"icon": "fas fa-moon", "name": "Sleep Inhaler", "desc": "Lavender & Chamomile for bedtime calm", "price": "145.00", "mrp": "170.00", "badge": "Sleep"},
            {"icon": "fas fa-fire", "name": "Headache Relief Inhaler", "desc": "Mint & Basil complex for tension relief", "price": "115.00", "mrp": "140.00", "badge": "Relief"},
            {"icon": "fas fa-star", "name": "Inhaler Combo Pack", "desc": "Day + Night inhalers — best value", "price": "240.00", "mrp": "300.00", "badge": "Bundle"},
        ]
    },
    {
        "title": "Headache & Sinus Relief",
        "slug": "headache-sinus-relief.html",
        "hero_icon": "fas fa-brain",
        "hero_tagline": "Clear your head with ancient Ayurvedic synergy",
        "hero_desc": "Specially curated to combat tension headaches, migraine triggers, and chronic sinus congestion using Brahmi, Peppermint, Camphor and Shankhpushpi in targeted formulations.",
        "benefits": [
            {"icon": "fas fa-bolt", "title": "Fast Acting", "desc": "Noticeable relief within 5–10 minutes"},
            {"icon": "fas fa-brain", "title": "Mind Calming", "desc": "Brahmi soothes neural inflammation"},
            {"icon": "fas fa-wind", "title": "Sinus Opening", "desc": "Camphor & Peppermint clear passages"},
            {"icon": "fas fa-leaf", "title": "No Chemicals", "desc": "Drug-free, non-drowsy herbal relief"},
        ],
        "products": [
            {"icon": "fas fa-tint", "name": "Universal Relief Oil", "desc": "Headache, Sinus & Cold multi-formula", "price": "99.00", "mrp": "108.00", "badge": "Best Seller"},
            {"icon": "fas fa-wind", "name": "Sinus Clear Inhaler", "desc": "Targeted menthol & eucalyptus blend", "price": "135.00", "mrp": "160.00", "badge": "Popular"},
            {"icon": "fas fa-spa", "name": "Migraine Balm", "desc": "Apply on temples — Brahmi & Lavender", "price": "190.00", "mrp": "225.00", "badge": "Specialist"},
            {"icon": "fas fa-leaf", "name": "Shankhpushpi Head Drops", "desc": "2-drop nasal therapy for sinus relief", "price": "165.00", "mrp": "200.00", "badge": "Ayurvedic"},
            {"icon": "fas fa-fire", "name": "Camphor Cooling Rub", "desc": "Forehead application for instant coolness", "price": "110.00", "mrp": "135.00", "badge": "Cooling"},
            {"icon": "fas fa-mortar-pestle", "name": "Head Relief Combo", "desc": "Oil + Inhaler + Balm trio pack", "price": "340.00", "mrp": "400.00", "badge": "Bundle"},
        ]
    },
    {
        "title": "Joint & Muscle Therapy",
        "slug": "joint-muscle-therapy.html",
        "hero_icon": "fas fa-dumbbell",
        "hero_tagline": "Restore mobility with deep Ayurvedic muscle therapy",
        "hero_desc": "Formulated for arthritis, sports injuries, chronic back pain, and muscular stiffness. Our Mahanarayan and Nirgundi-based therapies penetrate deep for lasting relief.",
        "benefits": [
            {"icon": "fas fa-running", "title": "Mobility Restoring", "desc": "Get back to walking, bending, exercising"},
            {"icon": "fas fa-fire", "title": "Deep Heat", "desc": "Penetrates to joints & surrounding tissue"},
            {"icon": "fas fa-clock", "title": "12-Hour Relief", "desc": "Long-lasting anti-inflammatory action"},
            {"icon": "fas fa-leaf", "title": "Zero Side Effects", "desc": "Natural herbs with no kidney strain"},
        ],
        "products": [
            {"icon": "fas fa-tint", "name": "Pain Relief Oil", "desc": "Joint & Muscle deep therapy oil", "price": "220.00", "mrp": "250.00", "badge": "Best Seller"},
            {"icon": "fas fa-fire-alt", "name": "Nirgundi Arthritis Oil", "desc": "Classical herb for arthritic joints", "price": "310.00", "mrp": "370.00", "badge": "Specialist"},
            {"icon": "fas fa-thumbs-up", "name": "Sports Recovery Balm", "desc": "Post-workout muscle repair formula", "price": "240.00", "mrp": "285.00", "badge": "Athletes"},
            {"icon": "fas fa-leaf", "name": "Back Care Oil", "desc": "Targeted lumbar & spine support oil", "price": "265.00", "mrp": "310.00", "badge": "Popular"},
            {"icon": "fas fa-spa", "name": "Kneecap Relief Wrap Oil", "desc": "Meniscus & knee joint nourishment", "price": "280.00", "mrp": "330.00", "badge": "Targeted"},
            {"icon": "fas fa-mortar-pestle", "name": "Joint Therapy Combo", "desc": "Complete 3-product joint care system", "price": "580.00", "mrp": "700.00", "badge": "Bundle"},
        ]
    },
    {
        "title": "Deep Sleep Aids",
        "slug": "deep-sleep-aids.html",
        "hero_icon": "fas fa-moon",
        "hero_tagline": "Drift into deep, restorative sleep — naturally",
        "hero_desc": "Curated with Ashwagandha, Lavender, Jatamasi, and Brahmi to calm an overactive nervous system, reduce cortisol, and guide you into uninterrupted, rejuvenating sleep.",
        "benefits": [
            {"icon": "fas fa-moon", "title": "Delta Wave Sleep", "desc": "Triggers deep REM sleep cycles naturally"},
            {"icon": "fas fa-brain", "title": "Stress Dissolving", "desc": "Ashwagandha reduces cortisol effectively"},
            {"icon": "fas fa-leaf", "title": "Non-Addictive", "desc": "No melatonin dependency or next-day fog"},
            {"icon": "fas fa-star", "title": "Clinically Inspired", "desc": "Based on research-backed herbs"},
        ],
        "products": [
            {"icon": "fas fa-spa", "name": "Sleep Balm", "desc": "Apply on wrists & temples before bed", "price": "90.00", "mrp": "108.00", "badge": "Best Seller"},
            {"icon": "fas fa-moon", "name": "Jatamasi Pillow Spray", "desc": "Mist on pillow for instant calm", "price": "155.00", "mrp": "185.00", "badge": "Popular"},
            {"icon": "fas fa-leaf", "name": "Sleep Inhaler", "desc": "Lavender & Chamomile bedtime inhaler", "price": "145.00", "mrp": "170.00", "badge": "Aromatic"},
            {"icon": "fas fa-fire", "name": "Ashwagandha Night Oil", "desc": "Scalp massage oil for deep relaxation", "price": "210.00", "mrp": "255.00", "badge": "Premium"},
            {"icon": "fas fa-tint", "name": "Brahmi Calm Drops", "desc": "3-drop under-tongue nervine tonic", "price": "175.00", "mrp": "210.00", "badge": "Potent"},
            {"icon": "fas fa-mortar-pestle", "name": "Sleep Ritual Kit", "desc": "Balm + Spray + Inhaler complete set", "price": "350.00", "mrp": "430.00", "badge": "Bundle"},
        ]
    },
    {
        "title": "Dandruff & Hairfall Control",
        "slug": "dandruff-hairfall-control.html",
        "hero_icon": "fas fa-cut",
        "hero_tagline": "End dandruff & hairfall with targeted herbal therapy",
        "hero_desc": "Combat the root causes of dandruff — fungal buildup, dry scalp, and product residue — with our Neem, Tea Tree, and Bhringraj-powered formulations designed for lasting scalp health.",
        "benefits": [
            {"icon": "fas fa-shield-alt", "title": "Anti-Fungal", "desc": "Neem & Tea Tree kill dandruff at source"},
            {"icon": "fas fa-seedling", "title": "Root Strengthening", "desc": "Bhringraj anchors follicles, reduces fall"},
            {"icon": "fas fa-leaf", "title": "Scalp Balancing", "desc": "Regulates sebum production naturally"},
            {"icon": "fas fa-star", "title": "Visible in 4 Weeks", "desc": "Real results within one usage cycle"},
        ],
        "products": [
            {"icon": "fas fa-tint", "name": "Medicated Hair Oil (2 Pack)", "desc": "Dandruff, Itchy Scalp & Hairfall", "price": "250.00", "mrp": "280.00", "badge": "Best Seller"},
            {"icon": "fas fa-leaf", "name": "Neem Anti-Dandruff Oil", "desc": "Concentrated anti-fungal scalp therapy", "price": "195.00", "mrp": "230.00", "badge": "Targeted"},
            {"icon": "fas fa-spa", "name": "Bhringraj Root Serum", "desc": "Follicle-anchoring & hairfall reduction", "price": "285.00", "mrp": "340.00", "badge": "Popular"},
            {"icon": "fas fa-fire", "name": "Scalp Detox Mask", "desc": "Weekly deep-cleanse with clay & herbs", "price": "160.00", "mrp": "195.00", "badge": "Weekly"},
            {"icon": "fas fa-cut", "name": "Hairfall Control Pack", "desc": "3-month comprehensive growth protocol", "price": "620.00", "mrp": "750.00", "badge": "Protocol"},
            {"icon": "fas fa-mortar-pestle", "name": "Anti-Dandruff Combo", "desc": "Oil + Mask + Serum bundle", "price": "560.00", "mrp": "680.00", "badge": "Bundle"},
        ]
    },
    {
        "title": "Skin Repair Solutions",
        "slug": "skin-repair-solutions.html",
        "hero_icon": "fas fa-magic",
        "hero_tagline": "Heal, restore & protect damaged skin with ancient herbs",
        "hero_desc": "Our skin repair range draws from classical Ayurvedic Kalpa formulations using Manjistha, Kumkumadi, Aloe Vera, and Lodhra to reverse sun damage, scars, and skin imbalances.",
        "benefits": [
            {"icon": "fas fa-magic", "title": "Scar Fading", "desc": "Manjistha & Kumkumadi reduce marks"},
            {"icon": "fas fa-sun", "title": "UV Damage Repair", "desc": "Reverses hyperpigmentation & sun spots"},
            {"icon": "fas fa-water", "title": "Barrier Repair", "desc": "Rebuilds damaged skin's protective layer"},
            {"icon": "fas fa-leaf", "title": "Ayurvedic Certified", "desc": "Traditional formulation — zero fillers"},
        ],
        "products": [
            {"icon": "fas fa-spa", "name": "Kumkumadi Glow Serum", "desc": "Saffron-based skin brightening elixir", "price": "380.00", "mrp": "450.00", "badge": "Premium"},
            {"icon": "fas fa-sun", "name": "Manjistha Scar Balm", "desc": "Targets blemishes, dark spots & scars", "price": "260.00", "mrp": "310.00", "badge": "Best Seller"},
            {"icon": "fas fa-leaf", "name": "Aloe Repair Gel", "desc": "Sunburn, redness & irritation calmer", "price": "140.00", "mrp": "170.00", "badge": "Soothing"},
            {"icon": "fas fa-fire", "name": "Lodhra Face Pack", "desc": "Astringent firming mask for all skins", "price": "175.00", "mrp": "210.00", "badge": "Firming"},
            {"icon": "fas fa-tint", "name": "Rose & Sandalwood Toner", "desc": "pH-balancing herbal skin tonic", "price": "155.00", "mrp": "185.00", "badge": "Toning"},
            {"icon": "fas fa-mortar-pestle", "name": "Skin Repair Ritual Kit", "desc": "Serum + Balm + Toner complete set", "price": "660.00", "mrp": "800.00", "badge": "Bundle"},
        ]
    },
    {
        "title": "Chemical-Free Wellness",
        "slug": "chemical-free-wellness.html",
        "hero_icon": "fas fa-certificate",
        "hero_tagline": "Wellness designed for the purest, most conscious living",
        "hero_desc": "Every product in this range is 100% free from parabens, artificial fragrances, SLS/SLES, and synthetic preservatives. Pure plants. Pure intention. Pure healing.",
        "benefits": [
            {"icon": "fas fa-ban", "title": "Zero Parabens", "desc": "Hormone-safe formulations only"},
            {"icon": "fas fa-leaf", "title": "Zero Synthetics", "desc": "No artificial colours, scents or wax"},
            {"icon": "fas fa-recycle", "title": "Eco-Friendly", "desc": "Sustainably sourced & packaged"},
            {"icon": "fas fa-certificate", "title": "Transparency", "desc": "Full ingredient list on every product"},
        ],
        "products": [
            {"icon": "fas fa-leaf", "name": "Pure Neem Body Oil", "desc": "100% cold-pressed neem — no additives", "price": "165.00", "mrp": "195.00", "badge": "Pure"},
            {"icon": "fas fa-spa", "name": "Clay + Herb Face Mask", "desc": "Multani mitti & herbal detox mask", "price": "145.00", "mrp": "180.00", "badge": "Natural"},
            {"icon": "fas fa-tint", "name": "Castor Growth Oil", "desc": "Unrefined, cold-pressed castor for hair & skin", "price": "120.00", "mrp": "145.00", "badge": "Organic"},
            {"icon": "fas fa-fire", "name": "Herbal Charcoal Soap", "desc": "Deep cleanse soap — SLS free", "price": "110.00", "mrp": "150.00", "badge": "Chemical-Free"},
            {"icon": "fas fa-feather", "name": "Zero-Chemical Moisturizer", "desc": "Shea + Kokum + Aloe natural moisturizer", "price": "190.00", "mrp": "230.00", "badge": "Clean Beauty"},
            {"icon": "fas fa-mortar-pestle", "name": "Clean Living Starter Kit", "desc": "6-product chemical-free wellness bundle", "price": "720.00", "mrp": "900.00", "badge": "Bundle"},
        ]
    },
    {
        "title": "Best Sellers",
        "slug": "best-sellers.html",
        "hero_icon": "fas fa-fire",
        "hero_tagline": "Loved by 50,000+ families across India",
        "hero_desc": "Discover the products that have earned the deepest trust from our customers. Each best seller carries hundreds of verified reviews and real transformations.",
        "benefits": [
            {"icon": "fas fa-star", "title": "Highest Rated", "desc": "4.8+ stars across all products"},
            {"icon": "fas fa-users", "title": "50k+ Customers", "desc": "Trusted by families pan-India"},
            {"icon": "fas fa-redo", "title": "High Repeat Rate", "desc": "85% customers reorder within 60 days"},
            {"icon": "fas fa-certificate", "title": "Verified Reviews", "desc": "Only genuine buyer testimonials"},
        ],
        "products": [
            {"icon": "fas fa-tint", "name": "Medicated Hair Oil (2 Pack)", "desc": "Dandruff, Itchy Scalp & Hairfall", "price": "250.00", "mrp": "280.00", "badge": "#1 Best Seller"},
            {"icon": "fas fa-hand-holding-heart", "name": "Pain Relief Oil", "desc": "Joint, Muscle & Body Care", "price": "220.00", "mrp": "250.00", "badge": "#2 Best Seller"},
            {"icon": "fas fa-spa", "name": "Sleep Balm", "desc": "Deep Sleep & Relaxation", "price": "90.00", "mrp": "108.00", "badge": "#3 Best Seller"},
            {"icon": "fas fa-wind", "name": "Herbal Inhaler", "desc": "Cold, Sinus & Headaches", "price": "135.00", "mrp": "160.00", "badge": "#4 Best Seller"},
            {"icon": "fas fa-fire", "name": "Universal Relief Oil", "desc": "Headache, Sinus & Cold multi-use", "price": "99.00", "mrp": "108.00", "badge": "#5 Best Seller"},
            {"icon": "fas fa-leaf", "name": "Charcoal Soap", "desc": "Deep Cleansing & Skin Detox", "price": "110.00", "mrp": "150.00", "badge": "#6 Best Seller"},
        ]
    },
    {
        "title": "Twin Packs & Bundles",
        "slug": "twin-packs-bundles.html",
        "hero_icon": "fas fa-box-open",
        "hero_tagline": "More healing, better savings — curated Ayurvedic bundles",
        "hero_desc": "Our thoughtfully crafted bundles combine complementary products to give you a complete therapeutic experience while saving up to 30% compared to individual purchases.",
        "benefits": [
            {"icon": "fas fa-tags", "title": "Up to 30% Off", "desc": "Big savings vs. buying individually"},
            {"icon": "fas fa-gift", "title": "Gift Ready", "desc": "Beautifully packaged — perfect for gifting"},
            {"icon": "fas fa-project-diagram", "title": "Curated Pairings", "desc": "Products that synergize for best results"},
            {"icon": "fas fa-truck", "title": "Free Shipping", "desc": "All bundle orders ship free across India"},
        ],
        "products": [
            {"icon": "fas fa-box", "name": "Hair Care Duo", "desc": "Hair Oil + Bhringraj Serum — 2 Pack", "price": "430.00", "mrp": "550.00", "badge": "Save ₹120"},
            {"icon": "fas fa-box", "name": "Pain Relief Bundle", "desc": "Pain Oil + Deep Heat Oil — twin pack", "price": "380.00", "mrp": "490.00", "badge": "Save ₹110"},
            {"icon": "fas fa-box", "name": "Sleep + Calm Kit", "desc": "Sleep Balm + Brahmi Oil + Inhaler", "price": "350.00", "mrp": "430.00", "badge": "Save ₹80"},
            {"icon": "fas fa-box-open", "name": "Complete Wellness Box", "desc": "7 bestselling products in one premium box", "price": "980.00", "mrp": "1280.00", "badge": "Save ₹300"},
            {"icon": "fas fa-gift", "name": "Gift Hamper", "desc": "Curated gift box — beautifully wrapped", "price": "750.00", "mrp": "950.00", "badge": "Gift"},
            {"icon": "fas fa-box", "name": "Skin Repair Duo", "desc": "Kumkumadi Serum + Manjistha Balm", "price": "560.00", "mrp": "710.00", "badge": "Save ₹150"},
        ]
    },
    {
        "title": "Sale & Offers",
        "slug": "sale-offers.html",
        "hero_icon": "fas fa-tags",
        "hero_tagline": "Incredible savings on authentic Ayurvedic wellness",
        "hero_desc": "Limited time offers on our top-selling products. Stock up on your favourite formulations at unbeatable prices — while supplies last.",
        "benefits": [
            {"icon": "fas fa-clock", "title": "Limited Time", "desc": "Offers valid while current stock lasts"},
            {"icon": "fas fa-percent", "title": "Up to 40% Off", "desc": "Genuine discounts, not inflated MRPs"},
            {"icon": "fas fa-truck", "title": "Free Shipping", "desc": "Orders above ₹499 ship free"},
            {"icon": "fas fa-undo", "title": "Easy Returns", "desc": "7-day no-questions return policy"},
        ],
        "products": [
            {"icon": "fas fa-tint", "name": "Hair Oil — Mega Pack", "desc": "3-pack deal — save big on bulk", "price": "590.00", "mrp": "840.00", "badge": "30% OFF"},
            {"icon": "fas fa-hand-holding-heart", "name": "Pain Relief Oil — Offer", "desc": "Joint & Muscle — limited stock deal", "price": "165.00", "mrp": "250.00", "badge": "34% OFF"},
            {"icon": "fas fa-spa", "name": "Sleep Balm — 2 Pack", "desc": "Buy 2 sleep balms at special price", "price": "155.00", "mrp": "216.00", "badge": "28% OFF"},
            {"icon": "fas fa-fire", "name": "Universal Oil — Clearance", "desc": "Last few bottles at discounted price", "price": "69.00", "mrp": "108.00", "badge": "36% OFF"},
            {"icon": "fas fa-wind", "name": "Inhaler — Festival Pack", "desc": "5 inhalers at near-cost price", "price": "450.00", "mrp": "675.00", "badge": "33% OFF"},
            {"icon": "fas fa-box-open", "name": "Mix & Match Bundle", "desc": "Choose any 4 products — flat rate", "price": "680.00", "mrp": "980.00", "badge": "31% OFF"},
        ]
    },
]

# ---- BUILD ALL PAGES ----
for page in pages:
    products_list = [
        {"icon": p["icon"], "name": p["name"], "desc": p["desc"],
         "price": p["price"], "mrp": p["mrp"], "badge": p.get("badge", "Natural")}
        for p in page["products"]
    ]
    html = make_page(
        title=page["title"],
        slug=page["slug"],
        hero_icon=page["hero_icon"],
        hero_tagline=page["hero_tagline"],
        hero_desc=page["hero_desc"],
        product_cards=products_list,
        benefits=page["benefits"]
    )
    out_path = os.path.join(base_dir, page["slug"])
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"  Created: {page['slug']}")

print(f"\nAll {len(pages)} category pages built successfully!")
