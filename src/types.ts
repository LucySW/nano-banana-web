export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string; // Text for user, Base64 Image for model
  textPrompt?: string; // For model messages to remember what generated them
  metadata?: {
    seed?: number;
    temp: number;
    ratio: string;
    resolution: string;
    timestamp: string;
    style?: string;
    lighting?: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}
