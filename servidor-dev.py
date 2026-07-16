# Servidor de desarrollo sin caché para KOAPLIT
import http.server

class SinCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    http.server.test(HandlerClass=SinCache, port=8321, bind='127.0.0.1')
