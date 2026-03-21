import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReservations, getMyReservations, cancelReservation, createReservation } from 'pages/remotes';

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

  return useMutation(
    (data: { roomId: string; date: string; start: string; end: string; attendees: number; equipment: string[] }) =>
      createReservation(data),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries(['reservations', variables.date]);
        queryClient.invalidateQueries(['myReservations']);
      },
    }
  );
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation((id: string) => cancelReservation(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(['reservations']);
      queryClient.invalidateQueries(['myReservations']);
    },
  });
}
