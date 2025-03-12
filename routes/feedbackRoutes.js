const express = require("express");
const router = express.Router();
const Perfume = require("../models/Perfume");
const { auth } = require("../middleware/auth");


// ✅ POST: Người dùng gửi feedback
router.post("/:perfumeId", auth, async (req, res) => {
    try {
        const { perfumeId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        const perfume = await Perfume.findById(perfumeId);
        if (!perfume) return res.status(404).json({ error: "Perfume not found" });

        // ❌ Kiểm tra nếu user đã đánh giá trước đó
        const hasReviewed = perfume.feedback.some(fb => fb.user.toString() === userId);
        if (hasReviewed) return res.status(400).json({ error: "You already reviewed this perfume" });

        // ✅ Thêm feedback mới
        const newFeedback = { user: userId, rating, comment };
        perfume.feedback.push(newFeedback);
        await perfume.save();

        res.status(201).json({ message: "Feedback added successfully", feedback: newFeedback });
    } catch (error) {
        console.error("Error adding feedback:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ GET: Lấy danh sách feedback của một nước hoa
router.get("/:perfumeId", async (req, res) => {
    try {
        const { perfumeId } = req.params;
        const perfume = await Perfume.findById(perfumeId).populate("feedback.user", "name");
        if (!perfume) return res.status(404).json({ error: "Perfume not found" });

        res.status(200).json(perfume.feedback);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
