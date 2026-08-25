#!/bin/zsh
IP=$(ipconfig getifaddr en0)
if [ -z "$IP" ]; then IP=$(ipconfig getifaddr en1); fi
echo ""
echo "Open on this Mac:  http://localhost:3000"
echo "Open on phone:     http://$IP:3000"
echo ""
echo "Phone and Mac must be on the same Wi-Fi."
