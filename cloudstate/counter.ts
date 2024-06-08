import { cloudstate } from "freestyle-sh";

@cloudstate
export class CounterCS {
  static id = "counter" as const;
  count = 0;

  getCount() {
    return this.count;
  }

  increment() {
    this.count++;
  }

  decrement() {
    this.count--;
  }
}
