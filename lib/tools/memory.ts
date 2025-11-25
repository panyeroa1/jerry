
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { FunctionCall } from '../state';
import { FunctionResponseScheduling } from '@google/genai';

// Helper to simulate DB access via localStorage
const MEMORY_STORAGE_KEY = 'jerry_long_term_memory';

export const getStoredMemories = (): Record<string, string> => {
  try {
    const data = localStorage.getItem(MEMORY_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to load memory', e);
    return {};
  }
};

export const saveMemory = (key: string, value: string) => {
  const memories = getStoredMemories();
  memories[key] = value;
  localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories));
  return `Memory stored: [${key}] = ${value}`;
};

export const memoryTools: FunctionCall[] = [
  {
    name: 'store_memory',
    description: 'Saves a specific detail about the user or the conversation to long-term memory. Use this when the user mentions names, preferences, hobbies, or important life events.',
    parameters: {
      type: 'OBJECT',
      properties: {
        key: {
          type: 'STRING',
          description: 'The category or topic of the memory (e.g., "user_nickname", "favorite_food", "girlfriend_name").',
        },
        value: {
          type: 'STRING',
          description: 'The specific detail to remember.',
        },
      },
      required: ['key', 'value'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.SILENT,
  },
  {
    name: 'retrieve_memory',
    description: 'Retrieves stored long-term memories about the user. Use this to recall past details, impress the user, or provide personalized context.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'The topic to search for in memory (optional). If empty, returns a summary of key memories.',
        },
      },
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.SILENT,
  },
];
