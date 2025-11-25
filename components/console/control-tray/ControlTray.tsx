
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import cn from 'classnames';

import { memo, ReactNode, useEffect, useRef, useState } from 'react';
import { AudioRecorder } from '../../../lib/audio-recorder';
import { useSettings, useTools, useLogStore, useUI } from '@/lib/state';
import AudioPulse from '../../audio-pulse/AudioPulse';

import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';

export type ControlTrayProps = {
  children?: ReactNode;
};

function ControlTray({ children }: ControlTrayProps) {
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);
  const connectButtonRef = useRef<HTMLButtonElement>(null);

  const { client, connected, connect, disconnect, volume: agentVolume } = useLiveAPIContext();
  const { toggleChat, isChatOpen } = useUI();
  const { turns } = useLogStore();
  
  // Silence Detection Refs
  const lastActivityRef = useRef<number>(Date.now());
  const silenceTimerRef = useRef<any>(null);
  const userVolumeRef = useRef<number>(0);

  useEffect(() => {
    if (!connected && connectButtonRef.current) {
      connectButtonRef.current.focus();
    }
  }, [connected]);

  useEffect(() => {
    if (!connected) {
      setMuted(false);
    }
  }, [connected]);

  // Silence Detection Logic
  useEffect(() => {
    if (!connected || muted) {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        return;
    }

    const checkSilence = () => {
        const now = Date.now();
        const timeSinceActivity = now - lastActivityRef.current;
        const SILENCE_THRESHOLD_MS = 7000; // 7 seconds

        // If silence detected, trigger system prompt
        if (timeSinceActivity > SILENCE_THRESHOLD_MS) {
             console.log("Silence detected. Triggering prompt.");
             useLogStore.getState().addTurn({
                 role: 'system',
                 text: `[SYSTEM_NOTIFICATION]: The user has been silent for 7 seconds. You are Jerry. Do NOT say you received a notification. Instead, break the silence naturally:
                 - Sing a short chorus or intro (use sing_snippet tool).
                 - Hum a tune.
                 - Say a "hugot" line.
                 - Ask "Boss, nandyan ka pa?"
                 Act bored or like you're waiting.`,
                 isFinal: true
             });
             // Reset timer to avoid spamming
             lastActivityRef.current = Date.now();
        }
    };

    const interval = setInterval(checkSilence, 1000);
    return () => clearInterval(interval);
  }, [connected, muted]);

  // Monitor Activity (User Voice, Agent Voice, Chat)
  useEffect(() => {
     // If agent is speaking, reset timer
     if (agentVolume > 0.01) {
         lastActivityRef.current = Date.now();
     }
  }, [agentVolume]);

  useEffect(() => {
      // If chat updates, reset timer
      lastActivityRef.current = Date.now();
  }, [turns.length]);

  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([
        {
          mimeType: 'audio/pcm;rate=16000',
          data: base64,
        },
      ]);
    };

    const onVolume = (vol: number) => {
        userVolumeRef.current = vol;
        if (vol > 0.01) {
            lastActivityRef.current = Date.now();
        }
    };

    if (connected && !muted && audioRecorder) {
      audioRecorder.on('data', onData);
      audioRecorder.on('volume', onVolume);
      audioRecorder.start();
    } else {
      audioRecorder.stop();
    }
    return () => {
      audioRecorder.off('data', onData);
      audioRecorder.off('volume', onVolume);
    };
  }, [connected, client, muted, audioRecorder]);

  const handleMicClick = () => {
    if (connected) {
      setMuted(!muted);
    } else {
      connect();
    }
  };

  const micButtonTitle = connected
    ? muted
      ? 'Unmute microphone'
      : 'Mute microphone'
    : 'Connect and start microphone';

  const connectButtonTitle = connected ? 'Stop streaming' : 'Start streaming';

  return (
    <section className="control-tray">
      <nav className={cn('actions-nav')}>
        <button
          className={cn('action-button mic-button')}
          onClick={handleMicClick}
          title={micButtonTitle}
        >
          {!muted ? (
            <span className="material-symbols-outlined filled">mic</span>
          ) : (
            <span className="material-symbols-outlined filled">mic_off</span>
          )}
        </button>

        <div className="action-button no-action outlined">
          <AudioPulse audioRecorder={audioRecorder} active={connected && !muted} />
        </div>

        <button
          className={cn('action-button', { active: isChatOpen })}
          onClick={toggleChat}
          aria-label="Toggle Chat"
          title="Open Chat & Transcription"
        >
          <span className="material-symbols-outlined icon">
            {isChatOpen ? 'chat_bubble' : 'chat_bubble_outline'}
          </span>
        </button>
        
        <button
          className={cn('action-button')}
          onClick={useLogStore.getState().clearTurns}
          aria-label="Reset Chat"
          title="Reset session logs"
        >
          <span className="icon">refresh</span>
        </button>
        {children}
      </nav>

      <div className={cn('connection-container', { connected })}>
        <div className="connection-button-container">
          <button
            ref={connectButtonRef}
            className={cn('action-button connect-toggle', { connected })}
            onClick={connected ? disconnect : connect}
            title={connectButtonTitle}
          >
            <span className="material-symbols-outlined filled">
              {connected ? 'pause' : 'play_arrow'}
            </span>
          </button>
        </div>
        <span className="text-indicator">Streaming</span>
      </div>
    </section>
  );
}

export default memo(ControlTray);
