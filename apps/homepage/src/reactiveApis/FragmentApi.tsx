import { fragment } from "juno";

interface CounterProps {
  className: string;
}

interface ButtonProps {
  count: number;
}

export function Counter() {
  const button = fragment(({ count }: ButtonProps) => (
    <button onClick={() => button.count++}>Number of clicks: {count}</button>
  ));

  return button;
}

export function Counter1() {
  const handleClick = () => button.count++;

  const button = fragment(({ count }: ButtonProps) => <button onClick={handleClick}>Number of clicks: {count}</button>);

  return button;
}

export function Counter2() {
  return fragment((props: ButtonProps) => (
    <button onClick={() => props.count++}>Number of clicks: {props.count}</button>
  ));
}

export function Counter3({ className }: CounterProps) {
  return fragment((props: ButtonProps) => (
    <button className={className} onClick={() => props.count++}>
      Number of clicks: {props.count}
    </button>
  ));
}
