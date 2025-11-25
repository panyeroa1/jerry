/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import './PopUp.css';

interface PopUpProps {
  onClose: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Meet Miles</h2>
        <p>Welcome to the Miles AI interface. This sandbox demonstrates advanced native audio streaming and function calling capabilities.</p>
        <p>To get started:</p>
        <ol>
          <li><span className="icon">play_circle</span>Press Play to wake Miles up.</li>
          <li><span className="icon">graphic_eq</span>Speak naturally—Miles is listening.</li>
          <li><span className="icon">auto_awesome</span>Use the Code Assistant to customize Miles' behavior.</li>
        </ol>
        <button onClick={onClose}>Start Speaking</button>
      </div>
    </div>
  );
};

export default PopUp;