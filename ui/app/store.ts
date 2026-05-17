import { create } from 'zustand';

// 1. Define what a single Chat Message looks like
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[]; // Optional array to display the page numbers/PDF references
}

// 2. Define the structural blueprint (Type Interface) for our global store
interface ChatState {
  messages: Message[];
  isLoading: boolean;
  
  // Actions (Functions to modify the state)
  addMessage: (message: Omit<Message, 'id'>) => void;
  setIsLoading: (loading: boolean) => void;
  clearChat: () => void;
}

// 3. Create the actual hook-based store using the blueprints above
export const useChatStore = create<ChatState>((set) => ({
  // Initial State Values
  messages: [],
  isLoading: false,

  // Action: Add an incoming message and auto-generate a unique ID
  addMessage: (message) => 
    set((state) => ({
      messages: [
        ...state.messages, 
        { ...message, id: crypto.randomUUID() }
      ]
    })),

  // Action: Toggle the shimmering loading UI state
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Action: Reset the session entirely
  clearChat: () => set({ messages: [], isLoading: false })
}));