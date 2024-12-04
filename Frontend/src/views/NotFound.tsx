import React from 'react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
    <div className="w-full mx-auto px-3 py-6 relative">
      <img 
        src="/logo2.png"
        alt="TrackWise"
        className="h-8 w-auto object-contain object-left"
        style={{ 
          position: 'absolute',
          transform: 'scale(4)', 
          transformOrigin: 'left', 
          imageRendering: 'auto' 
        }}
      />
    </div>

      {/* Rest of the 404 page content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg mx-auto px-4 text-center">
          {/* Map icon with 404 */}
          <div className="mb-16">
            <svg className="w-32 h-32 mx-auto text-slate-800" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
            </svg>
            <div className="mt-2 text-slate-600 text-xl">404</div>
          </div>

          {/* Text content */}
          <h1 className="text-6xl font-medium bg-gradient-to-r from-emerald-400 to-blue-400 text-transparent bg-clip-text mb-8">
            Signal Lost
          </h1>
          <div className="space-y-2 mb-16">
            <p className="text-slate-400 text-xl">
              We've lost track of this page in your career journey.
            </p>
            <p className="text-slate-400 text-xl">
              Let's get you back on the right path.
            </p>
          </div>

          {/* Button */}
          <button
           onClick={() => window.location.href = '/'}
           className="w-full max-w-xs mx-auto h-14 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-xl text-white text-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center group">
            <span>Back to Home</span>
            <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
