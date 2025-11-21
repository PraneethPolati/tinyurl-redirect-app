#!/bin/bash
set -e

echo "📦 Installing dependencies..."
npm install

echo "🛠 Generating Prisma Client..."
npx prisma generate

echo "🚀 Building Next.js app..."
npm run next:build
