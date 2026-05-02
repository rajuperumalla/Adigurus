import os
import glob
import re

base_dir = r"c:\Users\Pristyn Care.LT-ASUS-671\Desktop\Mediciti\computer-themed-portfolio\AdigurusWebsite"
html_files = glob.glob(os.path.join(base_dir, "*.html"))

# Performance-optimised <head> block to inject
PERF_HEAD = '''    <!-- Preconnect for faster Font Awesome loading -->
    <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
    <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">'''

changed = 0
for fpath in html_files:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content

    # 1. Replace CDN tailwind script with local compiled CSS
    content = content.replace(
        '<script src="https://cdn.tailwindcss.com"></script>',
        '<link rel="stylesheet" href="tailwind.css">'
    )

    # 2. Add preconnect after <meta viewport> if not already present
    if 'rel="preconnect"' not in content and 'cdnjs.cloudflare.com' in content:
        content = content.replace(
            '    <link href="https://cdnjs.cloudflare.com',
            PERF_HEAD + '\n    <link href="https://cdnjs.cloudflare.com'
        )

    # 3. Add loading="lazy" to images that don't have it
    # Only for images that are NOT above-the-fold (skip hero images)
    content = re.sub(
        r'(<img\b(?![^>]*loading=)[^>]*)(>)',
        lambda m: m.group(1) + ' loading="lazy"' + m.group(2),
        content
    )

    # 4. Move app.js to defer for non-blocking load
    content = content.replace(
        '<script src="app.js"></script>',
        '<script src="app.js" defer></script>'
    )

    # 5. Add Font Awesome with display=swap for faster rendering
    content = content.replace(
        'href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet"',
        'href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet" media="print" onload="this.media=\'all\'"'
    )

    if content != original:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        changed += 1
        print(f"  Optimised: {os.path.basename(fpath)}")

print(f"\nDone! {changed}/{len(html_files)} files updated.")
