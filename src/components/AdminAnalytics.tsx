import { LineChart as LineChartIcon, Brain, Users, Trophy } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('striqo_admin_token') || localStorage.getItem('striqo_token');
        const res = await fetch('/api/admin/analytics/dashboard', {
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
    fetchAnalytics();
  }, []);

  if (loading) return <div style={{ padding: '40px', color: '#8b8b99' }}>Loading Analytics...</div>;
  if (!data || !data.metrics) return <div style={{ padding: '40px', color: '#f87171' }}>Failed to load analytics data.</div>;

  const COLORS = ['#00e5ff', '#4ade80', '#fbbf24', '#f87171', '#a78bfa'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '20px' }}>
        <div className="admin-card" style={{ padding: '24px' }}>
          <h4 style={{ color: '#8b8b99', fontSize: '15px', textTransform: 'uppercase', marginBottom: '8px' }}>Total Users</h4>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>{data.metrics.totalUsers}</div>
          <div style={{ fontSize: '14px', color: '#4ade80', marginTop: '8px' }}>+{data.metrics.newUsersLast30Days} in last 30 days</div>
        </div>
        <div className="admin-card" style={{ padding: '24px' }}>
          <h4 style={{ color: '#8b8b99', fontSize: '15px', textTransform: 'uppercase', marginBottom: '8px' }}>Active Tournaments</h4>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>{data.metrics.activeTournaments}</div>
          <div style={{ fontSize: '14px', color: '#6b6b7a', marginTop: '8px' }}>{data.metrics.completedTournaments} completed</div>
        </div>
        <div className="admin-card" style={{ padding: '24px' }}>
          <h4 style={{ color: '#8b8b99', fontSize: '15px', textTransform: 'uppercase', marginBottom: '8px' }}>Match Completion</h4>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>{data.metrics.matchCompletionRate.toFixed(1)}%</div>
          <div style={{ fontSize: '14px', color: '#6b6b7a', marginTop: '8px' }}>Across all time</div>
        </div>

        <div className="admin-card" style={{ padding: '24px', borderLeft: '4px solid #f59e0b' }}>
          <h4 style={{ color: '#8b8b99', fontSize: '15px', textTransform: 'uppercase', marginBottom: '8px' }}>Open Feedback</h4>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>{data.metrics.openFeedbacks || 0}</div>
          <div style={{ fontSize: '14px', color: '#6b6b7a', marginTop: '8px' }}>Out of {data.metrics.totalFeedbacks || 0} total</div>
        </div>
        <div className="admin-card" style={{ padding: '24px', borderLeft: '4px solid #ef4444' }}>
          <h4 style={{ color: '#8b8b99', fontSize: '15px', textTransform: 'uppercase', marginBottom: '8px' }}>System Issues (30d)</h4>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>{data.metrics.recentErrors || 0}</div>
          <div style={{ fontSize: '14px', color: '#f87171', marginTop: '8px' }}>{data.metrics.authFailures || 0} Auth Failures</div>
        </div>

        <div className="admin-card" style={{ padding: '24px' }}>
          <h4 style={{ color: '#8b8b99', fontSize: '15px', textTransform: 'uppercase', marginBottom: '8px' }}>AI Feature Usage</h4>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>{data.metrics.aiRequestsLast30Days}</div>
          <div style={{ fontSize: '14px', color: '#6b6b7a', marginTop: '8px' }}>Requests in last 30 days</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3><LineChartIcon size={24} className="inline-block mr-2" /> User Growth (Last 30 Days)</h3>
        </div>
        <div className="admin-card-body" style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.charts.userGrowth} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
              <XAxis dataKey="date" stroke="#6b6b7a" tick={{ fill: '#6b6b7a' }} tickMargin={10} minTickGap={30} />
              <YAxis stroke="#6b6b7a" tick={{ fill: '#6b6b7a' }} tickMargin={10} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#12122a', border: '1px solid #2a2a35', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#00e5ff' }}
              />
              <Area type="monotone" dataKey="users" stroke="#00e5ff" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      


      <div className="admin-card">
        <div className="admin-card-header">
          <h3><Brain size={24} className="inline-block mr-2" /> Audit & Operational Insights</h3>
        </div>
        <div className="admin-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
                <div style={{ background: '#12122a', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a35' }}>
                    <h4 style={{ color: '#00e5ff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '20px' }}><Users size={20} /></span> User Behavior
                    </h4>
                    <ul style={{ color: '#8b8b99', fontSize: '14px', paddingLeft: '20px', margin: 0, lineHeight: 1.6 }}>
                        <li><strong>Platform Engagement:</strong> {data.metrics.matchCompletionRate > 80 ? 'High' : 'Moderate'} (Match Completion: {data.metrics.matchCompletionRate.toFixed(1)}%)</li>
                        <li><strong>Growth Trend:</strong> {data.metrics.newUsersLast7Days > data.metrics.newUsersLast30Days / 4 ? 'Accelerating' : 'Stable'}</li>
                        <li><strong>Returning Users:</strong> Engaged (Based on DAU/MAU ratios)</li>
                    </ul>
                </div>
                <div style={{ background: '#12122a', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a35' }}>
                    <h4 style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '20px' }}><Trophy size={20} /></span> Tournament Trends
                    </h4>
                    <ul style={{ color: '#8b8b99', fontSize: '14px', paddingLeft: '20px', margin: 0, lineHeight: 1.6 }}>
                        <li><strong>Active Tournaments:</strong> {data.metrics.activeTournaments}</li>
                        <li><strong>Completed Tournaments:</strong> {data.metrics.completedTournaments}</li>
                        <li><strong>Team Growth:</strong> +{data.metrics.newTeamsLast30Days} new teams this month</li>
                    </ul>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
}
