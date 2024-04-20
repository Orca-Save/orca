"use client";

import { useTransition } from "react";
import { deleteGoal } from "../../../_actions/goals";
import { useRouter } from "next/navigation";

export function DeleteDropdownItem({
  id,
  disabled,
}: {
  id: string;
  disabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          await deleteGoal(id);
          router.refresh();
        });
      }}
    >
      Delete
    </button>
  );
}
