import db from "@/db/db";
import { UserPinType } from "@/lib/users";

export const getPinnedUserGoal = async (userId: string) => {
  const userPin = await db.userPin.findFirst({
    where: {
      userId: userId,
      type: UserPinType.Goal,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (userPin) {
    const pinnedGoal = await db.goal.findUnique({
      where: {
        id: userPin.typeId,
      },
    });
    return pinnedGoal;
  }

  return null;
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
