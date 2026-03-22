import { css } from '@emotion/react';
import { Text, Spacing } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { ALL_EQUIPMENT, EQUIPMENT_LABELS } from 'constants/reservation';
import type { Equipment } from 'models/reservation';

interface Props {
  selected: Equipment[];
  onToggle: (eq: Equipment) => void;
}

export function EquipmentToggleGroup({ selected, onToggle }: Props) {
  return (
    <div>
      <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>필요 장비</Text>
      <Spacing size={8} />
      <div css={css`display: flex; gap: 8px; flex-wrap: wrap;`}>
        {ALL_EQUIPMENT.map(eq => {
          const isSelected = selected.includes(eq);
          return (
            <button
              key={eq}
              type="button"
              onClick={() => onToggle(eq)}
              aria-label={EQUIPMENT_LABELS[eq]}
              aria-pressed={isSelected}
              css={css`
                padding: 6px 12px; border-radius: 16px; font-size: 13px; font-weight: 500;
                cursor: pointer; transition: all 0.15s;
                border: 1px solid ${isSelected ? colors.blue500 : colors.grey200};
                background: ${isSelected ? colors.blue50 : colors.grey50};
                color: ${isSelected ? colors.blue600 : colors.grey700};
              `}
            >
              {EQUIPMENT_LABELS[eq]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
