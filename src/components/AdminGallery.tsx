import React from 'react';
import { EmptyState } from './ui/EmptyState';
import { Image as ImageIcon } from 'lucide-react';

export default function AdminGallery() {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3><ImageIcon size={24} className="inline-block mr-2" /> GALLERY MANAGER</h3>
      </div>
      <div className="admin-card-body" style={{ padding: '40px' }}>
        <EmptyState 
          icon={ImageIcon} 
          title="No Uploads Yet" 
          description="Upload and manage gallery images and media assets." 
          action={<button className="btn-card-cta" style={{marginTop: '16px'}}>Upload Media</button>}
        />
      </div>
    </div>
  );
}
