import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Loader2, Heart } from 'lucide-react';
import axios from 'axios';

const PRE_EXISTING_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Asthma',
  'Cardiac',
  'None',
  'Other'
];

export default function ProfileForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    lifestyle: '',
    conditions: [],
    incomeBand: '',
    cityTier: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (condition) => {
    setFormData(prev => {
      let updatedConditions;
      if (condition === 'None') {
        updatedConditions = ['None'];
      } else {
        const withoutNone = prev.conditions.filter(c => c !== 'None');
        if (withoutNone.includes(condition)) {
          updatedConditions = withoutNone.filter(c => c !== condition);
        } else {
          updatedConditions = [...withoutNone, condition];
        }
      }
      return { ...prev, conditions: updatedConditions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field validation
    if (!formData.fullName || !formData.age || !formData.lifestyle || formData.conditions.length === 0 || !formData.incomeBand || !formData.cityTier) {
      setError('Please fill out all fields so we can give you the best recommendations.');
      return;
    }

    setLoading(true);

    const payload = {
      name: formData.fullName,
      age: parseInt(formData.age),
      lifestyle: formData.lifestyle,
      pre_existing_conditions: formData.conditions.join(', '),
      income_band: formData.incomeBand,
      city_tier: formData.cityTier
    };

    try {
      // API call placeholder for actual backend
      const response = await axios.post('/api/recommend', payload).catch(() => {
        // Fallback for development if backend isn't ready or returns 404
        return new Promise(resolve => setTimeout(() => resolve({
          data: {
            session_id: "SESS_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
            recommendation_text: `[PEER COMPARISON TABLE]
Policy Name | Insurer | Premium (₹/yr) | Cover Amount | Waiting Period | Key Benefit | Suitability Score
Aarogya Supreme | SBI General | ₹10,200 | 10L | 2 Years | Wide Network | 9.2/10
Optima Restore | HDFC ERGO | ₹8,400 | 5L | 3 Years | Multiplier Benefit | 8.5/10
Care Supreme | Care Health | ₹9,100 | 7L | 4 Years | No Claim Bonus | 7.8/10

[COVERAGE DETAIL]
+ Room Rent up to 1% of Sum Insured
+ ICU charges up to actuals
+ Pre & Post hospitalization (60/120 days)
- Cosmetic or plastic surgery
- Self-inflicted injury or suicide attempt
- Non-medical expenses (consumables)
Sub-limit: Maternity capped at ₹50,000 after 3 years
Claim Type: Cashless across 12,000+ Hospitals
Co-pay %: 0% for those under age 60

[WHY THIS POLICY]
We recommend the Aarogya Supreme policy for ${formData.fullName} because at age ${formData.age} and lifestyle ${formData.lifestyle}, you require a balance of high coverage and low waiting periods. Given your income band of ${formData.incomeBand} and residence in a ${formData.cityTier} area, this policy offers the best network hospital density. Your ${formData.conditions.join(', ')} conditions are covered after a relatively short waiting period compared to competitors.`,
            recommended_policy_name: "Aarogya Supreme"
          }
        }), 2000));
      });

      navigate('/recommendation', { 
        state: { 
          session_id: response.data.session_id,
          recommendation_text: response.data.recommendation_text,
          recommended_policy_name: response.data.recommended_policy_name,
          profile: formData 
        } 
      });
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-teal-50 text-teal-600 rounded-full mb-2 shadow-sm">
          <Heart size={24} className="fill-teal-100" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
          Find the right health insurance for you
        </h1>
        <p className="text-lg text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">
          Tell us a little bit about yourself, and we'll craft a personalized recommendation that fits your needs and budget.
        </p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-10 border border-gray-100 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-teal-400 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-32 h-32 bg-blue-400 opacity-10 rounded-full blur-3xl"></div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Field 1: Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-bold text-gray-700">Your name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Jane Doe"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 font-medium"
              />
            </div>

            {/* Field 2: Age */}
            <div className="space-y-2">
              <label htmlFor="age" className="block text-sm font-bold text-gray-700">Your age</label>
              <input
                type="number"
                id="age"
                name="age"
                min="1"
                max="99"
                placeholder="e.g. 32"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 font-medium"
              />
            </div>

            {/* Field 3: Lifestyle */}
            <div className="space-y-2">
              <label htmlFor="lifestyle" className="block text-sm font-bold text-gray-700">Lifestyle</label>
              <div className="relative">
                <select
                  id="lifestyle"
                  name="lifestyle"
                  value={formData.lifestyle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-medium appearance-none"
                >
                  <option value="" disabled>Select your lifestyle</option>
                  <option value="Sedentary">Sedentary</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Active">Active</option>
                  <option value="Athlete">Athlete</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Field 6: City / Tier (Moved for layout balance) */}
            <div className="space-y-2">
              <label htmlFor="cityTier" className="block text-sm font-bold text-gray-700">City / Tier</label>
              <div className="relative">
                <select
                  id="cityTier"
                  name="cityTier"
                  value={formData.cityTier}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-medium appearance-none"
                >
                  <option value="" disabled>Select location type</option>
                  <option value="Metro">Metro</option>
                  <option value="Tier-2">Tier-2</option>
                  <option value="Tier-3">Tier-3</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            
            {/* Field 5: Annual Income Band */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="incomeBand" className="block text-sm font-bold text-gray-700">Annual Income Band</label>
              <div className="relative">
                <select
                  id="incomeBand"
                  name="incomeBand"
                  value={formData.incomeBand}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-medium appearance-none"
                >
                  <option value="" disabled>Select your income bracket</option>
                  <option value="Under ₹3L">Under ₹3L</option>
                  <option value="₹3L–8L">₹3L–8L</option>
                  <option value="₹8L–15L">₹8L–15L</option>
                  <option value="₹15L+">₹15L+</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Field 4: Pre-existing Conditions */}
          <div className="space-y-3 bg-teal-50/30 p-5 rounded-2xl border border-teal-100/50">
            <label className="block text-sm font-bold text-gray-800">Pre-existing Conditions</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PRE_EXISTING_CONDITIONS.map((condition) => {
                const isSelected = formData.conditions.includes(condition);
                return (
                  <label 
                    key={condition} 
                    className={`flex items-center p-3 rounded-xl cursor-pointer border transition-all ${
                      isSelected 
                        ? 'bg-teal-50 border-teal-200 text-teal-800 shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="relative flex items-center justify-center w-5 h-5 mr-3 flex-shrink-0">
                      <input
                        type="checkbox"
                        className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 checked:bg-teal-500 checked:border-teal-500 transition-colors"
                        checked={isSelected}
                        onChange={() => handleCheckboxChange(condition)}
                        disabled={condition !== 'None' && formData.conditions.includes('None')}
                      />
                      <svg 
                        className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-semibold text-sm">{condition}</span>
                  </label>
                );
              })}
            </div>
            <p className="text-sm text-teal-700/80 font-medium py-1 px-1 flex items-center">
              <ShieldCheck size={16} className="mr-1.5 opacity-70" />
              This helps us find policies that cover your specific needs — your information stays private.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-6 rounded-xl text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 font-bold text-lg transition-all shadow-lg shadow-teal-600/20 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-3" size={24} />
                  Finding the best policies for you...
                </>
              ) : (
                <>
                  <Sparkles size={20} className="mr-2" />
                  Show My Recommendations
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Ensure ShieldCheck is available within the file since we used it in the info text
import { ShieldCheck } from 'lucide-react';
