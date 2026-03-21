import { css } from '@emotion/react';
import { Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { EQUIPMENT_LABELS, TOTAL_MINUTES } from 'domains/reservation/constants';
import { timeToMinutes } from 'domains/reservation/utils';
import type { Room, Reservation } from 'domains/reservation/types';

interface Props {
  room: Room;
  reservations: Reservation[];
  activeReservation: string | null;
  onToggle: (id: string) => void;
  isFirst: boolean;
}

export function TimelineRow({ room, reservations, activeReservation, onToggle, isFirst }: Props) {
  return (
    <div css={css`display: flex; align-items: center; height: 32px; ${!isFirst ? 'margin-top: 4px;' : ''}`}>
      <div css={css`width: 80px; flex-shrink: 0; padding-right: 8px;`}>
        <Text typography="t7" fontWeight="medium" color={colors.grey700} ellipsisAfterLines={1}
          css={css`font-size: 12px;`}
        >
          {room.name}
        </Text>
      </div>
      <div css={css`flex: 1; height: 24px; background: ${colors.white}; border-radius: 6px; position: relative; overflow: visible;`}>
        {reservations.map(res => {
          const left = (timeToMinutes(res.start) / TOTAL_MINUTES) * 100;
          const width = ((timeToMinutes(res.end) - timeToMinutes(res.start)) / TOTAL_MINUTES) * 100;
          const isActive = activeReservation === res.id;
          return (
            <div key={res.id} css={css`position: absolute; left: ${left}%; width: ${width}%; height: 100%;`}>
              <div
                role="button"
                aria-label={`${room.name} ${res.start}-${res.end} 예약 상세`}
                onClick={() => onToggle(res.id)}
                css={css`
                  width: 100%; height: 100%; background: ${colors.blue400}; border-radius: 4px;
                  opacity: ${isActive ? 1 : 0.75}; cursor: pointer; transition: opacity 0.15s;
                  &:hover { opacity: 1; }
                `}
              />
              {isActive && (
                <div
                  role="tooltip"
                  css={css`
                    position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 6px;
                    background: ${colors.grey900}; color: ${colors.white}; padding: 8px 12px;
                    border-radius: 8px; font-size: 12px; white-space: nowrap; z-index: 10;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12); line-height: 1.6;
                  `}
                >
                  <div>{res.start} ~ {res.end}</div>
                  <div>{res.attendees}명</div>
                  {res.equipment.length > 0 && (
                    <div>{res.equipment.map(e => EQUIPMENT_LABELS[e]).join(', ')}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
