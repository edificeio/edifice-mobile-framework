import type { LogData } from '.';

const LOG_FORMAT = /(\d{2}:\d{2}:\d{2})\s+\|\s+\w+\s+\|\s+(\w+)\s+:\s+(.*)/;

/**
 * Splits an entry of the app log (`~/app/log`, format `hh:mm:ss | <logger> | <SEVERITY> : <message>`) into its parts.
 * An entry that doesn't follow this format is kept whole as the message.
 */
export const parseLog = (log: string): LogData => {
  const match = log.match(LOG_FORMAT);
  if (match) {
    const [, time, severity, message] = match;
    return { message, severity, time };
  }
  return { message: log };
};

/** The entries whose message, time or severity contains the query, whatever the case. An empty query keeps them all. */
export const filterLogs = (logs: LogData[], query: string): LogData[] => {
  if (query === '') return logs;
  const lowerCaseQuery = query.toLowerCase();
  return logs.filter(
    log =>
      log.message?.toLowerCase().includes(lowerCaseQuery) ||
      log.time?.toLowerCase().includes(lowerCaseQuery) ||
      log.severity?.toLowerCase().includes(lowerCaseQuery),
  );
};
