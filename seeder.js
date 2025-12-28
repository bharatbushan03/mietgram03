
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Post from './models/Post.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mietgram';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    
    // Clear existing data
    await User.deleteMany();
    await Post.deleteMany();

    console.log('Data cleared. Seeding...');

    // Create Admin
    const admin = await User.create({
      username: 'admin_miet',
      fullName: 'MIET System Admin',
      email: 'admin@mietjammu.in',
      password: 'password123',
      campusRole: 'Admin',
      isVerified: true
    });

    // Create Students
    const student1 = await User.create({
      username: 'rahul_cse',
      fullName: 'Rahul Singh',
      email: 'rahul.singh@mietjammu.in',
      password: 'password123',
      campusRole: 'Student',
      isVerified: true,
      bio: 'Code, Coffee, MIET 💻☕'
    });

    const student2 = await User.create({
      username: 'ananya_ece',
      fullName: 'Ananya Gupta',
      email: 'ananya.gupta@mietjammu.in',
      password: 'password123',
      campusRole: 'Student',
      isVerified: true,
      bio: 'Electronics enthusiast & photographer 📸'
    });

    // Create Posts
    await Post.create([
      {
        userId: student1._id,
        username: student1.username,
        mediaUrl: 'https://picsum.photos/seed/miet1/800/800',
        caption: 'First day at MIET Jammu! 🏛️ #MIET #CSE',
        likes: [student2._id]
      },
      {
        userId: student2._id,
        username: student2.username,
        mediaUrl: 'https://picsum.photos/seed/miet2/800/800',
        caption: 'Beautiful evening at the campus Central Garden. 🌸',
        likes: [student1._id]
      }
    ]);

    console.log('Seeding completed successfully.');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
