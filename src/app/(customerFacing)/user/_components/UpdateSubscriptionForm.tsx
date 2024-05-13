"use client";

import { Button } from "antd";
import { useRouter } from "next/navigation";
import { updateSubscription } from "../_actions/stripe";

export default function UpdateSubscriptionForm({
  userId,
  cancel,
  actionText,
}: {
  userId: string;
  actionText: string;
  cancel: boolean;
}) {
  const router = useRouter();

  return (
    <Button
      onClick={async () => {
        await updateSubscription(userId, cancel);
        router.push("/user");
      }}
    >
      {actionText}
    </Button>
  );
}