export enum UserPinType {
  GoalTransfer = "GoalTransfer",
  Goal = "Goal",
}

type UserPin = {
  userPinId?: string;
  updatedAt: Date;
};
export function sortPins(a: UserPin, b: UserPin) {
  if (a.userPinId && !b.userPinId) {
    return -1;
  }
  if (b.userPinId && !a.userPinId) {
    return 1;
  }

  if (a.updatedAt < b.updatedAt) {
    return -1;
  } else if (a.updatedAt > b.updatedAt) {
    return 1;
  }
  // a must be equal to b
  return 0;
}
