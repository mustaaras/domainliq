#!/bin/bash

# Configuration
REMOTE_USER="root"
REMOTE_HOST="46.224.108.38"
REMOTE_PORT="5432"
LOCAL_PORT="5433"
DB_NAME="postgres"
DB_USER="postgres"
# Extract password from .env if possible, or use the one we know.
# Using the full connection string approach for safety.

echo "🔌 Establishing Secure SSH Tunnel to Production..."

# Check if tunnel is already open
if lsof -Pi :$LOCAL_PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port $LOCAL_PORT in use. Assuming tunnel is active or clearing it..."
    kill $(lsof -t -i:$LOCAL_PORT) 2>/dev/null
fi

# Open Tunnel in background
ssh -f -N -L $LOCAL_PORT:127.0.0.1:$REMOTE_PORT $REMOTE_USER@$REMOTE_HOST

if [ $? -eq 0 ]; then
    echo "✅ Tunnel Established (localhost:$LOCAL_PORT -> $REMOTE_HOST:$REMOTE_PORT)"
else
    echo "❌ Failed to establish tunnel."
    exit 1
fi

# Ensure cleanup on exit
cleanup() {
    echo ""
    echo "🧹 Closing Tunnel..."
    kill $(lsof -t -i:$LOCAL_PORT) 2>/dev/null
    echo "👋 Done."
}
trap cleanup EXIT

# Construct Local Connection String (Password from your .env but pointing to localhost)
# We read the password from the .env file to avoid hardcoding it here
ENV_DB_URL=$(grep DATABASE_URL .env | cut -d '=' -f2)
# Extract Password using regex or string manipulation
# Format: postgres://user:PASSWORD@host:port/db
# This is a bit fragile but works for the current format
DB_PASS=$(echo $ENV_DB_URL | sed -E 's/.*:([^:]+)@.*/\1/')

# Fallback if sed fails (harder way)
if [ -z "$DB_PASS" ]; then
    echo "⚠️  Could not extract password from .env. Please check format."
    exit 1
fi

# New URL -> Pointing to Local Tunnel
LOCAL_URL="postgres://postgres:$DB_PASS@127.0.0.1:$LOCAL_PORT/postgres"

echo "🚀 Launching Prisma Studio..."
echo "--------------------------------"
DATABASE_URL="$LOCAL_URL" npx prisma studio

