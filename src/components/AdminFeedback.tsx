import { useState, useEffect } from 'react';

import { MessageSquare, Bug, Lightbulb } from 'lucide-react';

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('/api/feedbacks/all', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      setFeedbacks(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const updateFeedback = async (id: string, data: any) => {
    try {
      await fetch(`/api/feedbacks/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      fetchFeedbacks();
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/feedbacks/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchFeedbacks();
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    if (type === 'BUG') return <Bug className="w-4 h-4 text-red-400" />;
    if (type === 'FEATURE_REQUEST') return <Lightbulb className="w-4 h-4 text-yellow-400" />;
    return <MessageSquare className="w-4 h-4 text-indigo-400" />;
  };

  const filteredFeedbacks = filter === 'ALL' ? feedbacks : feedbacks.filter(f => f.status === filter);

  if (loading) return <div className="p-8 text-center text-zinc-400">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Beta Feedback</h2>
        <div className="flex gap-2">
          {['ALL', 'OPEN', 'REVIEWING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map(s => (
            <button 
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded text-xs font-medium ${filter === s ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredFeedbacks.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 bg-zinc-900 rounded-xl border border-zinc-800">
            No feedback found.
          </div>
        ) : filteredFeedbacks.map(f => (
          <div key={f.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex gap-4">
            <div className="pt-1">{getIcon(f.type)}</div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-zinc-400">{f.type}</span>
                    {f.category && <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">{f.category}</span>}
                    {f.priority && <span className={`text-xs px-2 py-0.5 rounded font-bold ${f.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-300'}`}>{f.priority}</span>}
                    {f.severity && <span className={`text-xs px-2 py-0.5 rounded ${f.severity === 'CRITICAL' ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-800 text-zinc-300'}`}>{f.severity}</span>}
                    <span className="text-xs text-zinc-600">{new Date(f.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-zinc-400">
                    From: {f.user ? f.user.username : 'Anonymous'}
                  </div>
                </div>
                <select 
                  value={f.status}
                  onChange={(e) => updateFeedback(f.id, { status: e.target.value })}
                  className={`text-xs font-medium px-2 py-1 rounded border border-zinc-700 bg-zinc-800 focus:outline-none ${
                    f.status === 'OPEN' ? 'text-red-400' : 
                    f.status === 'IN_PROGRESS' ? 'text-yellow-400' : 
                    'text-green-400'
                  }`}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="REVIEWING">REVIEWING</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
              <p className="text-white text-sm whitespace-pre-wrap">{f.content}</p>
              
              <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Priority</label>
                  <select 
                    value={f.priority || 'MEDIUM'}
                    onChange={(e) => updateFeedback(f.id, { priority: e.target.value })}
                    className="w-full text-sm bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Severity</label>
                  <select 
                    value={f.severity || 'MINOR'}
                    onChange={(e) => updateFeedback(f.id, { severity: e.target.value })}
                    className="w-full text-sm bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="MINOR">Minor</option>
                    <option value="MAJOR">Major</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Duplicate Of (Feedback ID)</label>
                  <input 
                    type="text"
                    value={f.duplicateOf || ''}
                    onChange={(e) => updateFeedback(f.id, { duplicateOf: e.target.value })}
                    placeholder="ID of original feedback..."
                    className="w-full text-sm bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Admin Notes</label>
                  <textarea 
                    value={f.adminNotes || ''}
                    onChange={(e) => updateFeedback(f.id, { adminNotes: e.target.value })}
                    placeholder="Internal notes..."
                    className="w-full text-sm bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-indigo-500 h-16 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
