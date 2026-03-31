import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { lead: true, tasks: true },
  });
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const project = await prisma.project.create({
    data: {
      name: body.name,
      description: body.description,
      leadId: body.leadId || null,
      package: body.package || "diagnosis",
      status: body.status || "pending",
      price: body.price ? parseFloat(body.price) : null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      notes: body.notes,
    },
  });
  return NextResponse.json(project, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const project = await prisma.project.update({
    where: { id: body.id },
    data: {
      name: body.name,
      description: body.description,
      leadId: body.leadId || null,
      package: body.package,
      status: body.status,
      price: body.price ? parseFloat(body.price) : null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      notes: body.notes,
    },
  });
  return NextResponse.json(project);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
