require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const MedicineOrder = require('./models/MedicineOrder');
const Supplier = require('./models/Supplier');
const Message = require('./models/Message');
const Prescription = require('./models/Prescription');
const PromoCode = require('./models/PromoCode');
const Report = require('./models/Report');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/neuropath');
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    
    // await User.deleteMany({});
    // await Appointment.deleteMany({});
    // await MedicineOrder.deleteMany({});
    // await Supplier.deleteMany({});
    // await Message.deleteMany({});
    // await Prescription.deleteMany({});
    // await PromoCode.deleteMany({});
    // await Report.deleteMany({});
    // console.log('Cleared existing data');

    // Hash password function
    const hashPassword = async (password) => await bcrypt.hash(password, 10);

    // Create Admin
    // const admin = await User.create({
    //   name: 'Admin User',
    //   email: 'admin@neuropath.com',
    //   password: await hashPassword('admin123'),
    //   role: 'admin'
    // });
    // console.log('Created admin:', admin._id);

    // Create Neurologists (5)
    const neurologists = [];
    const neurologistData = [
      { name: 'Dr. Sarah Johnson', email: 'sarah.johnson@neuropath.com', specialty: 'Neurology' },
      { name: 'Dr. Michael Chen', email: 'michael.chen@neuropath.com', specialty: 'Neurosurgery' },
      { name: 'Dr. Emily Davis', email: 'emily.davis@neuropath.com', specialty: 'Pediatric Neurology' },
      { name: 'Dr. Robert Wilson', email: 'robert.wilson@neuropath.com', specialty: 'Clinical Neurophysiology' },
      { name: 'Dr. Lisa Anderson', email: 'lisa.anderson@neuropath.com', specialty: 'Neuromuscular Medicine' }
    ];

    for (const data of neurologistData) {
      const neuro = await User.create({
        name: data.name,
        email: data.email,
        password: await hashPassword('doctor123'),
        role: 'neurologist'
      });
      neurologists.push(neuro);
    }
    console.log('Created neurologists:', neurologists.length);

    // Create Patients (10)
    const patients = [];
    const patientData = [
      { name: 'John Smith', email: 'john.smith@email.com', promoCode: 'NEURO2024' },
      { name: 'Mary Johnson', email: 'mary.johnson@email.com', promoCode: 'NEURO2024' },
      { name: 'David Brown', email: 'david.brown@email.com', promoCode: 'NEURO2024' },
      { name: 'Jennifer Davis', email: 'jennifer.davis@email.com', promoCode: 'NEURO2024' },
      { name: 'Robert Wilson', email: 'robert.wilson@email.com', promoCode: 'NEURO2024' },
      { name: 'Linda Miller', email: 'linda.miller@email.com', promoCode: 'NEURO2024' },
      { name: 'William Garcia', email: 'william.garcia@email.com', promoCode: 'NEURO2024' },
      { name: 'Patricia Martinez', email: 'patricia.martinez@email.com', promoCode: 'NEURO2024' },
      { name: 'Christopher Lee', email: 'christopher.lee@email.com', promoCode: 'NEURO2024' },
      { name: 'Barbara Taylor', email: 'barbara.taylor@email.com', promoCode: 'NEURO2024' }
    ];

    for (const data of patientData) {
      const patient = await User.create({
        name: data.name,
        email: data.email,
        password: await hashPassword('patient123'),
        role: 'patient',
        promoCode: data.promoCode,
        assignedNeurologistId: neurologists[Math.floor(Math.random() * neurologists.length)]._id
      });
      patients.push(patient);
    }
    console.log('Created patients:', patients.length);

    // Create PromoCodes (5)
    const promoCodes = [];
    for (let i = 0; i < 5; i++) {
      const promo = await PromoCode.create({
        code: `NEURO${2024 + i}`,
        neurologistId: neurologists[i % neurologists.length]._id,
        description: `Neurologist access code ${2024 + i}`,
        maxUsage: 10 + i * 5
      });
      promoCodes.push(promo);
    }
    console.log('Created promo codes:', promoCodes.length);

    // Create Suppliers (4)
    const suppliers = [];
    const supplierData = [
      { supplierId: 'SUP001', name: 'MediCare Pharmacy', company: 'MediCare Inc.', email: 'contact@medicare.com', phone: '+1-555-0101' },
      { supplierId: 'SUP002', name: 'HealthFirst Drugs', company: 'HealthFirst Corp.', email: 'orders@healthfirst.com', phone: '+1-555-0102' },
      { supplierId: 'SUP003', name: 'NeuroMeds Supply', company: 'NeuroMeds LLC', email: 'support@neuromeds.com', phone: '+1-555-0103' },
      { supplierId: 'SUP004', name: 'PharmaLink Distributors', company: 'PharmaLink Ltd.', email: 'info@pharmalink.com', phone: '+1-555-0104' }
    ];

    for (const data of supplierData) {
      const supplier = await Supplier.create({
        supplierId: data.supplierId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        password: await hashPassword('supplier123')
      });
      suppliers.push(supplier);
    }
    console.log('Created suppliers:', suppliers.length);

    // Create Appointments (12)
    const appointments = [];
    const appointmentTypes = ['Consultation', 'Follow-up', 'Emergency', 'Routine Check'];
    const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    const dates = ['2025-10-15', '2025-10-16', '2025-10-17', '2025-10-18', '2025-10-19'];

    for (let i = 0; i < 12; i++) {
      const patient = patients[i % patients.length];
      const neurologist = patient.assignedNeurologistId || neurologists[Math.floor(Math.random() * neurologists.length)];

      const appointment = await Appointment.create({
        patientId: patient._id,
        neurologistId: neurologist._id,
        doctor: neurologists.find(n => n._id.equals(neurologist)).name,
        specialty: neurologistData.find(n => n.name === neurologists.find(n => n._id.equals(neurologist)).name)?.specialty || 'Neurology',
        date: dates[Math.floor(Math.random() * dates.length)],
        time: timeSlots[Math.floor(Math.random() * timeSlots.length)],
        type: appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)],
        status: Math.random() > 0.1 ? 'confirmed' : 'cancelled'
      });
      appointments.push(appointment);
    }
    console.log('Created appointments:', appointments.length);

    // Create Prescriptions (10)
    const prescriptions = [];
    const medications = [
      'Gabapentin 300mg', 'Pregabalin 75mg', 'Carbamazepine 200mg',
      'Lamotrigine 100mg', 'Topiramate 50mg', 'Levetiracetam 500mg',
      'Valproic Acid 250mg', 'Oxcarbazepine 300mg', 'Zonisamide 100mg'
    ];
    const durations = ['30 days', '60 days', '90 days', '6 months', '1 year'];

    for (let i = 0; i < 10; i++) {
      const appointment = appointments[i % appointments.length];
      const prescription = await Prescription.create({
        patientId: appointment.patientId,
        neurologistId: appointment.neurologistId,
        appointmentId: appointment._id,
        medication: medications[Math.floor(Math.random() * medications.length)],
        duration: durations[Math.floor(Math.random() * durations.length)],
        instructions: 'Take as prescribed. Consult doctor before stopping.',
        status: Math.random() > 0.2 ? 'active' : 'completed'
      });
      prescriptions.push(prescription);
    }
    console.log('Created prescriptions:', prescriptions.length);

    // Create Medicine Orders (15)
    const medicineOrders = [];
    const deliveryAddresses = [
      '123 Main St, New York, NY 10001',
      '456 Oak Ave, Los Angeles, CA 90210',
      '789 Pine Rd, Chicago, IL 60601',
      '321 Elm St, Houston, TX 77001',
      '654 Maple Dr, Phoenix, AZ 85001'
    ];
    const statuses = ['uploaded', 'doctor_approved', 'forwarded_to_supplier', 'processing', 'shipped', 'delivered'];

    for (let i = 0; i < 15; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const neurologist = patient.assignedNeurologistId || neurologists[Math.floor(Math.random() * neurologists.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const supplier = status !== 'uploaded' && status !== 'doctor_approved' ? suppliers[Math.floor(Math.random() * suppliers.length)] : null;

      const timeline = [];
      if (status === 'doctor_approved' || status === 'forwarded_to_supplier' || status === 'processing' || status === 'shipped' || status === 'delivered') {
        timeline.push({ status: 'uploaded', note: 'Prescription uploaded', at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) });
        timeline.push({ status: 'doctor_approved', note: 'Approved by neurologist', at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) });
        if (status === 'forwarded_to_supplier' || status === 'processing' || status === 'shipped' || status === 'delivered') {
          timeline.push({ status: 'forwarded_to_supplier', note: `Forwarded to ${supplier?.name || 'supplier'}`, at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) });
          if (status === 'processing' || status === 'shipped' || status === 'delivered') {
            timeline.push({ status: 'processing', note: 'Order being processed', at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) });
            if (status === 'shipped' || status === 'delivered') {
              timeline.push({ status: 'shipped', note: 'Order shipped', at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) });
              if (status === 'delivered') {
                timeline.push({ status: 'delivered', note: 'Order delivered successfully', at: new Date() });
              }
            }
          }
        }
      }

      const order = await MedicineOrder.create({
        patientId: patient._id,
        neurologistId: neurologist._id,
        supplierId: supplier?._id,
        fileName: `prescription_${i + 1}.pdf`,
        fileType: 'application/pdf',
        url: `https://cloudinary.com/prescription_${i + 1}`,
        publicId: `prescription_${i + 1}`,
        resourceType: 'raw',
        bytes: 1024000 + Math.floor(Math.random() * 1000000),
        deliveryAddress: deliveryAddresses[Math.floor(Math.random() * deliveryAddresses.length)],
        status: status,
        timeline: timeline
      });
      medicineOrders.push(order);
    }
    console.log('Created medicine orders:', medicineOrders.length);

    // Create Messages (20)
    const messages = [];
    const messageContents = [
      'Hello, how are you feeling today?',
      'Please describe your symptoms in detail.',
      'Have you been taking your medication regularly?',
      'Let me review your test results.',
      'Do you have any questions about your treatment?',
      'Please schedule a follow-up appointment.',
      'Your prescription has been updated.',
      'How has your condition improved?',
      'Are you experiencing any side effects?',
      'Please upload your latest reports.'
    ];

    for (let i = 0; i < 20; i++) {
      const appointment = appointments[Math.floor(Math.random() * appointments.length)];
      const isFromPatient = Math.random() > 0.5;
      const senderId = isFromPatient ? appointment.patientId : appointment.neurologistId;

      const message = await Message.create({
        appointmentId: appointment._id,
        senderId: senderId,
        content: messageContents[Math.floor(Math.random() * messageContents.length)],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
      });
      messages.push(message);
    }
    console.log('Created messages:', messages.length);

    // Create Reports (8)
    const reports = [];
    const reportTitles = [
      'Neurological Assessment Report',
      'MRI Scan Analysis',
      'EEG Report',
      'Treatment Progress Report',
      'Follow-up Examination',
      'Diagnostic Summary',
      'Medication Review',
      'Clinical Evaluation'
    ];

    for (let i = 0; i < 8; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const neurologist = patient.assignedNeurologistId || neurologists[Math.floor(Math.random() * neurologists.length)];

      const report = await Report.create({
        patientId: patient._id,
        neurologistId: neurologist._id,
        title: reportTitles[Math.floor(Math.random() * reportTitles.length)],
        description: 'Comprehensive neurological evaluation and treatment recommendations.',
        findings: 'Patient shows normal neurological function with some minor irregularities.',
        recommendations: 'Continue current medication regimen and schedule follow-up in 3 months.',
        status: Math.random() > 0.3 ? 'completed' : 'pending',
        publicId: `report_${i + 1}`,
        url: `https://cloudinary.com/report_${i + 1}.pdf`,
        fileType: 'application/pdf',
        bytes: 2048000 + Math.floor(Math.random() * 2000000)
      });
      reports.push(report);
    }
    console.log('Created reports:', reports.length);

    console.log('\n=== SEEDING COMPLETED SUCCESSFULLY ===');
    console.log('Summary:');
    console.log(`- Admin: 1`);
    console.log(`- Neurologists: ${neurologists.length}`);
    console.log(`- Patients: ${patients.length}`);
    console.log(`- PromoCodes: ${promoCodes.length}`);
    console.log(`- Suppliers: ${suppliers.length}`);
    console.log(`- Appointments: ${appointments.length}`);
    console.log(`- Prescriptions: ${prescriptions.length}`);
    console.log(`- MedicineOrders: ${medicineOrders.length}`);
    console.log(`- Messages: ${messages.length}`);
    console.log(`- Reports: ${reports.length}`);

    console.log('\n=== SAMPLE LOGIN CREDENTIALS ===');
    console.log('Admin: admin@neuropath.com / admin123');
    console.log('Neurologists: [neurologist email] / doctor123');
    console.log('Patients: [patient email] / patient123');
    console.log('Suppliers: [supplierId] / supplier123');

  } catch (error) {
    console.error('Seeding error:', error);
  }
};

// Run the seeding function
connectDB().then(() => {
  seedData().then(() => {
    console.log('Seeding completed');
    process.exit(0);
  });
});
