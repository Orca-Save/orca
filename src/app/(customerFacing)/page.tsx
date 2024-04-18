import db from "@/db/db";
import { cache } from "@/lib/cache";
import { Goal } from "@prisma/client";
import { Button, Card, Skeleton } from "antd";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const getMostPopularGoals = cache(
  () => {
    return db.goal.findMany({
      orderBy: { savings: { _count: "desc" } },
      take: 6,
    });
  },
  ["/", "getMostPopulargoals"],
  { revalidate: 60 * 60 * 24 }
);

const getNewestGoals = cache(() => {
  return db.goal.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}, ["/", "getNewestgoals"]);

export default function HomePage() {
  return (
    <main className="space-y-12">
      <GoalGridSection
        title="Most Popular"
        goalsFetcher={getMostPopularGoals}
      />
      <GoalGridSection title="Newest" goalsFetcher={getNewestGoals} />
    </main>
  );
}

type goalGridSectionProps = {
  title: string;
  goalsFetcher: () => Promise<Goal[]>;
};

function GoalGridSection({ goalsFetcher, title }: goalGridSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button>
          <Link href="/goals" className="space-x-2">
            <span>View All</span>
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Suspense
          fallback={
            <>
              <Skeleton paragraph={{ rows: 4 }} />
              <Skeleton paragraph={{ rows: 4 }} />
              <Skeleton paragraph={{ rows: 4 }} />
            </>
          }
        >
          <GoalSuspense goalsFetcher={goalsFetcher} />
        </Suspense>
      </div>
    </div>
  );
}

async function GoalSuspense({
  goalsFetcher,
}: {
  goalsFetcher: () => Promise<Goal[]>;
}) {
  return (await goalsFetcher()).map((goal) => (
    <Card key={goal.id} title={goal.name}>
      <div>{goal.description}</div>
    </Card>
  ));
}
