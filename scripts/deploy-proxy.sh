#!/bin/bash
HOST="128.140.116.30"
USER="root"

echo "🚀 Deploying Edge Proxy to $HOST..."
echo "⚠️  Please copy this password: iWNcXiTq9Mr9UewRrqam"
echo "You will need to paste it when prompted."
echo ""

# 1. Install Docker & Setup Directories
echo "📦 Step 1: Installing Docker on remote server..."
ssh $USER@$HOST "
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq
    apt-get install -y -qq docker.io docker-compose-v2
    mkdir -p /root/proxy
"

# 2. Upload Configuration
echo "wn📂 Step 2: Uploading configuration files..."
scp proxy/Caddyfile proxy/docker-compose.yml $USER@$HOST:/root/proxy/

# 3. Start Proxy
echo "wn🔥 Step 3: Starting Caddy Proxy..."
ssh $USER@$HOST "
    cd /root/proxy
    docker compose down
    docker compose up -d
    echo '✅ Edge Proxy is RUNNING!'
"
