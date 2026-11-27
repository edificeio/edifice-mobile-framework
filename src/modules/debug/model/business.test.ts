import { filterLogs, parseLog } from './business';

describe('parseLog', () => {
  it('splits an entry that follows the log format', () => {
    expect(parseLog('12:34:56 | app | ERROR : Something failed')).toEqual({
      message: 'Something failed',
      severity: 'ERROR',
      time: '12:34:56',
    });
  });

  it('keeps the rest of a multi-word message', () => {
    expect(parseLog('01:02:03 | network | INFO : GET /api : 200').message).toBe('GET /api : 200');
  });

  it('keeps an entry that does not follow the format whole, as its message', () => {
    expect(parseLog('random text')).toEqual({ message: 'random text' });
  });
});

describe('filterLogs', () => {
  const logs = [
    { message: 'Something failed', severity: 'ERROR', time: '12:34:56' },
    { message: 'Loaded', severity: 'INFO', time: '08:00:00' },
    { message: 'no format' },
  ];

  it('keeps every entry for an empty query', () => {
    expect(filterLogs(logs, '')).toBe(logs);
  });

  it('matches the message, whatever the case', () => {
    expect(filterLogs(logs, 'FAILED')).toEqual([logs[0]]);
  });

  it('matches the severity and the time', () => {
    expect(filterLogs(logs, 'info')).toEqual([logs[1]]);
    expect(filterLogs(logs, '08:00')).toEqual([logs[1]]);
  });

  it('ignores missing time and severity', () => {
    expect(filterLogs(logs, 'format')).toEqual([logs[2]]);
  });
});
