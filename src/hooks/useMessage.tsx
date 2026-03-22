import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export interface Message {
  type: 'success' | 'error';
  text: string;
}

interface MessageContextValue {
  message: Message | null;
  showMessage: (message: Message) => void;
  clearMessage: () => void;
}

let globalShowMessage: ((msg: Message) => void) | null = null;
export function getGlobalShowMessage() { return globalShowMessage; }

const MessageContext = createContext<MessageContextValue | null>(null);

export function MessageProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<Message | null>(null);

  const showMessage = useCallback((msg: Message) => setMessage(msg), []);
  const clearMessage = useCallback(() => setMessage(null), []);

  useEffect(() => {
    globalShowMessage = showMessage;
    return () => { globalShowMessage = null; };
  }, [showMessage]);

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
