export interface DeusEvent {
  _id?: string;
  characterId: string;
  timestamp: number;
  eventType: string;
  data: any;
}
