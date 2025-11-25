
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef } from 'react';
import './Orb.css';
import { useLiveAPIContext } from '@/contexts/LiveAPIContext';

export default function Orb() {
  const { volume } = useLiveAPIContext();
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (orbRef.current) {
        // Dynamic scaling based on volume
        // Base scale 1, max scale ~1.5
        // Smooth transition handled by CSS transition
        const scale = 1 + Math.min(volume * 3, 0.8);
        orbRef.current.style.transform = `scale(${scale})`;
    }
  }, [volume]);

  return (
    <div className="orb-container">
      <div className="orb-glow" style={{ opacity: 0.3 + volume }}></div>
      <div className="orb" ref={orbRef}>
        <div className="orb-layer layer-1"></div>
        <div className="orb-layer layer-2"></div>
        <div className="orb-layer layer-3"></div>
      </div>
    </div>
  );
}
