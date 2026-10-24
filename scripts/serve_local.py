#!/usr/bin/env python3
"""Local preview that answers like GitHub Pages: /x -> x.html, /dir/ -> dir/index.html,
anything else -> 404.html with status 404.  Usage: python3 scripts/serve_local.py [port]"""
import http.server, os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(s, *a, **k): super().__init__(*a, directory=root, **k)
    def send_head(s):
        p = s.path.split('?')[0]
        f = os.path.join(root, p.lstrip('/'))
        if not os.path.isfile(f):
            if os.path.isfile(f + '.html'): s.path = p + '.html'
            elif os.path.isfile(os.path.join(f, 'index.html')): s.path = p.rstrip('/') + '/index.html'
            else:
                s.send_response(404); s.send_header('Content-Type', 'text/html'); s.end_headers()
                s.wfile.write(open(os.path.join(root, '404.html'), 'rb').read()); return None
        return super().send_head()

http.server.ThreadingHTTPServer(('127.0.0.1', port), H).serve_forever()
