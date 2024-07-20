export function map<T, R>(mapFn: (value: T) => R) {
  function mapArray(value: T[]): R[];
  function mapArray(value: T): R;
  function mapArray(value: T | T[]): R | R[] {
    if (Array.isArray(value)) {
      return value.map(mapFn);
    } else {
      return mapFn(value);
    }
  }
  return mapArray;
}
