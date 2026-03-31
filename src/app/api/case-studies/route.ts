import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const studies = await prisma.caseStudy.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(studies);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const study = await prisma.caseStudy.create({
    data: {
      title: body.title,
      client: body.client,
      industry: body.industry,
      problem: body.problem,
      solution: body.solution,
      result: body.result,
      tools: body.tools,
      published: body.published || false,
    },
  });
  return NextResponse.json(study, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const study = await prisma.caseStudy.update({
    where: { id: body.id },
    data: {
      title: body.title,
      client: body.client,
      industry: body.industry,
      problem: body.problem,
      solution: body.solution,
      result: body.result,
      tools: body.tools,
      published: body.published,
    },
  });
  return NextResponse.json(study);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.caseStudy.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
