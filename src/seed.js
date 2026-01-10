const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Project = require('./models/Project');

dotenv.config();

const projects = [
  {
    title: 'Modern Residential Villa',
    description: 'A 5-bedroom luxury villa with sustainable energy solutions.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6199fbfd0d?auto=format&fit=crop&q=80&w=800',
    category: 'Residential',
    location: 'Beverly Hills, CA'
  },
  {
    title: 'City Commercial Hub',
    description: 'Modern office complex with 20 floors and green rooftops.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    category: 'Commercial',
    location: 'Downtown, Seattle'
  },
  {
    title: 'Industrial Logistics Center',
    description: 'High-capacity warehouse with advanced automated tracking.',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
    category: 'Industrial',
    location: 'Port of Jersey, NJ'
  }
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();

    // Create admin user
    const adminUser = {
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'password123',
    };
    await User.create(adminUser);

    // Create dummy projects
    await Project.insertMany(projects);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

importData();
