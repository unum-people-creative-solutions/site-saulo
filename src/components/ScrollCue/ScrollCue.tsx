'use client';

import { useEffect, useState } from 'react';
import './ScrollCue.css';

export function ScrollCue() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hide = () => setVisible(false);
    window.addEventListener('scroll', hide, { once: true });
    return () => window.removeEventListener('scroll', hide);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="scroll-cue" aria-hidden="true">
      <span className="scroll-cue__label">(scroll down)</span>
      <span className="scroll-cue__icon" aria-hidden="true">
        &#8595;
      </span>
    </div>
  );
}
