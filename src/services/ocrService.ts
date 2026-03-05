import type { ExtractedEventCandidate } from '../types/event';

type ParsedDate = {
  day: number;
  month: number;
  year: number;
};

type ParsedTime = {
  hour: number;
  minute: number;
  meridiem?: 'a' | 'p';
};

const DATE_PATTERN_SOURCE = '(lun(?:es)?|mar(?:tes)?|mi[eé](?:rcoles)?|jue(?:ves)?|vie(?:rnes)?|s[aá]b(?:ado)?|dom(?:ingo)?)?[\\s,.-]*([0-3]?\\d)[\\/\\-]([01]?\\d)(?:[\\/\\-]([12]\\d{3}))?';
const DATE_PATTERN = new RegExp(DATE_PATTERN_SOURCE, 'i');
const TIME_RANGE_PATTERN_SOURCE = '(\\d{1,2}(?::?\\d{2})\\s*[ap](?:\\.?m\\.?)?|\\d{1,2}:\\d{2}|\\d{3,4}\\s*[ap])\\s*(?:-|–|—|to|a)\\s*(\\d{1,2}(?::?\\d{2})\\s*[ap](?:\\.?m\\.?)?|\\d{1,2}:\\d{2}|\\d{3,4}\\s*[ap])';

function timeRangeRegex(): RegExp {
  return new RegExp(TIME_RANGE_PATTERN_SOURCE, 'gi');
}

function dateRegexGlobal(): RegExp {
  return new RegExp(DATE_PATTERN_SOURCE, 'gi');
}

function parseDateFromLine(line: string, fallbackYear: number): ParsedDate | null {
  const match = DATE_PATTERN.exec(line);
  if (!match) {
    return null;
  }

  const day = Number(match[2]);
  const month = Number(match[3]);
  const year = match[4] ? Number(match[4]) : fallbackYear;
  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) {
    return null;
  }

  return { day, month, year };
}

function parseTimeToken(token: string, preferredMeridiem?: 'a' | 'p'): ParsedTime | null {
  const normalized = token.toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
  const tokenMeridiem: 'a' | 'p' | undefined = normalized.includes('pm') || normalized.endsWith('p')
    ? 'p'
    : normalized.includes('am') || normalized.endsWith('a')
      ? 'a'
      : undefined;

  const digitsPart = normalized.replace(/[apm]/g, '');
  let hour = 0;
  let minute = 0;

  if (digitsPart.includes(':')) {
    const [h, m] = digitsPart.split(':');
    hour = Number(h);
    minute = Number(m);
  } else if (digitsPart.length >= 3) {
    hour = Number(digitsPart.slice(0, digitsPart.length - 2));
    minute = Number(digitsPart.slice(-2));
  } else {
    hour = Number(digitsPart);
    minute = 0;
  }

  if (Number.isNaN(hour) || Number.isNaN(minute) || minute > 59) {
    return null;
  }

  const meridiem = tokenMeridiem ?? preferredMeridiem;
  if (meridiem && hour <= 12) {
    if (hour === 12) {
      hour = meridiem === 'a' ? 0 : 12;
    } else if (meridiem === 'p') {
      hour += 12;
    }
  }

  if (hour > 23) {
    return null;
  }

  return { hour, minute, meridiem: tokenMeridiem };
}

function toDate(date: ParsedDate, time: ParsedTime): Date {
  return new Date(date.year, date.month - 1, date.day, time.hour, time.minute, 0, 0);
}

