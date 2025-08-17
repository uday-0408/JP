import React from 'react';
import { Link, useRouteError } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Bootstrap Icons

const PageNotFound = () => {
  const error = useRouteError();

  const is404 = error?.status === 404 || error?.statusText === 'Not Found';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-light text-dark px-4">
      <div className="text-center">
        <i className="bi bi-exclamation-triangle text-danger text-6xl mb-4"></i>
        <h1 className="text-5xl font-bold mb-2">
          {is404 ? '404 - Page Not Found' : 'Unexpected Error'}
        </h1>
        <p className="text-lg text-muted mb-4">
          {is404
            ? "Oops! The page you're looking for doesn't exist."
            : error?.message || 'Something went wrong. Please try again.'}
        </p>
        <Link
          to="/"
          className="btn btn-primary rounded shadow px-4 py-2 transition-all duration-300 hover:bg-blue-700"
        >
          <i className="bi bi-house-door me-2"></i> Go Home
        </Link>
      </div>
    </div>
  );
};

export default PageNotFound;
