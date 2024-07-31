import { cloudstate, invalidate, useCloud } from "freestyle-sh";

@cloudstate
export class CounterCS {
  static id = "counter" as const;
  count = 0;

  getCount() {
    return this.count;
  }

  increment() {
    this.count++;
    invalidate(useCloud<typeof CounterCS>("counter").getCount)
  }

  decrement() {
    this.count--;

    invalidate(useCloud<typeof CounterCS>("counter").getCount)
  }
}
