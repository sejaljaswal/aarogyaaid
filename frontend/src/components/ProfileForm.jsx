import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Activity, Wallet, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import useStore from '../store/useStore';

const StepIndicator = ({ currentStep }) => {
  const steps = [
    { id: 1, icon: User, label: 'Profile' },
    { id: 2, icon: Activity, label: 'Health' },
    { id: 3, icon: Wallet, label: 'Finance' },
  ];

  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
              currentStep >= step.id
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white border-gray-200 text-gray-400'
            }`}
          >
            <step.icon size={20} />
          </div>
          {step.id !== 3 && (
            <div
              className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
                currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const ProfileForm = () => {
  const { userProfile, setProfile, setLifestyle, step, setStep, fetchRecommendations, isLoading } = useStore();

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const containerVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden relative">
      <StepIndicator currentStep={step} />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800">Tell us about yourself</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Your Age</label>
                <input
                  type="number"
                  value={userProfile.age}
                  onChange={(e) => setProfile({ age: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">City Tier</label>
                <select
                  value={userProfile.city_tier}
                  onChange={(e) => setProfile({ city_tier: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  <option value={1}>Tier 1 (Metro)</option>
                  <option value={2}>Tier 2 (State Capital)</option>
                  <option value={3}>Tier 3 (Others)</option>
                </select>
              </div>
            </div>
            <button
              onClick={nextStep}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-200"
            >
              <span>Continue</span>
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800">Health & Lifestyle</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">Do you smoke?</h3>
                  <p className="text-sm text-blue-700">This helps us calculate premium accurately.</p>
                </div>
                <input
                  type="checkbox"
                  checked={userProfile.lifestyle.smoker}
                  onChange={(e) => setLifestyle({ smoker: e.target.checked })}
                  className="w-6 h-6 rounded-lg border-blue-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-purple-900">Habitual alcohol consumption?</h3>
                  <p className="text-sm text-purple-700">For better underwriting results.</p>
                </div>
                <input
                  type="checkbox"
                  checked={userProfile.lifestyle.habitual_drinker}
                  onChange={(e) => setLifestyle({ habitual_drinker: e.target.checked })}
                  className="w-6 h-6 rounded-lg border-purple-300 text-purple-600 focus:ring-purple-500 transition-all cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Pre-existing conditions (e.g. Diabetes, BP)</label>
                <input
                  type="text"
                  placeholder="Seperate with commas"
                  onChange={(e) => setProfile({ pre_existing_conditions: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={prevStep}
                className="flex-1 py-4 border-2 border-gray-100 hover:bg-gray-50 text-gray-600 font-semibold rounded-2xl flex items-center justify-center space-x-2 transition-all"
              >
                <ChevronLeft size={20} />
                <span>Back</span>
              </button>
              <button
                onClick={nextStep}
                className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-200"
              >
                <span>Continue</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800">Final Details</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Annual Income (INR)</label>
                <input
                  type="range"
                  min="300000"
                  max="5000000"
                  step="100000"
                  value={userProfile.annual_income}
                  onChange={(e) => setProfile({ annual_income: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-sm font-bold text-blue-600">
                  <span>₹3L</span>
                  <span>₹{userProfile.annual_income.toLocaleString()}</span>
                  <span>₹50L+</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-900">Already insured?</h3>
                  <p className="text-sm text-green-700">Includes corporate/ESI covers.</p>
                </div>
                <input
                  type="checkbox"
                  checked={userProfile.has_existing_insurance}
                  onChange={(e) => setProfile({ has_existing_insurance: e.target.checked })}
                  className="w-6 h-6 rounded-lg border-green-300 text-green-600 focus:ring-green-500 transition-all cursor-pointer"
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={prevStep}
                className="flex-1 py-4 border-2 border-gray-100 hover:bg-gray-50 text-gray-600 font-semibold rounded-2xl flex items-center justify-center space-x-2 transition-all"
              >
                <ChevronLeft size={20} />
                <span>Back</span>
              </button>
              <button
                onClick={fetchRecommendations}
                disabled={isLoading}
                className="flex-[2] py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-blue-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Get Instant Recommendation</span>
                    <CheckCircle2 size={22} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileForm;
