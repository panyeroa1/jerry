
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

import ControlTray from './components/console/control-tray/ControlTray';
import ErrorScreen from './components/demo/ErrorScreen';
import StreamingConsole from './components/demo/streaming-console/StreamingConsole';
import { useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { LiveAPIProvider } from './contexts/LiveAPIContext';
import { useUI } from './lib/state';

const API_KEY = process.env.API_KEY as string;
if (typeof API_KEY !== 'string') {
  throw new Error(
    'Missing required environment variable: process.env.API_KEY'
  );
}

/**
 * Main application component that provides a streaming interface for Live API.
 * Manages video streaming state and provides controls for webcam/screen capture.
 */
function App() {
  const { theme } = useUI();
  
  // Request Wake Lock to prevent background throttling
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
        // Feature check
        if ('wakeLock' in navigator) {
            try {
                // @ts-ignore
                wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake Lock active');
            } catch (err: any) {
                // Ignore specific permission errors which are common in IFrames/Sandboxes
                if (err.name === 'NotAllowedError') {
                    console.debug('Wake Lock not allowed by permission policy. Running without it.');
                } else {
                    console.warn('Wake Lock failed:', err);
                }
            }
        }
    };
    
    // Initial request
    requestWakeLock();
    
    // Re-request on visibility change (wake locks are released when tab is hidden)
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            requestWakeLock();
        }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
        if (wakeLock) {
            try {
                wakeLock.release();
            } catch (e) {
                // ignore
            }
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="App" data-theme={theme}>
      <LiveAPIProvider apiKey={API_KEY}>
        <ErrorScreen />
        <Header />
        <Sidebar />
        <div className="streaming-console">
          <main>
            <div className="main-app-area">
              <StreamingConsole />

            </div>

            <ControlTray></ControlTray>
          </main>
        </div>
      </LiveAPIProvider>
    </div>
  );
}

export default App;
