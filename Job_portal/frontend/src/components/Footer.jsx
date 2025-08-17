import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">About Job Portal</h3>
            <p className="text-sm text-gray-400">
              Job Portal is your one-stop destination for finding your dream job or hiring top talent. We connect job seekers and recruiters seamlessly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white transition">Home</a></li>
              <li><a href="/jobs" className="text-gray-400 hover:text-white transition">Browse Jobs</a></li>
              <li><a href="/login" className="text-gray-400 hover:text-white transition">Login</a></li>
              <li><a href="/signup" className="text-gray-400 hover:text-white transition">Signup</a></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <p className="text-sm text-gray-400">Email: support@jobportal.com</p>
            <p className="text-sm text-gray-400">Phone: +1 234 567 890</p>
            <p className="text-sm text-gray-400">Address: 123 Job Street, Work City</p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-4 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Job Portal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
