const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const Member = require('../models/Member');

const router = express.Router();

// Chỉ Admin mới có quyền lấy danh sách thành viên
router.get('/', adminAuth, async (req, res) => {
    try {
        const members = await Member.find().select('-password'); // Không trả về mật khẩu
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Thành viên chỉ có thể chỉnh sửa thông tin của chính họ
router.put('/:id', auth, async (req, res) => {
    if (req.user.id !== req.params.id) return res.status(403).json({ error: "Unauthorized" });

    try {
        const updatedUser = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
