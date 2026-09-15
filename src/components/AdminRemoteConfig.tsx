import { useState, useEffect } from 'react';


export default function AdminRemoteConfig() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/remoteConfigs', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      setConfigs(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const createConfig = async () => {
    const key = prompt('Enter config key:');
    if (!key) return;
    const value = prompt('Enter config value (JSON):', '{}');
    if (!value) return;
    
    try {
      JSON.parse(value);
    } catch (e) {
      alert('Invalid JSON');
      return;
    }

    try {
      await fetch('/api/remoteConfigs', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      fetchConfigs();
    } catch (e) {
      alert('Error creating config');
    }
  };

  if (loading) return <div className="p-8 text-center text-zinc-400">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Remote Configuration</h2>
        <button onClick={createConfig} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-medium text-sm">
          + New Config
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-950 border-b border-zinc-800">
            <tr>
              <th className="p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Key</th>
              <th className="p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Version</th>
              <th className="p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {configs.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-zinc-500">No configs found.</td></tr>
            ) : configs.map(config => (
              <tr key={config.id} className="hover:bg-zinc-800/50">
                <td className="p-4 font-mono text-sm text-indigo-400">{config.key}</td>
                <td className="p-4 text-sm text-zinc-400">v{config.version}</td>
                <td className="p-4 text-sm font-mono text-zinc-500 overflow-hidden text-ellipsis max-w-md whitespace-nowrap">
                  {config.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
