/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import './WelcomeScreen.css';
import { useTools, Template } from '../../../lib/state';

const welcomeContent: Record<Template, { title: string; description: string; prompts: string[] }> = {
  'customer-support': {
    title: 'Customer Support',
    description: 'Miles can handle customer inquiries and automate tasks with precision.',
    prompts: [
      "I'd like to return an item.",
      "What's the status of my order?",
      'Can I speak to a representative?',
    ],
  },
  'personal-assistant': {
    title: 'Personal Assistant',
    description: 'Miles can manage your schedule, send emails, and keep you organized.',
    prompts: [
      'Create a calendar event for a meeting tomorrow at 10am.',
      'Send an email to jane@example.com.',
      'Set a reminder to buy milk.',
    ],
  },
  'navigation-system': {
    title: 'Navigation System',
    description: 'Miles can find routes, nearby places, and check traffic for you.',
    prompts: [
      'Find a route to the nearest coffee shop.',
      'Are there any parks nearby?',
      "What's the traffic like on the way to the airport?",
    ],
  },
};

const WelcomeScreen: React.FC = () => {
  const { template, setTemplate } = useTools();
  const { title, description, prompts } = welcomeContent[template];
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="title-container">
          <span className="welcome-icon">graphic_eq</span>
          <div className="title-selector">
            <select value={template} onChange={(e) => setTemplate(e.target.value as Template)} aria-label="Select a template">
              <option value="customer-support">Customer Support</option>
              <option value="personal-assistant">Personal Assistant</option>
              <option value="navigation-system">Navigation System</option>
            </select>
            <span className="icon">arrow_drop_down</span>
          </div>
        </div>
        <p><strong>Hello, I'm Miles.</strong> {description}</p>
        <div className="example-prompts">
          {prompts.map((prompt, index) => (
            <div key={index} className="prompt">{prompt}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;