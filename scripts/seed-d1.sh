#!/bin/bash

# Seed Cloudflare D1 database with default user
echo "Seeding D1 database with default user..."

# Seed local database
echo "Seeding local D1..."
wrangler d1 execute mate-music-db --local --file=./server/db/seed.sql

# Seed production database
echo "Seeding production D1..."
wrangler d1 execute mate-music-db --file=./server/db/seed.sql

echo "✅ Database seeding complete!"
