import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [leads, projects, tasks] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        contact: true,
        status: true,
        source: true,
        industry: true,
        callDate: true,
        createdAt: true,
      },
    }),
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: { lead: true, tasks: true },
    }),
    prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true, priority: true, createdAt: true, projectId: true },
    }),
  ]);

  // Lead funnel
  const funnelStages = ["new", "called", "qualified", "proposal", "won", "lost"];
  const funnel = funnelStages.map((status) => ({
    stage: status,
    count: leads.filter((l) => l.status === status).length,
  }));

  // Source breakdown
  const sources = ["website", "facebook", "linkedin", "referral", "calendly"];
  const sourceBreakdown = sources.map((source) => ({
    source,
    count: leads.filter((l) => l.source === source).length,
  })).filter((s) => s.count > 0);

  // Revenue by package
  const packages = ["diagnosis", "quick_win", "full"];
  const revenueByPackage = packages.map((pkg) => {
    const pkgProjects = projects.filter((p) => p.package === pkg);
    return {
      package: pkg,
      total: pkgProjects.reduce((sum, p) => sum + (p.price || 0), 0),
      count: pkgProjects.length,
    };
  });

  // Revenue by status
  const projectStatuses = ["pending", "in_progress", "review", "completed", "cancelled"];
  const revenueByStatus = projectStatuses.map((status) => {
    const statusProjects = projects.filter((p) => p.status === status);
    return {
      status,
      total: statusProjects.reduce((sum, p) => sum + (p.price || 0), 0),
      count: statusProjects.length,
    };
  });

  // Monthly trends (last 6 months)
  const now = new Date();
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const monthLabel = monthStart.toLocaleDateString("pl-PL", { month: "short", year: "2-digit" });

    const monthLeads = leads.filter(
      (l) => new Date(l.createdAt) >= monthStart && new Date(l.createdAt) <= monthEnd
    ).length;
    const monthProjects = projects.filter(
      (p) => new Date(p.createdAt) >= monthStart && new Date(p.createdAt) <= monthEnd
    ).length;
    const monthRevenue = projects
      .filter(
        (p) =>
          new Date(p.createdAt) >= monthStart &&
          new Date(p.createdAt) <= monthEnd &&
          ["in_progress", "completed", "review"].includes(p.status)
      )
      .reduce((sum, p) => sum + (p.price || 0), 0);

    monthlyData.push({
      month: monthLabel,
      leads: monthLeads,
      projects: monthProjects,
      revenue: monthRevenue,
    });
  }

  // Task stats
  const taskStats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    highPriority: tasks.filter((t) => t.priority === "high" && t.status !== "done").length,
  };

  // Conversion metrics
  const totalLeads = leads.length;
  const wonLeads = leads.filter((l) => l.status === "won").length;
  const lostLeads = leads.filter((l) => l.status === "lost").length;
  const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
  const lossRate = totalLeads > 0 ? (lostLeads / totalLeads) * 100 : 0;
  const avgDealValue =
    projects.filter((p) => p.price).length > 0
      ? projects.filter((p) => p.price).reduce((sum, p) => sum + (p.price || 0), 0) /
        projects.filter((p) => p.price).length
      : 0;

  // Industry breakdown
  const industries: Record<string, number> = {};
  leads.forEach((l) => {
    const ind = l.industry || "Brak branży";
    industries[ind] = (industries[ind] || 0) + 1;
  });
  const industryBreakdown = Object.entries(industries)
    .map(([industry, count]) => ({ industry, count }))
    .sort((a, b) => b.count - a.count);

  // Activity timeline (last 20 events)
  type TimelineEvent = { type: string; text: string; date: string; color: string };
  const timeline: TimelineEvent[] = [];

  leads.forEach((l) => {
    timeline.push({
      type: "lead",
      text: `Nowy lead: ${l.name} (${l.contact})`,
      date: new Date(l.createdAt).toISOString(),
      color: "blue",
    });
  });
  projects.forEach((p) => {
    timeline.push({
      type: "project",
      text: `Nowy projekt: ${p.name}${p.lead ? ` — ${p.lead.name}` : ""}`,
      date: new Date(p.createdAt).toISOString(),
      color: "green",
    });
  });

  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Upcoming calls
  const upcomingCalls = leads
    .filter((l) => l.callDate && new Date(l.callDate) >= now)
    .sort((a, b) => new Date(a.callDate!).getTime() - new Date(b.callDate!).getTime())
    .slice(0, 5);

  return NextResponse.json({
    funnel,
    sourceBreakdown,
    revenueByPackage,
    revenueByStatus,
    monthlyData,
    taskStats,
    conversion: {
      rate: Math.round(conversionRate * 10) / 10,
      lossRate: Math.round(lossRate * 10) / 10,
      totalLeads,
      wonLeads,
      lostLeads,
      avgDealValue: Math.round(avgDealValue),
    },
    industryBreakdown,
    timeline: timeline.slice(0, 20),
    upcomingCalls,
  });
}
