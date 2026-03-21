import { useQuery } from '@tanstack/react-query';
import { getRooms } from '../api';

export function useRooms() {
  return useQuery(['rooms'], getRooms);
}
