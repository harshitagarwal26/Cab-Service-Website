'use client';
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignIn() {
  const [email, setEmail] = useState('admin@cab.local');
  const [password, setPassword] = useState('Admin@123');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-xl bg-white/5 border border-white/10 p-6">
        <h1 className="text-xl font-semibold mb-4">Admin Sign In</h1>
        <input className="w-full mb-3 rounded-md bg-white/5 border border-white/10 px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/>
        <input className="w-full mb-4 rounded-md bg-white/5 border border-white/10 px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password"/>
        <button className="w-full rounded-md bg-brand-600 hover:bg-brand-500 px-4 py-2" onClick={()=>signIn('credentials',{ email, password, callbackUrl: '/' })}>Sign In</button>
      </div>
    </div>
  );
}
