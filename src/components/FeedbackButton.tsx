import React, { useState } from 'react';
import FeedbackModal from './FeedbackModal';
import { useFeatureFlag } from '../contexts/ClientConfigContext';

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const isEnabled = useFeatureFlag('BETA_FEEDBACK');

  // If the feature flag is explicitly not enabled, we hide it.
  // Wait, if it's loading, it will be false. Let's assume it should be rendered if enabled.
  if (!isEnabled) {
    return null;
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110 z-40 tooltip" 
        title="Leave Feedback"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </button>

      {isOpen && (
        <FeedbackModal onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
