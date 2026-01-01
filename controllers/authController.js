const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// Citizen Signup
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user exists
        const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        await db.execute(
            'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, phone]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Citizen Login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, type: 'citizen' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Police Signup (Internal)
exports.registerPolice = async (req, res) => {
    try {
        const { station_name, district, email, password } = req.body;

        // Check if exists
        const [existing] = await db.execute('SELECT * FROM police_users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Officer already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.execute(
            'INSERT INTO police_users (station_name, district, email, password) VALUES (?, ?, ?, ?)',
            [station_name, district, email, hashedPassword]
        );

        res.status(201).json({ message: 'Officer Account Created Successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating police account' });
    }
};

// Police Login
exports.loginPolice = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('------------------------------------------------');
        console.log('LOGIN ATTEMPT (Police):');
        console.log('Email:', email);
        console.log('Password:', password);

        const [police] = await db.execute('SELECT * FROM police_users WHERE email = ?', [email]);
        if (police.length === 0) {
            console.log('ERROR: User not found in database.');
            return res.status(400).json({ message: 'Invalid credentials (User not found)' });
        }

        const officer = police[0];
        console.log('User Found. Stored Hash:', officer.password);

        const isMatch = await bcrypt.compare(password, officer.password);
        console.log('Password Match Result:', isMatch);

        if (!isMatch) {
            console.log('ERROR: Password Does Not Match Hash.');
            return res.status(400).json({ message: 'Invalid credentials (Password mismatch)' });
        }

        const token = jwt.sign({ id: officer.id, type: 'police' }, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.json({ token, role: 'police', user: { id: officer.id, station: officer.station_name, district: officer.district } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
