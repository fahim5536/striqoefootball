import { Server, Activity, Cpu, FileText } from 'lucide-react';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

export default function AdminMetrics() {
  const [health, setHealth] = useState<any>(null);
  const [metrics, setMetrics] = useState<any[]>([]);

  const fetchApi = async (url: string, options?: RequestInit) => { 
    const token = localStorage.getItem('striqo_admin_token') || localStorage.getItem('striqo_token'); 
    const res = await fetch(url, { ...options, headers: { ...options?.headers, 'Authorization': `Bearer ${token}` } }); 
    if (!res.ok) throw new Error('API Error'); 
    return res.json(); 
  };

  useEffect(() => {
    fetchApi('/api/admin/health').then(setHealth).catch(console.error);
    fetchApi('/api/admin/metrics').then(res => setMetrics(res || [])).catch(console.error);
  }, []);

  // Process metrics for charting
  const apiLatencyData = metrics.filter(m => m.category === 'API_LATENCY').reverse().map(m => ({
    time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    latency: m.value,
    endpoint: m.name
  })).slice(-20);

  const memUsageData = metrics.filter(m => m.category === 'MEMORY_USAGE').reverse().map(m => ({
    time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    memory: m.value
  })).slice(-20);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="admin-card">
        <div className="admin-card-header">
          <h3><Server size={24} className="inline-block mr-2" /> System Health</h3>
        </div>
        <div className="admin-card-body">
          {health ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px' }}>
              <div style={{ background: '#12122a', padding: '16px', borderRadius: '8px', border: '1px solid rgba(0,229,255,0.1)' }}>
                <h4 style={{ color: '#8b8b99', fontSize: '14px', marginBottom: '8px' }}>SYSTEM STATUS</h4>
                <div style={{ color: health.status === 'Operational' ? '#4ade80' : '#f87171', fontSize: '20px', fontWeight: 'bold' }}>{health.status}</div>
                <div style={{ fontSize: '14px', color: '#6b6b7a', marginTop: '4px' }}>Uptime: {Math.floor(health.uptime / 60)} mins</div>
              </div>
              <div style={{ background: '#12122a', padding: '16px', borderRadius: '8px', border: '1px solid rgba(0,229,255,0.1)' }}>
                <h4 style={{ color: '#8b8b99', fontSize: '14px', marginBottom: '8px' }}>DATABASE</h4>
                <div style={{ color: health.services.database.status === 'Connected' ? '#4ade80' : '#f87171', fontSize: '20px', fontWeight: 'bold' }}>{health.services.database.status}</div>
                <div style={{ fontSize: '14px', color: '#6b6b7a', marginTop: '4px' }}>Latency: {health.services.database.latency}ms</div>
              </div>
              <div style={{ background: '#12122a', padding: '16px', borderRadius: '8px', border: '1px solid rgba(0,229,255,0.1)' }}>
                <h4 style={{ color: '#8b8b99', fontSize: '14px', marginBottom: '8px' }}>REDIS CACHE</h4>
                <div style={{ color: health.services.redis.status === 'Connected' ? '#4ade80' : '#f87171', fontSize: '20px', fontWeight: 'bold' }}>{health.services.redis.status}</div>
                <div style={{ fontSize: '14px', color: '#6b6b7a', marginTop: '4px' }}>Latency: {health.services.redis.latency}ms</div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#8b8b99' }}>Loading health data...</div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="admin-card">
            <div className="admin-card-header">
            <h3><Activity size={24} className="inline-block mr-2" /> API Latency (ms)</h3>
            </div>
            <div className="admin-card-body" style={{ height: '300px' }}>
                {apiLatencyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={apiLatencyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
                            <XAxis dataKey="time" stroke="#6b6b7a" tick={{ fill: '#6b6b7a', fontSize: 12 }} />
                            <YAxis stroke="#6b6b7a" tick={{ fill: '#6b6b7a', fontSize: 12 }} />
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: '#12122a', border: '1px solid #2a2a35', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fbbf24' }}
                            />
                            <Line type="monotone" dataKey="latency" stroke="#fbbf24" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ color: '#8b8b99', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>No latency data available</div>
                )}
            </div>
        </div>
        
        <div className="admin-card">
            <div className="admin-card-header">
            <h3><Cpu size={24} className="inline-block mr-2" /> Memory Usage (MB)</h3>
            </div>
            <div className="admin-card-body" style={{ height: '300px' }}>
                {memUsageData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={memUsageData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
                            <XAxis dataKey="time" stroke="#6b6b7a" tick={{ fill: '#6b6b7a', fontSize: 12 }} />
                            <YAxis stroke="#6b6b7a" tick={{ fill: '#6b6b7a', fontSize: 12 }} />
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: '#12122a', border: '1px solid #2a2a35', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#00e5ff' }}
                            />
                            <Bar dataKey="memory" fill="#00e5ff" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ color: '#8b8b99', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>No memory data available</div>
                )}
            </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3><FileText size={24} className="inline-block mr-2" /> Raw Metric Logs</h3>
        </div>
        <div className="admin-card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Category</th>
                <th>Metric Name</th>
                <th>Value</th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              {metrics.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#8b8b99' }}>No metrics available yet. Access the site to generate API metrics.</td>
                </tr>
              )}
              {metrics.map((m, i) => (
                <tr key={m.id || i}>
                  <td>{new Date(m.timestamp).toLocaleTimeString()}</td>
                  <td>{m.category}</td>
                  <td style={{ fontFamily: 'monospace' }}>{m.name}</td>
                  <td style={{ color: m.value > 1000 && m.category === 'API_LATENCY' ? '#f87171' : '#4ade80' }}>
                    {m.value.toFixed(2)} {m.unit}
                  </td>
                  <td style={{ fontSize: '11px', color: '#8b8b99' }}>{m.tags}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
