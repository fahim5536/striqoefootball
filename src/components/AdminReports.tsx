import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Filter, BarChart2, Gamepad2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function AdminReports() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('striqo_admin_token') || localStorage.getItem('striqo_token');
        const res = await fetch(`/api/admin/analytics/reports?period=${period}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [period]);

  const handleExport = () => {
    setGenerating(true);
    setTimeout(() => {

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Metric,Value\n";
        csvContent += `Total Matches,${data?.matchesTotal || 0}\n`;
        csvContent += `Completed Matches,${data?.matchesCompleted || 0}\n`;
        csvContent += `Total Tournaments,${data?.tournamentsTotal || 0}\n`;
        csvContent += `AI Usage (Tokens),${data?.aiUsageTotal || 0}\n`;
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `striqo_report_${period}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setGenerating(false);
    }, 1000);
  };

  const COLORS = ['#00e5ff', '#4ade80', '#fbbf24', '#f87171', '#a78bfa'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#12122a', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a35' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(0, 229, 255, 0.1)', borderRadius: '12px' }}>
                <FileText className="w-6 h-6" style={{ color: '#00e5ff' }} />
            </div>
            <div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', margin: 0 }}>Business Reports</h2>
                <div style={{ color: '#8b8b99', fontSize: '14px', marginTop: '4px' }}>Generate and export operational insights</div>
            </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
                <select 
                    value={period} 
                    onChange={(e) => setPeriod(e.target.value)}
                    style={{ 
                        appearance: 'none', 
                        background: '#0a0a14', 
                        border: '1px solid #2a2a35', 
                        color: '#fff', 
                        padding: '10px 40px 10px 16px', 
                        borderRadius: '8px',
                        outline: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                </select>
                <Calendar className="w-4 h-4" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8b8b99', pointerEvents: 'none' }} />
            </div>
            <button 
                onClick={handleExport}
                disabled={generating || loading || !data}
                className="btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', opacity: generating || loading ? 0.7 : 1 }}
            >
                <Download className="w-4 h-4" />
                {generating ? 'Exporting...' : 'Export CSV'}
            </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', color: '#8b8b99', textAlign: 'center' }}>Loading Report Data...</div>
      ) : data ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3><BarChart2 size={24} className="inline-block mr-2" /> Overview ({period})</h3>
                </div>
                <div className="admin-card-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#0a0a14', borderRadius: '8px', border: '1px solid #2a2a35' }}>
                            <span style={{ color: '#8b8b99' }}>Total Tournaments Created</span>
                            <span style={{ color: '#fff', fontWeight: 'bold' }}>{data.tournamentsTotal}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#0a0a14', borderRadius: '8px', border: '1px solid #2a2a35' }}>
                            <span style={{ color: '#8b8b99' }}>Total Matches Played</span>
                            <span style={{ color: '#fff', fontWeight: 'bold' }}>{data.matchesTotal}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#0a0a14', borderRadius: '8px', border: '1px solid #2a2a35' }}>
                            <span style={{ color: '#8b8b99' }}>Completed Matches</span>
                            <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{data.matchesCompleted}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#0a0a14', borderRadius: '8px', border: '1px solid #2a2a35' }}>
                            <span style={{ color: '#8b8b99' }}>AI Tokens Consumed</span>
                            <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>{data.aiUsageTotal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-card">
                <div className="admin-card-header">
                    <h3><Gamepad2 size={24} className="inline-block mr-2" /> Popular Games</h3>
                </div>
                <div className="admin-card-body" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {data.popularGames && data.popularGames.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.popularGames}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.popularGames.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#12122a', border: '1px solid #2a2a35', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ color: '#6b6b7a' }}>No game data for this period</div>
                    )}
                </div>
            </div>
        </div>
      ) : (
          <div style={{ padding: '40px', color: '#f87171', textAlign: 'center' }}>Failed to load report data.</div>
      )}
    </div>
  );
}
