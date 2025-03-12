const express = require("express");
const { auth, adminAuth } = require("../middleware/auth");
const Perfume = require("../models/Perfume");

const router = express.Router();

/**
 * 📌 Lấy danh sách tất cả nước hoa (Public)
 */
router.get('/', async (req, res) => {
    try {
        const perfumes = await Perfume.find().populate('brand', 'brandName');
        res.json(perfumes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * 📌 Lấy thông tin nước hoa theo ID (Public)
 */
router.get("/:id", async (req, res) => {
    try {
        const perfume = await Perfume.findById(req.params.id).populate("brand", "brandName");
        if (!perfume) {
            return res.status(404).json({ error: "Perfume not found" });
        }
        res.json(perfume);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * 📌 Lấy danh sách nước hoa cao cấp có `concentration` là "Extrait" (Public)
 */
router.get("/premium", async (req, res) => {
    try {
        const premiumPerfumes = await Perfume.find({ concentration: "Extrait" });
        res.json(premiumPerfumes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * 📌 Người dùng đánh giá nước hoa (Chỉ User, Admin không được đánh giá)
 */
router.post("/:id/feedback", auth, async (req, res) => {
    try {
        if (req.user.isAdmin) {
            return res.status(403).json({ error: "Admins are not allowed to give feedback" });
        }

        const { rating, comment } = req.body;
        if (!rating || !comment) {
            return res.status(400).json({ error: "Rating and comment are required" });
        }

        const perfume = await Perfume.findById(req.params.id);
        if (!perfume) return res.status(404).json({ error: "Perfume not found" });

        const existingFeedback = perfume.feedback.find(fb => fb.user.toString() === req.user.id);
        if (existingFeedback) return res.status(400).json({ error: "You can only rate a perfume once." });

        perfume.feedback.push({ user: req.user.id, rating, comment });
        await perfume.save();

        res.json(perfume);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
