import { Pencil, X, User, Camera, Save } from 'lucide-react';

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data === 'discord_linked') {
        alert('Discord linked successfully!');
        window.location.reload();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const unlinkDiscord = async () => {
    try {
      const res = await fetch('/api/auth/discord/unlink', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('striqo_token')}`
        }
      });
      if (res.ok) {
        alert('Discord unlinked successfully!');
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      alert('Error unlinking Discord');
    }
  };

import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc } from '../firebase';
import { db, auth } from '../firebase';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess: (updatedUser: any) => void;
}

export default function EditProfileModal({ isOpen, onClose, user, onSuccess }: EditProfileModalProps) {
  const [editName, setEditName] = useState('');
  const [editLogo, setEditLogo] = useState('');
  const [editEfootballId, setEditEfootballId] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editGameplayStyle, setEditGameplayStyle] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gameplayInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      setEditName(user.username || user.name || '');
      setEditLogo(user.avatarUrl || '');
      setEditEfootballId(user.efootballId || '');
      setEditBio(user.bio || '');
      setEditGameplayStyle(user.gameplayStyleImageUrl || '');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be smaller than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    let newTracker = user.efootballIdChangeTracker || { count: 0, month: new Date().getMonth(), year: new Date().getFullYear() };
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    if (newTracker.month !== currentMonth || newTracker.year !== currentYear) {
      newTracker = { count: 0, month: currentMonth, year: currentYear };
    }

    if (editEfootballId !== user.efootballId) {
      if (newTracker.count >= 4) {
        alert("You can only change your eFootball ID 4 times a month.");
        return;
      }
      newTracker.count += 1;
    }

    const updatedUser = {
      ...user,
      username: editName,
      name: editName,
      avatarUrl: editLogo,
      efootballId: editEfootballId,
      efootballIdChangeTracker: newTracker,
      bio: editBio,
      gameplayStyleImageUrl: editGameplayStyle
    };
    
    // Save to local storage
    localStorage.setItem('striqo_user', JSON.stringify(updatedUser));
    
    // Attempt to update in Firestore if auth is present
    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          username: editName,
          name: editName,
          avatarUrl: editLogo,
          efootballId: editEfootballId,
          efootballIdChangeTracker: newTracker,
          bio: editBio,
          gameplayStyleImageUrl: editGameplayStyle
        });
      } catch (err) {
        console.error("Error updating profile in DB", err);
      }
    }
    
    // Trigger global event so navbar updates
    window.dispatchEvent(new Event('userLogin'));
    onSuccess(updatedUser);
  };

  return (
    <div className="modal-overlay" id="editProfileModal" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999
    }}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{
        background: '#0a0a1f', border: '1px solid rgba(0,229,255,0.3)',
        padding: '40px', width: '100%', maxWidth: '500px',
        position: 'relative', maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: '"Orbitron", sans-serif', fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0, textTransform: 'uppercase' }}>
            <Pencil size={24} className="inline-block mr-2" /> EDIT PROFILE
          </h3>
          <button className="modal-close" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div 
              style={{
                width: '100px', height: '100px',
                background: 'rgba(0,229,255,0.1)',
                border: '2px solid rgba(0,229,255,0.4)',
                borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {editLogo ? (
                <img src={editLogo} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '40px' }}><User size={40} /></span>
              )}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', textAlign: 'center', padding: '4px 0', fontSize: '14px', color: '#00e5ff', fontWeight: 'bold' }}>
                CHANGE
              </div>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleImageUpload(e, setEditLogo)} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '14px', color: '#00e5ff', fontWeight: 'bold', letterSpacing: '0.1em', marginBottom: '8px' }}>DISPLAY NAME</label>
            <input type="text" id="editName" className="form-input" placeholder="Your name" maxLength={30} value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 16px', outline: 'none' }} />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '14px', color: '#00e5ff', fontWeight: 'bold', letterSpacing: '0.1em' }}>eFOOTBALL USER ID</label>
              <span style={{ fontSize: '14px', color: '#F8FAFC', fontWeight: 'bold', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Can be changed 4 times a month</span>
            </div>
            <input type="text" id="editEfootballId" className="form-input" placeholder="Your eFootball ID" value={editEfootballId} onChange={(e) => setEditEfootballId(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 16px', outline: 'none' }} />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '14px', color: '#00e5ff', fontWeight: 'bold', letterSpacing: '0.1em', marginBottom: '8px' }}>BIO</label>
            <textarea id="editBio" className="form-textarea" rows={3} placeholder="Tell others about your playstyle..." maxLength={200} value={editBio} onChange={(e) => setEditBio(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 16px', outline: 'none', resize: 'vertical' }}></textarea>
            <span className="char-count" id="bioCount" style={{ display: 'block', textAlign: 'right', fontSize: '14px', color: '#E2E8F0', marginTop: '4px' }}>{editBio.length}/200</span>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '14px', color: '#00e5ff', fontWeight: 'bold', letterSpacing: '0.1em', marginBottom: '8px' }}>GAMEPLAY STYLE IMAGE</label>
            <div className="upload-zone-sm" id="gameplayUploadZone" onClick={() => gameplayInputRef.current?.click()} style={{ padding: '20px', border: '1px dashed rgba(0,229,255,0.4)', textAlign: 'center', cursor: 'pointer', color: '#00e5ff', fontSize: '14px', background: 'rgba(0,229,255,0.05)', marginBottom: '8px' }}>
              <Camera size={16} className="inline-block mr-2" /> Drop or click to upload
              <input type="file" id="gameplayFileInput" accept="image/*" style={{ display: 'none' }} ref={gameplayInputRef} onChange={(e) => handleImageUpload(e, setEditGameplayStyle)} />
            </div>
            {editGameplayStyle && (
              <img id="gameplayPreview" src={editGameplayStyle} alt="preview" className="gameplay-preview-sm" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', gap: '16px' }}>
          <button className="btn-cancel-sm" onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '12px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase' }}>
            CANCEL
          </button>
          <button className="btn-igx-outline" onClick={handleSaveProfile} style={{ flex: 1, background: '#00e5ff', border: '1px solid #00e5ff', color: '#000', padding: '12px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase' }}>
            <Save size={16} className="inline-block mr-2" /> SAVE CHANGES
          </button>
        </div>
      </div>
    </div>
  );
}
