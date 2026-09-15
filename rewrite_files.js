import fs from 'fs';

const feedbackModal = `import { useState } from 'react';
import { X, MessageSquare, Bug, Lightbulb, Image as ImageIcon, Send } from 'lucide-react';
import { useApi } from '../lib/useApi';

interface FeedbackModalProps {
  onClose: () => void;
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [type, setType] = useState('GENERAL');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const api = useApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setSubmitting(true);
    try {
      await api.fetch('/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          content,
          category,
          metadata: JSON.stringify({
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString()
          })
        })
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Beta Feedback
          </h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
            <p className="text-zinc-400">Your feedback helps us improve STRIQO.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="flex gap-2 p-1 bg-zinc-950 rounded-lg">
              <button
                type="button"
                onClick={() => setType('BUG')}
                className={\`flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all \${type === 'BUG' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-zinc-400 hover:text-zinc-300'}\`}
              >
                <Bug className="w-4 h-4" /> Bug
              </button>
              <button
                type="button"
                onClick={() => setType('FEATURE_REQUEST')}
                className={\`flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all \${type === 'FEATURE_REQUEST' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'text-zinc-400 hover:text-zinc-300'}\`}
              >
                <Lightbulb className="w-4 h-4" /> Idea
              </button>
              <button
                type="button"
                onClick={() => setType('GENERAL')}
                className={\`flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all \${type === 'GENERAL' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:text-zinc-300'}\`}
              >
                <MessageSquare className="w-4 h-4" /> Other
              </button>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Category (Optional)</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">Select a category...</option>
                <option value="UI/UX">User Interface / Experience</option>
                <option value="MATCHMAKING">Matchmaking</option>
                <option value="TOURNAMENTS">Tournaments</option>
                <option value="TEAMS">Teams & Rosters</option>
                <option value="PERFORMANCE">Performance & Lag</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Details</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={type === 'BUG' ? "Describe the issue and how to reproduce it..." : type === 'FEATURE_REQUEST' ? "Describe your idea..." : "What's on your mind?"}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors min-h-[120px] resize-none"
                required
              />
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <button type="button" className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-2 text-sm tooltip" title="Screenshot support coming soon">
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Attach</span>
              </button>
              
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? 'Sending...' : (
                  <>
                    <Send className="w-4 h-4" /> Submit
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/FeedbackModal.tsx', feedbackModal);

const adminFeatureFlags = `import { useState, useEffect } from 'react';
import { useApi } from '../lib/useApi';

