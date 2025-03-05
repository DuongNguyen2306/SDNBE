const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const Brand = require('../models/Brand');

const router = express.Router();

// 📌 Lấy danh sách tất cả thương hiệu (Chỉ Admin)
router.get('/', auth, adminAuth, async (req, res) => {
    try {
        const brands = await Brand.find();
        res.json(brands);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Lấy chi tiết thương hiệu theo ID (Chỉ Admin)
router.get('/:brandId', auth, adminAuth, async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.brandId);
        if (!brand) return res.status(404).json({ error: "Brand not found" });
        res.json(brand);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Thêm thương hiệu mới (Chỉ Admin)
router.post('/', auth, adminAuth, async (req, res) => {
    try {
        const newBrand = new Brand(req.body);
        await newBrand.save();
        res.status(201).json(newBrand);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Cập nhật thương hiệu theo ID (Chỉ Admin)
router.put('/:brandId', auth, adminAuth, async (req, res) => {
    try {
        const updatedBrand = await Brand.findByIdAndUpdate(
            req.params.brandId,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedBrand) return res.status(404).json({ error: "Brand not found" });
        res.json(updatedBrand);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Xóa thương hiệu theo ID (Chỉ Admin)
router.delete('/:brandId', auth, adminAuth, async (req, res) => {
    try {
        const deletedBrand = await Brand.findByIdAndDelete(req.params.brandId);
        if (!deletedBrand) return res.status(404).json({ error: "Brand not found" });
        res.json({ message: "Brand deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
