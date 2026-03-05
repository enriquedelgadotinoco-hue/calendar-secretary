import * as FileSystem from 'expo-file-system/legacy';
import type { ExtractedEventCandidate } from '../types/event';

function formatUtc(dateIso: string): string {
  return new Date(dateIso).toISOString().replace(/[-:]/g, '').replace('.000', '').replace('Z', 'Z');
}

export function buildIcsContent(event: ExtractedEventCandidate): string {
  const uid = `${Date.now()}@calendar-secretary`;
  const dtStamp = formatUtc(new Date().toISOString());
  const dtStart = formatUtc(event.startDate);
  const dtEnd = formatUtc(event.endDate);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Calendar Secretary//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${event.title}`,
    event.location ? `LOCATION:${event.location}` : '',
    event.notes ? `DESCRIPTION:${event.notes}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ]
    .filter(Boolean)
    .join('\n');
}

export async function saveIcsFile(event: ExtractedEventCandidate): Promise<string> {
  const fileUri = `${FileSystem.cacheDirectory}calendar-secretary-event.ics`;
  const content = buildIcsContent(event);
  await FileSystem.writeAsStringAsync(fileUri, content, {
    encoding: FileSystem.EncodingType.UTF8
  });
  return fileUri;
}