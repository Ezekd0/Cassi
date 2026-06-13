#!/bin/bash
set -e

echo "===================================================="
echo "   NOXHUB SUPABASE DATABASE SETUP & MIGRATION DESK  "
echo "===================================================="

# Check if .env has the password configured
if grep -q "\[YOUR-PASSWORD\]" .env; then
  echo "❌ Error: Please update the password in your .env file first."
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
