export function makeId(url: string) {
  const u = new URL(url);

  return u.hostname;
}
