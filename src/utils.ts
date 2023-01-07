export async function retry<T>(
  fn: () => Promise<T>,
  waitMS: number,
  maxRetries: number,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (maxRetries === 0) throw err;
    await wait(waitMS);
    return retry(fn, waitMS, maxRetries - 1);
  }
}

export async function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
