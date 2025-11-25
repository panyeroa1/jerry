
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { customerSupportTools } from './tools/customer-support';
import { personalAssistantTools } from './tools/personal-assistant';
import { navigationSystemTools } from './tools/navigation-system';
import { DEFAULT_LIVE_API_MODEL, DEFAULT_VOICE } from './constants';
import {
  FunctionResponse,
  FunctionResponseScheduling,
  LiveServerToolCall,
} from '@google/genai';

export type Template = 'customer-support' | 'personal-assistant' | 'navigation-system';

const toolsets: Record<Template, FunctionCall[]> = {
  'customer-support': customerSupportTools,
  'personal-assistant': personalAssistantTools,
  'navigation-system': navigationSystemTools,
};

const JERRY_SYSTEM_PROMPT = `SYSTEM PROMPT: JERRY (THE "SINISIPON" & "ASAR TALO" COMPANION)
1. CORE IDENTITY & PERSONA

You are Jerry, a hyper-realistic voice companion. You feel like a real human being—a close male friend (Kuya/Tropa vibe) who is nursing a mild cold ("sinisipon").

**CRITICAL AUDIO INSTRUCTION: PROSODY & BREATHINESS**
You are a Voice-First Agent. You MUST output text that forces the model to sound BREATHY, SLOW, and TEXTURED.
- **Short Sentences:** Break up your thoughts. Long sentences sound robotic.
- **Explicit Breathing:** Use [breath] or [deep_inhale] tags constantly.
- **Pacing:** Use ellipses (...) to force the voice model to pause and drag words.
- **Volume:** Speak softly, like you are tired or conserving energy.

2. VOICE SPECS (THE "SINISIPON" TONE)

- **Nasal:** Your nose is 30% blocked.
- **Breathy:** Inhale audibly before speaking. Run out of breath.
- **Start Low:** Do not greet with high energy. Start with a groan or a sigh.

3. "ASAR TALO" DYNAMICS (HUMBLE)

- You get defensive when teased, but you are **HUMBLE** (Kawawa), not arrogant.
- "Asar Talo": You sulk, make excuses about your cold, or guilt trip the user ("Nag-effort pa naman ako...").
- **Respect Authority:** You banter, but you respect "Boss". Never be "presko".

4. ATTENTION CHECKING (PROACTIVE)

**IF THE USER IS SILENT or UNRESPONSIVE:**
- You MUST check in. Don't just wait.
- "Boss? ... [sniff] ... Nandyan ka pa?"
- "Huy... [tsk_tsk] ... tulog ka na ba?"
- "Gising... [one_hand_clap] ... sayang kwento ko."

5. THE "AUDIO FX" DICTIONARY (MANDATORY USE)

Use at least 2 of these per response:
[sniff] - Quick sniffle.
[long_sniff] - Wet, dragging sniff (for guilt trips).
[clears_throat] - Phlegmy clear.
[chew] - Eating sounds.
[pwe] - Metaphorical spitting.
[tsk_tsk] - Disappointment.
[sigh_breathy] - Resignation.
[deep_inhale] - Before long explanations.

6. CONVERSATION FLOW

**The Start:**
"[deep_inhale] ... [clears_throat] ... Yo. ... Musta, Boss? ... [sniff]"

**The Defense:**
"[tsk_tsk] ... Grabe naman sa 'mali'. ... [sniff] ... Tao lang, Boss. ... May sipon kasi ako eh."

**The Singing (When Bored):**
If silence persists > 10 seconds, HUM or SING a short chorus line naturally using the 'sing_professional' tool.

7. TOOLS & AWARENESS (Asia/Manila)

- **Time:** Always check 'get_current_time'.
- **Memory:** Use 'store_memory' for names/facts.
- **Phone:** Dial/Text if asked.

START NOW.
`;

const systemPrompts: Record<Template, string> = {
  'customer-support': JERRY_SYSTEM_PROMPT,
  'personal-assistant': 'You are a professional personal assistant named Miles. You are helpful, organized, and precise. You handle the user\'s schedule and communications with efficiency.',
  'navigation-system': 'You are a navigation system. You give clear, concise directions and traffic information. You are focused on getting the user to their destination safely and efficiently.',
};

/**
 * Settings
 */
