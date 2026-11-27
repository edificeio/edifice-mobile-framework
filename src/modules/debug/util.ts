import type { ColorValue } from 'react-native';

import { defaultTheme } from '~/app/theme';

/** Color of a log severity (`INFO`, `WARN`, `ERROR`), black for any other. */
export const getSeverityColor = (severity: string): ColorValue => {
  switch (severity) {
    case 'INFO':
      return defaultTheme.palette.status.info.regular;
    case 'WARN':
      return defaultTheme.palette.status.warning.regular;
    case 'ERROR':
      return defaultTheme.palette.status.failure.regular;
    default:
      return defaultTheme.palette.grey.black;
  }
};
