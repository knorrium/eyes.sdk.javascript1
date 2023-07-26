export function extractCallSite(elevation = 1): NodeJS.CallSite {
  const originalPrepareStackTrace = Error.prepareStackTrace
  Error.prepareStackTrace = (_, stack) => stack
  try {
    const trace = {} as {stack: NodeJS.CallSite[]}
    Error.captureStackTrace(trace)
    return trace.stack[elevation]
  } finally {
    Error.prepareStackTrace = originalPrepareStackTrace
  }
}
