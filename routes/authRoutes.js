const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth'); // THÊM HOẶC SỬA DÒNG NÀY
const Member = require('../models/Member');

const router = express.Router();


// Đăng ký
router.post('/register', async (req, res) => {
    const { email, password, name, YOB, gender } = req.body;
    try {
        const newMember = new Member({ email, password, name, YOB, gender });
        await newMember.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Đăng nhập
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Member.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Edit User Information
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, YOB, gender } = req.body;
        const user = await Member.findByIdAndUpdate(req.user.id, { name, YOB, gender }, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Change Password
router.put('/change-password', auth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await Member.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: "Incorrect old password" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: "Password changed successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
