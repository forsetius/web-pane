export function normalizeArgs(args: string[]): string[] {
  const argv: string[] = [];
  const splitAt = args.findLastIndex((arg) => arg.startsWith('--')) + 1;
  if (splitAt > 1) {
    const keys = args.slice(0, splitAt);
    const values = args.slice(splitAt);
    keys.forEach((key, idx) => {
      argv.push(key);
      argv.push(values[idx] ?? '');
    });

    return argv.slice(2);
  }

  return args.slice(2);
}
