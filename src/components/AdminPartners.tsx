import { Handshake, X, Image as ImageIcon, Lightbulb, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, orderBy, query, serverTimestamp, getDoc, where } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from '../firebase';
import { db, storage } from '../firebase';

export default function AdminPartners() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'partners'), orderBy('order', 'asc')));
      const data: any[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() }));
      setPartners(data);
    } catch (error) {
      console.error("Error loading partners:", error);
    } finally {
      setLoading(false);
    }
  };

  const openForm = (data: any = null, id: string | null = null) => {
    setEditingId(id);
    if (data) {
      setName(data.name || '');
      setWebsiteUrl(data.websiteUrl || '');
      setCurrentLogoUrl(data.logoUrl || null);
    } else {
      setName('');
      setWebsiteUrl('');
      setCurrentLogoUrl(null);
    }
    setLogoFile(null);
    setIsFormOpen(true);
    setTimeout(() => {
      document.getElementById('partnerFormPanel')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setName('');
    setWebsiteUrl('');
    setCurrentLogoUrl(null);
    setLogoFile(null);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo too large. Max 2MB.');
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setCurrentLogoUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setCurrentLogoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const savePartner = async () => {
    if (!name.trim()) {
      alert('Partner name is required!');
      return;
    }

    setIsUploading(true);

    try {
      let logoUrl = currentLogoUrl || null;
      let storagePath = editingId ? partners.find(p => p.id === editingId)?.storagePath : null;

      if (logoFile) {
        const filename = `${Date.now()}_${logoFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        storagePath = `partners/${filename}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytesResumable(storageRef, logoFile);
        logoUrl = await getDownloadURL(storageRef);
      }

      const partnerData: any = {
        name: name.trim(),
        websiteUrl: websiteUrl.trim() || null,
        logoUrl,
        storagePath,
        isVisible: editingId ? partners.find(p => p.id === editingId)?.isVisible : true,
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, 'partners', editingId), partnerData);
      } else {
        partnerData.order = partners.length > 0 ? partners[partners.length - 1].order + 1 : 1;
        partnerData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'partners'), partnerData);
      }

      closeForm();
      loadPartners();
    } catch (err) {
      console.error(err);
      alert('Failed to save partner');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleVisibility = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'partners', id), { isVisible: !current });
      loadPartners();
    } catch (err) {
      console.error(err);
      alert('Failed to toggle visibility');
    }
  };

  const movePartner = async (id: string, direction: 'up' | 'down') => {
    const idx = partners.findIndex(p => p.id === id);
    if (idx === -1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= partners.length) return;

    const tempOrder = partners[idx].order;
    try {
      await updateDoc(doc(db, 'partners', partners[idx].id), { order: partners[swapIdx].order });
      await updateDoc(doc(db, 'partners', partners[swapIdx].id), { order: tempOrder });
      loadPartners();
    } catch (err) {
      console.error(err);
    }
  };

  const deletePartner = async (id: string, storagePath: string | null) => {
    if (!window.confirm('Remove this partner permanently?')) return;
    try {
      if (storagePath) {
        await deleteObject(ref(storage, storagePath)).catch(e => console.error("Could not delete from storage", e));
      }
      await deleteDoc(doc(db, 'partners', id));
      loadPartners();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  return (
    <div className="admin-partners-section" style={{ marginBottom: '64px' }}>
      <div className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: '"Inter", sans-serif', fontSize: '32px', fontWeight: 900, color: '#ffffff', marginBottom: '8px' }}>
            <Handshake size={24} className="inline-block mr-2" /> PARTNERS MANAGER
          </h2>
          <p style={{ color: '#F8FAFC', fontSize: '14px' }}>
            Manage sponsors shown in footer
          </p>
        </div>
        <button className="btn-igx-outline" onClick={() => openForm()}>
          + ADD PARTNER
        </button>
      </div>

      {/* Live Footer Preview */}
      <div className="partners-preview-box">
        <div className="preview-label">FOOTER PREVIEW</div>
        <div className="preview-footer-strip">
          <span className="preview-tagline">STRIQO IS BROUGHT TO YOU BY</span>
          <div className="preview-logos" id="previewLogos">
            {partners.filter(p => p.isVisible).length === 0 && (
              <span className="preview-empty" style={{ fontSize: '14px', color: '#E2E8F0' }}>No partners added yet</span>
            )}
            {partners.filter(p => p.isVisible).map((p, i) => (
              <React.Fragment key={p.id}>
                {i > 0 && <span className="preview-dot">•</span>}
                {p.logoUrl ? (
                  <img src={p.logoUrl} alt={p.name} className="preview-logo-img" />
                ) : (
                  <span className="preview-partner-name">{p.name}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {isFormOpen && (
        <div className="partner-form-panel" id="partnerFormPanel" style={{ background: '#0a0a1f', padding: '24px', border: '1px solid rgba(0,229,255,0.2)', marginBottom: '32px', borderRadius: '4px' }}>
          <div className="partner-form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 id="partnerFormTitle" style={{ fontSize: '18px', fontWeight: 700, color: '#00e5ff', letterSpacing: '0.1em' }}>
              {editingId ? 'EDIT PARTNER' : 'ADD PARTNER'}
            </h3>
            <button className="form-close-btn" onClick={closeForm} style={{ background: 'transparent', border: 'none', color: '#F8FAFC', fontSize: '20px', cursor: 'pointer' }}><X size={20} /></button>
          </div>

          {/* Name */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '14px', color: '#F8FAFC', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.1em' }}>PARTNER NAME *</label>
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', outline: 'none' }}
              placeholder="e.g. Excellence Gaming"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </div>

          {/* Website */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '14px', color: '#F8FAFC', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.1em' }}>WEBSITE URL (Optional)</label>
            <input
              type="url"
              className="form-input"
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', outline: 'none' }}
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </div>

          {/* Logo upload */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '14px', color: '#F8FAFC', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.1em' }}>LOGO IMAGE (Optional)</label>
            
            {!currentLogoUrl ? (
              <div
                className={`partner-upload-zone ${isDragOver ? 'drag-over' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
              >
                <span className="upload-zone-icon" style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}><ImageIcon size={32} /></span>
                <span className="upload-zone-title" style={{ display: 'block', color: '#fff', fontWeight: 700, marginBottom: '4px' }}>Drop logo or click to browse</span>
                <span className="upload-zone-sub" style={{ display: 'block', color: '#E2E8F0', fontSize: '14px' }}>PNG transparent background recommended • Max 2MB • Ideal: 200×80px</span>
                <input type="file" ref={fileInputRef} onChange={handleFileInput} accept="image/*" style={{ display: 'none' }} />
              </div>
            ) : (
              <div className="partner-logo-preview">
                <div className="logo-preview-box">
                  <img src={currentLogoUrl} alt="Logo preview" />
                </div>
                <button className="remove-logo-btn" onClick={removeLogo}><X size={14} className="inline-block mr-1" /> Remove Logo</button>
                <p className="logo-preview-hint">This is how it will look in the footer</p>
              </div>
            )}
            <p className="form-hint"><Lightbulb size={14} className="inline-block mr-1 text-yellow-400" /> If no logo uploaded — partner name will show as styled text in footer</p>
          </div>

          {/* Actions */}
          <div className="form-actions" style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
            <button className="btn-cancel-sm" onClick={closeForm} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 24px', fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer' }}>CANCEL</button>
            <button className="btn-igx-outline" onClick={savePartner} disabled={isUploading}>
              {isUploading ? '⏳ SAVING...' : 'SAVE PARTNER'}
            </button>
          </div>
        </div>
      )}

      {/* Partners list */}
      <div className="admin-section-divider" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '24px' }}>
        <span style={{ fontSize: '14px', color: '#F8FAFC', fontWeight: 700, letterSpacing: '0.1em' }}>CURRENT PARTNERS</span>
      </div>

      <div className="partners-list">
        {loading ? (
          <div className="loading-text" style={{ color: '#E2E8F0', fontSize: '14px' }}>Loading...</div>
        ) : partners.length === 0 ? (
          <div className="empty-state" style={{ color: '#E2E8F0', fontSize: '14px', padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
            No partners yet. Add your first sponsor!
          </div>
        ) : (
          partners.map((p, index) => (
            <div key={p.id} className={`partner-row ${!p.isVisible ? 'partner-hidden' : ''}`}>
              <div className="partner-row-left">
                <div className="partner-logo-cell">
                  {p.logoUrl ? (
                    <img src={p.logoUrl} alt={p.name} className="partner-logo-thumb" />
                  ) : (
                    <div className="partner-text-thumb">{p.name}</div>
                  )}
                </div>
                <div className="partner-row-info">
                  <div className="partner-row-name">{p.name}</div>
                  {p.websiteUrl ? (
                    <a href={p.websiteUrl} target="_blank" rel="noreferrer" className="partner-row-url">{p.websiteUrl}</a>
                  ) : (
                    <span className="partner-row-url muted">No website</span>
                  )}
                </div>
              </div>
              <div className="partner-row-actions">
                <button className="partner-action-btn" disabled={index === 0} onClick={() => movePartner(p.id, 'up')} title="Move up">↑</button>
                <button className="partner-action-btn" disabled={index === partners.length - 1} onClick={() => movePartner(p.id, 'down')} title="Move down">↓</button>
                <button className={`partner-action-btn ${p.isVisible ? 'btn-visible' : 'btn-hidden'}`} onClick={() => toggleVisibility(p.id, p.isVisible)} title={p.isVisible ? 'Hide from footer' : 'Show in footer'}>
                  {p.isVisible ? <><Eye size={16} /></> : <><EyeOff size={16} /></>}
                </button>
                <button className="partner-action-btn btn-edit-p" onClick={() => openForm(p, p.id)} title="Edit"><Pencil size={16} /></button>
                <button className="partner-action-btn btn-delete-p" onClick={() => deletePartner(p.id, p.storagePath || null)} title="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
