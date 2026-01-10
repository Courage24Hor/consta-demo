require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
        console.log("Admin already exists. No need to run this again.");
        process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    // This looks at your .env file for the credentials
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt); 

    // If ADMIN_USERNAME is not set in .env, use 'Admin' as default
    const username = process.env.ADMIN_USERNAME || 'Admin';
    
    const admin = new User({
        username: username,        // <-- Fixed
        password: hashedPassword,
        role: "admin"
    });

    await admin.save();
    console.log("Admin account created with username:", username);
    process.exit();
}).catch(err => console.log(err));
