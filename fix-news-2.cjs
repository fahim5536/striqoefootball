const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/NewsSection.tsx');
let content = fs.readFileSync(file, 'utf8');

const correctFile = `import { Megaphone, Trophy, Gamepad2, Newspaper, Pin, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from '../firebase';
import { db } from '../firebase';

export default function NewsSection() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'news'));
      const posts: any[] = [];
      snap.forEach((d: any) => posts.push({ id: d.id, ...d.data() }));
      setArticles(posts.slice(0, 3)); // Display up to 3 posts
    } catch (err) {
      console.error('Failed to load news:', err);
    }
    setLoading(false);
  };

  const categoryConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    'UPDATE': { color: '#00e5ff', icon: <Megaphone size={16} />, label: 'UPDATE' },
    'EVENT': { color: '#7c3aed', icon: <Trophy size={16} />, label: 'EVENT' },
    'TIPS': { color: '#22c55e', icon: <Gamepad2 size={16} />, label: 'TIPS' },
    'ANNOUNCEMENT': { color: '#f59e0b', icon: <Megaphone size={16} />, label: 'ANNOUNCEMENT' }
  };

  const getCategoryFallbackBg = (category: string) => {
    const bgs: Record<string, string> = {
      'UPDATE': '#0a1a1f',
      'EVENT': '#1a0a1f',
      'TIPS': '#0a1f0a',
      'ANNOUNCEMENT': '#1f1a0a'
    };
    return bgs[category] || '#0a0a1f';
  };

  return (
    <>
      <section className="news-section">
        <div className="container-max">
          
          <div className="news-header">
            <div>
              <h2 className="news-title">LATEST NEWS</h2>
              <div className="news-subtitle">OFFICIAL UPDATES & ANNOUNCEMENTS</div>
            </div>
            {/* The REFRESH action look like a proper secondary control */}
            <button onClick={loadNews} className="btn-premium-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
              REFRESH
            </button>
          </div>

          {loading ? (
            <div className="news-grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="news-card">
                  <div className="skeleton-premium" style={{ height: '200px' }}></div>
                  <div className="news-content">
                    <div className="skeleton-premium" style={{ height: '16px', width: '30%', marginBottom: '16px' }}></div>
                    <div className="skeleton-premium" style={{ height: '24px', width: '90%', marginBottom: '12px' }}></div>
                    <div className="skeleton-premium" style={{ height: '24px', width: '70%', marginBottom: '24px' }}></div>
                    <div className="skeleton-premium" style={{ height: '80px', width: '100%', marginBottom: '24px' }}></div>
                    <div className="skeleton-premium" style={{ height: '20px', width: '40%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="empty-state-premium">
              <Newspaper size={48} className="empty-state-icon" />
              <h3 className="empty-state-title">NO NEWS YET</h3>
              <p className="empty-state-desc">Check back later for official announcements, tournament updates, and patch notes.</p>
            </div>
          ) : (
            <div className="news-grid">
              {articles.map((article) => {
                const conf = categoryConfig[article.category] || { color: '#00e5ff', icon: <Megaphone size={16}/>, label: article.category };
                return (
                  <div key={article.id} className="news-card" onClick={() => setSelectedArticle(article)} style={{ cursor: 'pointer' }}>
                    <div className="news-image-container" style={{
                      backgroundImage: article.imageUrl ? \`url(\${article.imageUrl})\` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: getCategoryFallbackBg(article.category)
                    }}>
                      {!article.imageUrl && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                          <Newspaper size={64} />
                        </div>
                      )}
                      <div className="news-category" style={{ background: conf.color, color: '#000' }}>
                        {conf.label}
                      </div>
                      {article.isPinned && (
                        <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', padding: '6px', borderRadius: '50%', color: '#fff' }}>
                          <Pin size={16} />
                        </div>
                      )}
                    </div>
                    
                    <div className="news-content">
                      <div className="news-date">
                        {article.createdAt ? new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'RECENT'}
                      </div>
                      <h3 className="news-card-title">{article.title}</h3>
                      <p className="news-excerpt">{article.excerpt || (article.content ? article.content.substring(0, 100) + '...' : '')}</p>
                      
                      <div className="news-read-more">
                        READ ARTICLE 
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Article Modal */}
      {selectedArticle && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedArticle(null)} />
          <div style={{ 
            position: 'relative', background: '#0a0a1f', border: '1px solid rgba(0,229,255,0.2)',
            width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto',
            borderRadius: '16px', zIndex: 1
          }}>
            <button 
              onClick={() => setSelectedArticle(null)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
            >
              <X size={20} />
            </button>
            
            {selectedArticle.imageUrl && (
              <div style={{ width: '100%', height: '300px', backgroundImage: \`url(\${selectedArticle.imageUrl})\`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            )}
            
            <div style={{ padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ background: (categoryConfig[selectedArticle.category] || {color: '#00e5ff'}).color, color: '#000', padding: '4px 8px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', borderRadius: '4px' }}>
                  {selectedArticle.category}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>
                  {selectedArticle.createdAt ? new Date(selectedArticle.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase() : 'RECENT'}
                </span>
              </div>
              
              <h2 style={{ fontFamily: '"Orbitron", sans-serif', fontSize: '32px', fontWeight: 900, color: '#fff', marginBottom: '32px', lineHeight: 1.2 }}>
                {selectedArticle.title}
              </h2>
              
              <div style={{ color: '#cbd5e1', fontSize: '16px', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: '"Inter", sans-serif' }}>
                {selectedArticle.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
`;
fs.writeFileSync(file, correctFile);
