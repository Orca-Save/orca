import db from './db';

export const getUserProfile = (userId: string) => {
  return db.userProfile.findUnique({
    where: {
      userId,
    },
  });
};
