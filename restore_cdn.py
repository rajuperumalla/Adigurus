import os
import glob

base_dir = r"c:\Users\Pristyn Care.LT-ASUS-671\Desktop\Mediciti\computer-themed-portfolio\AdigurusWebsite"
html_files = glob.glob(os.path.join(base_dir, "*.html"))

changed = 0
for fpath in html_files:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content
    # Restore CDN for now while we rebuild properly with v3
    content = content.replace(
        '<link rel="stylesheet" href="tailwind.css">',
        '<script src="https://cdn.tailwindcss.com"></script>'
    )

    if content != original:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        changed += 1

print(f"Restored CDN in {changed} files — site is working again.")
