import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // OAuth2PasswordRequestForm expects data in x-www-form-urlencoded
      const params = new URLSearchParams();
      params.append('username', formData.username);
      params.append('password', formData.password);

      const response = await axios.post('/api/admin/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      localStorage.setItem('adminToken', response.data.access_token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-12">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-900 to-teal-600"></div>
        
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center justify-center p-5 bg-gray-50 rounded-3xl mb-2 shadow-inner">
            <Lock size={40} className="text-gray-900" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight underline decoration-teal-500 decoration-4 underline-offset-8">Admin Portal</h1>
          <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mt-4">Restricted Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="text-red-600 text-xs font-black text-center bg-red-50 py-3 rounded-xl border border-red-100 px-4">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
            <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    required
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all font-semibold"
                />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all font-semibold"
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <span>Access Dashboard</span>}
          </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] flex items-center justify-center">
                <ShieldCheck size={12} className="mr-2 text-teal-500" />
                End-to-End Encrypted Session
            </p>
        </div>
      </div>
    </div>
  );
}
