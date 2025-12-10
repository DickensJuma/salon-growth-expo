import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import logger from '../utils/logger.js';

dotenv.config();

async function run() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/salon-growth-expo';
    await mongoose.connect(mongoURI);
    logger.info('discount.activate.connect');

    const percent = parseFloat(process.env.DISCOUNT_PERCENT || '30');
    if (isNaN(percent) || percent <= 0 || percent > 100) {
      throw new Error('Invalid DISCOUNT_PERCENT value');
    }

    const result = await Event.updateMany({ isActive: true }, {
      discountActive: true,
      discountPercent: percent,
    });

    logger.info('discount.activate.updated', { matched: result.matchedCount, modified: result.modifiedCount, percent });
    await mongoose.disconnect();
    logger.info('discount.activate.done');
  } catch (err) {
    logger.error('discount.activate.error', { error: err.message });
    process.exit(1);
  }
}

run();
