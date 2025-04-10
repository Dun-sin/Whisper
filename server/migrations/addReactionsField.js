require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('../models/MessageModel');

async function migrateMessages() {
  console.log('Starting migration: Adding reactions field to messages');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MongoDB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Find all messages that don't have the reactions field
    const messages = await Message.find({ reactions: { $exists: false } });
    console.log(`Found ${messages.length} messages to update`);
    
    // Update messages in batches to avoid memory issues
    const batchSize = 100;
    let updated = 0;
    
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const operations = batch.map(message => ({
        updateOne: {
          filter: { _id: message._id },
          update: { $set: { reactions: new Map() } }
        }
      }));
      
      await Message.bulkWrite(operations);
      updated += batch.length;
      console.log(`Updated ${updated}/${messages.length} messages`);
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateMessages();