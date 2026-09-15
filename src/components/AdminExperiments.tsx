import { useState, useEffect } from 'react';


export default function AdminExperiments() {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  

  const fetchExperiments = async () => {
    try {
      const res = await fetch('/api/experiments', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
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
      await fetch('/api/experiments', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
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
      await fetch(`/api/experiments/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
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
                    className={`text-xs font-medium px-2 py-1 rounded border border-zinc-700 bg-zinc-800 focus:outline-none ${
                      exp.status === 'RUNNING' ? 'text-green-400' : 'text-zinc-400'
                    }`}
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
