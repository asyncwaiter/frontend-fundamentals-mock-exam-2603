import { useState } from 'react';
import type { Equipment, Room } from 'domains/reservation/types';
import { useRooms } from 'domains/reservation/hooks/useRooms';
import { useReservations } from 'domains/reservation/hooks/useReservations';
import { formatDate } from 'domains/reservation/utils';
import { filterAvailableRooms } from '../filters';

export interface BookingFormState {
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  equipment: Equipment[];
  preferredFloor: number | null;
  selectedRoomId: string | null;
}

export function useBookingForm(initialState?: Partial<BookingFormState>) {
  const [date, setDate] = useState(initialState?.date ?? formatDate(new Date()));
  const [startTime, setStartTime] = useState(initialState?.startTime ?? '');
  const [endTime, setEndTime] = useState(initialState?.endTime ?? '');
  const [attendees, setAttendees] = useState(initialState?.attendees ?? 1);
  const [equipment, setEquipment] = useState<Equipment[]>(initialState?.equipment ?? []);
  const [preferredFloor, setPreferredFloor] = useState<number | null>(initialState?.preferredFloor ?? null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(initialState?.selectedRoomId ?? null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: rooms = [] } = useRooms();
  const { data: reservations = [] } = useReservations(date);

  const resetSelection = () => {
    setSelectedRoomId(null);
    setErrorMessage(null);
  };

  const hasTimeInputs = startTime !== '' && endTime !== '';
  let validationError: string | null = null;
  if (hasTimeInputs) {
    if (endTime <= startTime) {
      validationError = '종료 시간은 시작 시간보다 늦어야 합니다.';
    } else if (attendees < 1) {
      validationError = '참석 인원은 1명 이상이어야 합니다.';
    }
  }
  const isFilterComplete = hasTimeInputs && !validationError;

  const floors = [...new Set(rooms.map((r: Room) => r.floor))].sort((a, b) => a - b);

  const availableRooms = isFilterComplete
    ? filterAvailableRooms(rooms, reservations, { date, startTime, endTime, attendees, equipment, preferredFloor })
    : [];

  const toggleEquipment = (eq: Equipment) => {
    setEquipment(prev =>
      prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]
    );
    resetSelection();
  };

  const handleSetDate = (value: string) => { setDate(value); resetSelection(); };
  const handleSetStartTime = (value: string) => { setStartTime(value); resetSelection(); };
  const handleSetEndTime = (value: string) => { setEndTime(value); resetSelection(); };
  const handleSetAttendees = (value: number) => { setAttendees(Math.max(1, value)); resetSelection(); };
  const handleSetPreferredFloor = (value: number | null) => { setPreferredFloor(value); resetSelection(); };

  return {
    date, startTime, endTime, attendees, equipment, preferredFloor,
    selectedRoomId, errorMessage, validationError, isFilterComplete,
    availableRooms, floors,
    setDate: handleSetDate,
    setStartTime: handleSetStartTime,
    setEndTime: handleSetEndTime,
    setAttendees: handleSetAttendees,
    toggleEquipment,
    setPreferredFloor: handleSetPreferredFloor,
    selectRoom: setSelectedRoomId,
    setError: setErrorMessage,
  };
}
