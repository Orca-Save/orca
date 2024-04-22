import { Card } from "antd";
import PopconfirmDelete from "../goals/_components/PopconfirmDelete";
import EditAction from "./EditAction";
import PinSavingButton from "@/app/_components/PinSavingButton";
import { ShareAltOutlined } from "@ant-design/icons";
import Meta from "antd/es/card/Meta";
import GoalProgress from "../goals/_components/GoalProgress";
import { Goal as PrismaGoal } from "@prisma/client";
import { UserPinType } from "@/lib/users";

type Goal = PrismaGoal & {
  userPinId?: string;
  savedItemCount: number;
  currentBalanceInCents: number;
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
    <Card
      key={goal.id}
      actions={[
        <PopconfirmDelete
          goalId={goal.id}
          key="delete"
          title="Delete the goal"
          description="Are you sure to delete this goal?"
        />,
        <EditAction route={`/goals/${goal.id}/edit`} key="edit" />,
        <PinSavingButton
          key="pin"
          userPinId={goal.userPinId}
          typeId={goal.id}
          type={UserPinType.Goal}
          userHasPinnedGoal={userHasPinnedGoal}
          userId={goal.userId}
        />,
        <ShareAltOutlined key="share" />,
      ]}
    >
      <Meta
        title={goal.name}
        description={"by " + goal.dueAt.toLocaleDateString()}
      />
      <p>Saved {goal.savedItemCount} times!</p>
      <GoalProgress
        currentBalanceInCents={goal.currentBalanceInCents}
        targetInCents={goal.targetInCents}
      />
      <p>{goal.description}</p>
    </Card>
  );
}
