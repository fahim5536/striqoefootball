import React, { useEffect, useState } from 'react';
import { socket } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export function PushNotificationManager() {
  const navigate = useNavigate();
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      // We will only request permission explicitly when the user does something,
      // but for demonstration we request it right away if it's default.
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setPermission);
      }
    }
  }, []);

  useEffect(() => {
    const handleMatchSoon = (data: any) => {
      if (permission === 'granted' && 'Notification' in window) {
        const notification = new Notification('Match Starting Soon!', {
          body: `Your match in ${data.tournamentName} is starting in less than 15 minutes!`,
        });
        
        notification.onclick = () => {
          window.focus();
          navigate('/match');
          notification.close();
        };
      }
    };

    socket.on('match_starting_soon', handleMatchSoon);

    return () => {
      socket.off('match_starting_soon', handleMatchSoon);
    };
  }, [permission, navigate]);

  return null;
}
