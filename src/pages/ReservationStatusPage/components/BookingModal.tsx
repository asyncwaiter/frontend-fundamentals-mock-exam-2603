import { css } from '@emotion/react';
import { Spacing, Text, Button, Select } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { filterAvailableRooms } from 'utils/reservationFilters';
import { useRooms } from 'hooks/useRooms';
import { useReservations } from 'hooks/useReservations';
import { useMessage } from 'hooks/useMessage';
import { useCreateReservation } from 'hooks/useReservations';
import { useBookingForm } from 'hooks/useBookingForm';
import { EquipmentToggleGroup } from 'components/EquipmentToggleGroup';
import { inputStyle } from 'styles/inputs';

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
  const { showMessage } = useMessage();

  const form = useBookingForm({
    date,
    startTime,
    endTime,
    selectedRoomId: roomId,
  });

  const availableRooms = filterAvailableRooms(
    rooms, reservations,
    { date, startTime, endTime, attendees: form.attendees, equipment: form.equipment, preferredFloor: form.preferredFloor }
  );

  const isSelectedInList = availableRooms.some(r => r.id === form.selectedRoomId);
  const effectiveRoomId = isSelectedInList
    ? form.selectedRoomId
    : availableRooms[0]?.id ?? null;

  const floors = [...new Set(rooms.map(r => r.floor))].sort((a, b) => a - b);

  const createReservation = useCreateReservation();

  const handleBook = () => {
    if (!effectiveRoomId) {
      showMessage({ type: 'error', text: '예약 가능한 회의실이 없습니다.' });
      return;
    }

    createReservation.mutate({
      roomId: effectiveRoomId,
      date,
      start: startTime,
      end: endTime,
      attendees: form.attendees,
      equipment: form.equipment,
    }, {
      onSuccess: onClose,
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
              value={form.attendees}
              onChange={e => form.setAttendees(Number(e.target.value))}
              css={inputStyle}
            />
          </div>
          <div css={css`display: flex; flex-direction: column; gap: 6px; flex: 1;`}>
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>선호 층</Text>
            <Select
              value={form.preferredFloor ?? ''}
              onChange={e => form.setPreferredFloor(e.target.value === '' ? null : Number(e.target.value))}
            >
              <option value="">전체</option>
              {floors.map(f => (
                <option key={f} value={f}>{f}층</option>
              ))}
            </Select>
          </div>
        </div>

        <Spacing size={14} />

        <EquipmentToggleGroup selected={form.equipment} onToggle={form.toggleEquipment} />

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
              onChange={e => form.selectRoom(e.target.value)}
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
            disabled={createReservation.status === 'loading' || availableRooms.length === 0}
          >
            {createReservation.status === 'loading' ? '예약 중...' : '예약하기'}
          </Button>
        </div>
      </div>
    </div>
  );
}
