"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

const STAGE_LABELS: Record<string, string> = {
  new: "Nowy",
  called: "Po rozmowie",
  qualified: "Kwalifikowany",
  proposal: "Oferta",
  won: "Wygrany",
  lost: "Przegrany",
};

const PACKAGE_LABELS: Record<string, string> = {
  diagnosis: "Diagnoza AI",
  quick_win: "Quick Win",
  full: "Pełne wdrożenie",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Oczekuje",
  in_progress: "W trakcie",
  review: "Review",
  completed: "Ukończony",
  cancelled: "Anulowany",
};

const SOURCE_LABELS: Record<string, string> = {
  website: "Strona WWW",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  referral: "Polecenie",
  calendly: "Calendly",
};

const FUNNEL_COLORS = ["#3b82f6", "#f59e0b", "#8b5cf6", "#f97316", "#22c55e", "#ef4444"];
const PIE_COLORS = ["#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];
const SOURCE_COLORS = ["#6366f1", "#3b82f6", "#0ea5e9", "#10b981", "#f59e0b"];

interface AnalyticsData {
  funnel: Array<{ stage: string; count: number }>;
  sourceBreakdown: Array<{ source: string; count: number }>;
  revenueByPackage: Array<{ package: string; total: number; count: number }>;
  revenueByStatus: Array<{ status: string; total: number; count: number }>;
  monthlyData: Array<{ month: string; leads: number; projects: number; revenue: number }>;
  taskStats: { total: number; todo: number; inProgress: number; done: number; highPriority: number };
  conversion: { rate: number; lossRate: number; totalLeads: number; wonLeads: number; lostLeads: number; avgDealValue: number };
  industryBreakdown: Array<{ industry: string; count: number }>;
  timeline: Array<{ type: string; text: string; date: string; color: string }>;
  upcomingCalls: Array<{ id: string; name: string; contact: string; callDate: string }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-lg">Ładowanie analityki...</div>
      </div>
    );
  }

  const funnelData = data.funnel
    .filter((f) => f.stage !== "lost")
    .map((f, i) => ({
      name: STAGE_LABELS[f.stage] || f.stage,
      value: f.count,
      fill: FUNNEL_COLORS[i],
    }));

  const sourceData = data.sourceBreakdown.map((s, i) => ({
    name: SOURCE_LABELS[s.source] || s.source,
    value: s.count,
    fill: SOURCE_COLORS[i % SOURCE_COLORS.length],
  }));

  const packageData = data.revenueByPackage
    .filter((p) => p.total > 0 || p.count > 0)
    .map((p, i) => ({
      name: PACKAGE_LABELS[p.package] || p.package,
      revenue: p.total,
      projects: p.count,
      fill: PIE_COLORS[i],
    }));

  const statusRevenueData = data.revenueByStatus
    .filter((s) => s.total > 0)
    .map((s) => ({
      name: STATUS_LABELS[s.status] || s.status,
      value: s.total,
    }));

  const taskPercent = data.taskStats.total > 0
    ? Math.round((data.taskStats.done / data.taskStats.total) * 100)
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analityka</h1>
        <p className="text-gray-500 mt-1">Statystyki, lejek sprzedaży i trendy</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KPICard
          label="Konwersja"
          value={`${data.conversion.rate}%`}
          sub={`${data.conversion.wonLeads} z ${data.conversion.totalLeads} leadów`}
          color="bg-green-500"
        />
        <KPICard
          label="Utrata"
          value={`${data.conversion.lossRate}%`}
          sub={`${data.conversion.lostLeads} przegranych`}
          color="bg-red-500"
        />
        <KPICard
          label="Śr. wartość deala"
          value={`${data.conversion.avgDealValue.toLocaleString("pl-PL")} zł`}
          sub="na projekt"
          color="bg-purple-500"
        />
        <KPICard
          label="Zadania"
          value={`${taskPercent}%`}
          sub={`${data.taskStats.done}/${data.taskStats.total} ukończone`}
          color="bg-blue-500"
        />
        <KPICard
          label="Pilne zadania"
          value={data.taskStats.highPriority}
          sub="wysoki priorytet"
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Lead Funnel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Lejek sprzedaży</h2>
          {funnelData.some((f) => f.value > 0) ? (
            <div className="space-y-3">
              {funnelData.map((stage, i) => {
                const maxVal = Math.max(...funnelData.map((f) => f.value), 1);
                const width = Math.max((stage.value / maxVal) * 100, 8);
                return (
                  <div key={stage.name} className="flex items-center gap-3">
                    <div className="w-28 text-sm text-gray-600 text-right shrink-0">{stage.name}</div>
                    <div className="flex-1 flex items-center gap-2">
                      <div
                        className="h-8 rounded-md flex items-center justify-end pr-3 transition-all"
                        style={{ width: `${width}%`, backgroundColor: FUNNEL_COLORS[i], minWidth: "2rem" }}
                      >
                        <span className="text-white text-sm font-bold">{stage.value}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState text="Brak danych lejka" />
          )}
        </div>

        {/* Source Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Źródła leadów</h2>
          {sourceData.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sourceData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                      {sourceData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => [`${val}`, "Leadów"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {sourceData.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />
                    <span className="text-gray-700">{s.name}</span>
                    <span className="font-semibold text-gray-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState text="Brak danych o źródłach" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Trendy miesięczne</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="leads" name="Leady" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="projects" name="Projekty" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Package */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Przychód wg pakietu</h2>
          {packageData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={packageData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `${v.toLocaleString("pl-PL")} zł`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" width={120} />
                  <Tooltip formatter={(val) => [`${Number(val).toLocaleString("pl-PL")} zł`, "Przychód"]} />
                  <Bar dataKey="revenue" name="Przychód" radius={[0, 6, 6, 0]}>
                    {packageData.map((entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState text="Brak danych o przychodach" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4">Przychód miesięczny</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(val) => [`${Number(val).toLocaleString("pl-PL")} zł`, "Przychód"]} />
                <Bar dataKey="revenue" name="Przychód" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Zadania</h2>
          <div className="space-y-4">
            <TaskBar label="Do zrobienia" count={data.taskStats.todo} total={data.taskStats.total} color="bg-gray-400" />
            <TaskBar label="W trakcie" count={data.taskStats.inProgress} total={data.taskStats.total} color="bg-blue-500" />
            <TaskBar label="Ukończone" count={data.taskStats.done} total={data.taskStats.total} color="bg-green-500" />
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Postęp</span>
              <span className="text-2xl font-bold text-gray-900">{taskPercent}%</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${taskPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Industry Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Branże klientów</h2>
          {data.industryBreakdown.length > 0 ? (
            <div className="space-y-3">
              {data.industryBreakdown.slice(0, 8).map((ind, i) => {
                const maxVal = Math.max(...data.industryBreakdown.map((b) => b.count), 1);
                const width = Math.max((ind.count / maxVal) * 100, 8);
                return (
                  <div key={ind.industry} className="flex items-center gap-3">
                    <div className="w-32 text-sm text-gray-600 text-right truncate shrink-0">{ind.industry}</div>
                    <div className="flex-1">
                      <div
                        className="h-6 rounded-md flex items-center px-2"
                        style={{ width: `${width}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] + "30" }}
                      >
                        <span className="text-xs font-semibold" style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>
                          {ind.count}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState text="Brak danych o branżach" />
          )}
        </div>

        {/* Upcoming Calls + Activity Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Nadchodzące rozmowy</h2>
          {data.upcomingCalls.length > 0 ? (
            <div className="space-y-3 mb-6">
              {data.upcomingCalls.map((call) => (
                <div key={call.id} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{call.name}</p>
                    <p className="text-xs text-gray-500">{call.contact}</p>
                  </div>
                  <div className="ml-auto text-xs text-blue-600 font-medium shrink-0">
                    {new Date(call.callDate).toLocaleString("pl-PL", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-6">Brak zaplanowanych rozmów</p>
          )}

          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Ostatnia aktywność</h3>
          <div className="space-y-0">
            {data.timeline.slice(0, 8).map((event, i) => (
              <div key={i} className="flex gap-3 pb-3 last:pb-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                      event.type === "lead" ? "bg-blue-500" : "bg-green-500"
                    }`}
                  />
                  {i < data.timeline.slice(0, 8).length - 1 && (
                    <div className="w-px flex-1 bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="min-w-0 pb-2">
                  <p className="text-sm text-gray-700 truncate">{event.text}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(event.date).toLocaleDateString("pl-PL", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {data.timeline.length === 0 && <EmptyState text="Brak aktywności" />}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-10 rounded-full ${color}`} />
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-400">{sub}</p>
        </div>
      </div>
    </div>
  );
}

function TaskBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percent = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{count}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-sm text-gray-400">{text}</div>
  );
}
