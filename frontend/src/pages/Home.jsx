import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FaBell,
  FaCalendarCheck,
  FaFilter,
  FaGraduationCap,
  FaBuilding,
  FaChartLine,
  FaArrowRight,
  FaCheckCircle,
  FaUsers
} from 'react-icons/fa'
import { apiService } from '../services/api'
import { toast } from 'react-hot-toast'

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [recentPlacements, setRecentPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const promises = [
        apiService.getPlacedStudents({ limit: 5 })
      ];

      // Only fetch statistics if user is admin
      if (user?.role === 'placement_officer' || user?.role === 'admin') {
        promises.unshift(apiService.getJobStatistics());
      }

      const results = await Promise.all(promises);
      const placementsRes = results[results.length - 1]; // Last result is always placements

      if (promises.length > 1) { // Statistics were fetched
        const statsRes = results[0];
        setStats(statsRes.data.data);
      }

      setRecentPlacements(placementsRes.data.data || []);
    } catch (error) {
      // Handle 403 error for non-admin users accessing statistics
      if (error.response?.status === 403) {
        // For non-admin users, fetch only placed students data
        try {
          const placementsRes = await apiService.getPlacedStudents({ limit: 5 });
          setRecentPlacements(placementsRes.data.data || []);
        } catch (placementsError) {
          console.error('Error fetching placed students:', placementsError);
        }
      } else {
        console.error('Error fetching home data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <FaBell className="text-2xl" />,
      title: 'Smart Reminders',
      description: 'Never miss deadlines with automated email and in-app reminders',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: <FaFilter className="text-2xl" />,
      title: 'Personalized Filters',
      description: 'See only relevant opportunities based on your department and CGPA',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: <FaCalendarCheck className="text-2xl" />,
      title: 'Centralized Calendar',
      description: 'All placement drives organized in one place with clear timelines',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: <FaGraduationCap className="text-2xl" />,
      title: 'Easy Registration',
      description: 'One-click registration for placement drives with instant confirmation',
      color: 'text-orange-600 bg-orange-50'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      department: 'CSE',
      company: 'Infosys',
      quote: 'I missed 3 drives last year. EGS Bridge ensured I never missed another opportunity!',
      package: '8.5 LPA'
    },
    {
      name: 'Priya Sharma',
      department: 'ECE',
      company: 'TCS',
      quote: 'The smart reminders are a lifesaver. Got placed in my dream company!',
      package: '7.2 LPA'
    },
    {
      name: 'Amit Patel',
      department: 'MECH',
      company: 'L&T',
      quote: 'Filtering by department saved me hours of searching. Highly recommended!',
      package: '6.8 LPA'
    }
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="space-y-12 md:space-y-16">
      {/* College Image Section - Full Width */}
      <section className="w-full">
        <div className="relative h-[500px] w-full overflow-hidden">
          <img 
            src="/clg.webp" 
            alt="College Campus" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center w-full">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Welcome to EGS Bridge</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto px-4">Connecting engineering students with dream opportunities through smart reminders and personalized job matching.</p>
          </div>
        </div>
      </section>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white rounded-3xl md:rounded-4xl p-8 md:p-16 shadow-2xl transform hover:scale-[1.01] transition-transform duration-500">
        <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm"></div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left animate-fade-in-up">
              <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-full mb-6 backdrop-blur-sm">
                <span className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm font-medium">Trusted by 1000+ Students</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Never Miss a{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                    Placement
                  </span>
                  <div className="absolute -bottom-2 left-0 w-full h-3 bg-yellow-400 opacity-30 rounded-full"></div>
                </span>{' '}
                <span className="block mt-2">Opportunity Again</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-indigo-100 mb-10 max-w-2xl leading-relaxed">
                Connecting engineering students with dream opportunities through smart reminders and personalized job matching.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={handleGetStarted}
                  className="group px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-all duration-300 text-lg flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  {user ? 'Go to Dashboard' : 'Get Started Free'}
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                {!user && (
                  <Link
                    to="/login"
                    className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-indigo-700 transition-all duration-300 text-lg flex items-center justify-center backdrop-blur-sm"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
            
            <div className="relative hidden lg:block animate-fade-in-right">
              <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 shadow-2xl">
                {/* Platform Info */}
                <div className="flex flex-col items-center mb-6">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 rounded-2xl shadow-lg mb-4 transform hover:scale-110 transition-transform duration-300">
                    <img src="/logo.jpg" alt="EGS Bridge Logo" className="w-16 h-16 object-contain" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Our Platform</h3>
                  <p className="text-indigo-100 text-center">Smart placement management for engineering students</p>
                </div>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm animate-pulse">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                      <div className="h-4 bg-white bg-opacity-30 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
                
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 right-10 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-10 w-12 h-12 bg-white bg-opacity-5 rounded-full animate-ping"></div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-3xl p-8 shadow-inner">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Trusted by Engineering Students
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Join thousands of students who found their dream jobs through EGS Bridge
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: stats.totalEvents || '150+', label: 'Placement Drives', color: 'from-blue-500 to-cyan-500', icon: '💼' },
              { value: stats.placedStudents || '500+', label: 'Students Placed', color: 'from-green-500 to-emerald-500', icon: '🎓' },
              { value: stats.totalStudents || '1000+', label: 'Active Students', color: 'from-purple-500 to-pink-500', icon: '👥' },
              { value: `${stats.placementRate || '85'}%`, label: 'Placement Rate', color: 'from-orange-500 to-red-500', icon: '📊' }
            ].map((stat, index) => (
              <div 
                key={index}
                className="group bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r text-gray-800 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
              Powerful Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Designed specifically for engineering students to never miss placement opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-white to-gray-50 p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-700 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center text-indigo-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                    Learn more
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-8 bg-gray-50 rounded-3xl p-8 md:p-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            How EGS Bridge Works
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Simple, effective, and designed for students
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Register & Set Profile</h3>
            <p className="text-gray-600">
              Create your profile with department, CGPA, and skills
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Get Relevant Opportunities</h3>
            <p className="text-gray-600">
              See only drives that match your eligibility criteria
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Never Miss a Deadline</h3>
            <p className="text-gray-600">
              Smart reminders ensure you register on time
            </p>
          </div>
        </div>
      </section>

      {/* Recently Placed Students */}
      <section className="py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Success Stories
          </h2>
          <p className="text-gray-600 text-lg">
            Students who got placed through EGS Bridge
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((student, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                  <FaUsers className="text-primary-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{student.name}</h4>
                  <p className="text-gray-600 text-sm">{student.department}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">"{student.quote}"</p>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex items-center">
                  <FaBuilding className="text-gray-400 mr-2" />
                  <span className="font-medium">{student.company}</span>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  ₹{student.package} LPA
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12">
        <div className="bg-linear-to-r from-primary-500 to-primary-700 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Never Miss an Opportunity?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of engineering students who are using EGS Bridge to secure their dream jobs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg"
            >
              {user ? 'Go to Dashboard' : 'Get Started Free'}
            </button>
            {!user && (
              <Link
                to="/login"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:bg-opacity-10 transition-colors text-lg"
              >
                Sign In to Your Account
              </Link>
            )}
          </div>
          <p className="text-primary-200 text-sm mt-6">
            No credit card required • Free for all engineering students
          </p>
        </div>
      </section>

      {/* Footer Note */}
      <div className="text-center text-gray-500 text-sm">
        <p>
          EGS Bridge is developed by engineering students for engineering students.
          Solving real placement problems since 2024.
        </p>
        <p className="mt-2">
          Perfect for final year projects and hackathons.
        </p>
      </div>
    </div>
  );
};

export default Home;