import { useState } from 'react';
import { X, MessageSquare, Bug, Lightbulb, Image as ImageIcon, Send } from 'lucide-react';


interface FeedbackModalProps {
  onClose: () => void;
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [type, setType] = useState('GENERAL');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setSubmitting(true);
    try {
      await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('striqo_token')}`, 'Content-Type': 'application/json' },
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
                className={`flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all ${type === 'BUG' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-zinc-400 hover:text-zinc-300'}`}
              >
                <Bug className="w-4 h-4" /> Bug
              </button>
              <button
                type="button"
                onClick={() => setType('FEATURE_REQUEST')}
                className={`flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all ${type === 'FEATURE_REQUEST' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'text-zinc-400 hover:text-zinc-300'}`}
              >
                <Lightbulb className="w-4 h-4" /> Idea
              </button>
              <button
                type="button"
                onClick={() => setType('GENERAL')}
                className={`flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all ${type === 'GENERAL' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:text-zinc-300'}`}
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
