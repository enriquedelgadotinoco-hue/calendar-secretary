import * as Calendar from 'expo-calendar';
import type { ExtractedEventCandidate } from '../types/event';

export async function ensureCalendarPermission(): Promise<boolean> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
}

async function getDefaultCalendarId(): Promise<string | null> {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const primary = calendars.find((calendar) => calendar.allowsModifications);
  return primary?.id ?? null;
}

export async function createDeviceCalendarEvent(event: ExtractedEventCandidate): Promise<string | null> {
  const granted = await ensureCalendarPermission();
  if (!granted) {
    return null;
  }

  const calendarId = await getDefaultCalendarId();
  if (!calendarId) {
    return null;
  }

  const eventId = await Calendar.createEventAsync(calendarId, {
    title: event.title,
    startDate: new Date(event.startDate),
    endDate: new Date(event.endDate),
    location: event.location,
    notes: event.notes
  });

  return eventId;
}

export async function createDeviceCalendarEvents(events: ExtractedEventCandidate[]): Promise<number> {
  const granted = await ensureCalendarPermission();
  if (!granted || events.length === 0) {
    return 0;
  }

  const calendarId = await getDefaultCalendarId();
  if (!calendarId) {
    return 0;
  }

  let created = 0;
  for (const event of events) {
    await Calendar.createEventAsync(calendarId, {
      title: event.title,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      location: event.location,
      notes: event.notes
    });
    created += 1;
  }

  return created;
}