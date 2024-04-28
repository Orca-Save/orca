import db from "@/db/db";

export const getPinnedUserGoal = (userId: string) => {
  return db.goal.findFirst({
    where: {
      userId,
      pinned: true,
    },
  });
};
