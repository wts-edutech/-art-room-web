"use client";

import { useEffect, useRef } from 'react';

export default function VisitorTracker() {
  const tracked = useRef(false);

  useEffect(() => {
    // Only track once per session
    if (tracked.current) return;
    if (typeof window === 'undefined') return;
    
    const hasVisited = sessionStorage.getItem('hasVisited');
    
    if (!hasVisited) {
      tracked.current = true;
      sessionStorage.setItem('hasVisited', 'true');
      
      // Call API to increment visitor count
      fetch('/api/visitors', {
        method: 'POST',
      }).catch(err => console.error('Failed to track visitor', err));
    }
  }, []);

  return null; // This component doesn't render anything
}
