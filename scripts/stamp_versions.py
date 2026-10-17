#!/usr/bin/env python3
"""Stamp ?v= on app.css, data.js, seo.js and img-variants.js in index.html with
a hash of each file's content, then copy index.html to 404.html.

The deploy workflow versions these files itself, but GitHub Pages can also
publish the repository as it is; then these hand-set ?v= values are what the
browser sees, and an unchanged value keeps serving the old file from cache
(data.js is cached for 4h). Run after editing any of them, before prerender.py:

    python3 scripts/stamp_versions.py && python3 scripts/prerender.py
"""
import hashlib, os, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = ['app.css', 'data.js', 'seo.js', 'assets/img-variants.js']

path = os.path.join(ROOT, 'index.html')
html = open(path, encoding='utf-8').read()
for f in FILES:
    h = hashlib.sha1(open(os.path.join(ROOT, f), 'rb').read()).hexdigest()[:10]
    html, n = re.subn(r'(["\'])' + re.escape(f) + r'\?v=[^"\']*\1', lambda m: f'{m.group(1)}{f}?v={h}{m.group(1)}', html)
    print(f'{f}?v={h}' if n else f'{f}: not referenced')
open(path, 'w', encoding='utf-8').write(html)
shutil.copyfile(path, os.path.join(ROOT, '404.html'))
