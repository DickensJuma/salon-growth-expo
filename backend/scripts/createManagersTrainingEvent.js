// backend/scripts/createManagersTrainingEvent.js
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

const createManagersTrainingEvent = async () => {
  try {
    // Check if event already exists
    const existingEvent = await Event.findOne({ 
      title: 'Managers Training',
      date: new Date('2026-01-05T08:00:00.000Z')
    });

    if (existingEvent) {
      console.log('⚠️  Event already exists. Updating...');
      existingEvent.title = 'Managers Training';
      existingEvent.description = 'Give your manager the skills to run your salon, barbershop, or spa with strong leadership, better systems, and improved daily operations in 2026. This training covers leadership & professionalism, staff discipline & communication, daily operations & reporting, 2026 client experience, sales & accountability, conflict management, and running the business when you\'re away.';
      existingEvent.date = new Date('2026-01-05T08:00:00.000Z');
      existingEvent.startTime = '09:00';
      existingEvent.endTime = '17:00';
      existingEvent.location = 'Salons Assured Offices';
      existingEvent.price = 12500;
      existingEvent.maxAttendees = 35;
      existingEvent.isActive = true;
      existingEvent.category = 'training';
      existingEvent.updatedAt = new Date();
      
      await existingEvent.save();
      console.log('✅ Event updated successfully');
      console.log('📋 Event Details:');
      console.log(`   ID: ${existingEvent._id}`);
      console.log(`   Title: ${existingEvent.title}`);
      console.log(`   Date: ${existingEvent.date.toDateString()}`);
      console.log(`   Price: KES ${existingEvent.price}`);
      console.log(`   Location: ${existingEvent.location}`);
      console.log(`   Max Attendees: ${existingEvent.maxAttendees}`);
    } else {
      // Create new event
      const newEvent = new Event({
        title: 'Managers Training',
        description: 'Give your manager the skills to run your salon, barbershop, or spa with strong leadership, better systems, and improved daily operations in 2026. This training covers leadership & professionalism, staff discipline & communication, daily operations & reporting, 2026 client experience, sales & accountability, conflict management, and running the business when you\'re away.',
        date: new Date('2026-01-05T08:00:00.000Z'),
        startTime: '09:00',
        endTime: '17:00',
        location: 'Salons Assured Offices',
        price: 12500, // KES 12,500
        maxAttendees: 35,
        currentAttendees: 0,
        isActive: true,
        imageUrl: '/assets/salon-training-hero.jpg',
        category: 'training'
      });

      await newEvent.save();
      console.log('✅ Event created successfully');
      console.log('📋 Event Details:');
      console.log(`   ID: ${newEvent._id}`);
      console.log(`   Title: ${newEvent.title}`);
      console.log(`   Date: ${newEvent.date.toDateString()}`);
      console.log(`   Price: KES ${newEvent.price}`);
      console.log(`   Location: ${newEvent.location}`);
      console.log(`   Max Attendees: ${newEvent.maxAttendees}`);
      
      // Output JSON format similar to the example
      console.log('\n📄 Event JSON:');
      console.log(JSON.stringify({
        _id: { $oid: newEvent._id.toString() },
        title: newEvent.title,
        description: newEvent.description,
        date: { $date: newEvent.date.toISOString() },
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        location: newEvent.location,
        price: newEvent.price,
        maxAttendees: newEvent.maxAttendees,
        currentAttendees: newEvent.currentAttendees,
        isActive: newEvent.isActive,
        imageUrl: newEvent.imageUrl,
        category: newEvent.category,
        createdAt: { $date: newEvent.createdAt.toISOString() },
        updatedAt: { $date: newEvent.updatedAt.toISOString() },
        __v: newEvent.__v
      }, null, 2));
    }

  } catch (error) {
    console.error('❌ Error creating event:', error);
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await createManagersTrainingEvent();
  console.log('🎉 Script completed successfully!');
  process.exit(0);
};

run();