function normalizeTitle(line: string): string {
  const withoutDate = line.replace(DATE_PATTERN, ' ');
  const withoutTime = withoutDate.replace(timeRangeRegex(), ' ');
  const cleaned = withoutTime.replace(/[|•·]/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned.length > 2 ? cleaned : 'Turno detectado';
}

export async function extractTextFromImage(imageUri: string): Promise<string> {
  const formData = new FormData();
  formData.append('apikey', process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY ?? 'helloworld');
  formData.append('language', 'spa');
  formData.append('OCREngine', '2');
  formData.append('isTable', 'true');
  formData.append('scale', 'true');
  formData.append('file', {
    uri: imageUri,
    name: 'scan.jpg',
    type: 'image/jpeg'
  } as unknown as Blob);

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('No se pudo consultar el servicio OCR');
  }

  const data = (await response.json()) as {
    IsErroredOnProcessing?: boolean;
    ErrorMessage?: string[];
    ParsedResults?: Array<{ ParsedText?: string }>;
  };

  if (data.IsErroredOnProcessing) {
    throw new Error(data.ErrorMessage?.join(', ') || 'Error al procesar OCR');
  }

  const parsedText = (data.ParsedResults ?? [])
    .map((item) => item.ParsedText ?? '')
    .join('\n')
    .trim();

  if (!parsedText) {
    throw new Error('No se detectó texto en la imagen');
  }

  return parsedText;
}

export function parseEventCandidates(rawText: string): ExtractedEventCandidate[] {
  const normalizedText = rawText.replace(/\r/g, '\n').trim();
  const lines = normalizedText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const fallbackYear = new Date().getFullYear();
  const events: ExtractedEventCandidate[] = [];

  const dateAnchors = [...normalizedText.matchAll(dateRegexGlobal())]
    .map((match) => {
      const day = Number(match[2]);
      const month = Number(match[3]);
      const year = match[4] ? Number(match[4]) : fallbackYear;
      if (match.index === undefined || Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) {
        return null;
      }
      return {
        index: match.index,
        date: { day, month, year } as ParsedDate
      };
    })
    .filter((item): item is { index: number; date: ParsedDate } => item !== null);

  if (dateAnchors.length > 0) {
    for (let i = 0; i < dateAnchors.length; i += 1) {
      const current = dateAnchors[i];
      const next = dateAnchors[i + 1];
      const segment = normalizedText.slice(current.index, next?.index ?? normalizedText.length);
      const ranges = [...segment.matchAll(timeRangeRegex())];

      for (const match of ranges) {
        const startTime = parseTimeToken(match[1]);
        const endTime = parseTimeToken(match[2], startTime?.meridiem);
        if (!startTime || !endTime) {
          continue;
        }

        const startDate = toDate(current.date, startTime);
        let endDate = toDate(current.date, endTime);
        if (endDate <= startDate) {
          endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
        }

        events.push({
          title: normalizeTitle(segment),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          notes: 'Extraído desde imagen/captura con Calendar Secretary',
          confidence: 0.88,
          sourceText: segment
        });
      }
    }
  }

  let currentDate: ParsedDate | null = null;

  for (const line of lines) {
    const detectedDate = parseDateFromLine(line, fallbackYear);
    if (detectedDate) {
      currentDate = detectedDate;
    }

    if (!currentDate) {
      continue;
    }

    const rangeMatches = [...line.matchAll(timeRangeRegex())];
    if (!rangeMatches.length) {
      continue;
    }

    for (const match of rangeMatches) {
      const startRaw = match[1];
      const endRaw = match[2];
      const startTime = parseTimeToken(startRaw);
      const endTime = parseTimeToken(endRaw, startTime?.meridiem);

      if (!startTime || !endTime) {
        continue;
      }

      const startDate = toDate(currentDate, startTime);
      let endDate = toDate(currentDate, endTime);
      if (endDate <= startDate) {
        endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
      }

      events.push({
        title: normalizeTitle(line),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        notes: 'Extraído desde imagen/captura con Calendar Secretary',
        confidence: detectedDate ? 0.84 : 0.7,
        sourceText: line
      });
    }
  }

  const unique = new Map<string, ExtractedEventCandidate>();
  for (const event of events) {
    const key = `${event.startDate}-${event.endDate}-${event.title.toLowerCase()}`;
    if (!unique.has(key)) {
      unique.set(key, event);
    }
  }

  return [...unique.values()];
}