import { css } from '@emotion/react';
import { Spacing, Text, Button } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import type { Room } from 'models/reservation';
import { RoomCard } from './RoomCard';

interface Props {
  rooms: Room[];
  selectedRoomId: string | null;
  onSelect: (id: string) => void;
  onBook: () => void;
  isLoading: boolean;
}

export function RoomList({ rooms, selectedRoomId, onSelect, onBook, isLoading }: Props) {
  return (
    <div css={css`padding: 0 24px;`}>
      <div css={css`display: flex; align-items: baseline; gap: 6px;`}>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          예약 가능 회의실
        </Text>
        <Text typography="t7" fontWeight="medium" color={colors.grey500}>
          {rooms.length}개
        </Text>
      </div>
      <Spacing size={16} />

      {rooms.length === 0 ? (
        <div css={css`padding: 40px 0; text-align: center; background: ${colors.grey50}; border-radius: 14px;`}>
          <Text typography="t6" color={colors.grey500}>
            조건에 맞는 회의실이 없습니다.
          </Text>
        </div>
      ) : (
        <div css={css`display: flex; flex-direction: column; gap: 10px;`}>
          {rooms.map(room => (
            <RoomCard
              key={room.id}
              room={room}
              isSelected={selectedRoomId === room.id}
              onSelect={() => onSelect(room.id)}
            />
          ))}
        </div>
      )}

      <Spacing size={16} />
      <Button display="full" onClick={onBook} disabled={isLoading}>
        {isLoading ? '예약 중...' : '확정'}
      </Button>
    </div>
  );
}
