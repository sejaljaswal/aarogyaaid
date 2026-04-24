import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileUp, 
  Trash2, 
  Edit3, 
  LogOut, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  FileText,
  Calendar,
  Building,
  Save,
  X
} from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadState, setUploadState] = useState({ 
    file: null, 
    policyName: '', 
    insurerName: '', 
    status: 'idle', // idle, uploading, success, error
    message: '' 
  });
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ policy_name: '', insurer: '' });

  const token = localStorage.getItem('adminToken');

  const ax = axios.create({
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await ax.get('/api/admin/documents');
      setDocuments(response.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const handleFileChange = (e) => {
    setUploadState(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadState.file) return;

    setUploadState(prev => ({ ...prev, status: 'uploading' }));
    
    const formData = new FormData();
    formData.append('file', uploadState.file);
    // Note: Backend currently doesn't support policy_name/insurer as form fields, 
    // we should ideally update the backend, but for now we follow the frontend requirement.
    formData.append('policy_name', uploadState.policyName);
    formData.append('insurer', uploadState.insurerName);

    try {
      await ax.post('/api/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadState({ file: null, policyName: '', insurerName: '', status: 'success', message: 'Document uploaded and indexed successfully!' });
      fetchDocuments();
    } catch (err) {
      setUploadState(prev => ({ ...prev, status: 'error', message: err.response?.data?.detail || 'Upload failed' }));
    }
  };

  const handleDelete = async (doc) => {
    if (window.confirm(`Are you sure you want to delete ${doc.policy_name}? This will immediately remove it from the AI's knowledge base.`)) {
      try {
        await ax.delete(`/api/admin/documents/${doc.id}`);
        fetchDocuments();
      } catch (err) {
        alert('Failed to delete document');
      }
    }
  };

  const startEditing = (doc) => {
    setEditingId(doc.id);
    setEditValues({ policy_name: doc.policy_name, insurer: doc.insurer });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id) => {
    try {
      await ax.patch(`/api/admin/documents/${id}`, null, {
        params: { 
          policy_name: editValues.policy_name, 
          insurer: editValues.insurer 
        }
      });
      setEditingId(null);
      fetchDocuments();
    } catch (err) {
      alert('Update failed');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-900 text-white p-8 rounded-[2rem] shadow-2xl shadow-gray-200">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-teal-500 rounded-2xl">
            <Database size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Admin Dashboard</h1>
            <p className="text-teal-400 text-[10px] font-black uppercase tracking-widest">Managing Intelligence Layer</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-2 px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black text-sm rounded-xl transition-all border border-red-500/20"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* SECTION A — Upload New Policy */}
        <div className="lg:col-span-1 border-r border-gray-100 pr-0 lg:pr-8 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Upload Policy</h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">Add new insurance documents into the AI's vector knowledge base.</p>
          </div>

          <form onSubmit={handleUpload} className="space-y-4 bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
             <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">File (PDF, JSON, TXT)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept=".pdf,.json,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center space-y-3 group-hover:border-teal-500 group-hover:bg-teal-50/10 transition-all">
                    <FileUp size={40} className="text-gray-300 group-hover:text-teal-500" />
                    <span className="text-sm font-bold text-gray-400 group-hover:text-teal-600">
                      {uploadState.file ? uploadState.file.name : 'Choose or drop file'}
                    </span>
                  </div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Policy Name</label>
                <input 
                  type="text" 
                  value={uploadState.policyName}
                  onChange={(e) => setUploadState({ ...uploadState, policyName: e.target.value })}
                  placeholder="e.g. Aarogya Supreme"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold text-sm"
                />
             </div>

             <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Insurer Name</label>
                <input 
                  type="text" 
                  value={uploadState.insurerName}
                  onChange={(e) => setUploadState({ ...uploadState, insurerName: e.target.value })}
                  placeholder="e.g. SBI General"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold text-sm"
                />
             </div>

             <button 
               type="submit" 
               disabled={!uploadState.file || uploadState.status === 'uploading'}
               className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black shadow-lg shadow-teal-100 transition-all disabled:opacity-30 disabled:shadow-none flex items-center justify-center space-x-2"
             >
               {uploadState.status === 'uploading' ? (
                 <>
                   <Loader2 size={24} className="animate-spin" />
                   <span>Indexing...</span>
                 </>
               ) : (
                 <>
                   <CheckCircle2 size={20} />
                   <span>Start Upload</span>
                 </>
               )}
             </button>

             {uploadState.status === 'success' && (
               <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-start space-x-3 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                 <CheckCircle2 size={16} className="mt-0.5" />
                 <span>{uploadState.message}</span>
               </div>
             )}

             {uploadState.status === 'error' && (
               <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start space-x-3 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                 <AlertCircle size={16} className="mt-0.5" />
                 <span>{uploadState.message}</span>
               </div>
             )}
          </form>
        </div>

        {/* SECTION B — Document List Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Active Documents</h2>
            <div className="text-xs font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{documents.length} Records</div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Policy Info</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Insurer</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Index Time</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <FileText size={20} />
                        </div>
                        <div className="flex flex-col">
                          {editingId === doc.id ? (
                            <input 
                               type="text" 
                               value={editValues.policy_name} 
                               onChange={(e) => setEditValues({ ...editValues, policy_name: e.target.value })}
                               className="px-2 py-1 border-b-2 border-teal-500 outline-none text-sm font-bold bg-white"
                            />
                          ) : (
                            <span className="text-sm font-black text-gray-900">{doc.policy_name}</span>
                          )}
                          <span className="text-[10px] font-bold text-gray-400 truncate max-w-[150px]">{doc.file_name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center text-gray-600">
                        <Building size={14} className="mr-2 opacity-30" />
                        {editingId === doc.id ? (
                            <input 
                               type="text" 
                               value={editValues.insurer} 
                               onChange={(e) => setEditValues({ ...editValues, insurer: e.target.value })}
                               className="px-2 py-1 border-b-2 border-teal-500 outline-none text-sm font-bold bg-white"
                            />
                          ) : (
                            <span className="text-sm font-bold">{doc.insurer}</span>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Calendar size={12} className="mr-2" />
                        {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-6 transition-all">
                      <div className="flex items-center justify-end space-x-2">
                        {editingId === doc.id ? (
                           <>
                             <button 
                               onClick={() => handleUpdate(doc.id)}
                               className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                             >
                               <Save size={18} />
                             </button>
                             <button 
                               onClick={cancelEditing}
                               className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-200 transition-all shadow-sm"
                             >
                               <X size={18} />
                             </button>
                           </>
                        ) : (
                          <>
                            <button 
                              onClick={() => startEditing(doc)}
                              className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-white hover:text-blue-600 hover:shadow-lg transition-all"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(doc)}
                              className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-white hover:text-red-500 hover:shadow-lg transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-bold text-sm italic">
                      No documents currently indexed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
