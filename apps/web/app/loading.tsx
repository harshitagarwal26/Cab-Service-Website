import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="relative flex flex-col items-center">
        
        {/* Aesthetic Car Animation Container */}
        <div className="relative w-24 h-24 mb-8">
          {/* Pulsing Map Marker / Destination Halo */}
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
          
          <div className="relative z-10 w-full h-full bg-white rounded-full shadow-xl flex items-center justify-center border border-blue-50">
            {/* Animated Car Icon */}
            <svg 
              className="w-10 h-10 text-blue-600 animate-bounce" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ animationDuration: '1s' }}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a2 2 0 012-2h2a2 2 0 012 2v6a3 3 0 01-3 3z" 
              />
            </svg>
          </div>

          {/* Road/Shadow Effect underneath */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-gray-200 rounded-full animate-pulse"></div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
            Finding your ride...
          </h2>
          <p className="text-sm text-gray-500 animate-pulse">
            Getting the best routes ready for you
          </p>
        </div>

        {/* Minimal Progress Bar */}
        <div className="mt-8 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-orange-400 w-1/2 animate-[shimmer_1.5s_infinite] rounded-full relative">
            <div className="absolute inset-0 bg-white/20"></div>
          </div>
        </div>
      </div>

      {/* Add custom keyframe for the shimmer effect inline if not in global css */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}} />
    </div>
  );
}