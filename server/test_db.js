import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Session from './src/models/Session.js';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const sessions = await Session.find().sort({createdAt: -1}).limit(5);
  console.log("SESSIONS FOUND:");
  console.log(JSON.stringify(sessions, null, 2));
  process.exit(0);
}

run().catch(console.error);
