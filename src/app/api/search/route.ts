import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ leads: [], projects: [], tasks: [], caseStudies: [] });
  }

  const search = `%${q}%`;

  const [leads, projects, tasks, caseStudies] = await Promise.all([
    prisma.$queryRawUnsafe<Array<{ id: string; name: string; contact: string; status: string; email: string | null }>>(
      `SELECT id, name, contact, status, email FROM Lead WHERE name LIKE ? OR contact LIKE ? OR email LIKE ? OR industry LIKE ? OR painPoints LIKE ? LIMIT 5`,
      search, search, search, search, search
    ),
    prisma.$queryRawUnsafe<Array<{ id: string; name: string; status: string; description: string | null }>>(
      `SELECT id, name, status, description FROM Project WHERE name LIKE ? OR description LIKE ? OR notes LIKE ? LIMIT 5`,
      search, search, search
    ),
    prisma.$queryRawUnsafe<Array<{ id: string; title: string; status: string; projectId: string }>>(
      `SELECT id, title, status, projectId FROM Task WHERE title LIKE ? OR description LIKE ? LIMIT 5`,
      search, search
    ),
    prisma.$queryRawUnsafe<Array<{ id: string; title: string; client: string }>>(
      `SELECT id, title, client FROM CaseStudy WHERE title LIKE ? OR client LIKE ? OR problem LIKE ? OR solution LIKE ? LIMIT 5`,
      search, search, search, search
    ),
  ]);

  return NextResponse.json({ leads, projects, tasks, caseStudies });
}
