/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef } from 'react';
import { AudioRecorder } from '../../lib/audio-recorder';
import './AudioPulse.css';

interface AudioPulseProps {
  audioRecorder: AudioRecorder;
  active: boolean;
  hover?: boolean;
}

export default function AudioPulse({ audioRecorder, active, hover }: AudioPulseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const volumeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const onVolume = (vol: number) => {
      volumeRef.current = vol;
    };

    audioRecorder.on('volume', onVolume);

    return () => {
      audioRecorder.off('volume', onVolume);
    };
  }, [audioRecorder]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      if (!ctx) return;

      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Color configuration
      const activeColor = '#a1e4f2'; // var(--accent-blue)
      const inactiveColor = '#5f6368'; // var(--gray-500)
      
      ctx.fillStyle = active ? activeColor : inactiveColor;

      // 5-bar configuration
      const barCount = 5;
      const gap = 3;
      const totalGap = gap * (barCount - 1);
      const barWidth = (width - totalGap) / barCount;
      const centerY = height / 2;

      // Animation parameters
      const time = Date.now() / 150; // Speed factor
      // Non-linear sensitivity: Amplify low volumes, cap high ones
      const sensitivity = 2.5; 
      const volume = Math.min(1, Math.pow(volumeRef.current, 0.8) * sensitivity);

      for (let i = 0; i < barCount; i++) {
        // Calculate amplitude for each bar
        // Middle bar (index 2) is dominant, sides fall off
        const distanceFromCenter = Math.abs(2 - i);
        const scaleFactor = 1 - (distanceFromCenter * 0.15); // Center is 1.0, edges 0.7

        // Wave function: varying phases for "organic" look
        // If active, use volume + wave. If inactive, flat line.
        
        let barHeight = 4; // Min height

        if (active) {
            // "Breathing" idle state (volume ~0) vs Active speaking state
            const idleWave = Math.sin(time + i) * 2; 
            const activeWave = volume * (height - 6) * scaleFactor;
            
            // Combine: Base height + (Volume * Scale) + Small Idle Movement
            barHeight = 4 + activeWave + (activeWave > 2 ? 0 : idleWave * 0.5);
            
            // Ensure randomness to look like voice
            const noise = Math.random() * 2 * volume;
            barHeight += noise;
        }

        // Clamp
        barHeight = Math.max(3, Math.min(height, barHeight));

        const x = i * (barWidth + gap);
        const y = centerY - (barHeight / 2);

        ctx.beginPath();
        // Use taller corner radius for smoother look
        ctx.roundRect(x, y, barWidth, barHeight, 4);
        ctx.fill();
      }

      rafIdRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [active]);

  return (
    <div className={`audio-pulse ${active ? 'active' : ''}`}>
      <canvas ref={canvasRef} />
    </div>
  );
}