import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, ArrowLeft, Tag, Clock, Share2 } from 'lucide-react';
import { db, doc, getDoc } from '../firebase';

export default function NewsArticle() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        if (id) {
          const docRef = doc(db, 'news', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setArticle({
              id: docSnap.id,
              title: data.title,
              date: data.date || (data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recent'),
              category: data.category || 'UPDATE',
              excerpt: data.subtitle || data.excerpt || '',
              content: data.body || data.content || data.excerpt || '',
              image: data.image || data.imageUrl || 'https://images.unsplash.com/photo-1511886929837-354d827aae26?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'
            });
          } else {
            setArticle(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch article', err);
        setArticle(null);
      }
      setLoading(false);
    };

    fetchArticle();
  }, [id]);

  const handleShare = async () => {
    const shareData = {
      title: article?.title,
      text: article?.excerpt,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (loading) {
    return (
      <div className="pt-[72px] min-h-screen bg-[#08081a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00e5ff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="pt-[72px] min-h-screen bg-[#08081a] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Article Not Found</h1>
        <p className="text-[#94a3b8] mb-8">The news article you are looking for does not exist or has been removed.</p>
        <Link to="/news" className="btn-igx">BACK TO NEWS</Link>
      </div>
    );
  }

  return (
    <div className="pt-[100px] min-h-screen bg-[#08081a] pb-24">
      
      <div className="max-w-[1400px] w-full mx-auto px-4 md:px-8 flex flex-col items-center">
        {/* Header / Title Section */}
        <div className="w-full max-w-[1200px]">
          <Link to="/news" className="inline-flex items-center gap-2 text-[#00e5ff] hover:text-white transition-colors mb-6 font-bold uppercase tracking-wider text-sm">
            <ArrowLeft size={16} /> Back to News
          </Link>
          
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="bg-[#00e5ff] text-[#0a0a1f] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Tag size={12} /> {article.category}
            </span>
            <span className="text-white/70 text-sm font-mono flex items-center gap-2">
              <Calendar size={14} /> {article.date}
            </span>
            <span className="text-white/70 text-sm font-mono flex items-center gap-2">
              <Clock size={14} /> 3 min read
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tight leading-tight mb-8">
            {article.title}
          </h1>
        </div>

        {/* Hero Image */}
        <div className="w-full max-w-[1200px] relative rounded-2xl overflow-hidden mb-8 md:mb-12 border border-white/10 flex justify-center items-center bg-black/20">
          <img 
            src={article.image} 
            alt={article.title} 
            className="w-full max-h-[70vh] object-contain"
          />
        </div>

        {/* Article Content */}
        <div className="bg-[#0a0a1f] border border-white/10 rounded-2xl p-6 md:p-12 relative w-full max-w-[1200px] mx-auto">
          
          <button 
            onClick={handleShare}
            className="absolute top-6 right-6 md:top-12 md:right-12 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#94a3b8] hover:text-[#00e5ff] hover:bg-[#00e5ff]/10 transition-colors" 
            title="Share Article"
          >
            <Share2 size={18} />
          </button>

          <p className="text-xl md:text-3xl text-[#cbd5e1] font-medium leading-relaxed mb-10 pb-10 border-b border-white/10 pr-12">
            {article.excerpt}
          </p>

          <div 
            className="prose prose-invert prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wide prose-a:text-[#00e5ff] prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: article.content.replace(/\n\n/g, '</p><p>').replace(/### (.*?)\n/g, '<h3>$1</h3>') }}
          />
          
        </div>
      </div>
    </div>
  );
}
