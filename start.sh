#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 22 > /dev/null 2>&1

kill $(lsof -t -i:3001) 2>/dev/null
kill $(lsof -t -i:5173) 2>/dev/null
sleep 1

node /home/joan/farm-inventory/server/index.js &
echo "Server PID: $!"

npx vite --host 0.0.0.0 &
echo "Client PID: $!"

sleep 2
curl -s -o /dev/null -w "Server: %{http_code}\n" http://localhost:3001/api/categories
curl -s -o /dev/null -w "Client: %{http_code}\n" http://localhost:5173/

wait
