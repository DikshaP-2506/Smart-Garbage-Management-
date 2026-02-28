#!/bin/bash
# Smart kill port 5000 and restart via pm2

PM2="/c/Users/Diksha/AppData/Roaming/npm/pm2"

echo "🔍 Checking port 5000..."
PID=$(netstat -ano 2>/dev/null | grep ":5000" | grep LISTENING | awk '{print $NF}' | head -1)

if [ -n "$PID" ]; then
  echo "⚠️  Killing PID $PID on port 5000..."
  taskkill //F //PID "$PID" 2>/dev/null
  sleep 1
fi

echo "🛑 Stopping pm2..."
"$PM2" kill 2>/dev/null
sleep 2

echo "🚀 Starting backend..."
"$PM2" start server.js --name backend --restart-delay 3000
sleep 2

echo ""
"$PM2" list
echo ""
curl -s http://localhost:5000/ && echo ""
echo "✅ Done — backend is running on port 5000"
