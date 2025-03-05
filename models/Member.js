const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MemberSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    YOB: { type: Number },
    gender: { type: Boolean },
    isAdmin: { type: Boolean, default: false, required: false }
}, { timestamps: true });

// Hash password trước khi lưu
MemberSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('Member', MemberSchema);
