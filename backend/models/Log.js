const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actionType: { type: String, enum: ['Transporte', 'Reciclaje', 'Energía', 'Agua'], required: true },
  points: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', logSchema);