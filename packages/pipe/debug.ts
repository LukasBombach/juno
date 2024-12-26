export function debug<T>(fn: (input: T) => void): (input: T) => T {
  return input => {
    fn(input);
    return input;
  };
}
