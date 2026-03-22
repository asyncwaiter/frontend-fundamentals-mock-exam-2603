import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface Message {
  type: 'success' | 'error';
  text: string;
}

interface MessageContextValue {
  message: Message | null;
  showMessage: (message: Message) => void;
  clearMessage: () => void;
}

const MessageContext = createContext<MessageContextValue | null>(null);

export function MessageProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<Message | null>(null);

  const showMessage = useCallback((msg: Message) => setMessage(msg), []);
  const clearMessage = useCallback(() => setMessage(null), []);

  return (
    <MessageContext.Provider value={{ message, showMessage, clearMessage }}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessage() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within MessageProvider');
  }
  return context;
}
