const express = require("express");
const { auth, adminAuth } = require("../middleware/auth");
const Perfume = require("../models/Perfume");

const router = express.Router();

/**
 * 📌 Lấy danh sách tất cả nước hoa (Chỉ Admin)
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
 * 📌 Lấy danh sách nước hoa cao cấp có `concentration` là "Extrait" (Chỉ Admin)
 */
router.get("/premium", auth, adminAuth, async (req, res) => {
    try {
        const premiumPerfumes = await Perfume.find({ concentration: "Extrait" });
        if (premiumPerfumes.length === 0) {
            return res.status(404).json({ message: "No premium perfumes found" });
        }
        res.json(premiumPerfumes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * 📌 Lấy thông tin nước hoa theo ID (Chỉ Admin)
 */
router.get("/:id", auth, adminAuth, async (req, res) => {
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
 * 📌 Lấy danh sách feedback của nước hoa (Chỉ Admin)
 */
router.get("/:id/feedbacks", auth, adminAuth, async (req, res) => {
    try {
        const perfume = await Perfume.findById(req.params.id).populate("feedback.user", "name email");
        if (!perfume) return res.status(404).json({ error: "Perfume not found" });

        if (perfume.feedback.length === 0) {
            return res.status(404).json({ message: "No feedbacks available for this perfume." });
        }

        res.json(perfume.feedback);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * 📌 Thêm nước hoa mới (Chỉ Admin)
 */
router.post("/", auth, adminAuth, async (req, res) => {
    try {
        const { perfumeName, uri, price, concentration, description, ingredients, volume, targetAudience, brand } = req.body;
        
        // Kiểm tra xem dữ liệu có đầy đủ không
        if (!perfumeName || !uri || !price || !concentration || !brand) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newPerfume = new Perfume(req.body);
        await newPerfume.save();
        res.status(201).json(newPerfume);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * 📌 Cập nhật thông tin nước hoa (Chỉ Admin)
 */
router.put("/:id", auth, adminAuth, async (req, res) => {
    try {
        const updatedPerfume = await Perfume.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedPerfume) {
            return res.status(404).json({ error: "Perfume not found" });
        }
        res.json(updatedPerfume);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * 📌 Xoá nước hoa (Chỉ Admin)
 */
router.delete("/:id", auth, adminAuth, async (req, res) => {
    try {
        const deletedPerfume = await Perfume.findByIdAndDelete(req.params.id);
        if (!deletedPerfume) {
            return res.status(404).json({ error: "Perfume not found" });
        }
        res.json({ message: "Perfume deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * 📌 Người dùng đánh giá nước hoa (Chỉ User)
 */
router.post("/:id/feedback", auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating || !comment) {
            return res.status(400).json({ error: "Rating and comment are required" });
        }

        const perfume = await Perfume.findById(req.params.id);
        if (!perfume) return res.status(404).json({ error: "Perfume not found" });

        // Kiểm tra nếu user đã đánh giá trước đó
        const existingFeedback = perfume.feedback.find(fb => fb.user.toString() === req.user.id);
        if (existingFeedback) return res.status(400).json({ error: "You can only rate a perfume once." });

        // Thêm feedback mới
        perfume.feedback.push({ user: req.user.id, rating, comment });
        await perfume.save();

        res.json(perfume);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
