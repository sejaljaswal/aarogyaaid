import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle, 
  Info, 
  XCircle, 
  RotateCcw,
  Star
} from 'lucide-react';
import axios from 'axios';
import ChatInterface from '../components/ChatInterface';
import RecommendationSkeleton from '../components/Skeletons';
import ErrorBoundary from '../components/ErrorBoundary';

function RecommendationContent() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    session_id: location.state?.session_id || null,
    recommendation_text: location.state?.recommendation_text || null,
    recommended_policy_name: location.state?.recommended_policy_name || null,
    profile: location.state?.profile || null
  });

  useEffect(() => {
    // If we have a profile but no recommendation text, fetch it
    if (data.profile && !data.recommendation_text && !loading) {
      fetchRecommendation();
    }
  }, [data.profile, data.recommendation_text]);

  const fetchRecommendation = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: data.profile.fullName,
        age: parseInt(data.profile.age),
        lifestyle: data.profile.lifestyle,
        pre_existing_conditions: data.profile.conditions.join(', '),
        income_band: data.profile.incomeBand,
        city_tier: data.profile.cityTier
      };

      const response = await axios.post('/api/recommend', payload);
      setData(prev => ({
        ...prev,
        session_id: response.data.session_id,
        recommendation_text: response.data.recommendation_text,
        recommended_policy_name: response.data.recommended_policy_name
      }));
    } catch (err) {
      setError("We couldn't generate a recommendation right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Utility to parse sections
  const sections = useMemo(() => {
    if (!data.recommendation_text) return {};
    
    const parts = data.recommendation_text.split(/\[(PEER COMPARISON TABLE|COVERAGE DETAIL|WHY THIS POLICY)\]/);
    const result = {};
    
    for (let i = 1; i < parts.length; i += 2) {
      result[parts[i]] = parts[i + 1]?.trim();
    }
    
    return result;
  }, [data.recommendation_text]);

  if (loading) return <RecommendationSkeleton />;

  if (!data.profile || (!data.recommendation_text && !loading)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-6">
        <div className="p-4 bg-teal-50 rounded-full">
          <RotateCcw className="text-teal-600" size={48} />
        </div>
        <h2 className="text-2xl font-black text-gray-900">No recommendation data found</h2>
        <p className="text-gray-500 max-w-sm">Please fill out your profile first so we can help you find the right insurance.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-600/20 active:scale-95"
        >
          Go Back to Profile Form
        </button>
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-6">
          <h2 className="text-2xl font-bold text-red-600">{error}</h2>
          <button onClick={fetchRecommendation} className="px-6 py-3 bg-teal-600 text-white rounded-xl">Retry</button>
        </div>
    );
  }

  // Parse Table Data
  const tableData = [];
  if (sections['PEER COMPARISON TABLE']) {
    const lines = sections['PEER COMPARISON TABLE'].split('\n').filter(line => line.trim() && !line.includes('---'));
    lines.forEach(line => {
        tableData.push(line.split('|').map(cell => cell.trim()).filter(Boolean));
    });
  }

  // Parse Coverage Detail
  const coverageData = { inclusions: [], exclusions: [], subLimits: "", claimType: "", coPay: "" };
  if (sections['COVERAGE DETAIL']) {
    const lines = sections['COVERAGE DETAIL'].split('\n').map(l => l.trim()).filter(Boolean);
    lines.forEach(line => {
      if (line.toLowerCase().includes('inclusion:') || line.startsWith('+')) {
        coverageData.inclusions.push(line.replace(/inclusion:|[-+]/gi, '').trim());
      } else if (line.toLowerCase().includes('exclusion:') || line.startsWith('-')) {
        coverageData.exclusions.push(line.replace(/exclusion:|[-+]/gi, '').trim());
      } else if (line.toLowerCase().includes('sub-limit')) {
        coverageData.subLimits = line.split(':')[1]?.trim() || line;
      } else if (line.toLowerCase().includes('claim type')) {
        coverageData.claimType = line.split(':')[1]?.trim() || line;
      } else if (line.toLowerCase().includes('co-pay')) {
        coverageData.coPay = line.split(':')[1]?.trim() || line;
      }
    });
  }

  const itemsToBold = [
    data.profile.fullName,
    data.profile.age,
    data.profile.lifestyle,
    data.profile.incomeBand,
    data.profile.cityTier,
    ...(data.profile.conditions || [])
  ].filter(item => item && String(item).length > 0)
   .map(item => String(item).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

   const renderWhyText = (text) => {
    if (!text) return null;
    if (itemsToBold.length === 0) return <p className="text-gray-700 leading-relaxed text-lg">{text}</p>;
    const regex = new RegExp(`(${itemsToBold.join('|')})`, 'gi');
    const parts = text.split(regex);
    return (
      <p className="text-gray-700 leading-relaxed text-lg">
        {parts.map((part, i) => {
          const isMatch = itemsToBold.some(item => new RegExp(`^${item}$`, 'i').test(part));
          return isMatch ? <strong key={i} className="text-teal-700 font-bold">{part}</strong> : part;
        })}
      </p>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-20 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-2">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-teal-600 font-bold text-sm hover:translate-x-[-4px] transition-transform mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Start Over
          </button>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            Hi {data.profile.fullName.split(' ')[0]}, <br/>
            <span className="text-teal-600">here's what we found for you</span>
          </h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl leading-relaxed">
            {data.profile.conditions?.length > 0 && !data.profile.conditions.includes('None') 
              ? `We've specially curated this policy to ensure your health conditions are covered with minimal waiting periods.`
              : `We've matched your profile with the most reliable policies in the market today.`}
          </p>
        </div>
        <div className="bg-teal-50 px-6 py-4 rounded-2xl border border-teal-100 hidden lg:block">
          <div className="text-xs font-black text-teal-600 uppercase tracking-widest mb-1">Session ID</div>
          <div className="text-sm font-mono font-bold text-teal-800">{data.session_id || 'LOCAL_MATCH'}</div>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Star size={20} fill="currentColor" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Peer Comparison Table</h2>
        </div>
        
        <div className="overflow-x-auto rounded-3xl border border-gray-100 shadow-2xl shadow-gray-200/50 bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {['Policy Name', 'Insurer', 'Premium (₹/yr)', 'Cover Amount', 'Waiting Period', 'Key Benefit', 'Suitability Score'].map((h, i) => (
                  <th key={i} className="px-6 py-5 text-sm font-black text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center">
                        {h}
                        {h === 'Waiting Period' && (
                            <div className="group relative ml-2">
                            <Info size={14} className="text-gray-300 cursor-help" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-3 bg-gray-900 text-white text-[10px] font-medium rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50 leading-relaxed">
                                The time you must wait before the insurance company covers specific pre-existing illnesses.
                            </div>
                            </div>
                        )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.slice(1).map((row, idx) => {
                const isRecommended = row[0]?.toLowerCase().includes(data.recommended_policy_name?.toLowerCase());
                return (
                  <tr key={idx} className={`border-b border-gray-50 transition-colors ${isRecommended ? 'bg-teal-50/50' : 'hover:bg-gray-50/50'}`}>
                    {row.map((cell, i) => (
                      <td key={i} className="px-6 py-5">
                        <span className={`text-sm ${i === 2 || i === 3 ? 'font-black text-gray-900' : 'font-medium text-gray-600'} ${isRecommended && i === 0 ? 'font-bold text-teal-700' : ''}`}>
                            {cell}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
            <ShieldCheck size={20} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Coverage Detail</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-50 space-y-6">
            <h3 className="text-xl font-black text-gray-900 flex items-center">
              <span className="w-2 h-8 bg-green-500 rounded-full mr-4"></span>
              What's Covered
            </h3>
            <ul className="space-y-4">
              {coverageData.inclusions.map((item, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle size={18} className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-600 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-50 space-y-6">
            <h3 className="text-xl font-black text-gray-900 flex items-center">
              <span className="w-2 h-8 bg-red-500 rounded-full mr-4"></span>
              What's Not Covered
            </h3>
            <ul className="space-y-4">
              {coverageData.exclusions.map((item, i) => (
                <li key={i} className="flex items-start">
                  <XCircle size={18} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-600 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Info size={20} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Why we chose this for you</h2>
        </div>
        <div className="bg-teal-50/50 p-8 md:p-10 rounded-[2.5rem] border border-teal-100 relative overflow-hidden">
          <div className="relative z-10 max-w-4xl">
            {renderWhyText(sections['WHY THIS POLICY'])}
          </div>
        </div>
      </section>

      <section className="pt-8">
        <ErrorBoundary>
            <ChatInterface session_id={data.session_id} profile={data.profile} />
        </ErrorBoundary>
      </section>

      <div className="flex justify-center pt-8">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 px-8 py-4 bg-white border border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95"
        >
          <RotateCcw size={18} />
          <span>Not what you wanted? Start Over</span>
        </button>
      </div>
    </div>
  );
}

export default function RecommendationPage() {
  return (
    <ErrorBoundary>
      <RecommendationContent />
    </ErrorBoundary>
  );
}
