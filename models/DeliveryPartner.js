const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
  name: String,
  phone: String,
  vehicleNumber: String,
  status: { type: String, enum: ['online', 'busy', 'offline'], default: 'offline' },
  currentLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  },
  rating: { type: Number, default: 5 },
  totalTrips: { type: Number, default: 0 }
});

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
