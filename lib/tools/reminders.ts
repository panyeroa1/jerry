
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { FunctionCall } from '../state';
import { FunctionResponseScheduling } from '@google/genai';

const REMINDERS_KEY = 'jerry_critical_reminders';
const CALENDAR_KEY = 'jerry_calendar_events';

// Storage Helpers
export const getReminders = (): any[] => {
  try { return JSON.parse(localStorage.getItem(REMINDERS_KEY) || '[]'); } catch { return []; }
};

export const getCalendar = (): any[] => {
  try { return JSON.parse(localStorage.getItem(CALENDAR_KEY) || '[]'); } catch { return []; }
};

export const saveReminder = (note: string, priority: string, date?: string) => {
  const list = getReminders();
  list.push({ note, priority, date, timestamp: new Date().toISOString() });
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(list));
  return `Critical Reminder Saved: "${note}" [Priority: ${priority}]`;
};

export const saveEvent = (title: string, date: string, time: string) => {
  const list = getCalendar();
  list.push({ title, date, time, timestamp: new Date().toISOString() });
  localStorage.setItem(CALENDAR_KEY, JSON.stringify(list));
  return `Calendar Event Added: "${title}" on ${date} at ${time}`;
};

export const reminderTools: FunctionCall[] = [
  {
    name: 'set_critical_reminder',
    description: 'Saves a "Very Important" item that you must ALWAYS remember for the Boss/Master E. Use this for strict instructions, deadlines, or life-critical dates that the user emphasizes.',
    parameters: {
      type: 'OBJECT',
      properties: {
        note: {
          type: 'STRING',
          description: 'The content of the reminder (e.g., "Submit the EY report by Friday", "Master E hates being woken up before 8am").',
        },
        priority: {
          type: 'STRING',
          description: 'Importance level.',
          enum: ['high', 'critical'],
        },
        target_date: {
          type: 'STRING',
          description: 'The relevant date for this reminder, if any (YYYY-MM-DD).',
        },
      },
      required: ['note', 'priority'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.SILENT,
  },
  {
    name: 'get_current_time',
    description: 'Checks the current real-world date and time. Use this when the user asks "Anong oras na?" or when scheduling events to know what "tomorrow" means.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'manage_calendar',
    description: 'Adds or lists events in the calendar. Use this for specific appointments, meetings, or scheduled tasks.',
    parameters: {
      type: 'OBJECT',
      properties: {
        action: {
          type: 'STRING',
          enum: ['add', 'list'],
          description: 'Whether to add a new event or list existing ones.',
        },
        title: {
          type: 'STRING',
          description: 'Title of the event (required for "add").',
        },
        date: {
          type: 'STRING',
          description: 'Date of the event YYYY-MM-DD (required for "add", optional for "list").',
        },
        time: {
          type: 'STRING',
          description: 'Time of the event HH:MM (required for "add").',
        },
      },
      required: ['action'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.SILENT,
  },
];
