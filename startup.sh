#!/bin/bash
set -euo pipefail

export NODE_ENV=production

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs -0)
fi

if [ -z "$VITE_API_BASE_URL" ] || [ -z "$VITE_DATABASE_URL" ] || [ -z "$VITE_JWT_SECRET" ]; then
  echo "Error: VITE_API_BASE_URL, VITE_DATABASE_URL, and VITE_JWT_SECRET must be set in .env"
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo "Error: npm is required but not installed"
  exit 1
fi

if npm ci --loglevel=error; then
  echo "Dependencies installed successfully using npm ci"
else
  echo "npm ci failed, attempting npm install"
  if npm install --loglevel=error; then
    echo "Dependencies installed successfully using npm install"
  else
    echo "Error: npm install failed"
    exit 1
  fi
fi

npm run build

npm run start