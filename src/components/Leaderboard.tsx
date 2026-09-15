import { SEO } from './SEO';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useApi } from '../lib/useApi';
import { TableSkeleton } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';
import { Trophy } from 'lucide-react';
import { socket } from '../lib/api';
import { useEffect } from 'react';

export default function Leaderboard() {
  const [type, setType] = useState<'PLAYER' | 'TEAM'>('PLAYER');
  const { data, loading, error, refetch } = useApi<any>(`/leaderboards/global?entityType=${type}`);

  const demoData = [
    { rank: 1, name: "STR_Alex", wins: 24, draws: 3, losses: 2, points: 75, avatar: "" },
    { rank: 2, name: "FC_Pro_Gamer", wins: 20, draws: 5, losses: 4, points: 65, avatar: "" },
    { rank: 3, name: "NeoGoal", wins: 18, draws: 6, losses: 3, points: 60, avatar: "" },
    { rank: 4, name: "KingStriker", wins: 15, draws: 4, losses: 5, points: 49, avatar: "" },
    { rank: 5, name: "Viper11", wins: 14, draws: 3, losses: 6, points: 45, avatar: "" },
  ];

  const entries = data?.entries || [];

  useEffect(() => {
    socket.emit('join:room', { room: 'leaderboard:global' });

    const handleLeaderboardUpdate = () => {
      // Refresh the data when a live update happens
      refetch();
    };

    socket.on('leaderboard:update', handleLeaderboardUpdate);
    
    return () => {
      socket.off('leaderboard:update', handleLeaderboardUpdate);
      socket.emit('leave:room', { room: 'leaderboard:global' });
    };
  }, [type, refetch]);


  return (
    <div style={{ paddingTop: '72px' }}>
      <SEO 
        title="Global Leaderboard | STRIQO" 
        description="Check out the top-ranked players and teams on STRIQO. Climb the ladder and prove your skills."
        url="https://striqo.com/leaderboard"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Global Leaderboard",
          "url": "https://striqo.com/leaderboard"
        }}
      />
      
      
      <section className="bg-[#08081a] px-4 md:px-10 py-10 md:py-24 min-h-[calc(100vh-72px)]">
        <div className="container-max">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 style={{ fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 900, textTransform: 'uppercase', color: '#ffffff', marginBottom: '4px', lineHeight: 1.0, fontFamily: '"Inter", sans-serif' }}>
                GLOBAL RANKINGS
              </h1>
              <div style={{ fontSize: '15px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#E2E8F0', fontFamily: '"Inter", sans-serif' }}>
                FRIEND MATCH STANDINGS
              </div>
            </div>
            
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #00e5ff', color: '#00e5ff', fontSize: '14px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 12px' }} className="live-badge">
              <div style={{ width: '5px', height: '5px', background: '#00e5ff', borderRadius: '50%', animation: 'pulse 1.2s infinite' }} />
              LIVE UPDATE
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
             <button onClick={() => setType('PLAYER')} style={{ background: type === 'PLAYER' ? '#00e5ff' : 'rgba(255,255,255,0.05)', color: type === 'PLAYER' ? '#000' : '#fff', padding: '10px 24px', fontWeight: 'bold' }} className="premium-card">PLAYERS</button>
             <button onClick={() => setType('TEAM')} style={{ background: type === 'TEAM' ? '#00e5ff' : 'rgba(255,255,255,0.05)', color: type === 'TEAM' ? '#000' : '#fff', padding: '10px 24px', fontWeight: 'bold' }} className="premium-card">TEAMS</button>
          </div>

          <div style={{ background: "#0a0a1f", border: "1px solid rgba(255,255,255,0.1)", position: "relative", overflowX: "auto" }}>
            <div style={{ minWidth: "800px", display: "grid", gridTemplateColumns: "80px 1fr 100px 100px 100px 120px", padding: '24px 32px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)', fontFamily: '"Inter", sans-serif', fontSize: '14px', fontWeight: 700, letterSpacing: '0.15em', color: '#E2E8F0' }}>
              <div>RANK</div>
              <div>{type}</div>
              <div style={{ textAlign: 'center' }}>W</div>
              <div style={{ textAlign: 'center' }}>D</div>
              <div style={{ textAlign: 'center' }}>L</div>
              <div style={{ textAlign: 'right', color: '#00e5ff' }}>PTS</div>
            </div>
            
            {loading ? (
              <div className="p-8"><TableSkeleton rows={8} /></div>
            ) : error ? (
              <ErrorState onRetry={refetch} />
            ) : entries.length === 0 ? (
              <EmptyState icon={Trophy} title="No Rankings Yet" description="No one has played enough matches to be ranked. Be the first to climb the leaderboard!" />
            ) : (
              <div>
                {entries.map((player: any, index: number) => (
                  <div key={index} className="premium-card" style={{ minWidth: "800px", display: "grid", gridTemplateColumns: "80px 1fr 100px 100px 100px 120px", padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', alignItems: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 900, fontFamily: '"Orbitron", sans-serif', color: index < 3 ? '#00e5ff' : 'rgba(255,255,255,0.2)' }}>
                      #{index + 1}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', fontFamily: '"Inter", sans-serif' }}>
                        {player.user?.username || player.team?.name || 'Unknown'}
                      </span>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '16px', color: '#E2E8F0' }}>{player.wins || 0}</div>
                    <div style={{ textAlign: 'center', fontSize: '16px', color: '#E2E8F0' }}>{player.draws || 0}</div>
                    <div style={{ textAlign: 'center', fontSize: '16px', color: '#E2E8F0' }}>{player.losses || 0}</div>
                    <div style={{ textAlign: 'right', fontSize: '24px', fontWeight: 800, color: '#00e5ff' }}>
                      {player.score || 0}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
