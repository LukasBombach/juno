export function flatMap<T, R>(fn: (value: T) => R[]): (arr: T[]) => R[] {
  return arr => arr.flatMap(fn);
}

export function filter<T, S extends T>(predicate: (value: T) => value is S): (arr: T[]) => S[];
export function filter<T>(predicate: (value: T) => boolean): (arr: T[]) => T[];
export function filter(predicate: (value: any) => boolean) {
  return (arr: any[]) => arr.filter(predicate);
}
