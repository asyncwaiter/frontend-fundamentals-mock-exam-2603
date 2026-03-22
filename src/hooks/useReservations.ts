import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReservations, getMyReservations, cancelReservation, createReservation } from 'pages/remotes';
import type { CreateReservationParams } from 'models/reservation';
import { useMessage } from 'hooks/useMessage';

export function useReservations(date: string) {
  return useQuery(['reservations', date], () => getReservations(date), {
    enabled: !!date,
  });
}

export function useMyReservations() {
  return useQuery(['myReservations'], getMyReservations);
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  const { showMessage } = useMessage();

  return useMutation(
    (data: CreateReservationParams) => createReservation(data),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries(['reservations', variables.date]);
        queryClient.invalidateQueries(['myReservations']);
        showMessage({ type: 'success', text: '예약이 완료되었습니다!' });
      },
      onError: () => {
        showMessage({ type: 'error', text: '예약에 실패했습니다.' });
      },
    }
  );
}

export function useCancelReservation() {
  const queryClient = useQueryClient();
  const { showMessage } = useMessage();

  return useMutation((id: string) => cancelReservation(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(['reservations']);
      queryClient.invalidateQueries(['myReservations']);
      showMessage({ type: 'success', text: '예약이 취소되었습니다.' });
    },
    onError: () => {
      showMessage({ type: 'error', text: '취소에 실패했습니다.' });
    },
  });
}
