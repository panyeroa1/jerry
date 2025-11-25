
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { FunctionCall } from '../state';
import { FunctionResponseScheduling } from '@google/genai';

const PHONEBOOK_KEY = 'jerry_phonebook';

export interface Contact {
  name: string;
  number: string;
}

export const getPhonebook = (): Contact[] => {
  try {
    const data = localStorage.getItem(PHONEBOOK_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveContact = (name: string, number: string) => {
  const contacts = getPhonebook();
  // Check if exists
  const existingIndex = contacts.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
  if (existingIndex >= 0) {
    contacts[existingIndex].number = number;
  } else {
    contacts.push({ name, number });
  }
  localStorage.setItem(PHONEBOOK_KEY, JSON.stringify(contacts));
  return `Contact saved: ${name} (${number})`;
};

export const findContact = (nameQuery: string): Contact | undefined => {
  const contacts = getPhonebook();
  const query = nameQuery.toLowerCase();
  return contacts.find(c => c.name.toLowerCase().includes(query));
};

export const deleteContact = (name: string) => {
    const contacts = getPhonebook();
    const filtered = contacts.filter(c => c.name.toLowerCase() !== name.toLowerCase());
    localStorage.setItem(PHONEBOOK_KEY, JSON.stringify(filtered));
}

export const phonebookTools: FunctionCall[] = [
  {
    name: 'dial_number',
    description: 'Initiates a phone call to a specific number. Use this when the user asks to call someone.',
    parameters: {
      type: 'OBJECT',
      properties: {
        number: {
          type: 'STRING',
          description: 'The phone number to dial.',
        },
        name: {
          type: 'STRING',
          description: 'The name of the person being called (for context).',
        },
      },
      required: ['number'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'send_sms',
    description: 'Opens the SMS app with a drafted message. Use this when the user asks to text or message someone.',
    parameters: {
      type: 'OBJECT',
      properties: {
        recipient_name: {
            type: 'STRING',
            description: 'The name of the recipient (to look up in phonebook).',
        },
        number: {
            type: 'STRING',
            description: 'The phone number (optional if name is found in phonebook).',
        },
        message: {
          type: 'STRING',
          description: 'The content of the message to send.',
        },
      },
      required: ['message'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'search_contact',
    description: 'Looks up a contact in the saved phonebook.',
    parameters: {
      type: 'OBJECT',
      properties: {
        name: {
          type: 'STRING',
          description: 'The name to search for.',
        },
      },
      required: ['name'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.SILENT,
  },
  {
    name: 'add_contact',
    description: 'Saves a new contact to the phonebook.',
    parameters: {
      type: 'OBJECT',
      properties: {
        name: {
          type: 'STRING',
          description: 'The name of the contact.',
        },
        number: {
          type: 'STRING',
          description: 'The phone number.',
        },
      },
      required: ['name', 'number'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.SILENT,
  },
];
