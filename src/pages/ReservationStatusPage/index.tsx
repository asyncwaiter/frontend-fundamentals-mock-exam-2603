import { css } from '@emotion/react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Top, Spacing, Border, Button, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { formatDate } from 'utils/reservation';
import { useRooms } from 'hooks/useRooms';
import { useReservations, useMyReservations, useCancelReservation } from 'hooks/useReservations';
import { useOverlay } from '_tosslib/overlay';
import { useMessage } from 'hooks/useMessage';
import { MessageBanner } from 'components/MessageBanner';
import { Timeline } from './components/Timeline';
import { MyReservationList } from './components/MyReservationList';
import { BookingModal } from './components/BookingModal';
import { useTimelineSelection } from './hooks/useTimelineSelection';

export function ReservationStatusPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(formatDate(new Date()));
  const overlay = useOverlay();
  const { message } = useMessage();

  const { data: rooms = [] } = useRooms();
  const { data: reservations = [] } = useReservations(date);
  const { data: myReservationList = [] } = useMyReservations();
  const { mutate: cancelReservation } = useCancelReservation();

  // 타임라인 2클릭 → overlay로 모달 오픈
  const openBookingModal = useCallback((roomId: string, startTime: string, endTime: string) => {
    overlay.open(({ close }) => (
      <BookingModal
        roomId={roomId}
        date={date}
        startTime={startTime}
        endTime={endTime}
        onClose={() => { close(); clearSelection(); }}
      />
    ));
  }, [date, overlay]);

  const { selection, handleSlotClick, clearSelection } = useTimelineSelection(openBookingModal);

  return (
    <div css={css`background: ${colors.white}; padding-bottom: 40px;`}>
      <Top.Top03 css={css`padding-left: 24px; padding-right: 24px;`}>
        회의실 예약
      </Top.Top03>

      <Spacing size={24} />

      {/* 날짜 선택 */}
      <div css={css`padding: 0 24px;`}>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          날짜 선택
        </Text>
        <Spacing size={16} />
        <div css={css`display: flex; flex-direction: column; gap: 6px;`}>
          <input
            type="date"
            value={date}
            min={formatDate(new Date())}
            onChange={e => setDate(e.target.value)}
            aria-label="날짜"
            css={css`
              box-sizing: border-box; font-size: 16px; font-weight: 500; line-height: 1.5; height: 48px;
              background-color: ${colors.grey50}; border-radius: 12px; color: ${colors.grey800};
              width: 100%; border: 1px solid ${colors.grey200}; padding: 0 16px; outline: none;
              transition: border-color 0.15s; &:focus { border-color: ${colors.blue500}; }
            `}
          />
        </div>
      </div>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 예약 현황 타임라인 — 빈 영역 클릭으로 빠른 예약 */}
      <div css={css`padding: 0 24px;`}>
        <div css={css`display: flex; align-items: baseline; gap: 8px;`}>
          <Text typography="t5" fontWeight="bold" color={colors.grey900}>
            예약 현황
          </Text>
          <Text typography="t7" color={colors.grey400}>
            빈 시간을 클릭하여 바로 예약
          </Text>
        </div>
        <Spacing size={16} />
        <Timeline
          rooms={rooms}
          reservations={reservations}
          selection={selection}
          onSlotClick={handleSlotClick}
        />
      </div>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {message && (
        <div css={css`padding: 0 24px;`}>
          <MessageBanner message={message} />
          <Spacing size={12} />
        </div>
      )}

      <MyReservationList
        reservations={myReservationList}
        rooms={rooms}
        onCancel={cancelReservation}
      />

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      <div css={css`padding: 0 24px;`}>
        <Button display="full" onClick={() => navigate('/booking')}>
          예약하기
        </Button>
      </div>
      <Spacing size={24} />
    </div>
  );
}
