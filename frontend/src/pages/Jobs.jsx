import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';
import JobCard from '../components/Jobs/JobCard';
import JobFilters from '../components/Jobs/JobFilters';
import Loader, { SkeletonLoader } from '../components/Common/Loader';
import { FaPlus, FaFilter, FaCalendarPlus, FaExclamationTriangle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    upcoming: 0,
    registered: 0
  });

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getJobs();
      const jobsData = response.data.data || [];
      
      setJobs(jobsData);
      setFilteredJobs(jobsData);
      
      // Calculate statistics
      const now = new Date();
      const activeJobs = jobsData.filter(job => job.status === 'Active');
      const upcomingJobs = jobsData.filter(job => 
        new Date(job.driveDate) > now
      );
      const registeredJobs = jobsData.filter(job => job.isRegistered).length;
      
      setStats({
        total: jobsData.length,
        active: activeJobs.length,
        upcoming: upcomingJobs.length,
        registered: registeredJobs
      });
    } catch (error) {
      toast.error('Failed to load placement drives');
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (filterParams) => {
    let filtered = [...jobs];

    // Apply search
    if (filterParams.search) {
      const searchLower = filterParams.search.toLowerCase();
      filtered = filtered.filter(job =>
        job.companyName.toLowerCase().includes(searchLower) ||
        job.jobTitle.toLowerCase().includes(searchLower) ||
        job.jobDescription.toLowerCase().includes(searchLower)
      );
    }

    // Apply department filter
    if (filterParams.department) {
      filtered = filtered.filter(job =>
        job.eligibleDepartments.includes(filterParams.department)
      );
    }

    // Apply company filter
    if (filterParams.company) {
      filtered = filtered.filter(job =>
        job.companyName === filterParams.company
      );
    }

    // Apply mode filter
    if (filterParams.mode) {
      filtered = filtered.filter(job =>
        job.mode === filterParams.mode
      );
    }

    // Apply status filter
    if (filterParams.status) {
      filtered = filtered.filter(job =>
        job.status === filterParams.status
      );
    }

    // Apply sorting
    switch (filterParams.sortBy) {
      case 'driveDate':
        filtered.sort((a, b) => new Date(a.driveDate) - new Date(b.driveDate));
        break;
      case 'company':
        filtered.sort((a, b) => a.companyName.localeCompare(b.companyName));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'cgpa':
        filtered.sort((a, b) => 
          (a.eligibilityCriteria?.minCGPA || 0) - (b.eligibilityCriteria?.minCGPA || 0)
        );
        break;
      case 'deadline':
      default:
        filtered.sort((a, b) => new Date(a.registrationDeadline) - new Date(b.registrationDeadline));
        break;
    }

    setFilteredJobs(filtered);
  };

  const handleRegister = async (jobId) => {
    try {
      await apiService.registerForJob(jobId);
      toast.success('Successfully registered for the drive!');
      
      // Update the job in the list
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job._id === jobId
            ? { ...job, isRegistered: true }
            : job
        )
      );
      
      setFilteredJobs(prevJobs =>
        prevJobs.map(job =>
          job._id === jobId
            ? { ...job, isRegistered: true }
            : job
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        registered: prev.registered + 1
      }));
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setFilteredJobs(jobs);
    } else {
      const searchLower = value.toLowerCase();
      const filtered = jobs.filter(job =>
        job.companyName.toLowerCase().includes(searchLower) ||
        job.jobTitle.toLowerCase().includes(searchLower)
      );
      setFilteredJobs(filtered);
    }
  };

  const getDepartments = () => {
    const departments = new Set();
    jobs.forEach(job => {
      job.eligibleDepartments.forEach(dept => departments.add(dept));
    });
    return Array.from(departments).sort();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="card" count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Placement Drives
          </h1>
          <p className="text-gray-600">
            Find and register for upcoming placement opportunities
          </p>
        </div>
        
        {user?.role === 'placement_officer' ? (
          <Link
            to="/admin/jobs/new"
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <FaPlus className="mr-2" />
            New Drive
          </Link>
        ) : (
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <FaFilter className="mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-primary-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Drives</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active Now</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{stats.registered}</div>
          <div className="text-sm text-gray-600">Registered</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search drives by company or job title..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <JobFilters
          onFilterChange={handleFilterChange}
          departments={getDepartments()}
          initialFilters={filters}
        />
      )}

      {/* Jobs List */}
      <div>
        {filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onRegister={handleRegister}
                userRole={user}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <FaExclamationTriangle className="text-gray-300 text-4xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No placement drives found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm || Object.values(filters).some(Boolean)
                ? 'Try adjusting your search or filters to find more results.'
                : 'Check back later for new placement opportunities.'}
            </p>
            {(searchTerm || Object.values(filters).some(Boolean)) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({});
                  setFilteredJobs(jobs);
                }}
                className="mt-4 px-4 py-2 text-primary-600 hover:text-primary-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tips for Students */}
      {user?.role === 'student' && filteredJobs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <div className="flex items-start">
            <FaCalendarPlus className="text-blue-600 text-xl mr-3 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">
                Tips for Successful Placement
              </h3>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Register early to avoid last-minute technical issues</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Prepare your resume and keep it updated</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Check eligibility criteria carefully before registering</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Enable notifications to receive important reminders</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;