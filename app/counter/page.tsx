import { useCloud } from "freestyle-sh";
import { CounterCS } from "@/cloudstate/counter";
import Counter from "@/components/counter";

export const dynamic = "force-dynamic";

export default async function CounterPage() {
  const counter = useCloud<typeof CounterCS>("counter");
  const count = await counter.getCount();
  return <Counter count={count} />;
}
