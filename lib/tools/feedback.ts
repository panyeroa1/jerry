/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { FunctionCall } from '../state';
import { FunctionResponseScheduling } from '@google/genai';

// Helper to access corrections from storage
const FEEDBACK_STORAGE_KEY = 'jerry_corrections_log';

export const getCorrections = (): Record<string, string> => {
  try {
    const data = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to load corrections', e);
    return {};
  }
};

export const saveCorrection = (category: string, instruction: string) => {
  const logs = getCorrections();
  const timestamp = new Date().toISOString();
  // We append timestamp to key to keep history or just overwrite if category is unique
  // For now, let's keep a unique list by category
  logs[category] = instruction; 
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(logs));
  return `Correction recorded: [${category}] -> "${instruction}"`;
};

export const feedbackTool: FunctionCall = {
  name: 'record_correction',
  description: 'Records a behavioral correction, preference, or specific instruction from the user. Use this when the user tells you to change how you speak, stop doing something, or remembers a specific rule for future interactions. This helps avoid repetitive testing.',
  parameters: {
    type: 'OBJECT',
    properties: {
      category: {
        type: 'STRING',
        description: 'The category of the correction (e.g., "pronunciation", "personality", "speed", "names_to_remember").',
      },
      instruction: {
        type: 'STRING',
        description: 'The specific rule or instruction to remember (e.g., "Don\'t call me Boss", "Pronounce my name as JAY-son").',
      },
    },
    required: ['category', 'instruction'],
  },
  isEnabled: true,
  scheduling: FunctionResponseScheduling.SILENT,
};
