import { XCircle, AlertTriangle, CheckCircle2, Construction } from 'lucide-react';
import { useState } from 'react';
import { SEO } from './SEO';
import { useParams, Link } from 'react-router-dom';
import Bracket from './Bracket';
import { useFeatureFlag } from '../contexts/ClientConfigContext';

export default function TournamentDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('BRACKET');

  const tabs = ['OVERVIEW', 'PARTICIPANTS', 'MATCHES', 'BRACKET', 'STANDINGS'];

  const tournamentStandings = [
    { rank: 1, name: "STR_Alex", team: "FCB", flag: "🇪🇸", wins: 3, draws: 0, losses: 0, points: 9, status: "active" },
    { rank: 2, name: "KingStriker", team: "RMA", flag: "🇪🇸", wins: 2, draws: 1, losses: 0, points: 7, status: "active" },
    { rank: 3, name: "NeoGoal", team: "PSG", flag: "🇫🇷", wins: 2, draws: 0, losses: 1, points: 6, status: "active" },
    { rank: 4, name: "Viper11", team: "MCI", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", wins: 1, draws: 0, losses: 2, points: 3, status: "warning" },
    { rank: 5, name: "NoobMaster", team: "MUN", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", wins: 0, draws: 0, losses: 3, points: 0, status: "eliminated" },
  ];

  return (
    <div style={{ paddingTop: '72px' }}>
      <section style={{ background: '#08081a', padding: '60px 40px', minHeight: 'calc(100vh - 72px)' }}>
        <div className="container-max">
          <div style={{ marginBottom: '40px', position: 'relative' }}>
            <Link to="/tournaments" style={{ color: '#00e5ff', fontSize: '14px', textDecoration: 'none', fontFamily: '"Inter", sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              &larr; BACK TO TOURNAMENTS
            </Link>
            <h1 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, fontSize: 'clamp(32px, 5vw, 64px)', textTransform: 'uppercase', color: '#ffffff', marginTop: '16px' }}>
              PRO LEAGUE CHAMPIONSHIP
            </h1>
            <div style={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#E2E8F0', marginTop: '8px' }}>
              SEASON 4 • 16 PLAYERS
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '40px', overflowX: 'auto' }}>
            {tabs.map((tab) => (
              <div 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ 
                  padding: '16px 0', 
                  fontFamily: '"Inter", sans-serif', 
                  fontSize: '14px', 
                  fontWeight: 700, 
                  letterSpacing: '0.15em', 
                  color: activeTab === tab ? '#00e5ff' : '#E2E8F0',
                  borderBottom: activeTab === tab ? '2px solid #00e5ff' : '2px solid transparent',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab}
              </div>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'BRACKET' && <Bracket />}
            
            {activeTab === 'ANALYTICS' && (
            <div style={{ color: '#E2E8F0', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              <h2 style={{ fontFamily: '"Inter", sans-serif', fontSize: '24px', fontWeight: 700, color: '#00e5ff', marginBottom: '20px' }}>Beta: AI Tournament Analytics</h2>
              <p>Advanced player metrics, progression forecasting, and engagement trends. (Feature Flag: TOURNAMENT_ANALYTICS)</p>
            </div>
          )}
          
          {activeTab === 'STANDINGS' && (
              <div className="standings-content">
                  <table className="lb-table">
                    <thead>
                      <tr>
                        <th>RANK</th>
                        <th>PLAYER</th>
                        <th>TEAM</th>
                        <th>W</th>
                        <th>D</th>
                        <th>L</th>
                        <th style={{ textAlign: 'right' }}>POINTS</th>
                        <th style={{ textAlign: 'right' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tournamentStandings.map((row) => (
                        <tr key={row.rank} className={row.status === 'eliminated' ? 'eliminated-row' : row.status === 'warning' ? 'warning-row' : ''}>
                          <td style={{
                            color: row.rank === 1 ? '#ffd700' : row.rank === 2 ? '#c0c0c0' : row.rank === 3 ? '#cd7f32' : '#CBD5E1',
                            fontWeight: row.rank <= 3 ? 800 : 500,
                            fontSize: row.rank === 1 ? '18px' : '14px'
                          }}>
                            #{row.rank}
                          </td>
                          <td style={{ color: '#ffffff', fontWeight: 600 }}><Link to={`/profile?uid=${(row as any).uid || row.name}`} style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[#00e5ff] transition-colors">{row.name}</Link></td>
                          <td>{row.flag} {row.team}</td>
                          <td>{row.wins}</td>
                          <td>{row.draws}</td>
                          <td>{row.losses}</td>
                          <td style={{ textAlign: 'right' }}>
                            <span className="points-cell" style={{ fontFamily: '"Orbitron", sans-serif', fontSize: '16px', fontWeight: 700, color: '#00e5ff', textShadow: '0 0 8px rgba(0,229,255,0.4)' }}>
                              {row.points}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span className="status-badge" style={{ 
                              fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em',
                              color: row.status === 'eliminated' ? '#ff2d55' : row.status === 'warning' ? '#ffd700' : '#00ff88'
                            }}>
                              {row.status === 'eliminated' ? <><XCircle size={14} className="inline-block mr-1" /> ELIMINATED</> : row.status === 'warning' ? <><AlertTriangle size={14} className="inline-block mr-1" /> WARNING</> : <><CheckCircle2 size={14} className="inline-block mr-1" /> ACTIVE</>}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
            )}
            
            {activeTab !== 'BRACKET' && activeTab !== 'STANDINGS' && (
              <div style={{ padding: '60px', textAlign: 'center', background: '#0c0c22', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '24px', opacity: 0.5, marginBottom: '16px' }}><Construction size={24} /></div>
                <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '14px', color: '#E2E8F0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {activeTab} SECTION UNDER CONSTRUCTION
                </div>
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}
