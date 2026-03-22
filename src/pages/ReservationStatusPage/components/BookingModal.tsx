import { css } from '@emotion/react';
import { useState } from 'react';
import { Spacing, Text, Button, Select } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { ALL_EQUIPMENT, EQUIPMENT_LABELS } from 'constants/reservation';
import { filterAvailableRooms } from 'utils/reservationFilters';
import { useRooms } from 'hooks/useRooms';
import { useReservations } from 'hooks/useReservations';
import { useMessage } from 'hooks/useMessage';
import { useBooking } from 'pages/RoomBookingPage/hooks/useBooking';
import type { Equipment } from 'models/reservation';

interface Props {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  onClose: () => void;
}

export function BookingModal({ roomId, date, startTime, endTime, onClose }: Props) {
  const { data: rooms = [] } = useRooms();
  const { data: reservations = [] } = useReservations(date);

  const [selectedRoomId, setSelectedRoomId] = useState(roomId);
  const [attendees, setAttendees] = useState(1);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [preferredFloor, setPreferredFloor] = useState<number | null>(null);
  const { showMessage } = useMessage();

  // 필터 조건에 맞는 회의실 목록
  const availableRooms = filterAvailableRooms(
    rooms, reservations,
    { date, startTime, endTime, attendees, equipment, preferredFloor }
  );

  // 선택된 방이 필터 결과에 없으면 첫 번째 방으로 자동 전환
  const isSelectedInList = availableRooms.some(r => r.id === selectedRoomId);
  const effectiveRoomId = isSelectedInList
    ? selectedRoomId
    : availableRooms[0]?.id ?? null;

  const floors = [...new Set(rooms.map(r => r.floor))].sort((a, b) => a - b);

  const { book, isLoading } = useBooking({ onSuccess: onClose });

  const toggleEquipment = (eq: Equipment) => {
    setEquipment(prev =>
      prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]
    );
  };

  const handleBook = () => {
    if (!effectiveRoomId) {
      showMessage({ type: 'error', text: '예약 가능한 회의실이 없습니다.' });
      return;
    }

    book({
      roomId: effectiveRoomId,
      date,
      start: startTime,
      end: endTime,
      attendees,
      equipment,
    });
  };

  return (
    <div css={css`
      position: fixed; inset: 0; z-index: 100;
      display: flex; align-items: center; justify-content: center;
    `}>
      <div onClick={onClose} css={css`position: absolute; inset: 0; background: rgba(0, 0, 0, 0.4);`} />

      <div
        role="dialog"
        aria-label="빠른 예약"
        css={css`
          position: relative; width: 340px; max-height: 80vh; overflow-y: auto;
          background: ${colors.white}; border-radius: 20px;
          padding: 24px; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        `}
      >
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>빠른 예약</Text>
        <Spacing size={4} />
        <Text typography="t7" color={colors.grey400}>
          {date} {startTime} ~ {endTime}
        </Text>

        <Spacing size={16} />

        {/* 참석 인원 + 선호 층 */}
        <div css={css`display: flex; gap: 12px;`}>
          <div css={css`display: flex; flex-direction: column; gap: 6px; flex: 1;`}>
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>참석 인원</Text>
            <input
              type="number"
              min={1}
              value={attendees}
              onChange={e => setAttendees(Math.max(1, Number(e.target.value)))}
              css={inputStyle}
            />
          </div>
          <div css={css`display: flex; flex-direction: column; gap: 6px; flex: 1;`}>
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>선호 층</Text>
            <Select
              value={preferredFloor ?? ''}
              onChange={e => setPreferredFloor(e.target.value === '' ? null : Number(e.target.value))}
            >
              <option value="">전체</option>
              {floors.map(f => (
                <option key={f} value={f}>{f}층</option>
              ))}
            </Select>
          </div>
        </div>

        <Spacing size={14} />

        {/* 필요 장비 */}
        <div>
          <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>필요 장비</Text>
          <Spacing size={8} />
          <div css={css`display: flex; gap: 8px; flex-wrap: wrap;`}>
            {ALL_EQUIPMENT.map(eq => {
              const selected = equipment.includes(eq);
              return (
                <button
                  key={eq}
                  type="button"
                  onClick={() => toggleEquipment(eq)}
                  css={css`
                    padding: 6px 12px; border-radius: 16px; font-size: 13px; font-weight: 500;
                    cursor: pointer; transition: all 0.15s;
                    border: 1px solid ${selected ? colors.blue500 : colors.grey200};
                    background: ${selected ? colors.blue50 : colors.grey50};
                    color: ${selected ? colors.blue600 : colors.grey700};
                  `}
                >
                  {EQUIPMENT_LABELS[eq]}
                </button>
              );
            })}
          </div>
        </div>

        <Spacing size={14} />

        {/* 회의실 선택 */}
        <div css={css`display: flex; flex-direction: column; gap: 6px;`}>
          <div css={css`display: flex; align-items: baseline; gap: 6px;`}>
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>회의실</Text>
            <Text typography="t7" color={colors.grey400}>{availableRooms.length}개</Text>
          </div>
          {availableRooms.length === 0 ? (
            <div css={css`padding: 20px 0; text-align: center; background: ${colors.grey50}; border-radius: 12px;`}>
              <Text typography="t7" color={colors.grey500}>조건에 맞는 회의실이 없습니다.</Text>
            </div>
          ) : (
            <Select
              value={effectiveRoomId ?? ''}
              onChange={e => setSelectedRoomId(e.target.value)}
            >
              {availableRooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </Select>
          )}
        </div>

        <Spacing size={20} />

        <div css={css`display: flex; gap: 8px;`}>
          <Button display="full" style="weak" onClick={onClose}>닫기</Button>
          <Button
            display="full"
            onClick={handleBook}
            disabled={isLoading || availableRooms.length === 0}
          >
            {isLoading ? '예약 중...' : '예약하기'}
          </Button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = css`
  box-sizing: border-box; font-size: 16px; font-weight: 500; line-height: 1.5; height: 48px;
  background-color: ${colors.grey50}; border-radius: 12px; color: ${colors.grey800};
  width: 100%; border: 1px solid ${colors.grey200}; padding: 0 16px; outline: none;
  transition: border-color 0.15s; &:focus { border-color: ${colors.blue500}; }
`;
