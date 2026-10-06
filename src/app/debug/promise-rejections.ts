/**
 * Dev-only tracker of unhandled promise rejections.
 *
 * React Native's default tracker (see `Libraries/promiseRejectionTrackingOptions.js`) only keeps the error name and message, so the
 * LogBox shows "Uncaught (in promise, id: N): TypeError: ..." without any stack trace.
 * This one prints the real stack, symbolicated by Metro when possible.
 *
 * Errors are only printed (`console.warn`) and never given to `ErrorUtils`: the global handler is replaced by Crashlytics,
 * which would turn a non-fatal rejection into a native crash.
 */

interface StackFrame {
  methodName?: string | null;
  file?: string | null;
  lineNumber?: number | null;
  column?: number | null;
  collapse?: boolean;
}

const MAX_FRAMES = 12;

const formatFrame = (frame: StackFrame) =>
  `    at ${frame.methodName || '<anonymous>'} (${frame.file ?? '?'}:${frame.lineNumber ?? '?'}:${frame.column ?? '?'})`;

/**
 * Parses the error stack and asks Metro to symbolicate it.
 * Internal Hermes frames (`InternalBytecode.js`) are not in the source maps and are dropped by the parser.
 */
async function getReadableStack(error: Error): Promise<string> {
  try {
    // eslint-disable-next-line @react-native/no-deep-imports
    const parseErrorStack = require('react-native/Libraries/Core/Devtools/parseErrorStack').default;
    // eslint-disable-next-line @react-native/no-deep-imports
    const symbolicateStackTrace = require('react-native/Libraries/Core/Devtools/symbolicateStackTrace').default;
    const frames: StackFrame[] = parseErrorStack(error.stack);
    if (!frames.length) {
      return `    (no frame from the bundle, the error was thrown by the JS engine internals. Raw stack:)\n${error.stack}`;
    }
    const { stack } = (await symbolicateStackTrace(frames)) as { stack: StackFrame[] };
    // Frames from `node_modules` are collapsed by Metro: only show them if there is nothing else.
    const appFrames = stack.filter(frame => !frame.collapse);
    return (appFrames.length ? appFrames : stack).slice(0, MAX_FRAMES).map(formatFrame).join('\n');
  } catch {
    // Symbolication is unavailable (bundle not loaded from Metro, Metro stopped...).
    return `    (not symbolicated)\n${error.stack}`;
  }
}

const describe = (reason: unknown) => {
  if (reason instanceof Error) return `${reason.name}: ${reason.message}`;
  try {
    return `non-Error rejection: ${JSON.stringify(reason)}`;
  } catch {
    return `non-Error rejection: ${String(reason)}`;
  }
};

export function trackPromiseRejections() {
  if (!__DEV__) return;
  const hermes = (globalThis as { HermesInternal?: { enablePromiseRejectionTracker?: (options: object) => void } }).HermesInternal;
  if (!hermes?.enablePromiseRejectionTracker) return;

  hermes.enablePromiseRejectionTracker({
    allRejections: true,
    onHandled: (id: number) => {
      console.warn(`Promise rejection handled (id: ${id}). Previous "Unhandled promise rejection #${id}" can be ignored.`);
    },
    onUnhandled: async (id: number, reason: unknown) => {
      const stack = reason instanceof Error ? await getReadableStack(reason) : '    (no stack)';
      console.warn(`Unhandled promise rejection #${id}\n  ${describe(reason)}\n${stack}`);
    },
  });
}
