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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    invalidate(useCloud<typeof CounterCS>("counter").getCount)
  }

  decrement() {
    this.count--;
  }
}
