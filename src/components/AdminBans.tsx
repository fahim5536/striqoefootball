import { Ban } from 'lucide-react';
import React from 'react';

export default function AdminBans() {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3><Ban size={24} className="inline-block mr-2" /> BANNED PLAYERS</h3>
      </div>
      <div className="admin-card-body" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#F8FAFC' }}>Manage permanently banned and suspended players here.</p>
      </div>
    </div>
  );
}
