
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { FunctionCall } from '../state';
import { FunctionResponseScheduling } from '@google/genai';

export const singingTool: FunctionCall = {
  name: 'sing_snippet',
  description: 'Sings a short snippet (intro, chorus, or bridge) of a song. Use this when the user is unresponsive, to fill silence, or when specifically asked to sing. You should act like a professional singer.',
  parameters: {
    type: 'OBJECT',
    properties: {
      songName: {
        type: 'STRING',
        description: 'The name of the song to sing (optional). If not provided, pick a classic Filipino love song or a popular international hit.',
      },
      genre: {
        type: 'STRING',
        description: 'The genre of the song (e.g., ballad, pop, r&b).',
      },
      part: {
        type: 'STRING',
        description: 'The part of the song to sing.',
        enum: ['intro', 'chorus', 'bridge', 'outro'],
      },
      emotion: {
        type: 'STRING',
        description: 'The emotion to convey while singing.',
        enum: ['romantic', 'sad', 'energetic', 'playful', 'sentimental'],
      },
    },
  },
  isEnabled: true,
  scheduling: FunctionResponseScheduling.INTERRUPT,
};
