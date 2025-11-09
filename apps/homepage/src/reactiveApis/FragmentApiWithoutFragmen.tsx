interface CounterProps {
  className: string;
}

interface ButtonProps {
  count: number;
}

export function Counter() {
  const button = ({ count = 0 }: ButtonProps) => (
    <button onClick={() => button.count++}>Number of clicks: {count}</button>
  );

  return button;
}

export function Counter1() {
  const handleClick = () => button.count++;

  const button = ({ count = 0 }: ButtonProps) => <button onClick={handleClick}>Number of clicks: {count}</button>;

  return button;
}

export function Counter2() {
  return (props: ButtonProps) => <button onClick={() => props.count++}>Number of clicks: {props.count}</button>;
}

export function Counter3({ className }: CounterProps) {
  const handleClick = () => button.count++;

  const button = ({ count = 0 }: ButtonProps) => (
    <button className={className} onClick={handleClick}>
      Number of clicks: {count}
    </button>
  );

  return button;
}
