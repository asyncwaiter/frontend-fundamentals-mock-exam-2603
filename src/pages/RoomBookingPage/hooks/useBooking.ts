import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCreateReservation as useCreateReservationMutation } from 'domains/reservation/hooks/useReservations';

interface CreateReservationParams {
  roomId: string;
  date: string;
  start: string;
  end: string;
  attendees: number;
  equipment: string[];
}

interface UseBookingOptions {
  onError: (message: string) => void;
}

export function useBooking({ onError }: UseBookingOptions) {
  const navigate = useNavigate();
  const mutation = useCreateReservationMutation();

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
