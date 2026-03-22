import { css } from '@emotion/react';
import { Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { EQUIPMENT_LABELS, TOTAL_MINUTES, TIME_SLOTS } from 'constants/reservation';
import { timeToMinutes } from 'utils/reservation';
import type { Room, Reservation } from 'models/reservation';

interface TimelineSelection {
  roomId: string;
  startTime: string;
  endTime: string | null;
}

interface Props {
  room: Room;
  reservations: Reservation[];
  activeReservation: string | null;
  onToggle: (id: string) => void;
  isFirst: boolean;
  selection?: TimelineSelection | null;
  onSlotClick?: (time: string) => void;
}

export function TimelineRow({ room, reservations, activeReservation, onToggle, isFirst, selection, onSlotClick }: Props) {
  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSlotClick) return;

    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;

    // 클릭 위치를 가장 가까운 30분 슬롯으로 스냅
    const clickedMinutes = ratio * TOTAL_MINUTES;
    const snappedMinutes = Math.round(clickedMinutes / 30) * 30;
    const slotIndex = snappedMinutes / 30;
    const time = TIME_SLOTS[Math.min(slotIndex, TIME_SLOTS.length - 1)];

    if (time) onSlotClick(time);
  };

  // 선택 중인 시작 시간 하이라이트
  const selectionLeft = selection
    ? (timeToMinutes(selection.startTime) / TOTAL_MINUTES) * 100
    : 0;

  return (
    <div css={css`display: flex; align-items: center; height: 32px; ${!isFirst ? 'margin-top: 4px;' : ''}`}>
      <div css={css`width: 80px; flex-shrink: 0; padding-right: 8px;`}>
        <Text typography="t7" fontWeight="medium" color={colors.grey700} ellipsisAfterLines={1}
          css={css`font-size: 12px;`}
        >
          {room.name}
        </Text>
      </div>
      <div
        onClick={handleBarClick}
        css={css`
          flex: 1; height: 24px; background: ${colors.white}; border-radius: 6px;
          position: relative; overflow: visible;
          ${onSlotClick ? 'cursor: crosshair;' : ''}
        `}
      >
        {/* 선택 중인 시작 시간 마커 */}
        {selection && (
          <div
            css={css`
              position: absolute; left: ${selectionLeft}%; top: 0; bottom: 0; width: 2px;
              background: ${colors.blue500}; z-index: 5;
              &::after {
                content: '${selection.startTime}';
                position: absolute; top: -16px; left: 50%; transform: translateX(-50%);
                font-size: 10px; color: ${colors.blue500}; font-weight: 600; white-space: nowrap;
              }
            `}
          />
        )}

        {reservations.map(res => {
          const left = (timeToMinutes(res.start) / TOTAL_MINUTES) * 100;
          const width = ((timeToMinutes(res.end) - timeToMinutes(res.start)) / TOTAL_MINUTES) * 100;
          const isActive = activeReservation === res.id;
          return (
            <div key={res.id} css={css`position: absolute; left: ${left}%; width: ${width}%; height: 100%;`}>
              <div
                role="button"
                aria-label={`${room.name} ${res.start}-${res.end} 예약 상세`}
                onClick={(e) => { e.stopPropagation(); onToggle(res.id); }}
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
