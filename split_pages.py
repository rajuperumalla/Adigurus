import os
import re

base_dir = r"c:\Users\Pristyn Care.LT-ASUS-671\Desktop\Mediciti\computer-themed-portfolio\AdigurusWebsite"
index_path = os.path.join(base_dir, "index.html")

with open(index_path, "r", encoding="utf-8") as f:
    html = f.read()

# Extract top and bottom parts
top_match = re.search(r'(.*?)<main class="flex-grow">', html, re.DOTALL)
top_content = top_match.group(1) + '<main class="flex-grow">\n'

bottom_match = re.search(r'</main>(.*)', html, re.DOTALL)
bottom_content = '\n    </main>' + bottom_match.group(1)

# Extract sections
sections_data = {}
section_pattern = re.compile(r'(<section id="([^"]+)" class="page-section[^>]*>.*?</section>)', re.DOTALL)
for match in section_pattern.finditer(html):
    sec_html = match.group(1)
    sec_id = match.group(2)
    
    # Remove 'hidden' class
    sec_html = sec_html.replace('class="page-section hidden ', 'class="page-section ')
    sec_html = sec_html.replace('class="page-section hidden"', 'class="page-section"')
    
    sections_data[sec_id] = sec_html

page_map = {
    'home-page': 'index.html',
    'shop-page': 'shop.html',
    'product-page': 'product.html',
    'about-page': 'about.html',
    'blog-page': 'blog.html',
    'contact-page': 'contact.html',
    'dashboard-page': 'dashboard.html'
}

def fix_links(content):
    # Regex to handle href="#" and data-target="X" intelligently
    for page_id, filename in page_map.items():
        # First, match specifically elements having both
        content = re.sub(r'href="#"([^>]*)data-target="' + page_id + r'"', r'href="' + filename + r'"\1', content)
        content = re.sub(r'data-target="' + page_id + r'"([^>]*)href="#"', r'\1href="' + filename + r'"', content)
        # Fallback if href="#" is already removed or missing
        content = content.replace('data-target="' + page_id + '"', 'href="' + filename + '"')
        
    return content

for page_id, filename in page_map.items():
    if page_id not in sections_data:
        continue
    
    page_html = top_content + sections_data[page_id] + bottom_content
    page_html = fix_links(page_html)
    
    out_path = os.path.join(base_dir, filename)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(page_html)

print("Pages split successfully!")
