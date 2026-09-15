import { Gamepad2 } from 'lucide-react';
import { CoinIcon } from "./CoinIcon";
import { SEO } from './SEO';
import { getTournamentUrl } from '../lib/seo';
import React from "react";
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useApi } from '../lib/useApi';
import { socket } from '../lib/api';
import { useEffect } from 'react';
import { CardSkeleton } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';

export default function Tournament() {
  const navigate = useNavigate();
  // Fetch real tournaments from API
  const { data, loading, error, refetch } = useApi<{data: any[]}>('/v1/tournaments');
  
  const handleAuthNavigation = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (localStorage.getItem('striqo_user')) {
      navigate(path);
    } else {
      window.dispatchEvent(new Event('openLoginModal'));
    }
  };

  const tournaments = data?.data || [];

  useEffect(() => {
    socket.emit('join:room', { room: 'tournaments' });

    const handleTournamentUpdate = () => {
      refetch();
    };

    socket.on('tournaments:created', handleTournamentUpdate);
    socket.on('tournaments:updated', handleTournamentUpdate);
    socket.on('tournaments:deleted', handleTournamentUpdate);

    return () => {
      socket.off('tournaments:created', handleTournamentUpdate);
      socket.off('tournaments:updated', handleTournamentUpdate);
      socket.off('tournaments:deleted', handleTournamentUpdate);
      socket.emit('leave:room', { room: 'tournaments' });
    };
  }, [refetch]);

  return (
    <div style={{ paddingTop: '72px' }}>
      <SEO 
        title="Esports Tournaments | STRIQO" 
        description="Browse and join upcoming esports tournaments. Compete for prizes and glory."
        url="https://striqo.com/tournaments"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Esports Tournaments",
          "url": "https://striqo.com/tournaments"
        }}
      />
      
      
      <section className="bg-[#08081a] px-4 md:px-10 py-10 md:py-24 relative overflow-hidden min-h-[calc(100vh-72px)]">
        <div className="container-max">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 md:mb-16">
            <div>
              <h1 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, fontSize: 'clamp(40px, 7vw, 96px)', textTransform: 'uppercase', color: '#ffffff', lineHeight: 1.0, letterSpacing: '-0.02em' }}>
                TOURNAMENT ARENAS
              </h1>
              <div style={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.25em', color: '#E2E8F0', marginTop: '8px' }}>
                BECOME A LEGEND
              </div>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-3 mt-4 md:mt-0">
              <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '14px', fontWeight: 600, color: '#ffffff', letterSpacing: '0.1em' }}>
                01/12
              </div>
              <div style={{ display: 'flex', gap: 0 }}>
                <button aria-label="Previous page" style={{ width: '44px', height: '44px', background: 'transparent', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', borderRadius: 0, borderRight: 'none' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#00e5ff'; e.currentTarget.style.color = '#00e5ff'; e.currentTarget.style.background = 'rgba(0,229,255,0.08)'; e.currentTarget.style.borderRight = '1px solid #00e5ff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderRight = 'none'; }}>
                  <ChevronLeft size={20} />
                </button>
                <button aria-label="Next page" style={{ width: '44px', height: '44px', background: 'transparent', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', borderRadius: 0 }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#00e5ff'; e.currentTarget.style.color = '#00e5ff'; e.currentTarget.style.background = 'rgba(0,229,255,0.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'transparent'; }}>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          <div style={{ minHeight: '420px', marginBottom: '60px' }}>
            {loading ? (
              <div className="tournaments-grid">
                {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
              </div>
            ) : error ? (
              <ErrorState onRetry={refetch} />
            ) : tournaments.length === 0 ? (
              <EmptyState 
                icon={Trophy}
                title="No Active Tournaments"
                description="There are currently no tournaments available to join. Check back later for upcoming events and leagues."
              />
            ) : (
              <div className="tournaments-grid">
                {tournaments.map((item: any, i: number) => (
                  <div key={item.id} style={{ background: '#0a0a1f', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden', minHeight: '420px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'border-color 0.3s ease' }}
                       onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0,229,255,0.3)'}
                       onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
                    
                    <div style={{ flex: 1, background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(0,229,255,0.04))', position: 'relative', minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: '64px', opacity: 0.3, filter: 'grayscale(1)' }}><Gamepad2 size={64} /></div>
                    </div>
                    <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
                        <div style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: '20px', textTransform: 'uppercase', color: '#ffffff' }}>
                          {item.name || 'TOURNAMENT'}
                        </div>
                        <div style={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#00e5ff' }}>
                          {item.status === 'ACTIVE' ? 'OPEN SEATS' : 'FULL'}
                        </div>
                      </div>
                      <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '15px', color: '#E2E8F0', marginBottom: '16px', lineHeight: 1.5 }}>
                        Prize Pool: <strong>{item.prizePool || 0} <CoinIcon type="blue" size={16} /></strong>
                      </div>
                      <a href={getTournamentUrl(item.id, item.title)} onClick={(e) => handleAuthNavigation(e, getTournamentUrl(item.id, item.title))} style={{ textDecoration: 'none' }}>
                        <button className={`btn-card-cta ${item.status !== 'ACTIVE' ? 'active-state' : ''}`}>
                          {item.status !== 'ACTIVE' ? 'BRACKETS ACTIVE' : 'JOIN TOURNAMENT'}
                        </button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
            <Link to="/leaderboard" style={{ textDecoration: 'none' }}>
              <button className="btn-igx-results">
                RESULTS
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
