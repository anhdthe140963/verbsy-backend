export function weightedRandom(prob): number {
  let i,
    sum = 0;
  const r = Math.random();
  for (i in prob) {
    sum += prob[i];
    if (r <= sum) return i;
  }
}
