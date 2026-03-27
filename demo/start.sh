#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Installing dependencies..."
(cd "$SCRIPT_DIR/backend" && npm install --silent)
(cd "$SCRIPT_DIR/frontend" && npm install --silent)

echo "Starting backend (port 3001) and frontend (port 5173)..."
echo "Press Ctrl+C to stop both."
echo ""

trap 'kill 0' INT TERM

(cd "$SCRIPT_DIR/backend" && npm start) &
(cd "$SCRIPT_DIR/frontend" && npm run dev) &

wait
