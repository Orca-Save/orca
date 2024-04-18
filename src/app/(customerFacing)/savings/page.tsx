"use client";

import { Button, Card, Input } from "antd";
import { useFormState, useFormStatus } from "react-dom";

export default function MySavingsPage() {
  return <>Savings</>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-full"
      size="large"
      disabled={pending}
      htmlType="submit"
    >
      {pending ? "Sending..." : "Send"}
    </Button>
  );
}
