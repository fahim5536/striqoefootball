import { GitBranch } from 'lucide-react';
import React from 'react';

export default function AdminBracket() {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3><GitBranch size={24} className="inline-block mr-2" /> BRACKET MANAGER</h3>
      </div>
      <div className="admin-card-body" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#F8FAFC' }}>Bracket manager interface coming soon. This will allow visual arrangement of tournament trees.</p>
      </div>
    </div>
  );
}
