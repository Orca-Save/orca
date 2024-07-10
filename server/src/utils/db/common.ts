import db from '../../db/db';

export const getUserProfile = (userId: string) => {
  return db.userProfile.findUnique({
    where: {
      userId,
    },
  });
};
