const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const Member = require('../models/Member');

const router = express.Router();

// Thành viên có thể lấy danh sách tất cả (bỏ adminAuth nếu không cần)
router.get('/', auth, async (req, res) => {
    try {
        const members = await Member.find().select('-password'); // Không trả về mật khẩu
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin lấy danh sách thành viên (chính xác API cần cho /collectors)
router.get('/collectors', auth, async (req, res) => {
    try {
        const members = await Member.find().select('-password'); // Không trả về mật khẩu
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Thành viên chỉ có thể chỉnh sửa thông tin của chính họ
router.put('/:id', auth, async (req, res) => {
    if (req.user.id !== req.params.id) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {
        const updatedUser = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
