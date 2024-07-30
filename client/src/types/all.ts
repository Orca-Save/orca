export type Goal = {
  id: string;
  name: string;
  dueAt: Date;
  targetAmount: number;
  savedItemCount: number;
  currentBalance?: number;
  pinned: boolean;
  imagePath?: string;
};
export type GoalTransfer = {
  id: string;
  itemName: string;
  amount: number;
  rating: number | null;
  pinned: boolean;
  transactedAt: Date;
};

export type FormattedTransaction = {
  id: string;
  name: string;
  category: string;
  amount: number;
  impulse: boolean;
  read: boolean;
  date: string;
  formattedDate: string;
};
