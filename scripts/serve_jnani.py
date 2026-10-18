"""Serve this workspace for VS Code debugging, reusing its existing server."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import socket
import sys
from urllib.request import urlopen


ROOT = Path(__file__).resolve().parents[1]
HOST = "127.0.0.1"
PORT = 8002
READY = f"Serving JNANI project on {HOST} port {PORT}"


def existing_server_is_this_workspace() -> bool:
    with socket.socket() as probe:
        if probe.connect_ex((HOST, PORT)) != 0:
            return False
    try:
        with urlopen(f"http://{HOST}:{PORT}/index.html", timeout=2) as response:
            page = response.read().decode("utf-8", errors="replace")
        return "app.js?v=20261017-24" in page
    except Exception:
        return False


if existing_server_is_this_workspace():
    print(READY, flush=True)
    sys.exit(0)


class WorkspaceHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)


try:
    server = ThreadingHTTPServer((HOST, PORT), WorkspaceHandler)
except OSError as error:
    raise SystemExit(f"Cannot bind the JNANI debug server to {HOST}:{PORT}: {error}")

print(READY, flush=True)
server.serve_forever()
