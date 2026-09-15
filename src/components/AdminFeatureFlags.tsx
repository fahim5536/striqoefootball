import { useState, useEffect } from 'react';


export default function AdminFeatureFlags() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  

  const fetchFlags = async () => {
    try {
      const res = await fetch('/api/featureFlags', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
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

  const updateType = async (id: string, type: string) => {
    try {
      await fetch(`/api/featureFlags/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      fetchFlags();
    } catch (e) {}
  };

  const toggleFlag = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/featureFlags/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
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
      await fetch('/api/featureFlags', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
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
                  <select 
                    value={flag.type} 
                    onChange={e => updateType(flag.id, e.target.value)}
                    className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded border border-zinc-700 focus:outline-none"
                  >
                    <option value="GLOBAL">GLOBAL</option>
                    <option value="BETA_ONLY">BETA ONLY</option>
                    <option value="ADMIN_ONLY">ADMIN ONLY</option>
                  </select>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => toggleFlag(flag.id, flag.isEnabled)}
                    className={`px-3 py-1 rounded text-xs font-medium ${flag.isEnabled ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}
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
