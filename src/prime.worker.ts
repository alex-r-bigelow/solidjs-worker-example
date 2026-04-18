self.onmessage = (
  e: MessageEvent<{
    limit: number;
    reportIncrements: number;
  }>,
) => {
  const { limit, reportIncrements } = e.data;
  const step = Math.floor((limit * reportIncrements) / 100);
  let nextReport = step;
  const primes = [];
  for (let i = 2; i < limit; i++) {
    if (isPrime(i)) primes.push(i);
    if (i >= nextReport) {
      nextReport += step;
      self.postMessage({
        result: primes.length,
        progress: Math.floor(100 * (i / limit)),
      });
    }
  }
  self.postMessage({
    result: primes.length,
    progress: 100,
  });
};

function isPrime(num: number) {
  for (let i = 2, s = Math.sqrt(num); i <= s; i++)
    if (num % i === 0) return false;
  return num > 1;
}
