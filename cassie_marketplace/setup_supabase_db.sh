#!/bin/bash
set -e

echo "===================================================="
echo "   NOXHUB SUPABASE DATABASE SETUP & MIGRATION DESK  "
echo "===================================================="

# Check if .env file exists
if [ ! -f .env ]; then
  echo "❌ Error: .env file not found. Please ensure you have created it in the project root."
  exit 1
fi

# Check if .env has the placeholder password configured
if grep -q -F "[YOUR-PASSWORD]" .env; then
  echo "❌ Error: Please update the placeholder [YOUR-PASSWORD] in your .env file with your actual password."
  exit 1
fi

echo "1. Running database migrations on Supabase..."
../venv/bin/python manage.py migrate

echo "2. Seeding showroom assets (Villas, AMG Mercedes, Fine Art)..."
../venv/bin/python seed_db.py

echo "3. Linking local repository config to Supabase CLI..."
echo "Please enter your Supabase login details if prompted:"
npx supabase login
npx supabase link --project-ref szkvjislddxtefoyioah

echo "===================================================="
echo " ✅ NOXHUB Supabase Database Setup Completed! "
echo "===================================================="
