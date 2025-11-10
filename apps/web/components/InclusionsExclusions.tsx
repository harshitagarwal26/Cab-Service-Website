"use client";
import { useState } from "react";

export default function InclusionsExclusions() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6">
      <button
        type="button"
        className="text-blue-600 hover:text-blue-500 text-sm font-medium underline transition"
        onClick={() => setOpen((o) => !o)}
        style={{ outline: "none" }}
      >
        {open ? "Hide Inclusions and Exclusions" : "Inclusions and Exclusions"}
      </button>
      {open && (
        <div className="mt-4 w-full max-w-2xl rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:p-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg text-neutral-600 font-semibold">Included</span>
              </div>
              <ul className="space-y-3 text-sm text-green-700">
                {[
                  "Driver Allowance",
                  "Fuel",
                  "Toll & State Tax",
                  "Only One Pickup & Drop",
                  "GST (5%)"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg height={18} width={18} className="text-green-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none"><path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg text-neutral-600 font-semibold">Excluded</span>
              </div>
              <ul className="space-y-3 text-sm text-rose-700">
                {[
                  "Airport Entry/Parking",
                  "Waiting Charges",
                  "Extra Pickups/Drops",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg width={18} height={18} className="text-rose-300 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8m0-8l-8 8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>{item}</span>
                  </li>
                ))}
                <li className="flex items-start gap-2">
                  <svg width={18} height={18} className="text-rose-300 flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8m0-8l-8 8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span>Anything not listed in inclusions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
