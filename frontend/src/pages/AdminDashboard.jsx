import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, LogOut, Users, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/admin');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-black text-gray-900 flex items-center">
          <Database className="mr-3 text-teal-600" /> System Dashboard
        </h1>
        <button 
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 font-bold text-sm uppercase">Total Users</h3>
            <Users className="text-teal-600" size={20} />
          </div>
          <div className="text-4xl font-black text-gray-900">1,204</div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 font-bold text-sm uppercase">Active Sessions</h3>
            <Activity className="text-blue-600" size={20} />
          </div>
          <div className="text-4xl font-black text-gray-900">42</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 font-bold text-sm uppercase">API Health</h3>
            <Database className="text-green-600" size={20} />
          </div>
          <div className="text-4xl font-black text-green-600">99.9%</div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Form Submissions</h2>
        <div className="text-center py-12 text-gray-500">
          Backend integration pending. No real data available yet.
        </div>
      </div>
    </div>
  );
}
