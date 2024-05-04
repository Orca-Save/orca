import { completedUserGoalCount } from "@/app/_actions/users";
import db from "@/db/db";
import { Col, ConfigProvider, Row } from "antd";
import { getPinnedUserGoal } from "../_actions/data";
import GoalProgress from "../goals/_components/GoalProgress";
import CompletedCounts from "./CompletedCounts";

const getGoalTransfersSum = (userId: string) => {
  return db.goalTransfer.groupBy({
    by: ["goalId"],
    _sum: {
      amount: true,
    },
    _count: {
      goalId: true,
    },
    where: {
      goal: {
        userId: userId,
      },
    },
  });
};

export default async function DashGoalCard({ userId }: { userId: string }) {
  const [goal, sums, completedCounts] = await Promise.all([
    getPinnedUserGoal(userId),
    getGoalTransfersSum(userId),
    completedUserGoalCount(userId),
  ]);
  if (!goal)
    return (
      <CompletedCounts
        totalSaved={completedCounts.totalSaved}
        goalsCompleted={completedCounts.goalsCompleted}
      />
    );

  const goalSumMap = new Map(
    sums.map((item) => [
      item.goalId,
      { amount: item._sum.amount, count: item._count.goalId },
    ])
  );
  let goalDetail = Object.assign(goal, {
    currentBalance: goalSumMap.get(goal.id)?.amount?.toNumber() || 0,
    savedItemCount: goalSumMap.get(goal.id)?.count || 0,
  });
  return (
    <div
      style={{
        background: goal.imagePath ? `url(${goal.imagePath})` : "",
        backgroundSize: "cover",
        color: goal.imagePath ? "white" : undefined,
        padding: 0,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          borderRadius: 10,
        }}
      >
        <div
          style={{
            margin: 10,
          }}
        >
          <Row justify="space-between">
            <Col span={12}>
              <h1 className="font-bold text-xl">{goal.name}</h1>
            </Col>
            <Col span={12} style={{ textAlign: "right" }}>
              {"by " + goal.dueAt.toLocaleDateString()}
            </Col>
          </Row>
          {goalDetail.savedItemCount} Saves!
        </div>
        <div
          className="content-end"
          style={{
            height: "170px",
          }}
        >
          <ConfigProvider
            theme={{
              components: {
                Progress: {
                  colorText: goal.imagePath ? "white" : undefined,
                },
              },
            }}
          >
            <GoalProgress
              currentBalance={goalDetail.currentBalance}
              target={goal.targetAmount.toNumber()}
              strokeWidth={30}
              style={{ margin: 10 }}
            />
          </ConfigProvider>
        </div>
      </div>
    </div>
  );
}
