export const toKSh = (cents: number) =>
  `KSh ${Math.round(cents / 1).toLocaleString()}`;
