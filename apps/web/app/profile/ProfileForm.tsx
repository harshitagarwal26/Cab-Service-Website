'use client';

import { useState } from 'react';
import PhoneInput from '@/components/ui/PhoneInput';
import { updateProfile } from './actions';

interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
}

export default function ProfileForm({ user }: { user: User }) {
  // Logic to split saved phone "+91 9999999999" into parts for the component
  const initialPhoneParts = user.phone ? user.phone.split(' ') : ['+91', ''];
  const initialCountryCode = initialPhoneParts.length > 1 ? initialPhoneParts[0] : '+91';
  const initialPhoneNumber = initialPhoneParts.length > 1 ? initialPhoneParts.slice(1).join('') : (user.phone || '');

  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [isSaving, setIsSaving] = useState(false);

  async function clientAction(formData: FormData) {
    setIsSaving(true);
    try {
      await updateProfile(user.id, formData);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form action={clientAction} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input 
            name="name" 
            defaultValue={user.name || ''} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          {/* Reusing the exact same component from Booking Page */}
          <PhoneInput
            countryCode={countryCode}
            onCountryCodeChange={setCountryCode}
            value={phoneNumber}
            onValueChange={setPhoneNumber}
            required
            className="bg-white"
          />
          {/* Hidden input sends the combined value to the server action */}
          <input 
            type="hidden" 
            name="phone" 
            value={`${countryCode} ${phoneNumber}`} 
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input 
            disabled 
            defaultValue={user.email} 
            className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
        </div>
      </div>
      
      <div className="pt-4">
        <button 
          type="submit" 
          disabled={isSaving}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}