"use client";

import { useCloud } from "freestyle-sh";
import { useState } from "react";
import { CounterCS } from "@/cloudstate/counter";
import { useCloudQuery } from "freestyle-sh/react";
// import { useCloudQuery } from "freestyle-sh/react";

export default function Counter(props: { count: number }) {
  // const [count, setCount] = useState(props.count);
  const counter = useCloud<typeof CounterCS>("counter");
  const { data: count } = useCloudQuery(counter.getCount);
  // const { data: countData } = useCloudQuery(counter.getCount);

  const increment = async () => {
    await counter.increment();
  };

  const decrement = async () => {
    await counter.decrement();
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center flex-col">
      <button
        onClick={decrement}
        className="mt-4 p-4 rounded-xl bg-gray-700 transition-all hover:bg-gray-800"
      >
        Decrement
      </button>

      <p>Count: {count ?? props.count}</p>
      <button
        onClick={increment}
        className="mt-4 p-4 rounded-xl bg-gray-700 transition-all hover:bg-gray-800"
      >
        Increment
      </button>
    </div>
  );
}
