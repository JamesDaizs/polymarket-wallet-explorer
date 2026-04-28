import { getSignals } from "@/lib/queries/signals";
import { SignalsClient } from "./signals-client";

export const dynamic = "force-dynamic";

export default async function SignalsPage() {
  const signals = await getSignals(7, 50);
  return <SignalsClient initialSignals={signals} />;
}
