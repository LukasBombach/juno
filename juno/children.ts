interface A {
  type: "A";
  A: "A";
}

interface B {
  type: "B";
  B: "B";
}

interface C {
  type: "C";
  C: "C";
}

type NNode = A | B | C;

type NodeType = NNode["type"];
type NodeOfType<T extends NodeType> = Extract<NNode, { type: T }>;
type TypeQuery<T extends NodeType> = { type: T };

function x<Q extends TypeQuery<NodeType>>(param: Q): Q extends TypeQuery<infer T> ? NodeOfType<T> : NNode {
  return (param as any).type;
}

const r = x({ type: "A", asd: "x" }); // A

type R = NodeOfType<"A">;
