export function run<T>(fn: (...args: any[]) => Promise<T>): Promise<T | void> {
  return fn().catch(handleError)
}

export function handleError(err: Error) {
  console.error(err.stack)
  process.exitCode = 1
}
