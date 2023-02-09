const maxRequestTime = 3

export async function fetchWithTimeout(url: URL) {
  try {
    return await fetch(url, { signal: AbortSignal.timeout(maxRequestTime * 1000) })
  } catch (e) {
    throw new Error(`Request timed out.`)
  }
}
