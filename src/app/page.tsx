import { prisma } from "@/lib/db";
import Link from "next/link";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  called: "bg-yellow-100 text-yellow-800",
  qualified: "bg-purple-100 text-purple-800",
  proposal: "bg-orange-100 text-orange-800",
  won: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
  pending: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  review: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
};

const statusLabels: Record<string, string> = {
  new: "Nowy",
  called: "Po rozmowie",
  qualified: "Kwalifikowany",
  proposal: "Oferta",
  won: "Wygrany",
  lost: "Przegrany",
  pending: "Oczekuje",
  in_progress: "W trakcie",
  review: "Review",
  completed: "Ukończony",
};

const packageLabels: Record<string, string> = {
  diagnosis: "Diagnoza AI",
  quick_win: "Szybkie wdrożenie",
  full: "Pełne wdrożenie",
};

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekEnd = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [leads, projects, caseStudies, urgentTasks, upcomingCalls] = await Promise.all([
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { lead: true, tasks: true },
    }),
    prisma.caseStudy.count(),
    prisma.task.findMany({
      where: {
        status: { not: "done" },
        OR: [
          { priority: "high" },
          { dueDate: { lte: weekEnd } },
        ],
      },
      include: { project: true },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      take: 6,
    }),
    prisma.lead.findMany({
      where: {
        callDate: { gte: now },
      },
      orderBy: { callDate: "asc" },
      take: 5,
    }),
  ]);

  const [totalLeads, newLeads, qualifiedLeads, proposalLeads, wonLeads, lostLeads] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "new" } }),
    prisma.lead.count({ where: { status: "qualified" } }),
    prisma.lead.count({ where: { status: "proposal" } }),
    prisma.lead.count({ where: { status: "won" } }),
    prisma.lead.count({ where: { status: "lost" } }),
  ]);

  const [totalProjects, activeProjects] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "in_progress" } }),
  ]);

  const revenue = await prisma.project.aggregate({
    _sum: { price: true },
    where: { status: { in: ["in_progress", "completed", "review"] } },
  });

  const allTasks = await prisma.task.findMany({
    select: { status: true },
  });
  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter((t) => t.status === "done").length;
  const taskPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  const stats = [
    {
      label: "Leady",
      value: totalLeads,
      sub: `${newLeads} nowych, ${qualifiedLeads} kwalif.`,
      color: "bg-blue-500",
      trend: newLeads > 0 ? `+${newLeads}` : null,
      trendColor: "text-blue-600",
    },
    {
      label: "Projekty",
      value: totalProjects,
      sub: `${activeProjects} aktywnych`,
      color: "bg-green-500",
      trend: activeProjects > 0 ? `${activeProjects} w toku` : null,
      trendColor: "text-green-600",
    },
    {
      label: "Pipeline",
      value: `${((revenue._sum.price || 0) / 1000).toFixed(1)}k zł`,
      sub: "aktywne + ukończone",
      color: "bg-purple-500",
      trend: null,
      trendColor: "",
    },
    {
      label: "Konwersja",
      value: `${conversionRate}%`,
      sub: `${wonLeads} wygranych z ${totalLeads}`,
      color: "bg-orange-500",
      trend: null,
      trendColor: "",
    },
  ];

  // Pipeline funnel data
  const funnelStages = [
    { key: "new", label: "Nowy", count: newLeads, color: "bg-blue-400" },
    { key: "qualified", label: "Kwalif.", count: qualifiedLeads, color: "bg-purple-400" },
    { key: "proposal", label: "Oferta", count: proposalLeads, color: "bg-orange-400" },
    { key: "won", label: "Wygrany", count: wonLeads, color: "bg-green-400" },
    { key: "lost", label: "Przegrany", count: lostLeads, color: "bg-red-400" },
  ];
  const maxFunnel = Math.max(...funnelStages.map((s) => s.count), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Przegląd Danesilogika</p>
        </div>
        <Link
          href="/analytics"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Pełna analityka
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-8 rounded-full ${stat.color}`} />
              <div className="flex-1">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.trend && (
                    <span className={`text-xs font-medium ${stat.trendColor}`}>{stat.trend}</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{stat.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TODAY section + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Today Center */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h2 className="font-semibold text-lg">Dzisiaj</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upcoming calls */}
            <div>
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Nadchodzące rozmowy</h3>
              {upcomingCalls.length > 0 ? (
                <div className="space-y-2">
                  {upcomingCalls.map((call) => (
                    <div key={call.id} className="bg-white/10 backdrop-blur rounded-lg p-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{call.name}</p>
                        <p className="text-xs text-gray-400">{call.contact}</p>
                      </div>
                      <div className="text-xs text-blue-300 font-mono shrink-0">
                        {call.callDate!.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" })}{" "}
                        {call.callDate!.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Brak zaplanowanych rozmów</p>
              )}
            </div>

            {/* Urgent tasks */}
            <div>
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Pilne zadania</h3>
              {urgentTasks.length > 0 ? (
                <div className="space-y-2">
                  {urgentTasks.map((task) => (
                    <div key={task.id} className="bg-white/10 backdrop-blur rounded-lg p-3 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${task.priority === "high" ? "bg-red-400" : task.priority === "medium" ? "bg-yellow-400" : "bg-gray-400"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">{task.title}</p>
                        <p className="text-xs text-gray-400 truncate">{task.project.name}</p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                        task.status === "in_progress" ? "bg-blue-500/30 text-blue-300" : "bg-gray-500/30 text-gray-300"
                      }`}>
                        {task.status === "in_progress" ? "W trakcie" : "Do zrobienia"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Brak pilnych zadań</p>
              )}
            </div>
          </div>

          {/* Quick stats bar */}
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-gray-400">Zadania ukończone:</span>
              <span className="font-semibold">{taskPercent}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span className="text-gray-400">Aktywne projekty:</span>
              <span className="font-semibold">{activeProjects}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full" />
              <span className="text-gray-400">Case studies:</span>
              <span className="font-semibold">{caseStudies}</span>
            </div>
          </div>
        </div>

        {/* Pipeline Funnel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Lejek sprzedaży</h2>
          <div className="space-y-3">
            {funnelStages.map((stage) => {
              const width = Math.max((stage.count / maxFunnel) * 100, 8);
              return (
                <div key={stage.key}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{stage.label}</span>
                    <span className="font-semibold text-gray-900">{stage.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`${stage.color} h-2.5 rounded-full transition-all`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            href="/analytics"
            className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Szczegółowa analityka &rarr;
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Ostatnie leady</h2>
            <Link href="/leads" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              Zobacz wszystkie &rarr;
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {leads.map((lead) => (
              <div key={lead.id} className="p-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">{lead.name}</p>
                    {lead.source === "calendly" && (
                      <span className="shrink-0 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-medium">
                        Cal
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{lead.contact} — {lead.industry || "brak branży"}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ml-3 ${statusColors[lead.status] || "bg-gray-100"}`}>
                  {statusLabels[lead.status] || lead.status}
                </span>
              </div>
            ))}
            {leads.length === 0 && (
              <p className="p-4 text-sm text-gray-400">Brak leadów</p>
            )}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Ostatnie projekty</h2>
            <Link href="/projects" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              Zobacz wszystkie &rarr;
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {projects.map((project) => {
              const totalTasksProj = project.tasks.length;
              const doneTasksProj = project.tasks.filter((t) => t.status === "done").length;
              return (
                <div key={project.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900">{project.name}</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status] || "bg-gray-100"}`}>
                      {statusLabels[project.status] || project.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{packageLabels[project.package] || project.package}</span>
                    {project.price && <span>{project.price.toLocaleString("pl-PL")} zł</span>}
                    {totalTasksProj > 0 && <span>{doneTasksProj}/{totalTasksProj} zadań</span>}
                  </div>
                  {totalTasksProj > 0 && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${(doneTasksProj / totalTasksProj) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {projects.length === 0 && (
              <p className="p-4 text-sm text-gray-400">Brak projektów</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
