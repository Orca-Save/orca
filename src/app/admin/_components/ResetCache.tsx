"use client";

import { Button } from "antd";
import { resetCache } from "../_actions/reset";

export default function ResetCache() {
  const onClick = () => resetCache();
  return <Button onClick={onClick}>Reset Cache</Button>;
}
