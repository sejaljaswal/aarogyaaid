import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle, 
  Info, 
  XCircle, 
  MessageSquare, 
  RotateCcw,
  Star
} from 'lucide-react';

export default function RecommendationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { session_id, recommendation_text, recommended_policy_name, profile } = location.state || {};

  // Utility to parse sections
  const sections = useMemo(() => {
    if (!recommendation_text) return {};
    
    const parts = recommendation_text.split(/\[(PEER COMPARISON TABLE|COVERAGE DETAIL|WHY THIS POLICY)\]/);
    const result = {};
    
    for (let i = 1; i < parts.length; i += 2) {
      result[parts[i]] = parts[i + 1]?.trim();
    }
    
    return result;
  }, [recommendation_text]);

  if (!recommendation_text || !profile) {
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

  // Parse Table Data
  const tableData = useMemo(() => {
    const raw = sections['PEER COMPARISON TABLE'] || '';
    const lines = raw.split('\n').filter(line => line.trim() && !line.includes('---'));
    
    // Simple parser for | Policy Name | ... format
    return lines.map(line => {
      return line.split('|').map(cell => cell.trim()).filter(Boolean);
    });
  }, [sections]);

  // Parse Coverage Detail
  const coverageData = useMemo(() => {
    const raw = sections['COVERAGE DETAIL'] || '';
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    
    const inclusions = [];
    const exclusions = [];
    let subLimits = "";
    let claimType = "";
    let coPay = "";

    lines.forEach(line => {
      if (line.toLowerCase().includes('inclusion:') || line.startsWith('+')) {
        inclusions.push(line.replace(/inclusion:|[-+]/gi, '').trim());
      } else if (line.toLowerCase().includes('exclusion:') || line.startsWith('-')) {
        exclusions.push(line.replace(/exclusion:|[-+]/gi, '').trim());
      } else if (line.toLowerCase().includes('sub-limit')) {
        subLimits = line.split(':')[1]?.trim() || line;
      } else if (line.toLowerCase().includes('claim type')) {
        claimType = line.split(':')[1]?.trim() || line;
      } else if (line.toLowerCase().includes('co-pay')) {
        coPay = line.split(':')[1]?.trim() || line;
      }
    });

    return { inclusions, exclusions, subLimits, claimType, coPay };
  }, [sections]);

  // Handle bold profiles in "Why This Policy"
  const renderWhyText = (text) => {
    if (!text) return null;
    
    // Filter and escape profile attributes for regex
    const itemsToBold = [
      profile.fullName,
      profile.age,
      profile.lifestyle,
      profile.incomeBand,
      profile.cityTier,
      ...(profile.conditions || [])
    ].filter(item => item && String(item).length > 0)
     .map(item => String(item).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    if (itemsToBold.length === 0) return <p className="text-gray-700 leading-relaxed text-lg">{text}</p>;

    // Create a single regex for all keywords
    const regex = new RegExp(`(${itemsToBold.join('|')})`, 'gi');
    const parts = text.split(regex);

    return (
      <p className="text-gray-700 leading-relaxed text-lg">
        {parts.map((part, i) => {
          // Check if this part matches any of our keywords
          const isMatch = itemsToBold.some(item => 
            new RegExp(`^${item}$`, 'i').test(part)
          );
          return isMatch ? <strong key={i} className="text-teal-700 font-bold">{part}</strong> : part;
        })}
      </p>
    );
  };

  const getGreetingEmoji = () => {
    if (profile.conditions?.includes('Cardiac') || profile.conditions?.includes('Diabetes')) return '🧡';
    return '👋';
  };

  const getEmpatheticSubtitle = () => {
    if (profile.conditions?.length > 0 && !profile.conditions.includes('None')) {
      return `We've specially curated this policy to ensure your health conditions are covered with minimal waiting periods.`;
    }
    return `We've matched your profile with the most reliable policies in the market today.`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-20 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Header section */}
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
            Hi {profile.fullName.split(' ')[0]} {getGreetingEmoji()}, <br/>
            <span className="text-teal-600">here's what we found for you</span>
          </h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl leading-relaxed">
            {getEmpatheticSubtitle()}
          </p>
        </div>
        <div className="bg-teal-50 px-6 py-4 rounded-2xl border border-teal-100 hidden lg:block">
          <div className="text-xs font-black text-teal-600 uppercase tracking-widest mb-1">Session ID</div>
          <div className="text-sm font-mono font-bold text-teal-800">{session_id || 'LOCAL_MATCH'}</div>
        </div>
      </div>

      {/* SECTION 1 — Peer Comparison Table */}
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
                {tableData[0]?.map((header, i) => (
                  <th key={i} className="px-6 py-5 text-sm font-black text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center">
                      {header}
                      {header.includes('Waiting Period') && (
                        <div className="group relative ml-2">
                          <Info size={14} className="text-gray-300 cursor-help" />
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-3 bg-gray-900 text-white text-[10px] font-medium rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50 leading-relaxed">
                            The time you must wait before the insurance company covers specific pre-existing illnesses.
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                )) || (
                  ['Policy Name', 'Insurer', 'Premium (₹/yr)', 'Cover Amount', 'Waiting Period', 'Key Benefit', 'Suitability Score'].map((h, i) => (
                    <th key={i} className="px-6 py-5 text-sm font-black text-gray-400 uppercase tracking-wider">{h}</th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {tableData.slice(1).map((row, idx) => {
                const isRecommended = row[0]?.toLowerCase().includes(recommended_policy_name?.toLowerCase());
                return (
                  <tr 
                    key={idx} 
                    className={`border-b border-gray-50 transition-colors ${isRecommended ? 'bg-teal-50/50' : 'hover:bg-gray-50/50'}`}
                  >
                    {row.map((cell, i) => (
                      <td key={i} className="px-6 py-5">
                        {i === 0 && isRecommended ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{cell}</span>
                            <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest mt-1 bg-teal-100 px-2 py-0.5 rounded-full w-fit">Our Pick</span>
                          </div>
                        ) : (
                          <span className={`text-sm ${i === 2 || i === 3 ? 'font-black text-gray-900' : 'font-medium text-gray-600'}`}>
                            {cell}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 2 — Coverage Detail */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
            <ShieldCheck size={20} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Coverage Detail</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Card: Inclusions */}
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
            <div className="pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Sub-limits</div>
                <div className="text-sm font-bold text-gray-900">{coverageData.subLimits || 'No limits'}</div>
              </div>
              <div>
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Claim Type</div>
                <div className="text-sm font-bold text-gray-900">{coverageData.claimType || 'Cashless'}</div>
              </div>
            </div>
          </div>

          {/* Right Card: Exclusions */}
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
            <div className="pt-6 border-t border-gray-50">
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Co-pay %</div>
              <div className="text-sm font-bold text-gray-900">
                {coverageData.coPay || '0% (We recommend no co-pay policies)'}
                <p className="text-[10px] text-gray-400 font-medium mt-1">Co-pay is the % of the claim amount you have to pay yourself.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Why This Policy */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Info size={20} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Why we chose this for you</h2>
        </div>
        <div className="bg-teal-50/50 p-8 md:p-10 rounded-[2.5rem] border border-teal-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldCheck size={120} className="text-teal-600" />
          </div>
          <div className="relative z-10 max-w-4xl">
            {renderWhyText(sections['WHY THIS POLICY'])}
          </div>
        </div>
      </section>

      {/* Chat Interface Panel Placeholder */}
      <section className="pt-8">
        <div className="bg-gray-900 rounded-[2rem] p-8 text-center space-y-6 border border-gray-800 shadow-2xl">
          <div className="inline-flex items-center justify-center p-4 bg-gray-800 rounded-2xl mb-2">
            <MessageSquare size={32} className="text-teal-400" />
          </div>
          <h2 className="text-3xl font-black text-white px-2">Still have questions?</h2>
          <p className="text-gray-400 font-medium max-w-lg mx-auto">
            Our AI health assistant has analyzed thousands of policy documents. Ask specifically about coverage for your condition or claim process.
          </p>
          <div className="max-w-xl mx-auto flex gap-3">
             <div className="flex-grow bg-gray-800 border border-gray-700 rounded-xl px-6 py-4 text-gray-500 text-left font-medium">
               Ask me anything about this policy...
             </div>
             <button className="bg-teal-600 p-4 rounded-xl text-white opacity-50 cursor-not-allowed">
               <ArrowLeft className="rotate-180" size={24} />
             </button>
          </div>
          <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Chat feature coming in Phase 7</div>
        </div>
      </section>

      {/* Action footer */}
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
