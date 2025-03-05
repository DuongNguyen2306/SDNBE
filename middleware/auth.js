const jwt = require('jsonwebtoken');
const Member = require('../models/Member'); // Đảm bảo import đúng model

const auth = (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).json({ error: "Access denied, no token provided" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: "Invalid token" });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });

        const user = await Member.findById(req.user.id);
        if (!user || !user.isAdmin) return res.status(403).json({ error: "Admin access required" });

        next();
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { auth, adminAuth }; // Đảm bảo export đúng
