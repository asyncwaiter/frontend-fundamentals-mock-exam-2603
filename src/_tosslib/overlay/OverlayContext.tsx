import { createContext, ReactNode, useContext, useState, useCallback, useMemo } from 'react';

type OverlayElement = ReactNode;

interface OverlayContextValue {
  open: (id: string, element: OverlayElement) => void;
  close: (id: string) => void;
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [overlays, setOverlays] = useState<Map<string, OverlayElement>>(new Map());

  const open = useCallback((id: string, element: OverlayElement) => {
    setOverlays(prev => new Map(prev).set(id, element));
  }, []);

  const close = useCallback((id: string) => {
    setOverlays(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <OverlayContext.Provider value={value}>
      {children}
      {[...overlays.entries()].map(([id, element]) => (
        <div key={id}>{element}</div>
      ))}
    </OverlayContext.Provider>
  );
}

export function useOverlayContext() {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error('OverlayProvider가 필요합니다.');
  return ctx;
}
