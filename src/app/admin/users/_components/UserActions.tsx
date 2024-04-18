"use client";

import { useTransition } from "react";
import { deleteUser } from "../../_actions/users";
import { useRouter } from "next/navigation";

export function DeleteDropDownItem({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div
    // variant="destructive"
    // disabled={isPending}
    // onClick={() =>
    //   startTransition(async () => {
    //     await deleteUser(id);
    //     router.refresh();
    //   })
    // }
    >
      Delete
    </div>
  );
}
