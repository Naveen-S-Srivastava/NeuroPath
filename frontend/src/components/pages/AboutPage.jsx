import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            About 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> NeuroPath</span>
          </h1>
          <div className="max-w-4xl mx-auto">
            {/* <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 font-medium leading-relaxed mb-4">
              We are dedicated to providing 
              <span className="text-blue-600 dark:text-blue-400 font-semibold"> world-class neurological healthcare</span> 
              through innovative technology and compassionate care.
            </p> */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-500 dark:text-gray-400 font-normal leading-relaxed">
              Seamlessly connecting &nbsp;
              <span className="text-green-600 dark:text-green-400 font-medium">patients</span>, 
              <span className="text-purple-600 dark:text-purple-400 font-medium"> neurologists</span>, and 
              <span className="text-orange-600 dark:text-orange-400 font-medium"> medicine suppliers &nbsp;</span> 
              in one comprehensive platform.
            </p>
          </div>
          
          {/* Visual indicators */}
          <div className="flex justify-center items-center mb-4 space-x-4 sm:space-x-6">
          <div className="flex justify-center items-center mt-8 space-x-4 sm:space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Patients</span>
            </div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 via-purple-500 to-orange-500"></div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Neurologists</span>
            </div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-orange-500"></div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Suppliers</span>
            </div>
          </div>
        </div>

        {/* Our Platform Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Comprehensive Healthcare Ecosystem
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-blue-50 dark:bg-gray-800 rounded-lg">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">For Patients</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Easy appointment booking, video consultations, secure medical records, and direct access to prescribed medications.
              </p>
            </div>
            
            <div className="text-center p-6 bg-green-50 dark:bg-gray-800 rounded-lg">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">For Neurologists</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Patient management system, digital prescriptions, telemedicine capabilities, and seamless collaboration with suppliers.
              </p>
            </div>
            
            <div className="text-center p-6 bg-purple-50 dark:bg-gray-800 rounded-lg">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">For Suppliers</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Direct medicine orders from verified prescriptions, inventory management, and streamlined delivery to patients.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-300">
              To revolutionize neurological healthcare by creating a seamless ecosystem that connects patients 
              with expert neurologists and ensures timely access to prescribed medications through trusted suppliers. 
              We aim to make quality neurological care accessible, efficient, and patient-centered through 
              cutting-edge technology.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Vision</h2>
            <p className="text-gray-600 dark:text-gray-300">
              To be the leading integrated platform for neurological care, where patients receive comprehensive 
              treatment from consultation to medication delivery, neurologists can focus on providing excellent 
              care with advanced tools, and suppliers can efficiently serve the medical community.
            </p>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Platform Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Video Consultations</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                High-quality video calls between patients and neurologists with secure, HIPAA-compliant technology.
              </p>
            </div>
            
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Digital Prescriptions</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Electronic prescription system that directly connects to approved medicine suppliers for quick fulfillment.
              </p>
            </div>
            
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Appointment Management</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Easy scheduling system with automated reminders and flexible rescheduling options.
              </p>
            </div>
            
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Medical Records</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Secure, centralized storage of patient records accessible to authorized healthcare providers.
              </p>
            </div>
            
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Medicine Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Direct-to-patient medicine delivery through our network of verified pharmaceutical suppliers.
              </p>
            </div>
            
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Real-time Communication</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Instant messaging between all parties for quick updates, questions, and care coordination.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mb-16 bg-gray-50 dark:bg-gray-800 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Why Choose NeuroPath?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">For Healthcare Excellence</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Board-certified neurologists
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  24/7 emergency consultations
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Comprehensive care coordination
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">For Convenience & Security</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  HIPAA-compliant platform
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Same-day medicine delivery
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  End-to-end encrypted communications
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Experience Better Neurological Care?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of patients, neurologists, and suppliers who trust NeuroPath for comprehensive, 
            convenient, and secure healthcare solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/signup')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
            >
              Get Started Today
            </button>
            <button 
              onClick={() => navigate('/')}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-8 py-3 rounded-lg font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};
