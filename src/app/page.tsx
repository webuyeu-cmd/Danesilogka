import { prisma } from "@/lib/db";

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
  const [leads, projects, caseStudies] = await Promise.all([
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { lead: true, tasks: true },
    }),
    prisma.caseStudy.count(),
  ]);

  const [totalLeads, newLeads, qualifiedLeads] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "new" } }),
    prisma.lead.count({ where: { status: "qualified" } }),
  ]);

  const [totalProjects, activeProjects] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "in_progress" } }),
  ]);

  const revenue = await prisma.project.aggregate({
    _sum: { price: true },
    where: { status: { in: ["in_progress", "completed", "review"] } },
  });

  const stats = [
    { label: "Leady", value: totalLeads, sub: `${newLeads} nowych, ${qualifiedLeads} kwalif.`, color: "bg-blue-500" },
    { label: "Projekty", value: totalProjects, sub: `${activeProjects} aktywnych`, color: "bg-green-500" },
    { label: "Przychód (pipeline)", value: `${(revenue._sum.price || 0).toLocaleString("pl-PL")} zł`, sub: "aktywne + ukończone", color: "bg-purple-500" },
    { label: "Case Studies", value: caseStudies, sub: "do publikacji", color: "bg-orange-500" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Przegląd Danesilogika</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-8 rounded-full ${stat.color}`} />
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Ostatnie leady</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {leads.map((lead) => (
              <div key={lead.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{lead.name}</p>
                  <p className="text-sm text-gray-500">{lead.contact} — {lead.industry || "brak branży"}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[lead.status] || "bg-gray-100"}`}>
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
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Ostatnie projekty</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {projects.map((project) => {
              const totalTasks = project.tasks.length;
              const doneTasks = project.tasks.filter((t) => t.status === "done").length;
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
                    {totalTasks > 0 && <span>{doneTasks}/{totalTasks} zadań</span>}
                  </div>
                  {totalTasks > 0 && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${(doneTasks / totalTasks) * 100}%` }}
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
