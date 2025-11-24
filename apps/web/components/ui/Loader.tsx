'use client';

import React from 'react';

export default function Loader({ text = "Getting things ready..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="relative">
        {/* Road Line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-gray-400 to-transparent animate-road-move"></div>
        </div>

        {/* Car Icon */}
        <div className="relative z-10 mb-2 animate-car-bounce">
          <svg 
            width="64" 
            height="64" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            className="text-orange-600"
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
            <circle cx="6.5" cy="16.5" r="2.5" />
            <circle cx="16.5" cy="16.5" r="2.5" />
          </svg>
        </div>
        
        {/* Wind lines */}
        <div className="absolute top-2 -right-8 animate-wind-1 opacity-0">
          <div className="w-4 h-0.5 bg-gray-300 rounded-full"></div>
        </div>
        <div className="absolute top-6 -right-6 animate-wind-2 opacity-0">
          <div className="w-6 h-0.5 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      {/* Text */}
      <div className="mt-8 text-center">
        <h3 className="text-lg font-semibold text-gray-800 tracking-tight animate-pulse">
          {text}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Finding the best route for you
        </p>
      </div>

      <style jsx>{`
        @keyframes road-move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes car-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes wind-1 {
          0% { transform: translateX(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateX(-20px); opacity: 0; }
        }
        @keyframes wind-2 {
          0% { transform: translateX(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateX(-20px); opacity: 0; }
        }
        .animate-road-move {
          animation: road-move 1s linear infinite;
        }
        .animate-car-bounce {
          animation: car-bounce 2s ease-in-out infinite;
        }
        .animate-wind-1 {
          animation: wind-1 1.5s linear infinite;
          animation-delay: 0.2s;
        }
        .animate-wind-2 {
          animation: wind-2 1.5s linear infinite;
          animation-delay: 0.7s;
        }
      `}</style>
    </div>
  );
}