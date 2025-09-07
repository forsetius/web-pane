import { StrictRecord } from '../types/types.js';

export function map<K extends string, V, R>(
  obj: StrictRecord<K, V>,
  fn: (item: [K, V]) => [K, R],
) {
  return Object.fromEntries(
    (Object.entries(obj) as [K, V][]).map(fn),
  ) as StrictRecord<K, R>;
}
