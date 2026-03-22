import { css } from '@emotion/react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Top, Spacing, Border, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import type { Equipment } from 'models/reservation';
import { useRooms } from 'hooks/useRooms';
import { useReservations } from 'hooks/useReservations';
import { useBookingForm, type BookingFormState } from 'hooks/useBookingForm';
import { useMessage } from 'hooks/useMessage';
import { filterAvailableRooms } from 'utils/reservationFilters';
import { useBooking } from './hooks/useBooking';
import { BookingFilters } from './components/BookingFilters';
import { RoomList } from './components/RoomList';

function parseBookingParams(searchParams: URLSearchParams): Partial<BookingFormState> {
  const result: Partial<BookingFormState> = {};

  const date = searchParams.get('date');
  if (date) result.date = date;

  const startTime = searchParams.get('startTime');
  if (startTime) result.startTime = startTime;

  const endTime = searchParams.get('endTime');
  if (endTime) result.endTime = endTime;

  const attendees = searchParams.get('attendees');
  if (attendees) result.attendees = Number(attendees);

  const equipmentStr = searchParams.get('equipment');
  if (equipmentStr) result.equipment = equipmentStr.split(',').filter(Boolean) as Equipment[];

  const floor = searchParams.get('floor');
  if (floor) result.preferredFloor = Number(floor);

  return result;
}

export function RoomBookingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { message, showMessage } = useMessage();

  const form = useBookingForm(parseBookingParams(searchParams));

  const { data: rooms = [] } = useRooms();
  const { data: reservations = [] } = useReservations(form.date);

  // 층 선택지: rooms에서 파생
  const floors = [...new Set(rooms.map(r => r.floor))].sort((a, b) => a - b);
  const availableRooms = form.isFilterComplete
    ? filterAvailableRooms(rooms, reservations, { date: form.date, startTime: form.startTime, endTime: form.endTime, attendees: form.attendees, equipment: form.equipment, preferredFloor: form.preferredFloor })
    : [];

  useEffect(() => {
    const params: Record<string, string> = {};
    if (form.date) params.date = form.date;
    if (form.startTime) params.startTime = form.startTime;
    if (form.endTime) params.endTime = form.endTime;
    if (form.attendees > 1) params.attendees = String(form.attendees);
    if (form.equipment.length > 0) params.equipment = form.equipment.join(',');
    if (form.preferredFloor !== null) params.floor = String(form.preferredFloor);
    setSearchParams(params, { replace: true });
  }, [form.date, form.startTime, form.endTime, form.attendees, form.equipment, form.preferredFloor, setSearchParams]);

  const { book, isLoading } = useBooking();

  const handleBook = () => {
    if (!form.selectedRoomId) {
      showMessage({ type: 'error', text: '회의실을 선택해주세요.' });
      return;
    }

    book({
      roomId: form.selectedRoomId,
      date: form.date,
      start: form.startTime,
      end: form.endTime,
      attendees: form.attendees,
      equipment: form.equipment,
    });
  };

  return (
    <div css={css`background: ${colors.white}; padding-bottom: 40px;`}>
      <div css={css`padding: 12px 24px 0;`}>
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="뒤로가기"
          css={css`
            background: none; border: none; padding: 0; cursor: pointer; font-size: 14px;
            color: ${colors.grey600}; &:hover { color: ${colors.grey900}; }
          `}
        >
          ← 예약 현황으로
        </button>
      </div>
      <Top.Top03 css={css`padding-left: 24px; padding-right: 24px;`}>
        예약하기
      </Top.Top03>

      {message && (
        <div css={css`padding: 0 24px;`}>
          <Spacing size={12} />
          <div
            css={css`
              padding: 10px 14px; border-radius: 10px;
              background: ${message.type === 'success' ? colors.blue50 : colors.red50};
              display: flex; align-items: center; gap: 8px;
            `}
          >
            <Text typography="t7" fontWeight="medium" color={message.type === 'success' ? colors.blue600 : colors.red500}>{message.text}</Text>
          </div>
        </div>
      )}

      <Spacing size={24} />

      <BookingFilters form={form} floors={floors} />

      {form.validationError && (
        <div css={css`padding: 0 24px;`}>
          <Spacing size={8} />
          <span css={css`color: ${colors.red500}; font-size: 14px;`} role="alert">{form.validationError}</span>
        </div>
      )}

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {form.isFilterComplete && (
        <RoomList
          rooms={availableRooms}
          selectedRoomId={form.selectedRoomId}
          onSelect={form.selectRoom}
          onBook={handleBook}
          isLoading={isLoading}
        />
      )}

      <Spacing size={24} />
    </div>
  );
}
