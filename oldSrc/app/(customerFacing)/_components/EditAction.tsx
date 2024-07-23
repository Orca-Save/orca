"use client";
import { EditOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function EditAction({ route }: { route: string }) {
  const router = useRouter();
  return <EditOutlined onClick={() => router.push(route)} />;
}
