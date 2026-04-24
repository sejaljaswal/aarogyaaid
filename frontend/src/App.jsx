import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProfileForm from './pages/ProfileForm';
import RecommendationPage from './pages/RecommendationPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { ShieldCheck, HeartPulse } from 'lucide-react';

// A simple protected route wrapper for the dashboard
const ProtectedRoute = ({ children }) => {
  // In a real app, you'd check authentication status here
  const isAuthenticated = localStorage.getItem('isAdminLoggedIn') === 'true';
  return isAuthenticated ? children : <Navigate to="/admin" />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen relative font-sans overflow-x-hidden flex flex-col">
        {/* Background Layer */}
        <div className="bg-mesh" />
        
        {/* Header */}
        <header className="pt-8 pb-12 px-6 max-w-7xl mx-auto flex items-center justify-between w-full">
          <a href="/" className="flex items-center space-x-3 group cursor-pointer">
            <div className="p-2 bg-teal-600 rounded-2xl shadow-lg shadow-teal-200 group-hover:scale-110 transition-transform">
              <ShieldCheck className="text-white" size={28} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-gray-900 uppercase">
              Aarogya<span className="text-teal-600">Aid</span>
            </span>
          </a>
          
          <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-gray-500">
            <a href="#" className="hover:text-teal-600 transition-colors">How it works</a>
            <a href="#" className="hover:text-teal-600 transition-colors">Trusted Partners</a>
            <a href="/admin" className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-2xl shadow-sm transition-all active:scale-95">
              Admin Login
            </a>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="container mx-auto px-4 pb-24 flex-grow flex flex-col justify-center items-center">
          <Routes>
            <Route path="/" element={<ProfileForm />} />
            <Route path="/recommendation" element={<RecommendationPage />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>

        {/* Footer Branding */}
        <footer className="py-12 border-t border-gray-100 bg-white/30 backdrop-blur-md w-full">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-400 font-bold tracking-tighter uppercase text-sm">
              <HeartPulse size={18} className="text-teal-400" />
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
    </BrowserRouter>
  );
}

export default App;
