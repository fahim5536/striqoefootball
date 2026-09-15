import { Settings, Megaphone, Wrench, UserPlus, Smartphone } from 'lucide-react';
import { CoinIcon } from "./CoinIcon";

function DiscordSettingsPanel() {
  const [settings, setSettings] = React.useState({
    discordIntegration: false,
    discordClientId: '',
    discordClientSecret: '',
    discordBotToken: '',
    discordGuildId: '',
    socialDiscord: ''
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [testResult, setTestResult] = React.useState('');

  React.useEffect(() => {
    fetch('/api/admin/settings/discord', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('striqo_token')}` }
    }).then(res => res.json()).then(data => {
      if(data) setSettings(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/settings/discord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('striqo_token')}`
        },
        body: JSON.stringify(settings)
      });
      alert('Discord settings saved!');
    } catch(e) {
      alert('Error saving Discord settings');
    }
    setSaving(false);
  };

  const handleTest = async () => {
    setTestResult('Testing...');
    try {
      const res = await fetch('/api/admin/settings/discord/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('striqo_token')}`
        },
        body: JSON.stringify({ discordBotToken: settings.discordBotToken, discordGuildId: settings.discordGuildId })
      });
      const data = await res.json();
      if(data.success) {
        setTestResult(`Success! Connected to guild: ${data.guildName}`);
      } else {
        setTestResult(`Error: ${data.error}`);
      }
    } catch(e) {
      setTestResult('Error testing connection');
    }
  };

  if(loading) return <div>Loading Discord settings...</div>;

  return (
    <div style={{ background: '#0a0a1f', padding: '24px', borderRadius: '12px', border: '1px solid rgba(0,229,255,0.2)', marginTop: '24px' }}>
      <h3 style={{ color: '#00e5ff', marginBottom: '16px', fontFamily: '"Orbitron", sans-serif' }}>Discord Integration</h3>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', color: '#fff', cursor: 'pointer' }}>
          <input type="checkbox" checked={settings.discordIntegration} onChange={(e) => setSettings({...settings, discordIntegration: e.target.checked})} style={{ marginRight: '8px' }} />
          Enable Discord Integration
        </label>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', color: '#8b8b99', marginBottom: '8px', fontSize: '14px' }}>Client ID</label>
          <input type="text" value={settings.discordClientId} onChange={(e) => setSettings({...settings, discordClientId: e.target.value})} className="form-input" style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ display: 'block', color: '#8b8b99', marginBottom: '8px', fontSize: '14px' }}>Client Secret</label>
          <input type="password" value={settings.discordClientSecret} onChange={(e) => setSettings({...settings, discordClientSecret: e.target.value})} className="form-input" style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ display: 'block', color: '#8b8b99', marginBottom: '8px', fontSize: '14px' }}>Bot Token</label>
          <input type="password" value={settings.discordBotToken} onChange={(e) => setSettings({...settings, discordBotToken: e.target.value})} className="form-input" style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ display: 'block', color: '#8b8b99', marginBottom: '8px', fontSize: '14px' }}>Server Guild ID</label>
          <input type="text" value={settings.discordGuildId} onChange={(e) => setSettings({...settings, discordGuildId: e.target.value})} className="form-input" style={{ width: '100%' }} />
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        <button onClick={handleTest} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
          Test Connection
        </button>
        {testResult && <span style={{ color: testResult.includes('Success') ? '#4ade80' : '#f87171', fontSize: '14px' }}>{testResult}</span>}
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from '../firebase';
import { db } from '../firebase';

