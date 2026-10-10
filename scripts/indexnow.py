#!/usr/bin/env python3
"""TUNK: tell search engines which pages changed (IndexNow).

IndexNow is the protocol Bing, Yandex, Seznam, Naver and others share: one
POST notifies all of them. Bing's index also feeds ChatGPT search and Copilot,
so changes reach those faster too. (Google does not use IndexNow; it reads
sitemap.xml through Search Console.)

  python3 scripts/indexnow.py changed _site   # before deploy: print changed URLs
  python3 scripts/indexnow.py submit URL...   # after deploy: notify engines

"changed" compares each sitemap page in the new build with what is live now,
so only new or edited pages are submitted. The key file (<key>.txt in the
site root) proves ownership; it is public by design.
"""
import glob
import json
import os
import re
import sys
import urllib.error
import urllib.request

SITE = 'https://tunkstudio.com'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = 'TUNK-site-deploy (IndexNow)'


def key():
    keys = [os.path.basename(f)[:-4] for f in glob.glob(os.path.join(ROOT, '*.txt'))
            if re.fullmatch(r'[0-9a-f]{32}\.txt', os.path.basename(f))]
    if len(keys) != 1:
        sys.exit(f'indexnow: expected one <key>.txt in the repo root, found {len(keys)}')
    return keys[0]


def page_file(site_dir, url):
    path = url[len(SITE):].strip('/')
    return os.path.join(site_dir, 'index.html' if not path else path + '.html')


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Cache-Control': 'no-cache'})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.read()
    except (urllib.error.URLError, TimeoutError):
        return None  # unreachable / not live yet: treat the page as changed


def changed(site_dir):
    sitemap = open(os.path.join(site_dir, 'sitemap.xml'), encoding='utf-8').read()
    out = []
    for url in re.findall(r'<loc>([^<]+)</loc>', sitemap):
        f = page_file(site_dir, url)
        if os.path.isfile(f) and fetch(url) != open(f, 'rb').read():
            out.append(url)
    print(' '.join(out))


def submit(urls):
    if not urls:
        print('indexnow: nothing changed')
        return
    k = key()
    body = json.dumps({'host': 'tunkstudio.com', 'key': k, 'keyLocation': f'{SITE}/{k}.txt',
                       'urlList': urls}).encode()
    req = urllib.request.Request('https://api.indexnow.org/indexnow', data=body, method='POST',
                                 headers={'Content-Type': 'application/json; charset=utf-8', 'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print(f'indexnow: {r.status} for {len(urls)} url(s)')
    except urllib.error.HTTPError as e:
        # 202 = accepted pending key check; anything 4xx is worth seeing in the log, not failing the deploy
        print(f'indexnow: HTTP {e.code} {e.read()[:200]!r}')
    except (urllib.error.URLError, TimeoutError) as e:
        print(f'indexnow: not sent ({e})')


if __name__ == '__main__':
    if len(sys.argv) >= 3 and sys.argv[1] == 'changed':
        changed(sys.argv[2])
    elif len(sys.argv) >= 2 and sys.argv[1] == 'submit':
        submit(sys.argv[2:])
    else:
        sys.exit(__doc__)
