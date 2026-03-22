import { useCallback, useRef } from 'react';
import { useOverlayContext } from './OverlayContext';

let overlayId = 0;

/**
 * 토스 스타일 overlay 훅.
 * overlay.open(({ close }) => <Modal onClose={close} />) 형태로 사용.
 */
export function useOverlay() {
  const { open, close } = useOverlayContext();
  const idRef = useRef(`overlay-${++overlayId}`);

  const openOverlay = useCallback(
    (render: (props: { close: () => void }) => React.ReactNode) => {
      const id = idRef.current;
      open(id, render({ close: () => close(id) }));
    },
    [open, close]
  );

  const closeOverlay = useCallback(() => {
    close(idRef.current);
  }, [close]);

  return { open: openOverlay, close: closeOverlay };
}