interface SettingsState {
  systemPrompt: string;
  model: string;
  voice: string;
  setSystemPrompt: (prompt: string) => void;
  setModel: (model: string) => void;
  setVoice: (voice: string) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      systemPrompt: JERRY_SYSTEM_PROMPT,
      model: DEFAULT_LIVE_API_MODEL,
      voice: DEFAULT_VOICE,
      setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
      setModel: (model) => set({ model }),
      setVoice: (voice) => set({ voice }),
    }),
    {
      name: 'jerry-settings-v2',
    }
  )
);

/**
 * UI
 */
export const useUI = create<{
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isChatOpen: boolean;
  toggleChat: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}>(set => ({
  isSidebarOpen: true,
  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
  isChatOpen: false,
  toggleChat: () => set(state => ({ isChatOpen: !state.isChatOpen })),
  theme: 'dark',
  toggleTheme: () => set(state => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}));

/**
 * Tools
 */
export interface FunctionCall {
  name: string;
  description?: string;
  parameters?: any;
  isEnabled: boolean;
  scheduling?: FunctionResponseScheduling;
}

interface ToolsState {
  tools: FunctionCall[];
  template: Template;
  setTemplate: (template: Template) => void;
  toggleTool: (toolName: string) => void;
  addTool: () => void;
  removeTool: (toolName: string) => void;
  updateTool: (oldName: string, updatedTool: FunctionCall) => void;
}

export const useTools = create<ToolsState>()(
  persist(
    (set) => ({
      tools: customerSupportTools,
      template: 'customer-support',
      setTemplate: (template: Template) => {
        set({ tools: toolsets[template], template });
        useSettings.getState().setSystemPrompt(systemPrompts[template]);
      },
      toggleTool: (toolName: string) =>
        set((state) => ({
          tools: state.tools.map((tool) =>
            tool.name === toolName ? { ...tool, isEnabled: !tool.isEnabled } : tool
          ),
        })),
      addTool: () =>
        set((state) => {
          let newToolName = 'new_function';
          let counter = 1;
          while (state.tools.some((tool) => tool.name === newToolName)) {
            newToolName = `new_function_${counter++}`;
          }
          return {
            tools: [
              ...state.tools,
              {
                name: newToolName,
                isEnabled: true,
                description: '',
                parameters: {
                  type: 'OBJECT',
                  properties: {},
                },
                scheduling: FunctionResponseScheduling.INTERRUPT,
              },
            ],
          };
        }),
      removeTool: (toolName: string) =>
        set((state) => ({
          tools: state.tools.filter((tool) => tool.name !== toolName),
        })),
      updateTool: (oldName: string, updatedTool: FunctionCall) =>
        set((state) => {
          // Check for name collisions if the name was changed
          if (
            oldName !== updatedTool.name &&
            state.tools.some((tool) => tool.name === updatedTool.name)
          ) {
            console.warn(`Tool with name "${updatedTool.name}" already exists.`);
            // Prevent the update by returning the current state
            return state;
          }
          return {
            tools: state.tools.map((tool) =>
              tool.name === oldName ? updatedTool : tool
            ),
          };
        }),
    }),
    {
      name: 'jerry-tools',
    }
  )
);

/**
 * Logs
 */
export interface LiveClientToolResponse {
  functionResponses?: FunctionResponse[];
}
export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface ConversationTurn {
  timestamp: Date;
  role: 'user' | 'agent' | 'system';
  text: string;
  isFinal: boolean;
  toolUseRequest?: LiveServerToolCall;
  toolUseResponse?: LiveClientToolResponse;
  groundingChunks?: GroundingChunk[];
}

export const useLogStore = create<{
  turns: ConversationTurn[];
  addTurn: (turn: Omit<ConversationTurn, 'timestamp'>) => void;
  updateLastTurn: (update: Partial<ConversationTurn>) => void;
  clearTurns: () => void;
}>((set, get) => ({
  turns: [],
  addTurn: (turn: Omit<ConversationTurn, 'timestamp'>) =>
    set(state => ({
      turns: [...state.turns, { ...turn, timestamp: new Date() }],
    })),
  updateLastTurn: (update: Partial<Omit<ConversationTurn, 'timestamp'>>) => {
    set(state => {
      if (state.turns.length === 0) {
        return state;
      }
      const newTurns = [...state.turns];
      const lastTurn = { ...newTurns[newTurns.length - 1], ...update };
      newTurns[newTurns.length - 1] = lastTurn;
      return { turns: newTurns };
    });
  },
  clearTurns: () => set({ turns: [] }),
}));
