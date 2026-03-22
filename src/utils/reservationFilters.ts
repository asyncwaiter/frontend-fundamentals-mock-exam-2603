import type { Room, Reservation, Equipment } from 'models/reservation';

interface FilterCriteria {
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  equipment: Equipment[];
  preferredFloor: number | null;
}

export function filterAvailableRooms(
  rooms: Room[],
  reservations: Reservation[],
  filters: FilterCriteria
): Room[] {
  const { date, startTime, endTime, attendees, equipment, preferredFloor } = filters;

  return rooms
    .filter(room => {
      if (room.capacity < attendees) return false;
      if (!equipment.every(eq => room.equipment.includes(eq))) return false;
      if (preferredFloor !== null && room.floor !== preferredFloor) return false;

      const hasConflict = reservations.some(
        r => r.roomId === room.id && r.date === date && r.start < endTime && r.end > startTime
      );
      return !hasConflict;
    })
    .sort((a, b) => {
      if (a.floor !== b.floor) return a.floor - b.floor;
      return a.name.localeCompare(b.name);
    });
}
