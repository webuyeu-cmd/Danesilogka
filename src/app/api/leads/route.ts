import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { projects: true },
  });
  return NextResponse.json(leads);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const lead = await prisma.lead.create({
    data: {
      name: body.name,
      contact: body.contact,
      email: body.email,
      phone: body.phone,
      source: body.source || "website",
      status: body.status || "new",
      industry: body.industry,
      painPoints: body.painPoints,
      callDate: body.callDate ? new Date(body.callDate) : null,
      notes: body.notes,
    },
  });
  return NextResponse.json(lead, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const lead = await prisma.lead.update({
    where: { id: body.id },
    data: {
      name: body.name,
      contact: body.contact,
      email: body.email,
      phone: body.phone,
      source: body.source,
      status: body.status,
      industry: body.industry,
      painPoints: body.painPoints,
      callDate: body.callDate ? new Date(body.callDate) : null,
      notes: body.notes,
    },
  });
  return NextResponse.json(lead);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
