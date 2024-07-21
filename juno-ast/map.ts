export function map<T, R>(mapFn: (value: T) => R) {
  return function mapArray<U extends T | T[]>(value: U): U extends T[] ? R[] : R {
    if (Array.isArray(value)) {
      return value.map(mapFn) as any;
    } else {
      return mapFn(value as T) as any;
    }
  };
}
