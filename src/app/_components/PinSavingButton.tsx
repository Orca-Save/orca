"use client";

import { PushpinFilled, PushpinOutlined } from "@ant-design/icons";
import { createUserPin, deleteUserPin } from "../_actions/users";

type PinSavingButtonProps = {
  userPinId?: string;
  userId?: string;
  typeId?: string;
  type?: string;
  revalidatePath: string;
};

export default function PinSavingButton({
  userPinId,
  userId,
  typeId,
  type,
  revalidatePath,
}: PinSavingButtonProps) {
  const deletePinAction = () =>
    userPinId && deleteUserPin(userPinId, revalidatePath);
  const createPinAction = () =>
    userId &&
    typeId &&
    type &&
    createUserPin(userId, typeId, type, revalidatePath);

  const onClick = () => (userPinId ? deletePinAction() : createPinAction());

  if (userPinId) return <PushpinFilled onClick={onClick} />;
  return <PushpinOutlined onClick={onClick} />;
}
