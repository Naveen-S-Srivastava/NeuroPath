require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const Report = require('./models/Report');
const PromoCode = require('./models/PromoCode');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await Report.deleteMany({});
    await PromoCode.deleteMany({});

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@neuropath.com',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@neuropath.com',
        password: hashedPassword,
        role: 'neurologist'
      },
      {
        name: 'John Doe',
        email: 'john@neuropath.com',
        password: hashedPassword,
        role: 'patient'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Users created:', createdUsers.length);

    // Get IDs
    const admin = createdUsers.find(u => u.role === 'admin');
    const neurologist = createdUsers.find(u => u.role === 'neurologist');
    const patient = createdUsers.find(u => u.role === 'patient');

    // Create appointments
    const appointments = [
      {
        patientId: patient._id,
        neurologistId: neurologist._id,
        doctor: 'Dr. Sarah Johnson',
        specialty: 'Neurology',
        date: '2025-09-30',
        time: '10:00 AM',
        type: 'Consultation',
        status: 'confirmed'
      },
      {
        patientId: patient._id,
        neurologistId: neurologist._id,
        doctor: 'Dr. Sarah Johnson',
        specialty: 'Neurology',
        date: '2025-10-05',
        time: '2:00 PM',
        type: 'Follow-up',
        status: 'confirmed'
      }
    ];

    await Appointment.insertMany(appointments);
    console.log('Appointments created:', appointments.length);

    // Create reports
    const reports = [
      {
        patientId: patient._id,
        neurologistId: neurologist._id,
        title: 'Initial Neurological Assessment',
        description: 'Comprehensive evaluation of patient symptoms',
        findings: 'Mild cognitive impairment detected',
        recommendations: 'Schedule follow-up in 2 weeks',
        status: 'completed'
      },
      {
        patientId: patient._id,
        neurologistId: neurologist._id,
        title: 'MRI Report Analysis',
        description: 'Analysis of recent MRI scan',
        findings: 'No significant abnormalities',
        recommendations: 'Continue monitoring',
        status: 'pending'
      }
    ];

    await Report.insertMany(reports);
    console.log('Reports created:', reports.length);

    // Create sample promo codes
    const promoCodes = [
      {
        code: 'SARAH2024',
        neurologistId: neurologist._id,
        description: 'Dr. Sarah Johnson - Specialized Neurology Consultation',
        maxUsage: 10,
        expiresAt: new Date('2025-12-31')
      },
      {
        code: 'NEUROVIP',
        neurologistId: neurologist._id,
        description: 'VIP Neurology Access - Dr. Sarah Johnson',
        maxUsage: 5,
        expiresAt: new Date('2025-06-30')
      }
    ];

    await PromoCode.insertMany(promoCodes);
    console.log('Promo codes created:', promoCodes.length);

    console.log('Seeding completed successfully');
    console.log('Sample promo codes:');
    console.log('- SARAH2024 (10 uses, expires Dec 2025)');
    console.log('- NEUROVIP (5 uses, expires Jun 2025)');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

connectDB().then(() => {
  seedData();
});
