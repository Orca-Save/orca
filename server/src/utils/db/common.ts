import db from './db';

export const getUserProfile = (userId: string) => {
  return db.userProfile.findUnique({
    where: {
      userId,
    },
  });
};

export const getUserTour = (userId: string) => {
  return db.userTour.findUnique({
    where: {
      userId,
    },
  });
};
