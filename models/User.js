const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  avatar: String,
  provider: { type: String, enum: ['google', 'facebook', 'phone'], required: true },
  providerId: String,
  phone: String,
  addresses: [{
    label: String,
    line1: String,
    lat: Number,
    lng: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
