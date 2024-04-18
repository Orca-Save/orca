import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/db/db";
import { cache } from "@/lib/cache";
import { ExtendedSession, isExtendedSession } from "@/lib/session";
import { Card, Skeleton } from "antd";
import { AuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { signIn } from "next-auth/react";

import { Suspense } from "react";
const getGoals = (userId: string) => {
  return db.goal.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
};

export default async function GoalsPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Suspense
        fallback={
          <>
            <Skeleton />
          </>
        }
      >
        <GoalsSuspense />
      </Suspense>
    </div>
  );
}

async function GoalsSuspense() {
  const session = await getServerSession(authOptions);
  if (!session) {
    signIn("azure-ad-b2c", { callbackUrl: "/goals" });
    return;
  }

  if (isExtendedSession(session)) {
    console.log("session", session);
    const goals = await getGoals(session.user.id);
    console.log("trying", goals);

    return goals.map((goal) => (
      <Card key={goal.id} title={goal.name}>
        <p>{goal.description}</p>
      </Card>
    ));
  }
}
