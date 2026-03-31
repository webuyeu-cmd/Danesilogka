import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [
    totalLeads,
    newLeads,
    qualifiedLeads,
    wonLeads,
    totalProjects,
    activeProjects,
    completedProjects,
    totalRevenue,
    caseStudies,
    recentLeads,
    recentProjects,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "new" } }),
    prisma.lead.count({ where: { status: "qualified" } }),
    prisma.lead.count({ where: { status: "won" } }),
    prisma.project.count(),
    prisma.project.count({ where: { status: "in_progress" } }),
    prisma.project.count({ where: { status: "completed" } }),
    prisma.project.aggregate({ _sum: { price: true }, where: { status: { in: ["in_progress", "completed", "review"] } } }),
    prisma.caseStudy.count(),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.project.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { lead: true } }),
  ]);

  return NextResponse.json({
    leads: { total: totalLeads, new: newLeads, qualified: qualifiedLeads, won: wonLeads },
    projects: { total: totalProjects, active: activeProjects, completed: completedProjects },
    revenue: totalRevenue._sum.price || 0,
    caseStudies,
    recentLeads,
    recentProjects,
  });
}
