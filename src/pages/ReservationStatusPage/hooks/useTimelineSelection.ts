import { useState, useCallback } from 'react';
import { TIME_SLOTS } from 'constants/reservation';

interface TimelineSelection {
  roomId: string;
  startTime: string;
  endTime: string | null;
}

/**
 * 타임라인에서 빈 영역을 2번 클릭하여 시간 범위를 선택하는 훅.
 * 첫 번째 클릭 → 시작 시간, 두 번째 클릭 → 종료 시간 → onComplete 호출.
 */
export function useTimelineSelection(onComplete: (roomId: string, startTime: string, endTime: string) => void) {
  const [selection, setSelection] = useState<TimelineSelection | null>(null);

  const handleSlotClick = useCallback((roomId: string, time: string) => {
    setSelection(prev => {
      // 다른 회의실을 클릭하면 처음부터
      if (prev && prev.roomId !== roomId) {
        return { roomId, startTime: time, endTime: null };
      }

      // 첫 번째 클릭: 시작 시간 설정
      if (!prev) {
        return { roomId, startTime: time, endTime: null };
      }

      // 두 번째 클릭: 시작 시간 이전이면 새로운 시작으로 초기화
      if (time <= prev.startTime) {
        return { roomId, startTime: time, endTime: null };
      }

      onComplete(roomId, prev.startTime, nextSlot(time));
      return null;
    });
  }, [onComplete]);

  const clearSelection = useCallback(() => setSelection(null), []);

  return { selection, handleSlotClick, clearSelection };
}

/** 주어진 시간의 다음 30분 슬롯을 반환 */
function nextSlot(time: string): string {
  const idx = TIME_SLOTS.indexOf(time);
  return idx >= 0 && idx < TIME_SLOTS.length - 1
    ? TIME_SLOTS[idx + 1]
    : TIME_SLOTS[TIME_SLOTS.length - 1];
}
