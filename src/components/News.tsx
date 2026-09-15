import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db, collection, getDocs } from '../firebase';

export default function News() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'news'));
      const posts: any[] = [];
      snap.forEach((d: any) => posts.push({ id: d.id, ...d.data() }));
      setArticles(posts);
    } catch (err) {
      console.error('Failed to load news:', err);
    }
    setLoading(false);
  };

  return (
    <div className="pt-[100px] w-full">
      <section className="bg-[#08081a] w-full px-4 py-16 min-h-[calc(100vh-100px)] flex flex-col items-center">
        <div className="w-full max-w-5xl flex flex-col items-center">
          <div className="text-center mb-16 w-full flex flex-col items-center">
            <h1 className="hero-heading text-[clamp(32px,5vw,56px)] mb-4 text-center">LATEST NEWS</h1>
            <p className="text-[#94a3b8] text-lg max-w-2xl text-center mx-auto">Stay updated with the latest STRIQO platform announcements, tournament results, and eFootball tips.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#0a0a1f] border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[380px] animate-pulse">
                  <div className="h-48 bg-white/5"></div>
                  <div className="p-6 flex flex-col flex-1 gap-3">
                    <div className="h-4 bg-white/5 rounded w-1/4"></div>
                    <div className="h-6 bg-white/5 rounded w-3/4"></div>
                    <div className="h-16 bg-white/5 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="w-full max-w-xl mx-auto text-center py-16 bg-[#0a0a1f] border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center">
              <Newspaper size={48} className="text-[#00e5ff]/40 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wider">NO NEWS YET</h3>
              <p className="text-[#94a3b8] text-sm max-w-md mx-auto">Check back later for official announcements, tournament updates, and patch notes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {articles.map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#0a0a1f] border border-white/10 rounded-2xl overflow-hidden group hover:border-[#00e5ff]/50 transition-colors flex flex-col"
                >
                  <div className="h-48 overflow-hidden relative">
                    <div className="absolute top-4 left-4 z-10 bg-[#00e5ff] text-[#0a0a1f] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {item.category || 'UPDATE'}
                    </div>
                    <img 
                      src={item.image || item.imageUrl || 'https://images.unsplash.com/photo-1511886929837-354d827aae26?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-white/50 text-xs font-mono mb-3">
                      <Calendar size={14} />
                      {item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'RECENT')}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 leading-snug">{item.title}</h3>
                    <p className="text-[#94a3b8] text-sm mb-6 line-clamp-3 flex-1">{item.excerpt || (item.body ? item.body.substring(0, 100) + '...' : '')}</p>
                    
                    <Link to={`/news/${item.id}`} className="flex items-center gap-2 text-[#00e5ff] text-sm font-bold uppercase tracking-wider hover:text-white transition-colors mt-auto">
                      Read More <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
