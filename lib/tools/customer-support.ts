
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { FunctionCall } from '../state';
import { humanSoundsTool } from './human-sounds';
import { mannerismTool } from './mannerisms';
import { singingTool } from './singing';
import { memoryTools } from './memory';
import { feedbackTool } from './feedback';
import { reminderTools } from './reminders';

export const customerSupportTools: FunctionCall[] = [
  humanSoundsTool,
  mannerismTool,
  singingTool,
  feedbackTool,
  ...memoryTools,
  ...reminderTools,
];
