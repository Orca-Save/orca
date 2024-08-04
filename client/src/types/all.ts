export type Goal = {
  id: string;
  name: string;
  dueAt: Date;
  targetAmount: number;
  description: string;
  savedItemCount: number;
  currentBalance?: number;
  pinned: boolean;
  note: string;
  categoryId: string;
  plaidCategory: string;
  imagePath?: string;
};
export type GoalTransfer = {
  id: string;
  itemName: string;
  amount: number;
  rating: number | null;
  pinned: boolean;
  goalId: string;
  merchantName: string;
  plaidCategory: string;
  note: string;
  link: string;
  categoryId: string;
  transactedAt: Date;
  initialTransfer: boolean;
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

export type UserProfile = {
  privacyPolicyAccepted: boolean;
  stripeSubscriptionId: string;
};
export type OnboardingProfile = {
  goalName: string;
  goalAmount: number;
  goalDueAt: string;
  imagePath: string;
  initialAmount: number;
  saving: string;
  savingAmount: number;
  privacyAgreement: boolean;
};

export type ItemData = {
  id: string;
  name: string;
  institutionName: string;
  logo: string;
  balance: number;
  userId: string;
  institution?: Institution;
  accounts: Account[];
  linkToken: string;
  itemId: string;
  linkText: string;
};
export type Institution = {
  institution_id: string;
  name: string;
};

export type Account = {
  account_id: string;
  mask: string;
  name: string;
  official_name: string;
  subtype: string;
  type: string;
};

export type InstitutionProps = {
  institution?: Institution;
  accounts: Account[];
  linkToken: string;
  linkText: string;
  itemId: string;
};

export type Transaction = {
  impulse: boolean;
  authorizedDate: string;
  date: string;
  recurring: boolean;
  name: string;
  merchantName: string;
  amount: number;
  userId: string;
  transactionId: string;
  personalFinanceCategory: {
    primary: string;
    secondary: string;
  };
  rating: number;
  impulseReturn: boolean;
  note: string;
  read: boolean;
};

export type GoalCategory = {
  id: string;
  name: string;
};
