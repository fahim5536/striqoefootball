import React, { useState, useEffect, useCallback } from 'react';
import { Camera, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface GalleryImage {
  id: string;
  imageUrl: string;
  caption?: string;
  uploadedAt?: number;
}

export default function PremiumGallery({ images }: { images: GalleryImage[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  }, [lightboxIndex, images.length]);

  const showPrev = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
    }
  }, [lightboxIndex, images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, showNext, showPrev]);

  if (images.length === 0) {
    return (
      <div className="premium-gallery-empty">
        <ImageIcon size={48} className="empty-icon" />
        <h3 className="empty-title">NO MOMENTS YET</h3>
        <p className="empty-desc">The competition is just getting started. Check back later for epic tournament highlights.</p>
      </div>
    );
  }

  return (
    <>
      <div className="premium-gallery-grid">
        {images.map((img, index) => {
          const isFeatured = index === 0 && images.length >= 3;
          return (
            <div 
              key={img.id || index} 
              className={`premium-gallery-item ${isFeatured ? 'featured' : ''}`}
              onClick={() => openLightbox(index)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openLightbox(index);
                }
              }}
              role="button"
              aria-label={`View full image ${img.caption ? '- ' + img.caption : ''}`}
            >
              <img src={img.imageUrl} alt={img.caption || 'Tournament moment'} loading="lazy" />
              <div className="item-overlay">
                <div className="item-content">
                  {isFeatured && <div className="featured-badge">FEATURED MOMENT</div>}
                  {img.caption && <div className="item-caption">{img.caption}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {lightboxIndex !== null && (
        <div 
          className="premium-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery lightbox"
        >
          <div className="lightbox-backdrop" onClick={closeLightbox}></div>
          <div className="lightbox-container">
            <button 
              className="lightbox-close" 
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <X size={24} />
            </button>
            
            <div className="lightbox-content">
              <button className="nav-btn prev" onClick={showPrev} aria-label="Previous image">
                <ChevronLeft size={36} />
              </button>
              
              <div className="lightbox-image-wrapper">
                <img 
                  src={images[lightboxIndex].imageUrl} 
                  alt={images[lightboxIndex].caption || 'Full size tournament moment'} 
                />
                {images[lightboxIndex].caption && (
                  <div className="lightbox-caption">
                    {images[lightboxIndex].caption}
                  </div>
                )}
              </div>

              <button className="nav-btn next" onClick={showNext} aria-label="Next image">
                <ChevronRight size={36} />
              </button>
            </div>
            
            <div className="lightbox-counter">
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
