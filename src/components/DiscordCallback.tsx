import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function DiscordCallback() {
  const [status, setStatus] = useState('Linking Discord account...');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    
    if (code) {
      if (window.opener) {
         // We are in a popup
         fetch('/api/auth/discord/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('striqo_token')}`
            },
            body: JSON.stringify({ code, redirectUri: window.location.origin + '/discord-callback' })
         }).then(res => res.json()).then(data => {
            if (data.success) {
               window.opener.postMessage('discord_linked', '*');
               window.close();
            } else {
               setStatus('Failed: ' + data.error);
            }
         }).catch(e => {
            setStatus('Error linking account');
         });
      } else {
         // Not in a popup, maybe direct navigation? Just show status.
         setStatus('Please close this window and try from the profile settings.');
      }
    } else {
      setStatus('No authorization code provided.');
    }
  }, [location]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a1f', color: '#fff', fontFamily: 'Inter' }}>
      <h2>{status}</h2>
    </div>
  );
}
