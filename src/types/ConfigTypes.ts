import type { Elem, IsArray, IsPlainObject } from './types.js';

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}.${P}`
    : never
  : never;

// depth counter
type Depth = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type Dec<D extends Depth> = D extends 6
  ? 5
  : D extends 5
    ? 4
    : D extends 4
      ? 3
      : D extends 3
        ? 2
        : D extends 2
          ? 1
          : D extends 1
            ? 0
            : 0;

/** All dot paths (branches and leaves), with a depth limit. */
export type DotPath<T, D extends Depth = 6> = [D] extends [0]
  ? never
  : IsArray<T> extends true
    ? `${number}` | Join<number, DotPath<Elem<T>, Dec<D>>>
    : IsPlainObject<T> extends true
      ? {
          [K in Extract<keyof T, string>]: T[K] extends infer V
            ? IsPlainObject<V> extends true
              ? `${K}` | Join<K, DotPath<V, Dec<D>>>
              : IsArray<V> extends true
                ? `${K}` | Join<K, DotPath<Elem<V>, Dec<D>>>
                : `${K}`
            : never;
        }[Extract<keyof T, string>]
      : never;

/** Type of value for a dot-notation path with a depth limit. */
export type PathValue<T, P, D extends Depth = 6> = P extends string
  ? [D] extends [0]
    ? unknown
    : P extends `${infer K}.${infer Rest}`
      ? K extends keyof T
        ? PathValue<T[K], Rest, Dec<D>>
        : IsArray<T> extends true
          ? PathValue<Elem<T>, Rest, Dec<D>>
          : never
      : P extends keyof T
        ? T[P]
        : IsArray<T> extends true
          ? Elem<T>
          : never
  : never;

export type DeepPartial<T> =
  IsArray<T> extends true
    ? readonly DeepPartial<Elem<T>>[]
    : IsPlainObject<T> extends true
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;
