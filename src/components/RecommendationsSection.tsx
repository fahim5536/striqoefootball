import { CoinIcon } from "./CoinIcon";
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getTournamentUrl } from '../lib/seo';
import { Link } from 'react-router-dom';
import { Trophy, Users, User, ArrowRight, Activity } from 'lucide-react';

export default function RecommendationsSection() {
  const [data, setData] = useState<any>(null);
  const [discovery, setDiscovery] = useState<any>(null);

  useEffect(() => {
    // Only load personalized if logged in
    if (localStorage.getItem('striqo_token')) {
      api.get('/v1/recommendations/personalized').then(setData).catch(() => {});
    }
    // Always load discovery
    api.get('/v1/recommendations/discovery').then(setDiscovery).catch(() => {});
  }, []);

  if (!data && !discovery) return null;

  return (
    <section style={{ padding: "80px 40px" }}>
      <div className="container-max">
        
        {data?.suggestedTournaments && data.suggestedTournaments.length > 0 && (
          <div style={{ marginBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
              <div>
                <h2 className="section-heading-premium">Recommended For You</h2>
                <div className="section-subheading-premium" style={{ marginBottom: "0" }}>BASED ON YOUR ACTIVITY</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
              {data.suggestedTournaments.map((t: any) => (
                <Link to={getTournamentUrl(t.id, t.title)} key={t.id} style={{ textDecoration: 'none' }}>
                  <div className="card-premium">
                    <Trophy size={24} color="#00e5ff" style={{ marginBottom: '16px' }} />
                    <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{t.title}</h3>
                    <div style={{ color: '#E2E8F0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>Prize Pool: {t.prizePool} <CoinIcon type="blue" size={14} /></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {discovery?.trending && discovery.trending.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
              <div>
                <h2 className="section-heading-premium">Trending Now</h2>
                <div style={{ color: '#7c3aed', fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', marginTop: '8px' }}>MOST ACTIVE TOURNAMENTS</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
              {discovery.trending.map((t: any) => (
                <Link to={getTournamentUrl(t.id, t.title)} key={t.id} style={{ textDecoration: 'none' }}>
                  <div className="card-premium">
                    <Activity size={24} color="#7c3aed" style={{ marginBottom: '16px' }} />
                    <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{t.title}</h3>
                    <div style={{ color: '#E2E8F0', fontSize: '14px' }}>{t._count?.participants || 0} Participants • {t.status}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {discovery?.mostActiveTeams && discovery.mostActiveTeams.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
              <div>
                <h2 className="section-heading-premium">Top Teams to Watch</h2>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
              {discovery.mostActiveTeams.map((t: any) => (
                <div key={t.id} style={{ minWidth: '200px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '20px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {t.logoUrl ? (
                    <img src={t.logoUrl} alt={t.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={24} color="#fff" />
                    </div>
                  )}
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>{t.name}</div>
                    <div style={{ color: '#E2E8F0', fontSize: '15px' }}>[{t.tag}]</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
