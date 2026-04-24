import os
import glob

base_dir = r"c:\Users\Pristyn Care.LT-ASUS-671\Desktop\Mediciti\computer-themed-portfolio\AdigurusWebsite"
html_files = glob.glob(os.path.join(base_dir, "*.html"))

FONT_LINK = '    <link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" media="print" onload="this.media=\'all\'">'

changed = 0
for fpath in html_files:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    if 'fonts.googleapis.com' not in content and '<link rel="stylesheet" href="styles.css">' in content:
        content = content.replace(
            '    <link rel="stylesheet" href="styles.css">',
            FONT_LINK + '\n    <link rel="stylesheet" href="styles.css">'
        )
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        changed += 1
        print(f"  Font link added: {os.path.basename(fpath)}")

print(f"\nDone! Fonts added to {changed} files.")
