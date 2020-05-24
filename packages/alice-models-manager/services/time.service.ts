import { Provider } from '@loopback/core';

export interface TimeService {
  timestamp(): number;
}

export class TimeServiceImpl implements TimeService {
  timestamp(): number {
    return Date.now();
  }
}

export class TimeServiceProvider implements Provider<TimeService> {
  value(): TimeService {
    return new TimeServiceImpl();
  }
}
