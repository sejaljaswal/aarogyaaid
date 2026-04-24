import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react';

export default function RecommendationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { responseData, userProfile } = location.state || {};

  if (!responseData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No recommendations found</h2>
        <p className="text-gray-500 mb-8">Please fill out your profile first to get tailored recommendations.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center space-x-4 mb-4 cursor-pointer text-gray-500 hover:text-gray-900 transition-colors" onClick={() => navigate('/')}>
        <ArrowLeft size={20} />
        <span className="font-bold">Edit Profile</span>
      </div>

      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-gray-900">Your Personalized Recommendations</h1>
        <p className="text-lg text-gray-500 font-medium">
          Based on your profile, here are the top policies that fit your needs.
        </p>
      </div>

      <div className="grid gap-6">
        {responseData?.policies?.map((policy, idx) => (
          <div key={idx} className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1 space-y-3">
              <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                <CheckCircle size={14} className="mr-1.5" />
                {policy.highlight}
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{policy.name}</h3>
              <p className="text-gray-500 font-medium">{policy.provider}</p>
            </div>
            <div className="text-left md:text-right space-y-1">
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wide">Cover Amount</div>
              <div className="text-xl font-black text-gray-900">₹{policy.cover}</div>
            </div>
            <div className="text-left md:text-right space-y-1">
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wide">Premium</div>
              <div className="text-3xl font-black text-teal-600">{policy.premium}</div>
            </div>
            <button className="w-full md:w-auto px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors shadow-md">
              Select Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
