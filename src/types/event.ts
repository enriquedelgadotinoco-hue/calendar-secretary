export type ExtractedEventCandidate = {
  title: string;
  startDate: string;
  endDate: string;
  location?: string;
  notes?: string;
  confidence: number;
  sourceText: string;
};

export type AppStackParamList = {
  Home: undefined;
  Scan: undefined;
  Review: { rawText: string } | undefined;
  EventPreview: { event: ExtractedEventCandidate };
  Paywall: undefined;
  Settings: undefined;
  Connections: undefined;
};