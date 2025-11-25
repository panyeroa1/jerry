
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { FunctionCall } from '../state';
import { FunctionResponseScheduling } from '@google/genai';

export const singingTool: FunctionCall = {
  name: 'sing_professional',
  description: 'Sings a song snippet (intro, chorus, bridge, or outro) like a professional singer. Use this to demonstrate high-quality vocal performance with specific emotion and genre.',
  parameters: {
    type: 'OBJECT',
    properties: {
      songName: {
        type: 'STRING',
        description: 'The name of the song to sing.',
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
    required: ['part', 'emotion'],
  },
  isEnabled: true,
  scheduling: FunctionResponseScheduling.INTERRUPT,
};
