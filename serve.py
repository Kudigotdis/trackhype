import http.server
import os
import socket
import sys
import webbrowser

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)
    sys.stderr.reconfigure(line_buffering=True)

OPEN_BROWSER = "--open" in sys.argv
REQUESTED = None
if len(sys.argv) > 1:
    for a in sys.argv[1:]:
        if a.isdigit():
            REQUESTED = int(a)
            break


def lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"
    finally:
        s.close()


class AppHTTPServer(http.server.ThreadingHTTPServer):
    allow_reuse_address = False  # so a busy port fails and we can roll over


def bind_http_server(port):
    for candidate in range(port, port + 6):
        try:
            return AppHTTPServer(("0.0.0.0", candidate), http.server.SimpleHTTPRequestHandler)
        except OSError:
            continue
    return None


os.chdir(os.path.dirname(os.path.abspath(__file__)))
print("Serving TrackHype from:", os.getcwd())

want = REQUESTED if REQUESTED else 8080
server = bind_http_server(want)
if server is None:
    print("Could not bind a free port - is another TrackHype window open?")
    input("Press Enter to close...")
    sys.exit(1)

port = server.server_address[1]
if port != want:
    print("Port {} was busy -> using {} instead.".format(want, port))
ip = lan_ip()
local_url = "http://localhost:{}/index.html".format(port)
lan_url = "http://{}:{}/index.html".format(ip, port)

print()
print("  Local:  " + local_url)
print("  Phone:  " + lan_url + "   (same Wi-Fi)")
print()
print("Music will NOT skip, because the app is served over http://")
print("(SPA loader active). To stop: press Ctrl+C or close this window.")
print()

try:
    if OPEN_BROWSER:
        webbrowser.open(local_url)
    server.serve_forever()
except KeyboardInterrupt:
    print("Stopped.")