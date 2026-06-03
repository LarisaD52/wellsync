
IP=${1:-127.0.0.1}
CERT_DIR="$(dirname "$0")/certs"
mkdir -p "$CERT_DIR"

echo "🔐 Generating self-signed certificate for IP: $IP"

openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout "$CERT_DIR/server.key" \
  -out    "$CERT_DIR/server.crt" \
  -days 365 \
  -subj "/C=RO/ST=Cluj/L=Cluj-Napoca/O=WellSync/CN=WellSync-Local" \
  -addext "subjectAltName=IP:$IP,IP:127.0.0.1,DNS:localhost"

echo "✅ Certificates generated in $CERT_DIR/"
echo "   Key:  $CERT_DIR/server.key"
echo "   Cert: $CERT_DIR/server.crt"
echo ""
echo "⚠️  Remember to update VITE_API_BASE in the frontend .env:"
echo "   VITE_API_BASE=https://$IP:3001/api"
