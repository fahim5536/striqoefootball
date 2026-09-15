import { Image as ImageIcon, X, Pin, Loader2, Save, Send, CheckCircle2, Pencil, Archive, PinOff, Trash2, FileEdit, Newspaper } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, orderBy, query, serverTimestamp } from '../firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from '../firebase';
import { signInWithEmailAndPassword } from '../firebase';
import { db, storage, auth } from '../firebase';

export default function AdminNewsManager() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState('UPDATE');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [body, setBody] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  
  // Image State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const authenticateAndLoad = async () => {
      try {
        await signInWithEmailAndPassword(auth, 'admin@striqo.com', 'password123');
        await loadPosts();
      } catch (err) {
        console.error("Auth failed", err);
      }
    };
    authenticateAndLoad();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'news'), orderBy('createdAt', 'desc')));
      const loadedPosts: any[] = [];
      snap.forEach(d => loadedPosts.push({ id: d.id, ...d.data() }));
      setPosts(loadedPosts);
    } catch (err) {
      console.error(err);
      alert('Failed to load posts. Are Firebase rules set correctly?');
    }
    setLoading(false);
  };

  const openForm = (postData: any = null, postId: string | null = null) => {
    setEditingPostId(postId);
    setIsFormOpen(true);
    if (postData) {
      setTitle(postData.title || '');
      setSubtitle(postData.subtitle || '');
      setBody(postData.body || '');
      setIsPinned(postData.isPinned || false);
      setCategory(postData.category || 'UPDATE');
      setCurrentImageUrl(postData.imageUrl || null);
      setPreviewUrl(postData.imageUrl || null);
    } else {
      clearForm();
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    clearForm();
  };

  const clearForm = () => {
    setEditingPostId(null);
    setTitle('');
    setSubtitle('');
    setBody('');
    setIsPinned(false);
    setCategory('UPDATE');
    setSelectedImage(null);
    setPreviewUrl(null);
    setCurrentImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image too large. Max 5MB.');
      return;
    }
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setCurrentImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const savePost = async (publish: boolean) => {
    if (!title.trim()) { alert('Title is required!'); return; }
    if (!body.trim()) { alert('Content is required!'); return; }

    setIsSaving(true);
    try {
      let imageUrl = currentImageUrl;
      
      if (selectedImage) {
        const filename = `${Date.now()}_${selectedImage.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storageRef = ref(storage, `news/${filename}`);
        await uploadBytesResumable(storageRef, selectedImage);
        imageUrl = await getDownloadURL(storageRef);
      }

      const postData: any = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        body: body.trim(),
        category,
        imageUrl,
        isPinned,
        isPublished: publish,
        publishedAt: publish ? serverTimestamp() : null,
        updatedAt: serverTimestamp()
      };

      if (editingPostId) {
        await updateDoc(doc(db, 'news', editingPostId), postData);
      } else {
        postData.createdAt = serverTimestamp();
        postData.authorName = 'Admin';
        await addDoc(collection(db, 'news'), postData);
      }

      closeForm();
      loadPosts();
    } catch (err) {
      console.error(err);
      alert('Failed to save post.');
    }
    setIsSaving(false);
  };

  const togglePublish = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'news', id), {
      isPublished: !current,
      publishedAt: !current ? serverTimestamp() : null
    });
    loadPosts();
  };

  const togglePin = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'news', id), { isPinned: !current });
    loadPosts();
  };

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post permanently?')) return;
    await deleteDoc(doc(db, 'news', id));
    loadPosts();
  };

  const publishedPosts = posts.filter(p => p.isPublished);
  const draftPosts = posts.filter(p => !p.isPublished);

  const catColors: Record<string, string> = {
    'UPDATE': '#00e5ff',
    'EVENT': '#7c3aed',
    'TIPS': '#22c55e',
    'ANNOUNCEMENT': '#f59e0b'
  };

  return (
    <div style={{ marginBottom: '60px' }}>
      <div className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: '"Inter", sans-serif', fontSize: '32px', fontWeight: 900, color: '#ffffff', marginBottom: '8px' }}><Newspaper size={32} className="inline-block mr-2" /> NEWS MANAGER</h2>
          <p style={{ color: '#F8FAFC', fontSize: '14px' }}>Write and publish news for the home page</p>
        </div>
        {!isFormOpen && (
          <button className="btn-igx-outline" onClick={() => openForm()}>
            + CREATE NEW POST
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="news-form-panel" style={{ background: '#0a0a1f', border: '1px solid rgba(0,229,255,0.2)', padding: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700 }}>{editingPostId ? 'EDIT NEWS POST' : 'CREATE NEWS POST'}</h3>
            <button onClick={closeForm} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '18px' }}><X size={18} /></button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#00e5ff', fontSize: '14px', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.1em' }}>CATEGORY</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['UPDATE', 'EVENT', 'TIPS', 'ANNOUNCEMENT'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    background: category === cat ? 'rgba(0,229,255,0.1)' : 'transparent',
                    border: `1px solid ${category === cat ? '#00e5ff' : 'rgba(255,255,255,0.1)'}`,
                    color: category === cat ? '#00e5ff' : '#CBD5E1',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 700
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#00e5ff', fontSize: '14px', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.1em' }}>TITLE *</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              maxLength={100}
              placeholder="e.g. Striqo Cup #5 Registration Now Open!"
              style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
            <div style={{ fontSize: '14px', color: '#E2E8F0', textAlign: 'right', marginTop: '4px' }}>{title.length}/100</div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#00e5ff', fontSize: '14px', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.1em' }}>SUBTITLE</label>
            <input 
              type="text" 
              value={subtitle} 
              onChange={e => setSubtitle(e.target.value)} 
              maxLength={150}
              placeholder="e.g. Registration closes this Friday"
              style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#00e5ff', fontSize: '14px', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.1em' }}>CONTENT *</label>
            <textarea 
              value={body} 
              onChange={e => setBody(e.target.value)} 
              maxLength={2000}
              rows={6}
              placeholder="Write your full news article here..."
              style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'vertical' }}
            />
            <div style={{ fontSize: '14px', color: '#E2E8F0', textAlign: 'right', marginTop: '4px' }}>{body.length}/2000</div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#00e5ff', fontSize: '14px', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.1em' }}>COVER IMAGE (Optional)</label>
            {!previewUrl ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '32px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)', cursor: 'pointer', color: '#F8FAFC' }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}><ImageIcon size={24} /></div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Click to browse</div>
                <div style={{ fontSize: '14px', marginTop: '4px', opacity: 0.7 }}>JPG, PNG, WEBP • Max 5MB</div>
                <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
              </div>
            ) : (
              <div style={{ position: 'relative', width: 'fit-content' }}>
                <img src={previewUrl} alt="Preview" style={{ height: '160px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                <button onClick={removeImage} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', padding: '4px 8px', fontSize: '14px', cursor: 'pointer' }}><X size={14} className="inline-block mr-1" /> Remove</button>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" id="isPinned" checked={isPinned} onChange={e => setIsPinned(e.target.checked)} />
            <label htmlFor="isPinned" style={{ color: '#fff', fontSize: '14px' }}><Pin size={14} className="inline-block mr-1" /> Pin this post (shows at top always)</label>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={() => savePost(false)} 
              disabled={isSaving}
              style={{ padding: '12px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
            >
              {isSaving ? '<Loader2 size={14} className="inline-block mr-1 animate-spin" /> SAVING...' : '<Save size={14} className="inline-block mr-1" /> SAVE AS DRAFT'}
            </button>
            <button 
              onClick={() => savePost(true)} 
              disabled={isSaving}
              style={{ padding: '12px 24px', background: '#00e5ff', border: 'none', color: '#000', cursor: 'pointer', fontWeight: 700 }}
            >
              {isSaving ? '<Loader2 size={14} className="inline-block mr-1 animate-spin" /> PUBLISHING...' : '<Send size={14} className="inline-block mr-1" /> PUBLISH NOW'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: '#F8FAFC', padding: '24px' }}>Loading posts...</div>
      ) : posts.length === 0 ? (
        <div style={{ color: '#E2E8F0', padding: '40px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
          No news posts yet. Create your first post!
        </div>
      ) : (
        <div>
          {publishedPosts.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#00e5ff', letterSpacing: '0.1em', marginBottom: '12px' }}><CheckCircle2 size={14} className="inline-block mr-2" /> PUBLISHED ({publishedPosts.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {publishedPosts.map(post => (
                  <div key={post.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a1f', border: '1px solid rgba(255,255,255,0.05)', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {post.isPinned && <span title="Pinned"><Pin size={14} /></span>}
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{post.title}</div>
                      <span style={{ fontSize: '14px', padding: '2px 6px', background: 'rgba(0,0,0,0.5)', border: `1px solid ${catColors[post.category] || '#fff'}`, color: catColors[post.category] || '#fff' }}>{post.category}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openForm(post, post.id)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 12px', fontSize: '14px', cursor: 'pointer' }}><Pencil size={14} className="inline-block mr-1" /> Edit</button>
                      <button onClick={() => togglePublish(post.id, post.isPublished)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 12px', fontSize: '14px', cursor: 'pointer' }}><Archive size={14} className="inline-block mr-1" /> Unpublish</button>
                      <button onClick={() => togglePin(post.id, post.isPinned)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 12px', fontSize: '14px', cursor: 'pointer' }}>{post.isPinned ? <><PinOff size={14} className="inline-block mr-1" /> Unpin</> : <><Pin size={14} className="inline-block mr-1" /> Pin</>}</button>
                      <button onClick={() => deletePost(post.id)} style={{ background: 'transparent', border: '1px solid rgba(255,45,85,0.5)', color: '#ff2d55', padding: '6px 12px', fontSize: '14px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {draftPosts.length > 0 && (
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '0.1em', marginBottom: '12px' }}><FileEdit size={14} className="inline-block mr-2" /> DRAFTS ({draftPosts.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {draftPosts.map(post => (
                  <div key={post.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a1f', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', opacity: 0.7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{post.title}</div>
                      <span style={{ fontSize: '14px', padding: '2px 6px', background: 'rgba(0,0,0,0.5)', border: `1px solid ${catColors[post.category] || '#fff'}`, color: catColors[post.category] || '#fff' }}>{post.category}</span>
                      <span style={{ fontSize: '14px', color: '#E2E8F0' }}>DRAFT</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openForm(post, post.id)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 12px', fontSize: '14px', cursor: 'pointer' }}><Pencil size={14} className="inline-block mr-1" /> Edit</button>
                      <button onClick={() => togglePublish(post.id, post.isPublished)} style={{ background: '#00e5ff', border: 'none', color: '#000', padding: '6px 12px', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}><Send size={14} className="inline-block mr-1" /> Publish</button>
                      <button onClick={() => deletePost(post.id)} style={{ background: 'transparent', border: '1px solid rgba(255,45,85,0.5)', color: '#ff2d55', padding: '6px 12px', fontSize: '14px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
