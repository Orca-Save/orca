import db from '../../../../server/src/db/db';

export const getPinnedUserGoal = (userId: string) => {
  return db.goal.findFirst({
    where: {
      userId,
      pinned: true,
    },
  });
};
