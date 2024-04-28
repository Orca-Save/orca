import db from "@/db/db";
import { UserPinType } from "@/lib/users";

export const getPinnedUserGoal = (userId: string) => {
  return db.goal.findFirst({
    where: {
      userId,
      pinned: true,
    },
  });
};

export const getPinnedUserGoalId = async (userId: string) => {
  const userPin = await db.userPin.findFirst({
    where: {
      userId: userId,
      type: UserPinType.Goal,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return userPin?.typeId;
};
