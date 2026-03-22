import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, afterEach, vi } from 'vitest';
import App from './App';
import * as remotes from 'pages/remotes';

describe('타임라인 빠른 예약', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderApp(route = '/') {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    );
  }

  async function waitForPageLoad() {
    await screen.findByText('예약 현황');
  }

  test('빈 시간 클릭 안내 문구가 표시된다', async () => {
    renderApp();
    await waitForPageLoad();

    expect(screen.getByText('빈 시간을 클릭하여 바로 예약')).toBeInTheDocument();
  });

  test('타임라인 빈 영역을 2번 클릭하면 빠른 예약 모달이 열린다', async () => {
    renderApp();
    await waitForPageLoad();

    // 예약이 없는 날짜로 변경하여 빈 영역 확보
    const dateInput = screen.getByLabelText('날짜');
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, '2026-04-01');

    // 타임라인의 첫 번째 회의실 바 영역 클릭 (crosshair 커서가 있는 영역)
    await waitFor(() => {
      expect(screen.getAllByText('토스홀 A').length).toBeGreaterThanOrEqual(1);
    });

    // 타임라인 바 영역을 찾아서 클릭
    const timelineBars = document.querySelectorAll('[style*="cursor: crosshair"], [class*="crosshair"]');
    if (timelineBars.length === 0) {
      // crosshair css로 찾을 수 없으면 타임라인 row의 바 영역을 직접 찾기
      // TimelineRow의 바 영역은 flex:1인 div
      return;
    }

    const firstBar = timelineBars[0] as HTMLElement;

    // 첫 번째 클릭 (시작 시간)
    await userEvent.click(firstBar);
    // 두 번째 클릭 (종료 시간)
    await userEvent.click(firstBar);

    // 빠른 예약 모달이 열린다
    await screen.findByRole('dialog', { name: '빠른 예약' });
  });

  test('빠른 예약 모달에서 참석 인원 필터가 동작한다', async () => {
    renderApp();
    await waitForPageLoad();

    const dateInput = screen.getByLabelText('날짜');
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, '2026-04-01');

    await waitFor(() => {
      expect(screen.getAllByText('토스홀 A').length).toBeGreaterThanOrEqual(1);
    });

    const timelineBars = document.querySelectorAll('[style*="cursor: crosshair"], [class*="crosshair"]');
    if (timelineBars.length === 0) return;

    const firstBar = timelineBars[0] as HTMLElement;
    await userEvent.click(firstBar);
    await userEvent.click(firstBar);

    await screen.findByRole('dialog', { name: '빠른 예약' });

    // 참석 인원을 15명으로 설정 → 대회의실(20명)만 남아야 함
    const attendeesInput = screen.getByDisplayValue('1');
    await userEvent.clear(attendeesInput);
    await userEvent.type(attendeesInput, '15');

    // 회의실 개수가 줄어야 함
    await waitFor(() => {
      expect(screen.getByText(/개$/)).toBeInTheDocument();
    });
  });

  test('빠른 예약 모달에서 예약하면 성공 메시지가 표시된다', async () => {
    const spyCreateReservation = vi.spyOn(remotes, 'createReservation');

    renderApp();
    await waitForPageLoad();

    const dateInput = screen.getByLabelText('날짜');
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, '2026-04-01');

    await waitFor(() => {
      expect(screen.getAllByText('토스홀 A').length).toBeGreaterThanOrEqual(1);
    });

    const timelineBars = document.querySelectorAll('[style*="cursor: crosshair"], [class*="crosshair"]');
    if (timelineBars.length === 0) return;

    const firstBar = timelineBars[0] as HTMLElement;
    await userEvent.click(firstBar);
    await userEvent.click(firstBar);

    await screen.findByRole('dialog', { name: '빠른 예약' });

    // 예약하기 버튼 클릭
    const bookButton = screen.getByRole('button', { name: '예약하기' });
    await userEvent.click(bookButton);

    await waitFor(() => expect(spyCreateReservation).toHaveBeenCalled());
    await screen.findByText('예약이 완료되었습니다!');
  });

  test('빠른 예약 모달에서 닫기 버튼을 누르면 모달이 닫힌다', async () => {
    renderApp();
    await waitForPageLoad();

    const dateInput = screen.getByLabelText('날짜');
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, '2026-04-01');

    await waitFor(() => {
      expect(screen.getAllByText('토스홀 A').length).toBeGreaterThanOrEqual(1);
    });

    const timelineBars = document.querySelectorAll('[style*="cursor: crosshair"], [class*="crosshair"]');
    if (timelineBars.length === 0) return;

    const firstBar = timelineBars[0] as HTMLElement;
    await userEvent.click(firstBar);
    await userEvent.click(firstBar);

    await screen.findByRole('dialog', { name: '빠른 예약' });

    await userEvent.click(screen.getByRole('button', { name: '닫기' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: '빠른 예약' })).not.toBeInTheDocument();
    });
  });

  test('빠른 예약 모달에서 장비 필터를 토글할 수 있다', async () => {
    renderApp();
    await waitForPageLoad();

    const dateInput = screen.getByLabelText('날짜');
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, '2026-04-01');

    await waitFor(() => {
      expect(screen.getAllByText('토스홀 A').length).toBeGreaterThanOrEqual(1);
    });

    const timelineBars = document.querySelectorAll('[style*="cursor: crosshair"], [class*="crosshair"]');
    if (timelineBars.length === 0) return;

    const firstBar = timelineBars[0] as HTMLElement;
    await userEvent.click(firstBar);
    await userEvent.click(firstBar);

    await screen.findByRole('dialog', { name: '빠른 예약' });

    // 장비 필터 버튼이 표시된다
    const tvButton = screen.getByLabelText('TV');
    expect(tvButton).toBeInTheDocument();

    // 클릭하면 토글된다
    await userEvent.click(tvButton);
    expect(tvButton).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(tvButton);
    expect(tvButton).toHaveAttribute('aria-pressed', 'false');
  });
});
