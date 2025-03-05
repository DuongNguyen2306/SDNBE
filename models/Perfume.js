const mongoose = require('mongoose');

const PerfumeSchema = new mongoose.Schema({
    perfumeName: { type: String, required: true },
    uri: { type: String, required: true },
    price: { type: Number, required: true },
    concentration: { type: String, required: true },
    description: String,
    ingredients: String,
    volume: Number,
    targetAudience: String,
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    feedback: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: Number,
        comment: String
    }],
    isPremium: { type: Boolean, default: false } // 🏆 Nước hoa cao cấp
}, { timestamps: true });

// 🔥 Middleware: Gán `isPremium` nếu là Extrait
PerfumeSchema.pre('save', function(next) {
    this.isPremium = this.concentration.toLowerCase() === 'extrait';
    next();
});

module.exports = mongoose.model('Perfume', PerfumeSchema);
