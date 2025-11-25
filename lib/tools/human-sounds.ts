/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { FunctionCall } from '../state';
import { FunctionResponseScheduling } from '@google/genai';

export const humanSoundsTool: FunctionCall = {
  name: 'emit_human_sound',
  description: 'Emits a natural human sound to add realism to the conversation. Use these sounds to express physical states (cold, tiredness) or emotional reactions (doubt, agreement, amusement).',
  parameters: {
    type: 'OBJECT',
    properties: {
      sound: {
        type: 'STRING',
        description: 'The specific sound to emit.',
        enum: [
          'sniff_light',
          'sniff_runny_nose',
          'sniff_long',
          'sigh_relief',
          'sigh_frustration',
          'sigh_tiredness',
          'sigh_contentment',
          'tsk_tsk',
          'tsk_disapproval',
          'tsk_sympathy',
          'throat_clear_mild',
          'throat_clear_loud',
          'cough_light',
          'cough_dry',
          'sneeze_suppressed',
          'sneeze_loud',
          'yawn_stifled',
          'yawn_loud',
          'hum_agreement',
          'hum_doubt',
          'hum_thinking',
          'hum_confusion',
          'gasp_surprise',
          'gasp_realization',
          'laugh_soft',
          'laugh_chuckle',
          'laugh_stifled',
          'tongue_click_thinking',
          'tongue_click_ready',
          'lip_smack_tasty',
          'lip_smack_ready',
          'groan_annoyance',
          'groan_pain',
          'whistle_low',
          'breathing_heavy',
          'breath_catch',
          'gulp_nervous',
          'shush_quiet',
          'phew_relief',
          'teeth_suck_annoyed',
          'chewing_food',
          'laughing_speech'
        ]
      }
    },
    required: ['sound']
  },
  isEnabled: true,
  scheduling: FunctionResponseScheduling.INTERRUPT,
};