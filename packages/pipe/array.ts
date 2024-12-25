export function filter<T, S extends T>(predicate: (value: T) => value is S): (arr: T[]) => S[];
export function filter<T>(predicate: (value: T) => boolean): (arr: T[]) => T[];
export function filter(predicate: (value: unknown) => boolean) {
  return (arr: unknown[]) => arr.filter(predicate);
}

export function map<T, R>(fn: (value: T) => R): (arr: T[]) => R[] {
  return arr => arr.map(fn);
}

export function flatMap<T, R>(fn: (value: T) => R[]): (arr: T[]) => R[] {
  return arr => arr.flatMap(fn);
}
