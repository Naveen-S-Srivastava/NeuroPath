import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { 
  Brain, 
  Calendar, 
  MessageSquare, 
  Shield, 
  Clock, 
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Video,
  Pill,
  FileText,
  Truck,
  Zap,
  Heart,
  Award,
  TrendingUp
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: Video,
      title: 'HD Video Consultations',
      description: 'Crystal-clear video calls with board-certified neurologists from anywhere',
      color: 'blue'
    },
    {
      icon: Calendar,
      title: 'Smart Appointment Booking',
      description: 'AI-powered scheduling that matches you with the right specialist instantly',
      color: 'green'
    },
    {
      icon: FileText,
      title: 'Digital Health Records',
      description: 'Secure, centralized storage of your complete medical history',
      color: 'purple'
    },
    {
      icon: Pill,
      title: 'Medicine Delivery',
      description: 'Same-day delivery of prescribed medications directly to your door',
      color: 'orange'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'HIPAA-compliant platform with end-to-end encryption',
      color: 'red'
    },
    {
      icon: Clock,
      title: '24/7 Emergency Care',
      description: 'Round-the-clock access to neurological emergency consultations',
      color: 'teal'
    }
  ];

  const userTypes = [
    {
      title: "For Patients",
      icon: "👥",
      description: "Get world-class neurological care from the comfort of your home",
      features: [
        "🎥 HD Video Consultations",
        "📅 Easy Appointment Booking", 
        "💊 Medicine Delivery",
        "📋 Digital Health Records",
        "🔔 Smart Reminders",
        "💬 24/7 Chat Support"
      ],
      cta: "Book Consultation",
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "For Neurologists",
      icon: "👨‍⚕️",
      description: "Advanced tools to enhance your practice and patient care",
      features: [
        "📊 Patient Management Dashboard",
        "💻 Telemedicine Platform",
        "📝 Digital Prescriptions",
        "🧠 AI Diagnosis Support",
        "📈 Practice Analytics",
        "🔗 Supplier Integration"
      ],
      cta: "Join as Doctor",
      color: "from-purple-500 to-indigo-600"
    },
    {
      title: "For Suppliers",
      icon: "🏪",
      description: "Streamlined pharmaceutical operations with integrated order management",
      features: [
        "📦 Order Management",
        "📈 Inventory Tracking",
        "🚚 Delivery Network",
        "✅ Compliance Monitoring",
        "💰 Revenue Analytics",
        "🔄 Auto-reordering"
      ],
      cta: "Partner With Us",
      color: "from-orange-500 to-red-600"
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      rating: 5,
      comment: 'NeuroCare transformed my healthcare experience. The video consultations are seamless, and getting my medications delivered the same day is incredible!',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      condition: 'Migraine Treatment'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Neurologist',
      rating: 5,
      comment: 'The platform\'s patient management tools and AI-assisted diagnosis features have significantly improved my practice efficiency and patient outcomes.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
      specialty: 'Neurology Specialist'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Patient',
      rating: 5,
      comment: 'From booking to consultation to medicine delivery - everything is so smooth. The digital health records feature helps me track my progress perfectly.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
      condition: 'Epilepsy Management'
    },
    {
      name: 'MedSupply Pro',
      role: 'Pharmaceutical Supplier',
      rating: 5,
      comment: 'The automated order processing and real-time inventory management have streamlined our operations and improved customer satisfaction.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=supplier',
      business: 'Medical Supplier'
    }
  ];

  const stats = [
    { number: '25,000+', label: 'Patients Served', icon: Users },
    { number: '1,200+', label: 'Neurologists', icon: Brain },
    { number: '1,50000+', label: 'Consultations', icon: Video },
    { number: '500+', label: 'Suppliers', icon: Truck },
    { number: '4.9/5', label: 'Average Rating', icon: Star },
    { number: '24/7', label: 'Availability', icon: Clock }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Sign Up & Profile",
      description: "Create your account and complete your medical profile in minutes",
      icon: "📝"
    },
    {
      step: "02", 
      title: "Find Specialist",
      description: "AI matches you with the best neurologist based on your needs",
      icon: "🔍"
    },
    {
      step: "03",
      title: "Book Consultation",
      description: "Schedule video consultation at your convenient time",
      icon: "📅"
    },
    {
      step: "04",
      title: "Get Treatment",
      description: "Receive expert care and get prescriptions delivered to your door",
      icon: "💊"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-purple-200 rounded-full opacity-20 animate-ping"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
               
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  Your Brain Health,
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent"> Our Mission</span>
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  Connect with 
                  <span className="text-blue-600 font-semibold"> world-class neurologists</span>, 
                  manage your health digitally, and get 
                  <span className="text-green-600 font-semibold"> medications delivered</span> - 
                  all in one comprehensive platform.
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>HIPAA Compliant</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>24/7 Available</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Same-day Delivery</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                  onClick={() => navigate('/signup')}
                >
                  Start Free Consultation
                  <Video className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 py-6 text-lg rounded-xl border-2 border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transform hover:scale-105 transition-all duration-200"
                  onClick={() => navigate('/services')}
                >
                  Explore Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              
            </div>
            
            <div className="relative">
              <div className="relative z-10">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwaGVhbHRoY2FyZSUyMG5ldXJvbG9naXN0fGVufDF8fHx8MTc1ODgwMzUzOXww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Neurologist consultation"
                  className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
                />
              </div>
              
             
              
              
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Thousands Worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Our platform continues to grow with satisfied users across all categories
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl mb-4 group-hover:shadow-lg transition-shadow">
                  <stat.icon className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                  <div className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Designed for Everyone in Healthcare
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Whether you're a patient seeking care, a neurologist providing treatment, or a supplier delivering medicines - 
              we have the perfect solution for you.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {userTypes.map((userType, index) => (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${userType.color}`}></div>
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">{userType.icon}</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {userType.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {userType.description}
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    {userType.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className={`w-full bg-gradient-to-r ${userType.color} text-white hover:opacity-90 py-3 rounded-lg font-medium`}
                    onClick={() => navigate('/signup')}
                  >
                    {userType.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get started with neurological care in just 4 simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center relative">
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-300 to-teal-300 z-0"></div>
                )}
                <div className="relative z-10 bg-white dark:bg-gray-900">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                    {step.icon}
                  </div>
                  <div className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full mx-auto mb-4 w-fit">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Advanced Features for Modern Healthcare
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We combine cutting-edge technology with compassionate care to provide 
              the most comprehensive neurological healthcare experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <CardContent className="p-8">
                  <div className={`bg-${feature.color}-100 dark:bg-${feature.color}-900/20 p-4 rounded-full w-fit mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-8 w-8 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg"
              variant="outline"
              className="px-8 py-4 text-lg rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={() => navigate('/services')}
            >
              View All Features
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Community Says
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Trusted by patients, neurologists, and suppliers worldwide
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                    "{testimonial.comment}"
                  </p>
                  <div className="flex items-center">
                    <ImageWithFallback
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">
                        {testimonial.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {testimonial.role}
                      </div>
                      {(testimonial.condition || testimonial.specialty || testimonial.business) && (
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          {testimonial.condition || testimonial.specialty || testimonial.business}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/10 rounded-full"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Transform Your 
              <span className="text-yellow-300"> Healthcare Journey?</span>
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 leading-relaxed">
              Join over 25,000 patients, 1,200+ neurologists, and 500+ suppliers who trust NeuroCare 
              for comprehensive, convenient, and secure neurological healthcare solutions.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-12 text-white/80">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>ISO Certified</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>24/7 Care</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>99.9% Uptime</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-6 text-lg rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                onClick={() => navigate('/signup')}
              >
                Start Free Trial
                <Zap className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-10 py-6 text-lg rounded-xl border-2 border-white text-blue-600 hover:bg-white font-semibold transform hover:scale-105 transition-all duration-200"
                onClick={() => navigate('/contact')}
              >
                Contact Sales
                <MessageSquare className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-10 py-6 text-lg rounded-xl border-2 border-white text-blue-600 hover:bg-white font-semibold transform hover:scale-105 transition-all duration-200"
                onClick={() => navigate('/login')}
              >
                Login
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <p className="text-sm text-blue-100 mt-6">
              💳 No credit card required • 🆓 Free 30-day trial • ⚡ Setup in under 5 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-600 to-teal-600 p-3 rounded-xl">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <span className="text-2xl font-bold">NeuroCare</span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Leading the future of neurological healthcare with compassionate, 
                technology-driven solutions that connect patients, doctors, and suppliers 
                in one comprehensive platform.
              </p>
              <div className="flex space-x-4">
                <div className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
                  <Facebook className="h-5 w-5 text-gray-400 hover:text-white" />
                </div>
                <div className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
                  <Twitter className="h-5 w-5 text-gray-400 hover:text-white" />
                </div>
                <div className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
                  <Instagram className="h-5 w-5 text-gray-400 hover:text-white" />
                </div>
                <div className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
                  <Youtube className="h-5 w-5 text-gray-400 hover:text-white" />
                </div>
              </div>
            </div>
            
            {/* Navigation Links */}
            <div>
              <h4 className="font-semibold mb-6 text-lg">Platform</h4>
              <div className="space-y-3">
                <p className="text-gray-400 hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/about')}>About Us</p>
                <p className="text-gray-400 hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/services')}>Services</p>
                <p className="text-gray-400 hover:text-white cursor-pointer transition-colors">For Patients</p>
                <p className="text-gray-400 hover:text-white cursor-pointer transition-colors">For Doctors</p>
                <p className="text-gray-400 hover:text-white cursor-pointer transition-colors">For Suppliers</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Support</h4>
              <div className="space-y-3">
                <p className="text-gray-400 hover:text-white cursor-pointer transition-colors">Help Center</p>
                <p className="text-gray-400 hover:text-white cursor-pointer transition-colors">Privacy Policy</p>
                <p className="text-gray-400 hover:text-white cursor-pointer transition-colors">Terms of Service</p>
                <p className="text-gray-400 hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/contact')}>Contact Us</p>
                <p className="text-gray-400 hover:text-white cursor-pointer transition-colors">API Documentation</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Contact Info</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-400">+91 8686868686</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-600 p-2 rounded-lg">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-400">neurocare@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-600 p-2 rounded-lg">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-400">123 Healthcare Ave, Medical City</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-16 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">
                © 2025 NeuroCare. All rights reserved. | Made with ❤️ for better healthcare
              </p>
              
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};