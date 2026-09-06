const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: String,
  veg: Boolean,
  heat: { type: Number, min: 0, max: 3 },
  price: Number,
  desc: String,
  emoji: String,
  available: { type: Boolean, default: true }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
