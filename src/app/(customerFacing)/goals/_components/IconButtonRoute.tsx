"use client";

import { Button } from "antd";
import { useRouter } from "next/navigation";

type IconRouteProps = {
  icon: JSX.Element;
  route: string;
  text: string;
};
export default function IconButtonRoute({ icon, route, text }: IconRouteProps) {
  const router = useRouter();
  return (
    <Button
      icon={icon}
      type="primary"
      style={{ width: "100%" }}
      onClick={() => router.push(route)}
    >
      {text}
    </Button>
  );
}
