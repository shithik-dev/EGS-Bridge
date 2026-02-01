import React from 'react';

const Loader = ({ type = 'spinner', size = 'medium', text = 'Loading...', fullPage = false }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  const LoaderContent = () => {
    switch (type) {
      case 'dots':
        return (
          <div className="flex items-center justify-center space-x-2">
            <div className={`${sizeClasses[size]} rounded-full bg-primary-600 animate-bounce`}></div>
            <div className={`${sizeClasses[size]} rounded-full bg-primary-600 animate-bounce delay-100`}></div>
            <div className={`${sizeClasses[size]} rounded-full bg-primary-600 animate-bounce delay-200`}></div>
          </div>
        );

      case 'bars':
        return (
          <div className="flex items-center justify-center space-x-1">
            <div className="h-8 w-2 bg-primary-600 animate-pulse"></div>
            <div className="h-10 w-2 bg-primary-600 animate-pulse delay-100"></div>
            <div className="h-12 w-2 bg-primary-600 animate-pulse delay-200"></div>
            <div className="h-10 w-2 bg-primary-600 animate-pulse delay-300"></div>
            <div className="h-8 w-2 bg-primary-600 animate-pulse delay-400"></div>
          </div>
        );

      case 'spinner':
      default:
        return (
          <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin`}></div>
        );
    }
  };

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex flex-col items-center justify-center">
        <LoaderContent />
        {text && <p className="mt-4 text-gray-600 font-medium">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoaderContent />
      {text && <p className="mt-4 text-gray-600 font-medium">{text}</p>}
    </div>
  );
};

export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const CardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
      <div className="flex justify-between items-center mt-6">
        <div className="flex space-x-2">
          <div className="h-6 bg-gray-200 rounded w-12"></div>
          <div className="h-6 bg-gray-200 rounded w-12"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );

  const ListSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
      ))}
    </div>
  );

  const TableSkeleton = () => (
    <div className="overflow-hidden border border-gray-200 rounded-lg">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="px-6 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  switch (type) {
    case 'list':
      return <ListSkeleton />;
    case 'table':
      return <TableSkeleton />;
    case 'card':
    default:
      return (
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      );
  }
};

export const InlineLoader = ({ text = 'Loading...' }) => (
  <div className="inline-flex items-center">
    <div className="h-4 w-4 border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin mr-2"></div>
    <span className="text-sm text-gray-600">{text}</span>
  </div>
);

export default Loader;