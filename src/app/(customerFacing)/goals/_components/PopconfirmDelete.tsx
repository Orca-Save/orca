"use client";

import { deleteGoal } from "@/app/_actions/goals";
import { DeleteOutlined } from "@ant-design/icons";
import { Popconfirm } from "antd";

type PopconfirmDeleteProps = {
  goalId: string;
  title: string;
  description: string;
};
export default function PopconfirmDelete({
  goalId,
  title,
  description,
}: PopconfirmDeleteProps) {
  const deleteGoalWithId = deleteGoal.bind(null, goalId);
  const onConfirm = () => deleteGoalWithId();
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
