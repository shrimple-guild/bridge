export function sleep<T>(ms: number, onCompletion?: T): Promise<T> {
  return new Promise<T>(resolve => {
    setTimeout(resolve, ms)
    return onCompletion
  })
}

