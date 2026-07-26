import socket
import os
import http.server
import socketserver

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip

ip = get_ip()
with open("ip.js", "w") as f:
    f.write(f"window.LOCAL_IP = '{ip}';\n")

PORT = 8089
Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    ".js": "application/javascript",
})

print(f"Starting P2P Mobile Portal Server on {ip}:{PORT}")
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
