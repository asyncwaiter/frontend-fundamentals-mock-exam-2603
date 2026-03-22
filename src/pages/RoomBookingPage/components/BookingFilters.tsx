import { css } from '@emotion/react';
import { Spacing, Text, Select } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { TIME_SLOTS } from 'constants/reservation';
import { formatDate } from 'utils/reservation';
import { EquipmentToggleGroup } from 'components/EquipmentToggleGroup';
import { inputStyle } from 'styles/inputs';
import type { useBookingForm } from 'hooks/useBookingForm';

type BookingForm = ReturnType<typeof useBookingForm>;

interface Props {
  form: BookingForm;
  floors: number[];
}

export function BookingFilters({ form, floors }: Props) {
  return (
    <div css={css`padding: 0 24px;`}>
      <Text typography="t5" fontWeight="bold" color={colors.grey900}>
        예약 조건
      </Text>
      <Spacing size={16} />

      {/* 날짜 */}
      <div css={css`display: flex; flex-direction: column; gap: 6px;`}>
        <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>날짜</Text>
        <input
          type="date"
          value={form.date}
          min={formatDate(new Date())}
          onChange={e => form.setDate(e.target.value)}
          aria-label="날짜"
          css={inputStyle}
        />
      </div>
      <Spacing size={14} />

      {/* 시간 */}
      <div css={css`display: flex; gap: 12px;`}>
        <div css={css`display: flex; flex-direction: column; gap: 6px; flex: 1;`}>
          <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>시작 시간</Text>
          <Select
            value={form.startTime}
            onChange={e => form.setStartTime(e.target.value)}
            aria-label="시작 시간"
          >
            <option value="">선택</option>
            {TIME_SLOTS.slice(0, -1).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
        </div>
        <div css={css`display: flex; flex-direction: column; gap: 6px; flex: 1;`}>
          <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>종료 시간</Text>
          <Select
            value={form.endTime}
            onChange={e => form.setEndTime(e.target.value)}
            aria-label="종료 시간"
          >
            <option value="">선택</option>
            {TIME_SLOTS.slice(1).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
        </div>
      </div>
      <Spacing size={14} />

      {/* 참석 인원 + 선호 층 */}
      <div css={css`display: flex; gap: 12px;`}>
        <div css={css`display: flex; flex-direction: column; gap: 6px; flex: 1;`}>
          <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>참석 인원</Text>
          <input
            type="number"
            min={1}
            value={form.attendees}
            onChange={e => form.setAttendees(Number(e.target.value))}
            aria-label="참석 인원"
            css={inputStyle}
          />
        </div>
        <div css={css`display: flex; flex-direction: column; gap: 6px; flex: 1;`}>
          <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>선호 층</Text>
          <Select
            value={form.preferredFloor ?? ''}
            onChange={e => {
              const val = e.target.value;
              form.setPreferredFloor(val === '' ? null : Number(val));
            }}
            aria-label="선호 층"
          >
            <option value="">전체</option>
            {floors.map((f: number) => (
              <option key={f} value={f}>{f}층</option>
            ))}
          </Select>
        </div>
      </div>
      <Spacing size={14} />

      <EquipmentToggleGroup selected={form.equipment} onToggle={form.toggleEquipment} />
    </div>
  );
}

