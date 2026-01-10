const path = require('path');
// Explicitly load .env from the same folder as server.js
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models
const User = require('./src/models/User');
const Message = require('./src/models/Message');

const app = express();
const PORT = process.env.PORT || 5000;

// DEBUG: check if dotenv loaded correctly
console.log("Mongo URI:", process.env.MONGODB_URI);

// Stop immediately if MONGODB_URI is missing
if (!process.env.MONGODB_URI) {
    console.error("Error: MONGODB_URI is missing. Make sure .env exists in the backend folder and is formatted correctly.");
    process.exit(1);
}

// Middleware
app.use(cors()); // Allow frontend at different port to connect
app.use(express.json()); // Parse JSON bodies

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('DB Error:', err));

// ------------------------
// Admin Login Route
// ------------------------
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: "Missing username or password" });

        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid password" });

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: "Login successful", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ------------------------
// Contact Form Submission
// ------------------------
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        if (!name || !email || !message) return res.status(400).json({ message: "Missing required fields" });

        const newMessage = new Message({ name, email, phone, message });
        await newMessage.save();

        res.status(201).json({ message: "Message submitted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ------------------------
// Middleware: Verify JWT & Admin
// ------------------------
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Invalid token format" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') return res.status(403).json({ message: "Access denied" });
        req.user = decoded;
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: "Invalid token" });
    }
};

// ------------------------
// Admin-only: Get all messages
// ------------------------
app.get('/api/admin/messages', verifyAdmin, async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 }); // latest first
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ------------------------
// Admin-only: Delete a message
// ------------------------
app.delete('/api/admin/messages/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndDelete(id);
        res.json({ message: "Message deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ------------------------
// Optional: Test Route
// ------------------------
app.get('/', (req, res) => res.send('Backend is running'));

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
