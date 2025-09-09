import { StrictRecord } from '../types/types.js';
import type * as CT from '../types/ConfigTypes.js';

export function map<K extends string, V, R>(
  obj: StrictRecord<K, V>,
  fn: (item: [K, V]) => [K, R],
) {
  return Object.fromEntries(
    (Object.entries(obj) as [K, V][]).map(fn),
  ) as StrictRecord<K, R>;
}

export function getTyped<T extends object, P extends CT.DotPath<T>>(
  obj: T,
  key: P,
): CT.PathValue<T, P> {
  const segments = (key as string).split('.');
  let node: unknown = obj;

  for (const seg of segments) {
    const maybeIndex = Number(seg);
    const access: string | number =
      Number.isInteger(maybeIndex) && maybeIndex.toString() === seg
        ? maybeIndex
        : seg;

    if (
      node == null ||
      !(access in (node as Record<string | number, unknown>))
    ) {
      throw new Error(
        `Missing key at "${key as string}" (stopped at "${seg}")`,
      );
    }
    node = (node as Record<string | number, unknown>)[access];
  }

  return node as CT.PathValue<T, P>;
}
