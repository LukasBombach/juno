type NonNullable<T> = T extends Array<infer U> ? (U extends undefined ? never : U)[] : T extends undefined ? never : T;

export type PipeIn<T> = undefined | T | T[];
export type PipeOut<In, Out> = In extends Array<any> ? NonNullable<Out[]> : Out;

export function map<T, R>(mapFn: (value: T) => R) {
  return function mapArray<U extends T | T[]>(value: U): U extends T[] ? NonNullable<R[]> : R {
    if (Array.isArray(value)) {
      return value.map(mapFn).filter((v) => v !== undefined) as any;
    } else {
      return mapFn(value as T) as any;
    }
  };
}
