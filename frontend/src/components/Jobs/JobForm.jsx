import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  FaBuilding, 
  FaFileAlt, 
  FaCalendarAlt, 
  FaLink, 
  FaGraduationCap,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

const JobForm = ({ jobData = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    eligibleDepartments: [],
    eligibilityCriteria: {
      minCGPA: '',
      requiredSkills: '',
      backlogAllowed: false,
      yearOfPassing: new Date().getFullYear()
    },
    registrationLink: '',
    registrationDeadline: '',
    driveDate: '',
    driveTime: '',
    mode: 'Offline',
    venue: 'College Placement Cell'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (jobData) {
      setFormData({
        companyName: jobData.companyName || '',
        jobTitle: jobData.jobTitle || '',
        jobDescription: jobData.jobDescription || '',
        eligibleDepartments: jobData.eligibleDepartments || [],
        eligibilityCriteria: {
          minCGPA: jobData.eligibilityCriteria?.minCGPA || '',
          requiredSkills: jobData.eligibilityCriteria?.requiredSkills?.join(', ') || '',
          backlogAllowed: jobData.eligibilityCriteria?.backlogAllowed || false,
          yearOfPassing: jobData.eligibilityCriteria?.yearOfPassing || new Date().getFullYear()
        },
        registrationLink: jobData.registrationLink || '',
        registrationDeadline: jobData.registrationDeadline 
          ? new Date(jobData.registrationDeadline).toISOString().split('T')[0]
          : '',
        driveDate: jobData.driveDate 
          ? new Date(jobData.driveDate).toISOString().split('T')[0]
          : '',
        driveTime: jobData.driveTime || '10:00',
        mode: jobData.mode || 'Offline',
        venue: jobData.venue || 'College Placement Cell'
      });
    }
  }, [jobData]);

  const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = 'Job description is required';
    }

    if (formData.eligibleDepartments.length === 0) {
      newErrors.eligibleDepartments = 'Select at least one department';
    }

    if (!formData.registrationLink.trim()) {
      newErrors.registrationLink = 'Registration link is required';
    } else if (!formData.registrationLink.startsWith('http')) {
      newErrors.registrationLink = 'Please enter a valid URL';
    }

    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = 'Registration deadline is required';
    } else if (new Date(formData.registrationDeadline) < new Date()) {
      newErrors.registrationDeadline = 'Deadline cannot be in the past';
    }

    if (!formData.driveDate) {
      newErrors.driveDate = 'Drive date is required';
    }

    if (!formData.driveTime) {
      newErrors.driveTime = 'Drive time is required';
    }

    if (formData.registrationDeadline && formData.driveDate) {
      if (new Date(formData.registrationDeadline) >= new Date(formData.driveDate)) {
        newErrors.registrationDeadline = 'Deadline must be before drive date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        eligibilityCriteria: {
          ...formData.eligibilityCriteria,
          requiredSkills: formData.eligibilityCriteria.requiredSkills
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill)
        }
      };

      let response;
      if (jobData) {
        // Update existing job
        response = await apiService.updateJob(jobData._id, payload);
        toast.success('Placement drive updated successfully!');
      } else {
        // Create new job
        response = await apiService.createJob(payload);
        toast.success('Placement drive created successfully!');
      }

      if (onSuccess) {
        onSuccess(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save placement drive');
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentToggle = (department) => {
    setFormData(prev => ({
      ...prev,
      eligibleDepartments: prev.eligibleDepartments.includes(department)
        ? prev.eligibleDepartments.filter(dept => dept !== department)
        : [...prev.eligibleDepartments, department]
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('eligibilityCriteria.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        eligibilityCriteria: {
          ...prev.eligibilityCriteria,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {jobData ? 'Edit Placement Drive' : 'Create New Placement Drive'}
        </h2>
        <p className="text-gray-600">
          Fill in the details below to create a new placement opportunity for students
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Details */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaBuilding className="mr-2 text-primary-600" />
            Company Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.companyName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Tata Consultancy Services"
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.jobTitle ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Software Engineer"
              />
              {errors.jobTitle && (
                <p className="mt-1 text-sm text-red-600">{errors.jobTitle}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.jobDescription ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the job role, responsibilities, and requirements..."
              />
              {errors.jobDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.jobDescription}</p>
              )}
            </div>
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaGraduationCap className="mr-2 text-primary-600" />
            Eligibility Criteria
          </h3>
          <div className="space-y-6">
            {/* Eligible Departments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Eligible Departments *
              </label>
              <div className="flex flex-wrap gap-3">
                {departments.map(dept => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => handleDepartmentToggle(dept)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      formData.eligibleDepartments.includes(dept)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
              {errors.eligibleDepartments && (
                <p className="mt-1 text-sm text-red-600">{errors.eligibleDepartments}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Selected: {formData.eligibleDepartments.join(', ') || 'None'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  name="eligibilityCriteria.minCGPA"
                  value={formData.eligibilityCriteria.minCGPA}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 7.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills
                </label>
                <input
                  type="text"
                  name="eligibilityCriteria.requiredSkills"
                  value={formData.eligibilityCriteria.requiredSkills}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Java, Python, React (comma separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year of Passing
                </label>
                <select
                  name="eligibilityCriteria.yearOfPassing"
                  value={formData.eligibilityCriteria.yearOfPassing}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="backlogAllowed"
                name="eligibilityCriteria.backlogAllowed"
                checked={formData.eligibilityCriteria.backlogAllowed}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="backlogAllowed" className="ml-2 block text-sm text-gray-700">
                Backlog allowed
              </label>
            </div>
          </div>
        </div>

        {/* Schedule & Registration */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaCalendarAlt className="mr-2 text-primary-600" />
            Schedule & Registration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Link *
              </label>
              <div className="relative">
                <FaLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  name="registrationLink"
                  value={formData.registrationLink}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.registrationLink ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://company.com/register"
                />
              </div>
              {errors.registrationLink && (
                <p className="mt-1 text-sm text-red-600">{errors.registrationLink}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drive Mode
              </label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Offline">Offline</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Deadline *
              </label>
              <input
                type="date"
                name="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.registrationDeadline ? 'border-red-500' : 'border-gray-300'
                }`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.registrationDeadline && (
                <p className="mt-1 text-sm text-red-600">{errors.registrationDeadline}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drive Date *
              </label>
              <input
                type="date"
                name="driveDate"
                value={formData.driveDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.driveDate ? 'border-red-500' : 'border-gray-300'
                }`}
                min={formData.registrationDeadline || new Date().toISOString().split('T')[0]}
              />
              {errors.driveDate && (
                <p className="mt-1 text-sm text-red-600">{errors.driveDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drive Time *
              </label>
              <input
                type="time"
                name="driveTime"
                value={formData.driveTime}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.driveTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.driveTime && (
                <p className="mt-1 text-sm text-red-600">{errors.driveTime}</p>
              )}
            </div>

            {formData.mode === 'Offline' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., College Placement Cell, Room 101"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              disabled={loading}
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {jobData ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <FaCheck className="mr-2" />
                {jobData ? 'Update Drive' : 'Create Drive'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;