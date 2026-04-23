import React from 'react';
import { motion } from 'framer-motion';
import { Shield, MapPin, Clock, ArrowRight, Star, CheckCircle } from 'lucide-react';
import useStore from '../store/useStore';

const RecommendationCards = () => {
  const { recommendations, setStep } = useStore();

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">No matches found for your profile.</h2>
        <button 
          onClick={() => setStep(1)}
          className="mt-4 text-blue-600 font-semibold hover:underline"
        >
          Try adjusting your filters
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
          Top Handpicked <span className="text-blue-600">Insurance Plans</span>
        </h1>
        <p className="text-gray-500 text-lg">Based on our AI analysis of your health footprint.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recommendations.map((item, index) => (
          <motion.div
            key={item.policy.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-1 rounded-[2.5rem] bg-gradient-to-br ${
              index === 0 ? 'from-blue-500 to-indigo-600 scale-105 z-10' : 'from-gray-200 to-gray-300'
            }`}
          >
            <div className="bg-white rounded-[2.3rem] p-8 h-full flex flex-col">
              {index === 0 && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-1 rounded-full text-sm font-bold shadow-lg">
                  Best Value Match
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{item.policy.provider}</span>
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight mt-1">{item.policy.name}</h3>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <span className="text-xl font-black">{Math.round(item.score)}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 mt-1">Match</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center text-gray-600 text-sm">
                  <Shield size={18} className="mr-3 text-blue-500" />
                  <span>Sum Insured: <span className="font-bold">₹{(item.policy.sum_insured / 100000).toFixed(0)}L</span></span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin size={18} className="mr-3 text-blue-500" />
                  <span>{item.policy.cashless_hospitals.toLocaleString()} Network Hospitals</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock size={18} className="mr-3 text-blue-500" />
                  <span>{item.policy.waiting_period_months} mo Waiting Period</span>
                </div>
              </div>

              <div className="bg-blue-50/50 rounded-2xl p-4 mb-8 border border-blue-100/50">
                <p className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center">
                  <Star size={12} className="mr-1 inline" /> Why this fits you:
                </p>
                <ul className="space-y-2">
                  {item.matching_reasons.slice(0, 3).map((reason, i) => (
                    <li key={i} className="text-xs text-blue-900 flex items-start">
                      <CheckCircle size={14} className="mr-2 text-blue-500 shrink-0 mt-0.5" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto">
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-black text-gray-900">₹{item.estimated_premium}</span>
                  <span className="text-gray-500 text-sm font-medium ml-1">/year</span>
                </div>
                <button className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl transition-all flex items-center justify-center group">
                  <span>Policy Details</span>
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-16 text-center">
        <button 
          onClick={() => setStep(1)}
          className="text-gray-500 hover:text-blue-600 font-semibold flex items-center mx-auto transition-colors"
        >
          <Clock size={18} className="mr-2" />
          Edit My Health Profile
        </button>
      </div>
    </div>
  );
};

export default RecommendationCards;
