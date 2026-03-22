import { css } from '@emotion/react';
import { useState } from 'react';
import { Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { HOUR_LABELS, TOTAL_MINUTES } from 'domains/reservation/constants';
import { timeToMinutes } from 'domains/reservation/utils';
import type { Room, Reservation } from 'domains/reservation/types';
import { TimelineRow } from './TimelineRow';

interface TimelineSelection {
  roomId: string;
  startTime: string;
  endTime: string | null;
}

interface Props {
  rooms: Room[];
  reservations: Reservation[];
  selection?: TimelineSelection | null;
  onSlotClick?: (roomId: string, time: string) => void;
}

export function Timeline({ rooms, reservations, selection, onSlotClick }: Props) {
  const [activeReservation, setActiveReservation] = useState<string | null>(null);

  return (
    <div css={css`background: ${colors.grey50}; border-radius: 14px; padding: 16px;`}>
      {/* 시간 헤더 */}
      <div css={css`display: flex; align-items: flex-end; margin-bottom: 8px;`}>
        <div css={css`width: 80px; flex-shrink: 0; padding-right: 8px;`} />
        <div css={css`flex: 1; position: relative; height: 18px;`}>
          {HOUR_LABELS.map(t => {
            const left = (timeToMinutes(t) / TOTAL_MINUTES) * 100;
            return (
              <Text
                key={t}
                typography="t7"
                fontWeight="regular"
                color={colors.grey400}
                css={css`
                  position: absolute; left: ${left}%; transform: translateX(-50%);
                  font-size: 10px; letter-spacing: -0.3px;
                `}
              >
                {t.slice(0, 2)}
              </Text>
            );
          })}
        </div>
      </div>

      {rooms.map((room, index) => (
        <TimelineRow
          key={room.id}
          room={room}
          reservations={reservations.filter(r => r.roomId === room.id)}
          activeReservation={activeReservation}
          onToggle={id => setActiveReservation(activeReservation === id ? null : id)}
          isFirst={index === 0}
          selection={selection?.roomId === room.id ? selection : null}
          onSlotClick={onSlotClick ? (time) => onSlotClick(room.id, time) : undefined}
        />
      ))}
    </div>
  );
}
