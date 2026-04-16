import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.title || !body.projectId) {
    return NextResponse.json({ error: "title i projectId wymagane" }, { status: 400 });
  }
  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description,
      projectId: body.projectId,
      status: body.status || "todo",
      priority: body.priority || "medium",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    },
  });
  return NextResponse.json(task, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "ID wymagane" }, { status: 400 });
  const task = await prisma.task.update({
    where: { id: body.id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
    },
  });
  return NextResponse.json(task);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID wymagane" }, { status: 400 });
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
