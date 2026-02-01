import React from 'react'
import { FaBuilding, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaLink, FaUserCheck } from 'react-icons/fa'
import { format } from 'date-fns'

const JobCard = ({ job, onRegister, userRole }) => {
  const getStatusBadge = () => {
    const now = new Date()
    const deadline = new Date(job.registrationDeadline)
    const driveDate = new Date(job.driveDate)
    
    if (job.status !== 'Active') {
      return <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm">Closed</span>
    }
    
    if (deadline < now) {
      return <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">Deadline Passed</span>
    }
    
    if (deadline.toDateString() === now.toDateString()) {
      return <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">Deadline Today</span>
    }
    
    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
    
    if (daysLeft <= 3) {
      return <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm">{daysLeft} days left</span>
    }
    
    return <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">Registration Open</span>
  }

  const isEligible = userRole === 'student' && 
    job.eligibleDepartments.includes(userRole.department) &&
    (userRole.cgpa >= (job.eligibilityCriteria?.minCGPA || 0))

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 mb-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center mb-2">
            <FaBuilding className="text-primary-600 mr-2" />
            <h3 className="text-xl font-bold text-gray-800">{job.companyName}</h3>
          </div>
          <h4 className="text-lg font-semibold text-gray-700 mb-1">{job.jobTitle}</h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {job.eligibleDepartments.map(dept => (
              <span key={dept} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {dept}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end">
          {getStatusBadge()}
          {job.isRegistered && (
            <span className="mt-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
              <FaUserCheck className="mr-1" /> Registered
            </span>
          )}
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{job.jobDescription}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center text-gray-700">
            <FaCalendarAlt className="mr-2 text-gray-500" />
            <span className="font-medium">Deadline:</span>
            <span className="ml-2">{format(new Date(job.registrationDeadline), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <FaCalendarAlt className="mr-2 text-gray-500" />
            <span className="font-medium">Drive Date:</span>
            <span className="ml-2">{format(new Date(job.driveDate), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <FaClock className="mr-2 text-gray-500" />
            <span className="font-medium">Time:</span>
            <span className="ml-2">{job.driveTime}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-gray-700">
            <FaMapMarkerAlt className="mr-2 text-gray-500" />
            <span className="font-medium">Mode:</span>
            <span className={`ml-2 px-2 py-1 rounded ${job.mode === 'Online' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
              {job.mode}
            </span>
          </div>
          {job.mode === 'Offline' && (
            <div className="flex items-center text-gray-700">
              <FaMapMarkerAlt className="mr-2 text-gray-500" />
              <span className="font-medium">Venue:</span>
              <span className="ml-2">{job.venue}</span>
            </div>
          )}
          <div className="flex items-center text-gray-700">
            <span className="font-medium mr-2">Min CGPA:</span>
            <span className="px-2 py-1 bg-gray-100 rounded">{job.eligibilityCriteria?.minCGPA || 'No minimum'}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex items-center">
          <FaLink className="mr-2 text-blue-600" />
          <a 
            href={job.registrationLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Registration Link
          </a>
        </div>
        
        {userRole === 'student' && job.canRegister && !job.isRegistered && isEligible && (
          <button
            onClick={() => onRegister(job._id)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Register Now
          </button>
        )}

        {userRole === 'student' && !isEligible && (
          <span className="text-red-600 text-sm font-medium">
            Not eligible for this drive
          </span>
        )}
      </div>
    </div>
  )
}

export default JobCard