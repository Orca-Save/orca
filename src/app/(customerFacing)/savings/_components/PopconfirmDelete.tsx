"use client";

import { deleteGoalTransfer } from "@/app/_actions/goalTransfers";
import { DeleteOutlined } from "@ant-design/icons";
import { Popconfirm } from "antd";

type PopconfirmDeleteProps = {
  goalTransferId: string;
  title: string;
  description: string;
};
export default function PopconfirmDelete({
  goalTransferId,
  title,
  description,
}: PopconfirmDeleteProps) {
  const deleteGoalTransferWithId = deleteGoalTransfer.bind(
    null,
    goalTransferId
  );
  const onConfirm = () => deleteGoalTransferWithId();
  return (
    <Popconfirm
      title={title}
      description={description}
      onConfirm={onConfirm}
      okText="Yes"
      cancelText="No"
    >
      <DeleteOutlined key="delete" />
    </Popconfirm>
  );
}
