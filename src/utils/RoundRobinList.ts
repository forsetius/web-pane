export class RoundRobinList<K, V> implements Iterable<V> {
  private map = new Map<K, ListItem<K, V>>();
  private _current: ListItem<K, V> | undefined = undefined;

  public constructor(items: Iterable<[K, V]> = []) {
    for (const [k, v] of items) this.add(k, v);
  }

  public get size() {
    return this.map.size;
  }

  public get current() {
    return this._current;
  }

  public get next() {
    return this._current?.next;
  }

  public get previous() {
    return this._current?.previous;
  }

  public has(key: K) {
    return this.map.has(key);
  }

  public get(key: K): V | undefined {
    return this.map.get(key)?.value;
  }

  public getCurrentKey(): K | undefined {
    return this._current?.key;
  }

  public getCurrent(): V | undefined {
    return this._current?.value;
  }

  public getNext(): V | undefined {
    return this._current?.next.value;
  }

  public getPrevious(): V | undefined {
    return this._current?.previous.value;
  }

  public getItemByKey(key: K) {
    return this.map.get(key);
  }

  public find(fn: (item: ListItem<K, V>) => boolean) {
    for (const item of this.map.values()) {
      if (fn(item)) return item;
    }

    return undefined;
  }

  public advance(steps = 1): V | undefined {
    if (!this._current || steps === 0) return this._current?.value;

    let item = this._current;
    const times = Math.abs(steps);
    for (let i = 0; i < times; i++) {
      item = steps > 0 ? item.next : item.previous;
    }
    this._current = item;

    return item.value;
  }

  public setCurrent(element: ListItem<K, V>): boolean;
  public setCurrent(key: K): boolean;
  public setCurrent(elementOrKey: ListItem<K, V> | K): boolean {
    if (elementOrKey instanceof ListItem) {
      if (!this.map.has(elementOrKey.key)) return false;

      this._current = elementOrKey;
      return true;
    }

    const item = this.map.get(elementOrKey);
    if (!item) return false;

    this._current = item;
    return true;
  }

  public add(key: K, value: V, insertAfter?: K): boolean {
    if (this.map.has(key) || (insertAfter && !this.map.has(insertAfter))) {
      return false;
    }

    if (!this._current) {
      const item = new ListItem(key, value);
      this.map.set(key, item);
      this._current = item;

      return true;
    }

    const previousItem =
      (insertAfter ? this.map.get(insertAfter) : undefined) ?? this._current;
    const nextItem = previousItem.next;

    const item = new ListItem(key, value, previousItem, nextItem);
    previousItem.next = item;
    nextItem.previous = item;

    this.map.set(key, item);
    return true;
  }

  public remove(key: K): boolean {
    const item = this.map.get(key);
    if (!item) return false;

    if (this.map.size === 1) {
      this.map.clear();
      this._current = undefined;

      return true;
    }

    // re-link previous and next so that they link around the removed item, excluding it
    item.previous.next = item.next;
    item.next.previous = item.previous;

    if (this.current === item) this._current = item.next;

    this.map.delete(key);
    // @ts-expect-error - erasing references to help GC clean up
    item.next = item.previous = undefined;

    return true;
  }

  public clear() {
    this.map.clear();
    this._current = undefined;
  }

  private *items(opts?: {
    startKey?: K;
    forward?: boolean;
    loop?: boolean;
    includeStart?: boolean;
  }): IterableIterator<ListItem<K, V>> {
    if (!this.current) return;

    const direction = opts?.forward ?? true;
    const loop = opts?.loop ?? false;
    const includeStart = opts?.includeStart ?? true;

    const start =
      (opts?.startKey ? this.map.get(opts.startKey) : undefined) ??
      this.current;

    let item = includeStart ? start : direction ? start.next : start.previous;
    const step = (x: ListItem<K, V>) => (direction ? x.next : x.previous);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      yield item;
      item = step(item);
      if (!loop && item === start) break;
    }
  }

  public values(opts?: {
    forward?: boolean;
    loop?: boolean;
    startKey?: K;
    includeStart?: boolean;
  }): IterableIterator<V> {
    const iter = this.items(opts);

    return (function* () {
      for (const item of iter) yield item.value;
    })();
  }

  public keys(opts?: {
    forward?: boolean;
    loop?: boolean;
    startKey?: K;
    includeStart?: boolean;
  }): IterableIterator<K> {
    const iter = this.items(opts);

    return (function* () {
      for (const item of iter) yield item.key;
    })();
  }

  public entries(opts?: {
    forward?: boolean;
    loop?: boolean;
    startKey?: K;
    includeStart?: boolean;
  }): IterableIterator<[K, V]> {
    const iter = this.items(opts);

    return (function* () {
      for (const item of iter) yield [item.key, item.value];
    })();
  }

  public [Symbol.iterator](): IterableIterator<V> {
    return this.values({ forward: true, loop: false, includeStart: true });
  }
}

class ListItem<K, V> {
  public previous: ListItem<K, V>;
  public next: ListItem<K, V>;

  public constructor(
    public key: K,
    public value: V,
    previous?: ListItem<K, V>,
    next?: ListItem<K, V>,
  ) {
    this.previous = previous ?? this;
    this.next = next ?? this;
  }
}
