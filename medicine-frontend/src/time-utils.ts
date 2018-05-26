const infinity = 864000;

function signCharacter(value: number): string {
  return value < 0 ? '−' /* U+2212 */ : '';
}

// Prints an integer padded with leading zeroes
export function formatInteger(value: number, padding: number): string {
  const sign = signCharacter(value);
  const str = Math.abs(value).toFixed(0);
  const padded = (str.length >= padding) ? str : ('0000000000000000' + str).slice(-padding);
  return sign + padded;
}

// Prints "H:MM" or "M:SS" with a given separator.
export function formatTime2(value: number, separator: string): string {
  if (value >= infinity) {
    return '∞';
  }
  const sign = signCharacter(value);
  value = Math.abs(value);
  value = Math.floor(value);
  const high = Math.floor(value / 60);
  const low = value % 60;
  return sign + formatInteger(high, 1) + separator + formatInteger(low, 2);
}

// Prints "H:MM:SS" with a given separator.
export function formatTime3(value: number, separator: string): string {
  if (value >= infinity) {
    return '∞';
  }
  const sign = signCharacter(value);
  value = Math.abs(value);
  value = Math.floor(value);
  const hour = Math.floor(value / 3600);
  const min = Math.floor(value / 60) % 60;
  const sec = value % 60;
  return sign +
    formatInteger(hour, 1) + separator +
    formatInteger(min, 2) + separator +
    formatInteger(sec, 2);
}

function renderDay(now: Date, timestamp: Date) {
  const microsPerDay = 24 * 3600 * 1000;
  const localOffset = now.getTimezoneOffset() * 60 * 1000;
  const timestampDaysSinceEpoch = Math.floor((timestamp.getTime() - localOffset) / microsPerDay);
  const nowDaysSinceEpoch = Math.floor((now.getTime() - localOffset) / microsPerDay);
  const dayDiff = Math.abs(nowDaysSinceEpoch - timestampDaysSinceEpoch);
  if (timestampDaysSinceEpoch < nowDaysSinceEpoch) {
    if (dayDiff == 1) {
      return 'вчера';
    } else if (dayDiff == 2) {
      return 'позавчера';
    } else {
      return dayDiff + /*U+00A0*/ ' д. назад';
    }
  } else {
    if (dayDiff == 1) {
      return 'завтра';
    } else if (dayDiff == 2) {
      return 'послезавтра';
    } else {
      return 'через ' + dayDiff + /*U+00A0*/ ' д.';
    }
  }
}

// TODO: test
export function renderTimestamp(unixMilliseconds: number): string {
  const timestamp = new Date(unixMilliseconds);
  const now = new Date();

  const minutesSinceMidnight = timestamp.getHours() * 60 + timestamp.getMinutes();

  const time = formatTime2(minutesSinceMidnight, ':');

  if (timestamp.getFullYear() == now.getFullYear() &&
    timestamp.getMonth() == now.getMonth() &&
    timestamp.getDate() == now.getDate()) {
    return time;
  }

  return time + ', ' + renderDay(now, timestamp);
  // TODO: fix leap seconds
}
