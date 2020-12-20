export interface TimeService {
  timestamp(): number;
}

export class TimeServiceImpl implements TimeService {
  timestamp(): number {
    return Date.now();
  }
}
