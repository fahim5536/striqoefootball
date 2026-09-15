import { CoinIcon } from "./CoinIcon";
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Trophy, Users, User, Bell, ChevronRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import * as Dialog from '@radix-ui/react-dialog';

export default function GlobalSearch({ open, setOpen }: { open: boolean, setOpen: (val: boolean) => void }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('striqo_recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setLoading(true);
      api.get(`/v1/search/global?q=${encodeURIComponent(debouncedQuery)}`)
        .then(data => {
          setResults(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setResults(null);
    }
  }, [debouncedQuery]);

  const handleSelect = (url: string, title: string) => {
    if (!recentSearches.includes(title)) {
      const updated = [title, ...recentSearches].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('striqo_recent_searches', JSON.stringify(updated));
    }
    setOpen(false);
    navigate(url);
  };

  const highlight = (text: string, q: string) => {
    if (!q) return text;
    const parts = text.split(new RegExp(`(${q})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === q.toLowerCase() ? <span key={i} style={{ color: '#00e5ff' }}>{part}</span> : part
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 10000 }} />
        <Dialog.Content style={{ 
          position: 'fixed', top: '10vh', left: '50%', transform: 'translateX(-50%)', 
          width: '90%', maxWidth: '650px', background: '#0a0a1f', border: '1px solid rgba(255,255,255,0.1)',
          zIndex: 10001, display: 'flex', flexDirection: 'column', maxHeight: '80vh'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Search size={24} color="#00e5ff" />
            <input 
              autoFocus
              placeholder="Search tournaments, players, teams..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ 
                flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', 
                outline: 'none', marginLeft: '16px', fontFamily: '"Inter", sans-serif'
              }}
            />
            {loading && <div style={{ width: '20px', height: '20px', border: '2px solid rgba(0,229,255,0.2)', borderTopColor: '#00e5ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
            <button aria-label="Close search" onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: '#F8FAFC', cursor: 'pointer', marginLeft: '16px' }}>
              <X size={24} />
            </button>
          </div>

          <div style={{ overflowY: 'auto', padding: '20px', flex: 1 }}>
            {!query && recentSearches.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '0.1em', marginBottom: '12px' }}>RECENT SEARCHES</div>
                {recentSearches.map((s, i) => (
                  <div key={i} onClick={() => setQuery(s)} style={{ padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Search size={16} color="#475569" />
                    <span style={{ color: '#E2E8F0', fontSize: '15px' }}>{s}</span>
                  </div>
                ))}
              </div>
            )}

            {results?.tournaments?.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '0.1em', marginBottom: '12px' }}>TOURNAMENTS</div>
                {results.tournaments.map((t: any) => (
                  <div key={t.id} onClick={() => handleSelect(`/tournaments/${t.id}`, t.title)} className="search-result-item" style={{ padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: '32px', height: '32px', background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trophy size={16} color="#00e5ff" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>{highlight(t.title, debouncedQuery)}</div>
                      <div style={{ color: '#E2E8F0', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '4px' }}>{t.status} • {t.format} • {t.prizePool} <CoinIcon type="blue" size={13} /></div>
                    </div>
                    <ChevronRight size={16} color="#475569" />
                  </div>
                ))}
              </div>
            )}

            {results?.users?.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '0.1em', marginBottom: '12px' }}>PLAYERS</div>
                {results.users.map((u: any) => (
                  <div key={u.id} onClick={() => handleSelect(`/profile/${u.id}`, u.username)} className="search-result-item" style={{ padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} color="#fff" />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>{highlight(u.username, debouncedQuery)}</div>
                      {u.inGameName && <div style={{ color: '#E2E8F0', fontSize: '15px' }}>IGN: {u.inGameName}</div>}
                    </div>
                    <ChevronRight size={16} color="#475569" />
                  </div>
                ))}
              </div>
            )}

            {results?.teams?.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '0.1em', marginBottom: '12px' }}>TEAMS</div>
                {results.teams.map((t: any) => (
                  <div key={t.id} onClick={() => handleSelect(`/teams/${t.id}`, t.name)} className="search-result-item" style={{ padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: '32px', height: '32px', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={16} color="#7c3aed" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>{highlight(t.name, debouncedQuery)}</div>
                      <div style={{ color: '#E2E8F0', fontSize: '15px' }}>[{t.tag}] • {t._count?.members || 0} Members</div>
                    </div>
                    <ChevronRight size={16} color="#475569" />
                  </div>
                ))}
              </div>
            )}

            {query.length >= 2 && !loading && (!results || (results.tournaments?.length === 0 && results.users?.length === 0 && results.teams?.length === 0)) && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#E2E8F0' }}>
                <Search size={32} color="#475569" style={{ margin: '0 auto 16px' }} />
                <div>No results found for "{query}"</div>
                <div style={{ fontSize: '14px', marginTop: '8px' }}>Try adjusting your keywords.</div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
