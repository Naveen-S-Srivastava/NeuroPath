import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ServicesPage = () => {
  const navigate = useNavigate();

  const patientServices = [
    {
      icon: "🎥",
      title: "Video Consultations",
      description: "High-quality, secure video calls with board-certified neurologists from the comfort of your home.",
      features: ["HD Video Quality", "Screen Sharing", "Session Recording", "Multi-device Support"]
    },
    {
      icon: "📅",
      title: "Smart Appointment Booking",
      description: "AI-powered scheduling system that finds the best neurologist match based on your symptoms and preferences.",
      features: ["Instant Booking", "Smart Matching", "Automated Reminders", "Easy Rescheduling"]
    },
    {
      icon: "📋",
      title: "Digital Health Records",
      description: "Comprehensive, secure storage of your medical history accessible to you and authorized healthcare providers.",
      features: ["HIPAA Compliant", "Cloud Storage", "Easy Sharing", "Mobile Access"]
    },
    {
      icon: "💊",
      title: "Medicine Delivery",
      description: "Direct-to-door delivery of prescribed medications from verified suppliers within 24 hours.",
      features: ["Same-day Delivery", "Prescription Verification", "Real-time Tracking", "Auto-refill Options"]
    }
  ];

  const neurologistServices = [
    {
      title: "Patient Management Dashboard",
      description: "Comprehensive patient overview with medical history, appointments, and treatment progress.",
      icon: "📊"
    },
    {
      title: "Telemedicine Platform",
      description: "Professional-grade video consultation tools with diagnostic capabilities and session recording.",
      icon: "💻"
    },
    {
      title: "Digital Prescription System",
      description: "Streamlined e-prescribing with direct integration to verified pharmaceutical suppliers.",
      icon: "📝"
    },
    {
      title: "Clinical Decision Support",
      description: "AI-assisted diagnosis suggestions and treatment recommendations based on latest medical research.",
      icon: "🧠"
    }
  ];

  const supplierServices = [
    {
      title: "Prescription Order Management",
      description: "Automated order processing from verified neurologist prescriptions with real-time notifications.",
      icon: "📦"
    },
    {
      title: "Inventory Management",
      description: "Smart inventory tracking with low-stock alerts and automated reordering capabilities.",
      icon: "📈"
    },
    {
      title: "Delivery Network",
      description: "Integrated logistics platform for efficient medicine delivery with tracking and confirmation.",
      icon: "🚚"
    },
    {
      title: "Compliance Monitoring",
      description: "Automated regulatory compliance checks and documentation for pharmaceutical standards.",
      icon: "✅"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            Our 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Services</span>
          </h1>
          <div className="max-w-4xl mx-auto">
           
            <p className="text-base sm:text-lg lg:text-xl text-gray-500 dark:text-gray-400 font-normal leading-relaxed">
              Seamlessly connecting healthcare stakeholders with cutting-edge technology and compassionate care.
            </p>
          </div>
        </div>

        {/* Patient Services Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              For <span className="text-green-600 dark:text-green-400">Patients</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get the neurological care you need, when you need it, from anywhere.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {patientServices.map((service, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border border-green-200 dark:border-gray-600 hover:shadow-lg transition-shadow text-center">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {service.description}
                </p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {/* {service.features.map((feature, idx) => (
                    <span key={idx} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                      {feature}
                    </span>
                  ))} */}
                </div>
              </div>
            ))}

            
          </div>
        </div>

        {/* Neurologist Services Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              For <span className="text-purple-600 dark:text-purple-400">Neurologists</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Advanced tools and platforms to enhance your practice and patient care.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {neurologistServices.map((service, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border border-purple-200 dark:border-gray-600 hover:shadow-lg transition-shadow text-center">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Supplier Services Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              For <span className="text-orange-600 dark:text-orange-400">Suppliers</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Streamlined pharmaceutical operations with integrated order management.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supplierServices.map((service, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border border-orange-200 dark:border-gray-600 hover:shadow-lg transition-shadow text-center">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features Section */}
        <div className="mb-20 bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 lg:p-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Platform Highlights
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Enterprise Security</h3>
              <p className="text-gray-600 dark:text-gray-300">
                HIPAA-compliant platform with end-to-end encryption and multi-factor authentication.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Real-time Integration</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Instant synchronization between all platform users for seamless care coordination.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Insights</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Machine learning algorithms to optimize scheduling, diagnosis assistance, and inventory management.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our platform today and experience the future of neurological healthcare.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/signup')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transform hover:scale-105 transition-transform"
            >
              Get Started Now
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transform hover:scale-105 transition-transform"
            >
              Contact Sales
            </button>
            <button 
              onClick={() => navigate('/')}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-8 py-3 rounded-lg font-medium transform hover:scale-105 transition-transform"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};