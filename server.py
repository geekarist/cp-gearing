#!/usr/bin/env python3
"""
Simple development server for CP Gears web app
"""

from http.server import SimpleHTTPRequestHandler, HTTPServer
import os

class CpGearsHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)
    
    def do_GET(self):
        # Serve index.html for root path
        if self.path == '/' or self.path == '/index.html':
            self.path = '/index.html'
        return super().do_GET()

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, CpGearsHandler)
    print(f'CP Gears app running on http://localhost:{port}')
    print('Press Ctrl+C to stop the server')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
