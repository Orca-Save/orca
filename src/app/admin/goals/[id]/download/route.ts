import db from "@/db/db";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  const goal = await db.goal.findUnique({
    where: { id },
    select: { filePath: true, name: true },
  });

  if (goal == null) return notFound();

  const { size } = await fs.stat(goal.filePath);
  const file = await fs.readFile(goal.filePath);
  const extension = goal.filePath.split(".").pop();

  return new NextResponse(file, {
    headers: {
      "Content-Disposition": `attachment; filename="${goal.name}.${extension}"`,
      "Content-Length": size.toString(),
    },
  });
}
