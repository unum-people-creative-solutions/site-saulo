'use client';

import { useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';
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
      <ArrowDown className="scroll-cue__icon" strokeWidth={1.25} aria-hidden="true" />
    </div>
  );
}
