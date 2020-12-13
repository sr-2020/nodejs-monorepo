export type SendEvent = (eventType: string, data: unknown, successMessage?) => Promise<void>;
