import React from 'react';
import useStore from './store/useStore';
import ProfileForm from './components/ProfileForm';
import RecommendationCards from './components/RecommendationCards';
import { ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';

function App() {
  const { step } = useStore();

  return (
    <div className="min-h-screen relative font-sans overflow-x-hidden">
      {/* Background Layer */}
      <div className="bg-mesh" />
      
      {/* Header */}
      <header className="pt-8 pb-12 px-6 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="p-2 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
            <ShieldCheck className="text-white" size={28} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-gray-900 uppercase">
            Aarogya<span className="text-blue-600">Aid</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-gray-500">
          <a href="#" className="hover:text-blue-600 transition-colors">How it works</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Trusted Partners</a>
          <button className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-2xl shadow-sm transition-all active:scale-95">
            Log In
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-24">
        {step < 4 ? (
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-2">
                <Sparkles size={14} className="mr-2" />
                AI-Powered Recommendations
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
                Find the Perfect <span className="text-blue-600">Health Cover</span> for Your Family
              </h1>
              <p className="text-xl text-gray-500 font-medium leading-relaxed">
                We analyze 40+ medical parameters to suggest policies that actually pay out when you need them. No jargon, just clarity.
              </p>
            </div>
            <ProfileForm />
          </div>
        ) : (
          <RecommendationCards />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="py-12 border-t border-gray-100 bg-white/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex items-center space-x-2 text-gray-400 font-bold tracking-tighter uppercase text-sm">
            <HeartPulse size={18} className="text-blue-400" />
            <span>Built for India • Powered by Intelligence</span>
          </div>
          <div className="flex space-x-8 text-sm font-bold text-gray-400">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Insurance Guide</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
