require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const { Server } = require('socket.io');

require('./config/passport');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const whatsappRoutes = require('./routes/whatsapp');
const menuRoutes = require('./routes/menu');
const registerTrackingSocket = require('./sockets/tracking');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true }
});
app.set('io', io);

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/menu', menuRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

registerTrackingSocket(io);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Guntur Kaaram backend running on port ${PORT}`));
