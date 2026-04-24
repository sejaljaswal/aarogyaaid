import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin') {
      localStorage.setItem('isAdminLoggedIn', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials. Use "admin" for testing.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-10 border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-900 to-teal-600"></div>
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-gray-50 rounded-full mb-2">
            <Lock size={32} className="text-gray-900" />
          </div>
          <h1 className="text-3xl font-black text-gray-900">Admin Portal</h1>
          <p className="text-gray-500 font-medium">Please authenticate to continue.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">{error}</div>}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all"
            />
          </div>
          <button type="submit" className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
