// backend/scripts/seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import Event from '../models/Event.js';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/salon-growth-expo';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedEvents = async () => {
  try {
    // Clear existing events
    await Event.deleteMany({});
    console.log('🗑️  Cleared existing events');

    // Create sample event
    const sampleEvent = new Event({
      title: 'Salon Growth Summit 2024',
      description: 'Join Kenya\'s leading salon managers for comprehensive training on staff management, operations, client experience, and social media marketing. This summit will empower you with the latest strategies and tools to grow your salon business.',
      date: new Date('2025-09-30T09:00:00.000Z'),
      startTime: '09:00',
      endTime: '17:00',
      location: 'Nairobi Business Park, Nairobi, Kenya',
      price: 5000, // KES 5,000
      maxAttendees: 100,
      currentAttendees: 0,
      isActive: true,
      imageUrl: '/assets/salon-training-hero.jpg',
      category: 'training'
    });

    await sampleEvent.save();
    console.log('✅ Sample event created successfully');
    console.log('📋 Event Details:');
    console.log(`   Title: ${sampleEvent.title}`);
    console.log(`   Date: ${sampleEvent.date.toDateString()}`);
    console.log(`   Price: KES ${sampleEvent.price}`);
    console.log(`   Location: ${sampleEvent.location}`);
    console.log(`   Max Attendees: ${sampleEvent.maxAttendees}`);

  } catch (error) {
    console.error('❌ Error seeding events:', error);
  }
};

// Run the seeder
const runSeeder = async () => {
  await connectDB();
  await seedEvents();
  console.log('🎉 Database seeded successfully!');
  process.exit(0);
};

runSeeder();
