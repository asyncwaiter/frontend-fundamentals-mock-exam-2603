import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createReservation } from 'pages/remotes';

interface CreateReservationParams {
  roomId: string;
  date: string;
  start: string;
  end: string;
  attendees: number;
  equipment: string[];
}

interface UseCreateReservationOptions {
  onError: (message: string) => void;
}

export function useCreateReservation({ onError }: UseCreateReservationOptions) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation(
    (data: CreateReservationParams) => createReservation(data),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries(['reservations', variables.date]);
        queryClient.invalidateQueries(['myReservations']);
      },
    }
  );

  const handleBook = async (params: CreateReservationParams) => {
    try {
      const result = await mutation.mutateAsync(params);

      if ('ok' in result && result.ok) {
        navigate('/', { state: { message: '예약이 완료되었습니다!' } });
        return;
      }

      const errResult = result as { message?: string };
      onError(errResult.message ?? '예약에 실패했습니다.');
    } catch (err: unknown) {
      let serverMessage = '예약에 실패했습니다.';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        serverMessage = data?.message ?? serverMessage;
      }
      onError(serverMessage);
    }
  };

  return {
    book: handleBook,
    isLoading: mutation.isLoading,
  };
}
