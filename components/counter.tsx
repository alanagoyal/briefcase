"use client";

import { useCloud } from "freestyle-sh";
import { useState } from "react";
import { CounterCS } from "@/cloudstate/counter";

export default function Counter(props: { count: number }) {
  const [count, setCount] = useState(props.count);
  const counter = useCloud<typeof CounterCS>("counter");

  const increment = async () => {
    await counter.increment();
    setCount(await counter.getCount());
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
