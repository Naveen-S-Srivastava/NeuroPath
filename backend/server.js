const http = require('http');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from any dev origin (reflect request origin) to avoid CORS issues during local development
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'NeuroPath API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// Reports (cloudinary-backed uploads)
const reportsRoutes = require('./routes/reports');
app.use('/api/reports', reportsRoutes);

// Prescriptions
const prescriptionsRoutes = require('./routes/prescriptions');
app.use('/api/prescriptions', prescriptionsRoutes);

// Create HTTP server and attach socket.io
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: true, credentials: true }
});

// Socket auth using JWT
const jwt = require('jsonwebtoken');

io.use((socket, next) => {
  const token = socket.handshake.auth && socket.handshake.auth.token;
  if (!token) return next();
  jwt.verify(token, process.env.JWT_SECRET || 'neuropath_secret_key', (err, user) => {
    if (err) return next();
    socket.user = user;
    next();
  });
});

io.on('connection', (socket) => {
  try {
    if (socket.user && socket.user.id) {
      const room = `user_${socket.user.id}`;
      socket.join(room);
      console.log('Socket joined room', room);
    }

    socket.on('webrtc:offer', (payload) => {
      const { to, offer } = payload;
      if (!to) return;
      io.to(`user_${to}`).emit('webrtc:offer', { from: socket.user?.id, offer });
    });

    socket.on('webrtc:answer', (payload) => {
      const { to, answer } = payload;
      if (!to) return;
      io.to(`user_${to}`).emit('webrtc:answer', { from: socket.user?.id, answer });
    });

    socket.on('webrtc:ice', (payload) => {
      const { to, candidate } = payload;
      if (!to) return;
      io.to(`user_${to}`).emit('webrtc:ice', { from: socket.user?.id, candidate });
    });

    socket.on('chat:message', async (payload) => {
      const { to, appointmentId, content } = payload;
      // forward to recipient
      io.to(`user_${to}`).emit('chat:message', { from: socket.user?.id, appointmentId, content, createdAt: new Date() });
    });

    socket.on('appointment:respond', async (payload) => {
      const { appointmentId, accept } = payload;
      try {
        const Appointment = require('./models/Appointment');
        const appt = await Appointment.findById(appointmentId);
        if (!appt) return;
        if (String(appt.neurologistId) !== String(socket.user?.id)) return;
        appt.status = accept ? 'confirmed' : 'rejected';
        await appt.save();
        io.to(`user_${appt.patientId}`).emit('appointment:updated', { appointment: appt });
      } catch (err) {
        console.error('Socket appointment respond error:', err);
      }
    });

  } catch (err) {
    console.error('Socket connection error:', err);
  }
});

// Mount appointments routes with io
const appointmentsRoutes = require('./routes/appointments')(io);
app.use('/api/appointments', appointmentsRoutes);

// Medicine Orders (patient upload + doctor approval + supplier tracking)
const medicineOrdersRoutes = require('./routes/medicineOrders')(io);
app.use('/api/medicine-orders', medicineOrdersRoutes);

// Suppliers (auth + orders)
const suppliersRoutes = require('./routes/suppliers')(io);
app.use('/api/suppliers', suppliersRoutes);

// Promo Codes (neurologist management)
const promoCodesRoutes = require('./routes/promoCodes');
app.use('/api/promo-codes', promoCodesRoutes);

// Contact
const contactRoutes = require('./routes/contact');
app.use('/api/contact', contactRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`NeuroPath API server running on port ${PORT}`);
  console.log('Test accounts:');
  console.log('Admin: admin@neuropath.com / admin123');
  console.log('Neurologist: sarah@neuropath.com / admin123');
  console.log('Patient: john@neuropath.com / admin123');
});