export default function AdminFeatureFlags() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const api = useApi();

  const fetchFlags = async () => {
    try {
      const data = await api.fetch('/featureFlags');
      setFlags(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const toggleFlag = async (id: string, current: boolean) => {
    try {
      await api.fetch(\`/featureFlags/\${id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !current })
      });
      fetchFlags();
    } catch (e) {
      console.error(e);
    }
  };

  const createFlag = async () => {
    const key = prompt('Enter feature key (e.g. NEW_DASHBOARD):');
    if (!key) return;
    const name = prompt('Enter feature name:');
    if (!name) return;
    
    try {
      await api.fetch('/featureFlags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, name, isEnabled: false, type: 'GLOBAL' })
      });
      fetchFlags();
    } catch (e) {
      alert('Error creating flag');
    }
  };

  if (loading) return <div className="p-8 text-center text-zinc-400">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Feature Flags</h2>
        <button onClick={createFlag} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-medium text-sm">
          + New Flag
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-950 border-b border-zinc-800">
            <tr>
              <th className="p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Key / Name</th>
              <th className="p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Type</th>
              <th className="p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {flags.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-zinc-500">No feature flags found.</td></tr>
            ) : flags.map(flag => (
              <tr key={flag.id} className="hover:bg-zinc-800/50">
                <td className="p-4">
                  <div className="font-mono text-sm text-indigo-400 mb-1">{flag.key}</div>
                  <div className="text-sm text-zinc-300">{flag.name}</div>
                  {flag.description && <div className="text-xs text-zinc-500 mt-1">{flag.description}</div>}
                </td>
                <td className="p-4 text-sm text-zinc-400">
                  <span className="bg-zinc-800 px-2 py-1 rounded text-xs">{flag.type}</span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => toggleFlag(flag.id, flag.isEnabled)}
                    className={\`px-3 py-1 rounded text-xs font-medium \${flag.isEnabled ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-400'}\`}
                  >
                    {flag.isEnabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/AdminFeatureFlags.tsx', adminFeatureFlags);

const adminFeedback = `import { useState, useEffect } from 'react';
import { useApi } from '../lib/useApi';
import { MessageSquare, Bug, Lightbulb } from 'lucide-react';

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const api = useApi();

  const fetchFeedbacks = async () => {
    try {
      const data = await api.fetch('/feedbacks/all');
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

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.fetch(\`/feedbacks/\${id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(s => (
            <button 
              key={s}
              onClick={() => setFilter(s)}
              className={\`px-3 py-1 rounded text-xs font-medium \${filter === s ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}\`}
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
                    <span className="text-xs text-zinc-600">{new Date(f.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-zinc-400">
                    From: {f.user ? f.user.username : 'Anonymous'}
                  </div>
                </div>
                <select 
                  value={f.status}
                  onChange={(e) => updateStatus(f.id, e.target.value)}
                  className={\`text-xs font-medium px-2 py-1 rounded border border-zinc-700 bg-zinc-800 focus:outline-none \${
                    f.status === 'OPEN' ? 'text-red-400' : 
                    f.status === 'IN_PROGRESS' ? 'text-yellow-400' : 
                    'text-green-400'
                  }\`}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
              <p className="text-white text-sm whitespace-pre-wrap">{f.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/AdminFeedback.tsx', adminFeedback);

const adminExperiments = `import { useState, useEffect } from 'react';
import { useApi } from '../lib/useApi';

export default function AdminExperiments() {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const api = useApi();

  const fetchExperiments = async () => {
    try {
      const data = await api.fetch('/experiments');
      setExperiments(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, []);

  const createExperiment = async () => {
    const key = prompt('Enter experiment key (e.g. NEW_MATCHMAKING_ALGO):');
    if (!key) return;
    const name = prompt('Enter experiment name:');
    if (!name) return;
    
    try {
      await api.fetch('/experiments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          key, 
          name, 
          status: 'DRAFT', 
          variants: JSON.stringify([{ key: 'control', weight: 50 }, { key: 'treatment', weight: 50 }]) 
        })
      });
      fetchExperiments();
    } catch (e) {
      alert('Error creating experiment');
    }
  };
  
  const updateStatus = async (id: string, status: string) => {
    try {
      await api.fetch(\`/experiments/\${id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchExperiments();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-zinc-400">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Experiments (A/B Testing)</h2>
        <button onClick={createExperiment} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-medium text-sm">
          + New Experiment
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-950 border-b border-zinc-800">
            <tr>
              <th className="p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Key / Name</th>
              <th className="p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Variants</th>
              <th className="p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {experiments.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-zinc-500">No experiments found.</td></tr>
            ) : experiments.map(exp => (
              <tr key={exp.id} className="hover:bg-zinc-800/50">
                <td className="p-4">
                  <div className="font-mono text-sm text-indigo-400 mb-1">{exp.key}</div>
                  <div className="text-sm text-zinc-300">{exp.name}</div>
                  <div className="text-xs text-zinc-500 mt-1">{exp.participants?.length || 0} participants</div>
                </td>
                <td className="p-4 text-sm text-zinc-400">
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(exp.variants).map((v: any) => (
                      <span key={v.key} className="bg-zinc-800 px-2 py-1 rounded text-xs">{v.key} ({v.weight}%)</span>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <select 
                    value={exp.status}
                    onChange={(e) => updateStatus(exp.id, e.target.value)}
                    className={\`text-xs font-medium px-2 py-1 rounded border border-zinc-700 bg-zinc-800 focus:outline-none \${
                      exp.status === 'RUNNING' ? 'text-green-400' : 'text-zinc-400'
                    }\`}
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="RUNNING">RUNNING</option>
                    <option value="STOPPED">STOPPED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/AdminExperiments.tsx', adminExperiments);

console.log('Rewritten correctly');
