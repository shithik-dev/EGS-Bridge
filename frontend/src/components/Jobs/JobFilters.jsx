import React, { useState } from 'react';
import { FaFilter, FaSearch, FaCalendarAlt, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';

const JobFilters = ({ onFilterChange, departments, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    department: initialFilters.department || '',
    company: initialFilters.company || '',
    mode: initialFilters.mode || '',
    status: initialFilters.status || '',
    sortBy: initialFilters.sortBy || 'deadline',
    search: initialFilters.search || ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      department: '',
      company: '',
      mode: '',
      status: '',
      sortBy: 'deadline',
      search: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FaFilter className="text-primary-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Filter Drives</h2>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden text-primary-600 hover:text-primary-700"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company or job title..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filters - Always visible on desktop, toggle on mobile */}
      <div className={`${isExpanded ? 'block' : 'hidden'} md:block`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaBuilding className="inline mr-2 text-gray-500" />
              Department
            </label>
            <select
              value={filters.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Company Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaBuilding className="inline mr-2 text-gray-500" />
              Company
            </label>
            <select
              value={filters.company}
              onChange={(e) => handleChange('company', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Companies</option>
              <option value="TCS">TCS</option>
              <option value="Infosys">Infosys</option>
              <option value="Wipro">Wipro</option>
              <option value="Accenture">Accenture</option>
              <option value="Amazon">Amazon</option>
              <option value="Microsoft">Microsoft</option>
            </select>
          </div>

          {/* Mode Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaMapMarkerAlt className="inline mr-2 text-gray-500" />
              Mode
            </label>
            <select
              value={filters.mode}
              onChange={(e) => handleChange('mode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Modes</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-2 text-gray-500" />
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2 lg:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'deadline', label: 'Registration Deadline' },
                { value: 'driveDate', label: 'Drive Date' },
                { value: 'company', label: 'Company Name' },
                { value: 'newest', label: 'Newest First' },
                { value: 'cgpa', label: 'Minimum CGPA' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleChange('sortBy', option.value)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.sortBy === option.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Reset Filters
          </button>
          <button
            onClick={() => onFilterChange(filters)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.department || filters.company || filters.mode || filters.status) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-600">Active filters:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.department && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    Department: {filters.department}
                    <button
                      onClick={() => handleChange('department', '')}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.company && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    Company: {filters.company}
                    <button
                      onClick={() => handleChange('company', '')}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.mode && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    Mode: {filters.mode}
                    <button
                      onClick={() => handleChange('mode', '')}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.status && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                    Status: {filters.status}
                    <button
                      onClick={() => handleChange('status', '')}
                      className="ml-2 text-yellow-600 hover:text-yellow-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobFilters;