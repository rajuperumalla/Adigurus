import os
import re
import glob
import shutil

base_dir = r"c:\Users\Pristyn Care.LT-ASUS-671\Desktop\Mediciti\computer-themed-portfolio\AdigurusWebsite"
shop_path = os.path.join(base_dir, "shop.html")

# Read shop.html as the layout template
with open(shop_path, "r", encoding="utf-8") as f:
    shop_html = f.read()

# Define the targets we want to create pages for based on the text
targets = [
    "Hair Care",
    "Pain Relief & Wellness Oils",
    "Balms & Skin Care",
    "Inhalers",
    "Headache & Sinus Relief",
    "Joint & Muscle Therapy",
    "Deep Sleep Aids",
    "Dandruff & Hairfall Control",
    "Skin Repair Solutions",
    "Chemical-Free Wellness"
]

def slugify(text):
    s = text.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s) # remove special chars except space and dash
    s = re.sub(r'\s+', '-', s).strip() # replace spaces with dash
    return s + ".html"

# 1. Update navigation links in ALL HTML files, including the base shop_html which we will use for duplicates
html_files = glob.glob(os.path.join(base_dir, "*.html"))

for file_path in html_files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # We only want to replace href="#" for these specific categories.
    for target in targets:
        slug = slugify(target)
        # Using regex to find <a href="#" ...>TargetText</a>
        # Let's match `<a href="#" class="...">Target</a>`
        pattern = r'<a\s+href="#"\s+class="([^"]+)">' + re.escape(target) + r'</a>'
        replacement = r'<a href="' + slug + r'" class="\1">' + target + '</a>'
        content = re.sub(pattern, replacement, content)
        
        # In case href="#" is after class
        pattern2 = r'<a\s+class="([^"]+)"\s+href="#">' + re.escape(target) + r'</a>'
        replacement2 = r'<a class="\1" href="' + slug + '">' + target + '</a>'
        content = re.sub(pattern2, replacement2, content)
        
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

# We must read shop.html again because it was just updated with correct links!
with open(shop_path, "r", encoding="utf-8") as f:
    shop_template = f.read()

# 2. Duplicate shop.html for each target and inject the custom Title
for target in targets:
    slug = slugify(target)
    out_path = os.path.join(base_dir, slug)
    
    # Replace the <h1 class="... text-earth ...">Our Remedies</h1> with the new target name
    # <h1 class="text-4xl font-serif text-earth mb-8 text-center">Our Remedies</h1>
    pattern_title = r'(<h1[^>]*>).*?(</h1>)'
    
    # Be careful not to replace the logo h1 or other things... Wait, shop.html has specific H1
    # <h1 class="text-4xl font-serif text-earth mb-8 text-center">Our Remedies</h1>
    new_page_html = re.sub(r'<h1 class="text-4xl font-serif text-earth mb-8 text-center">Our Remedies</h1>',
                           f'<h1 class="text-4xl font-serif text-earth mb-8 text-center">{target}</h1>',
                           shop_template)
    
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(new_page_html)

print("Shop pages created and links updated universally!")
