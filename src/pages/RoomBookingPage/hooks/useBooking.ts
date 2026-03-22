import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCreateReservation as useCreateReservationMutation } from 'hooks/useReservations';
import { useMessage } from 'hooks/useMessage';

interface CreateReservationParams {
  roomId: string;
  date: string;
  start: string;
  end: string;
  attendees: number;
  equipment: string[];
}

interface UseBookingOptions {
  onSuccess?: () => void;
}

export function useBooking({ onSuccess }: UseBookingOptions = {}) {
  const navigate = useNavigate();
  const { showMessage } = useMessage();
  const mutation = useCreateReservationMutation();

  const handleBook = async (params: CreateReservationParams) => {
    try {
      const result = await mutation.mutateAsync(params);

      if ('ok' in result && result.ok) {
        onSuccess?.();
        showMessage({ type: 'success', text: '예약이 완료되었습니다!' });
        navigate('/');
        return;
      }

      const errResult = result as { message?: string };
      showMessage({ type: 'error', text: errResult.message ?? '예약에 실패했습니다.' });
    } catch (err: unknown) {
      let serverMessage = '예약에 실패했습니다.';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        serverMessage = data?.message ?? serverMessage;
      }
      showMessage({ type: 'error', text: serverMessage });
    }
  };

  return {
    book: handleBook,
    isLoading: mutation.isLoading,
  };
}
