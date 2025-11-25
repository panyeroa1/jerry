
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useUI } from '@/lib/state';

export default function Header() {
  const { toggleSidebar, theme, toggleTheme } = useUI();

  return (
    <header>
      <div className="header-left">
        <h1>Jerry</h1>
        <p>Voice Companion</p>
      </div>
      <div className="header-right">
        <button 
            className="theme-button"
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
            <span className="material-symbols-outlined">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
        </button>
        <button
          className="settings-button"
          onClick={toggleSidebar}
          aria-label="Settings"
        >
          <span className="icon">tune</span>
        </button>
      </div>
    </header>
  );
}
