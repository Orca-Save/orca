"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function DeleteDropDownItem({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div
    // disabled={isPending}
    // onClick={() =>
    //   startTransition(async () => {
    //     await deleteTransfer(id);
    //     router.refresh();
    //   })
    // }
    >
      Delete
    </div>
  );
}
