import { FieldErrors } from './goals';

export function isFieldErrors(value: any): value is FieldErrors {
  return (value as any)?.fieldErrors != null;
}

export type PinnedGoalError = {
  noPinnedGoal: boolean;
};
export function isPinnedGoalError(value: any): value is PinnedGoalError {
  return (value as PinnedGoalError).noPinnedGoal != null;
}

export function isGoalTransferFilter(value: any): value is FieldErrors {
  return value === 'templates' || value === 'accounts';
}
