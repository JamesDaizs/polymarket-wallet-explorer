import { getActiveMarkets, getCategories } from "@/lib/queries/markets";
import { HomeClient } from "./home-client";

export const dynamic = "force-static";
export const revalidate = 300;

export default async function HomePage() {
  const [markets, categories] = await Promise.all([
    getActiveMarkets(undefined, 60),
    getCategories(),
  ]);

  return <HomeClient initialMarkets={markets} categories={categories} />;
}