export default function AdminSettings() {
  const [announcementActive, setAnnouncementActive] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [allowFriendMatch, setAllowFriendMatch] = useState(true);

  const [coinTourWin, setCoinTourWin] = useState('20');
  const [coinTourDraw, setCoinTourDraw] = useState('10');
  const [coinTourLoss, setCoinTourLoss] = useState('3');
  const [coinFriendWin, setCoinFriendWin] = useState('20');

  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialTwitter, setSocialTwitter] = useState('');
  const [socialDiscord, setSocialDiscord] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      const snap = await getDoc(doc(db, 'settings', 'global'));
      if (snap.exists()) {
        const d = snap.data();
        setAnnouncementActive(d.announcementActive || false);
        setAnnouncementText(d.announcementText || '');
        setMaintenanceMode(d.maintenanceMode || false);
        setMaintenanceMsg(d.maintenanceMsg || '');
        setAllowRegistration(d.allowRegistration !== false);
        setAllowFriendMatch(d.allowFriendMatch !== false);
        if (d.coins) {
          setCoinTourWin(d.coins.tourWin || '20');
          setCoinTourDraw(d.coins.tourDraw || '10');
          setCoinTourLoss(d.coins.tourLoss || '3');
          setCoinFriendWin(d.coins.friendWin || '20');
        }
        if (d.socials) {
          setSocialInstagram(d.socials.instagram || '');
          setSocialTwitter(d.socials.twitter || '');
          setSocialDiscord(d.socials.discord || '');
        }
      }
    };
    fetchSettings();
  }, []);

  const saveSettings = async (updates: any) => {
    try {
      await setDoc(doc(db, 'settings', 'global'), updates, { merge: true });
      alert('Settings saved!');
    } catch (e) {
      console.error(e);
      alert('Failed to save settings');
    }
  };

  return (
    <>

    <div className="admin-card">
      <div className="admin-card-header">
        <h3><Settings size={24} className="inline-block mr-2" /> SITE SETTINGS</h3>
      </div>
      <div className="admin-card-body">
        
        <div className="settings-group">
          <h4 className="settings-group-title"><Megaphone size={16} className="inline-block mr-2" /> ANNOUNCEMENT BANNER</h4>
          <div className="toggle-row">
            <label className="toggle-label" style={{ color: '#fff', fontSize: '15px' }}>Show announcement on home page</label>
            <label className="toggle-switch">
              <input type="checkbox" checked={announcementActive} onChange={e => { setAnnouncementActive(e.target.checked); saveSettings({ announcementActive: e.target.checked }) }} />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <input type="text" className="form-input" placeholder="e.g. Striqo Cup #5 is now open!" value={announcementText} onChange={e => setAnnouncementText(e.target.value)} style={{ marginBottom: '12px' }} />
          <button className="btn-admin-secondary" onClick={() => saveSettings({ announcementText })}>Save Announcement</button>
        </div>

        <div className="settings-group">
          <h4 className="settings-group-title"><Wrench size={16} className="inline-block mr-2" /> MAINTENANCE MODE</h4>
          <div className="toggle-row">
            <label className="toggle-label" style={{ color: '#fff', fontSize: '15px' }}>Enable maintenance mode <span className="toggle-warning" style={{ color: '#ff2d55', fontSize: '14px' }}>(Blocks all users except admin)</span></label>
            <label className="toggle-switch">
              <input type="checkbox" checked={maintenanceMode} onChange={e => { setMaintenanceMode(e.target.checked); saveSettings({ maintenanceMode: e.target.checked }) }} />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <input type="text" className="form-input" placeholder="Maintenance message for users..." value={maintenanceMsg} onChange={e => setMaintenanceMsg(e.target.value)} style={{ marginBottom: '12px' }} />
          <button className="btn-admin-secondary" onClick={() => saveSettings({ maintenanceMsg })}>Save Maintenance Msg</button>
        </div>

        <div className="settings-group">
          <h4 className="settings-group-title"><UserPlus size={16} className="inline-block mr-2" /> REGISTRATION</h4>
          <div className="toggle-row">
            <label className="toggle-label" style={{ color: '#fff', fontSize: '15px' }}>Allow new user registration</label>
            <label className="toggle-switch">
              <input type="checkbox" checked={allowRegistration} onChange={e => { setAllowRegistration(e.target.checked); saveSettings({ allowRegistration: e.target.checked }) }} />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="toggle-row">
            <label className="toggle-label" style={{ color: '#fff', fontSize: '15px' }}>Allow friend match requests</label>
            <label className="toggle-switch">
              <input type="checkbox" checked={allowFriendMatch} onChange={e => { setAllowFriendMatch(e.target.checked); saveSettings({ allowFriendMatch: e.target.checked }) }} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-group">
          <h4 className="settings-group-title"><CoinIcon type="blue" /> COIN REWARDS</h4>
          <div className="coin-settings-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Tournament Win <CoinIcon type="blue" /></label>
              <input type="number" className="form-input" value={coinTourWin} onChange={e => setCoinTourWin(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Tournament Draw <CoinIcon type="blue" /></label>
              <input type="number" className="form-input" value={coinTourDraw} onChange={e => setCoinTourDraw(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Tournament Loss <CoinIcon type="blue" /></label>
              <input type="number" className="form-input" value={coinTourLoss} onChange={e => setCoinTourLoss(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Friend Match Win <CoinIcon type="silver" /></label>
              <input type="number" className="form-input" value={coinFriendWin} onChange={e => setCoinFriendWin(e.target.value)} />
            </div>
          </div>
          <button className="btn-admin-secondary" onClick={() => saveSettings({ coins: { tourWin: coinTourWin, tourDraw: coinTourDraw, tourLoss: coinTourLoss, friendWin: coinFriendWin }})}>Save Coin Settings</button>
        </div>

        <div className="settings-group">
          <h4 className="settings-group-title"><Smartphone size={16} className="inline-block mr-2" /> SOCIAL LINKS</h4>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">Instagram URL</label>
            <input type="url" className="form-input" value={socialInstagram} onChange={e => setSocialInstagram(e.target.value)} placeholder="https://instagram.com/striqo" />
          </div>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">Twitter/X URL</label>
            <input type="url" className="form-input" value={socialTwitter} onChange={e => setSocialTwitter(e.target.value)} placeholder="https://x.com/striqo" />
          </div>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">Discord URL</label>
            <input type="url" className="form-input" value={socialDiscord} onChange={e => setSocialDiscord(e.target.value)} placeholder="https://discord.gg/striqo" />
          </div>
          <button className="btn-admin-secondary" onClick={() => saveSettings({ socials: { instagram: socialInstagram, twitter: socialTwitter, discord: socialDiscord }})}>Save Social Links</button>
        </div>

      </div>
    </div>
    <DiscordSettingsPanel />
    </>
  );
}
