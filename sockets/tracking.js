const DeliveryPartner = require('../models/DeliveryPartner');

module.exports = function registerTrackingSocket(io) {
  io.on('connection', (socket) => {

    socket.on('track:subscribe', ({ orderId }) => {
      socket.join(`order:${orderId}`);
    });

    socket.on('partner:location', async ({ partnerId, orderId, lat, lng }) => {
      await DeliveryPartner.findByIdAndUpdate(partnerId, {
        currentLocation: { lat, lng, updatedAt: new Date() }
      });

      io.to(`order:${orderId}`).emit('location:update', { partnerId, lat, lng, at: Date.now() });
    });

    socket.on('partner:status', async ({ partnerId, status }) => {
      await DeliveryPartner.findByIdAndUpdate(partnerId, { status });
      io.emit('partner:statusChanged', { partnerId, status });
    });

    socket.on('disconnect', () => {
    });
  });
};
