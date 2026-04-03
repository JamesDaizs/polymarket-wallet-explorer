import { getSignals } from "@/lib/queries/signals";
import { SignalsClient } from "./signals-client";

export const dynamic = "force-static";
export const revalidate = 300;

export default async function SignalsPage() {
  const signals = await getSignals(7, 50);
  return <SignalsClient initialSignals={signals} />;
}
