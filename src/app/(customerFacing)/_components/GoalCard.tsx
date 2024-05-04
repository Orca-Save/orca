import PinSavingButton from "@/app/_components/PinSavingButton";
import { Goal as PrismaGoal } from "@prisma/client";
import { Card, Col, ConfigProvider, Row } from "antd";
import GoalProgress from "../goals/_components/GoalProgress";
import PopconfirmDelete from "../goals/_components/PopconfirmDelete";
import EditAction from "./EditAction";

type Goal = PrismaGoal & {
  savedItemCount: number;
  currentBalance: number;
};

export default function GoalCard({
  goal,
  userHasPinnedGoal,
  revalidatePath,
}: {
  goal: Goal;
  userHasPinnedGoal: boolean;
  revalidatePath: string;
}) {
  const isDashboard = revalidatePath === "/";
  return (
    <ConfigProvider
      theme={{
        components: {
          Card: {
            actionsBg: "rgba(255, 255, 255, 0.5)",
            colorText: goal.imagePath ? "white" : undefined,
            extraColor: goal.imagePath ? "white" : undefined,
            paddingLG: 10,
            actionsLiMargin: goal.pinned ? undefined : "0",
          },
          Progress: {
            colorText: goal.imagePath ? "white" : undefined,
          },
        },
      }}
    >
      <Card
        key={goal.id}
        style={{
          background: goal.imagePath ? `url(${goal.imagePath})` : "",
          backgroundSize: "cover",
          padding: 0,
        }}
        actions={
          !isDashboard
            ? [
                <PopconfirmDelete
                  goalId={goal.id}
                  key="delete"
                  title="Delete the goal"
                  description="Are you sure you want to delete this goal?"
                />,
                <EditAction route={`/goals/${goal.id}/edit`} key="edit" />,
                <PinSavingButton
                  key="pin"
                  type="Goal"
                  typeId={goal.id}
                  pinned={goal.pinned}
                  userHasPinnedGoal={userHasPinnedGoal}
                />,
              ]
            : undefined
        }
      >
        <div>
          <Row justify="space-between">
            <Col span={12}>
              <h1 className="font-bold">{goal.name}</h1>
            </Col>
            <Col span={12} style={{ textAlign: "right" }}>
              {"by " + goal.dueAt.toLocaleDateString()}
            </Col>
          </Row>
          {goal.savedItemCount
            ? `${goal.savedItemCount}  Saves!`
            : "Start saving!"}
          {/* send div items to the bottom of this div */}
          <div className="flex flex-col align-end h-full">
            <div>
              <GoalProgress
                currentBalance={goal.currentBalance}
                target={goal.targetAmount.toNumber()}
              />
            </div>
          </div>
        </div>
      </Card>
    </ConfigProvider>
  );
}
