import { Goal, GoalTransfer } from "@prisma/client";

type Item = Goal | GoalTransfer;
export function sortPins(a: Item, b: Item) {
  if (a.pinned && !b.pinned) {
    return -1;
  }
  if (b.pinned && !a.pinned) {
    return 1;
  }

  if (a.updatedAt < b.updatedAt) {
    return 1;
  } else if (a.updatedAt > b.updatedAt) {
    return -1;
  }
  return 0;
}
