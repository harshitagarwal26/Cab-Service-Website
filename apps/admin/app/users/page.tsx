'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: {
    bookings: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async (q = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?search=${encodeURIComponent(q)}`);
      const data = await res.json();
      setUsers(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-100">Registered Users</h1>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <input 
          className="input max-w-md bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchUsers(search)}
        />
        <button onClick={() => fetchUsers(search)} className="btn btn-primary">
          Search
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Bookings</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="font-medium text-slate-200">{user.name || 'N/A'}</div>
                    </td>
                    <td className="text-slate-400">{user.email}</td>
                    <td>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        user.role === 'admin' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-500/20 text-slate-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="text-slate-300">{user._count.bookings}</td>
                    <td className="text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link 
                        href={`/users/${user.id}`}
                        className="text-indigo-400 hover:text-indigo-300 hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}