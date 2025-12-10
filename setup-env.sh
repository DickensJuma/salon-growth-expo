#!/bin/bash

# Create .env.local with Paystack configuration
echo "# Paystack Configuration" > .env.local
echo "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_public_key_here" >> .env.local
echo "PAYSTACK_SECRET_KEY=your_secret_key_here" >> .env.local
echo "NEXT_PUBLIC_BASE_URL=http://localhost:3001" >> .env.local

echo "# MongoDB Configuration" >> .env.local
echo "MONGODB_URI=mongodb://password@cluster0-shard-00-00.yeyah.mongodb.net:27017/salon-growth-expo?replicaSet=Cluster0-shard-0&ssl=true&authSource=admin" >> .env.local
echo "MONGODB_DB=salon-growth-expo" >> .env.local

echo "\n.env.local file has been created. Please update it with your Paystack API keys."
