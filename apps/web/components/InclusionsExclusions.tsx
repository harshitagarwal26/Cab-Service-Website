'use client';

import { useState } from 'react';

export default function InclusionsExclusions() {
  const [isOpen, setIsOpen] = useState(false);

  // Stop scrolling on body when modal is open
  const toggleModal = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission if inside a form
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  return (
    <>
      <button 
        type="button" 
        onClick={toggleModal}
        className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:underline focus:outline-none transition-colors"
      >
        View Inclusions & Exclusions
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={toggleModal}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Fare Breakdown</h3>
              <button 
                onClick={toggleModal}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                
                {/* Inclusions */}
                <div>
                  <h4 className="flex items-center text-green-700 font-semibold mb-3">
                    <span className="bg-green-100 p-1.5 rounded-full mr-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    What's Included
                  </h4>
                  <ul className="space-y-3 pl-2">
                    {[
                      "Base Fare and Fuel Charges",
                      "Driver Allowance",
                      "State Taxes & Toll Taxes",
                      "GST (Goods & Services Tax)",
                      "One Pick-up & One Drop-off point"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="h-px bg-gray-100 w-full"></div>

                {/* Exclusions */}
                <div>
                  <h4 className="flex items-center text-red-700 font-semibold mb-3">
                    <span className="bg-red-100 p-1.5 rounded-full mr-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                    What's Excluded
                  </h4>
                  <ul className="space-y-3 pl-2">
                    {[
                      "Parking Charges (if applicable)",
                      "Multiple Pick-ups or Drops",
                      "Waiting charges beyond 45 mins",
                      "Night charges (if applicable between 11 PM - 5 AM)"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Note */}
              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>Note:</strong> Total fare includes all standard charges. Any additional charges incurred during the trip (like parking or route deviations) are payable directly to the driver.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <button 
                onClick={toggleModal}
                className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}