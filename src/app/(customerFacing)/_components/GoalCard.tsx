import PinSavingButton from "@/app/_components/PinSavingButton";
import { Goal as PrismaGoal } from "@prisma/client";
import { Card, Col, ConfigProvider, Row } from "antd";
import Meta from "antd/es/card/Meta";
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
  return (
    <ConfigProvider
      theme={{
        components: {
          Card: {
            // partially transparent background
            actionsBg: "rgba(0, 0, 0, 0.7)",
          },
        },
      }}
    >
      <Card
        key={goal.id}
        style={{
          backgroundImage: goal.imagePath ? `url(${goal.imagePath})` : "",
          backgroundSize: "cover",
        }}
        actions={[
          <PopconfirmDelete
            goalId={goal.id}
            key="delete"
            title="Delete the goal"
            description="Are you sure you want to delete this goal?"
          />,
          <EditAction route={`/goals/${goal.id}/edit`} key="edit" />,
          ...(revalidatePath !== "/"
            ? [
                <PinSavingButton
                  key="pin"
                  type="Goal"
                  typeId={goal.id}
                  pinned={goal.pinned}
                  userHasPinnedGoal={userHasPinnedGoal}
                />,
              ]
            : []),
          // <ShareAltOutlined key="share" />,
        ]}
      >
        <Meta title={goal.name} />
        <Row justify="space-between">
          <Col span={12}>
            <p>{goal.savedItemCount} Saves!</p>
          </Col>
          <Col span={12} style={{ textAlign: "right" }}>
            {"by " + goal.dueAt.toLocaleDateString()}
          </Col>
        </Row>
        <GoalProgress
          currentBalance={goal.currentBalance}
          target={goal.targetAmount.toNumber()}
        />
        <p>{goal.description}</p>
      </Card>
    </ConfigProvider>
  );
}
