export type IsArray<T> = T extends readonly unknown[] ? true : false;
export type Elem<T> = T extends readonly (infer U)[] ? U : never;
export type IsFn<T> = T extends (...args: unknown[]) => unknown ? true : false;
export type IsCtor<T> = T extends abstract new (...args: unknown[]) => unknown
  ? true
  : false;

export type IsPlainObject<T> = T extends object
  ? IsArray<T> | IsFn<T> | IsCtor<T> extends true
    ? false
    : true
  : false;

/**
 * Utility type `StrictRecord` that represents an object type with keys restricted
 * to the specified set of properties `K` and their corresponding values of type `V`. Any
 * additional properties outside the specified keys `K` will be disallowed.
 */
export type StrictRecord<K extends PropertyKey, V> = Record<K, V> &
  Partial<Record<Exclude<PropertyKey, K>, never>>;
