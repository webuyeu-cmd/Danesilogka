"use client";

import { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  package: string;
  status: string;
  price: number | null;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  leadId: string | null;
  lead: { id: string; name: string } | null;
  tasks: Task[];
  createdAt: string;
}

interface Lead {
  id: string;
  name: string;
}

const statusOptions = [
  { value: "pending", label: "Oczekuje", color: "bg-gray-100 text-gray-800" },
  { value: "in_progress", label: "W trakcie", color: "bg-blue-100 text-blue-800" },
  { value: "review", label: "Review", color: "bg-yellow-100 text-yellow-800" },
  { value: "completed", label: "Ukończony", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Anulowany", color: "bg-red-100 text-red-800" },
];

const packageOptions = [
  { value: "diagnosis", label: "Diagnoza AI (299-999 zł)", color: "bg-purple-100 text-purple-800" },
  { value: "quick_win", label: "Szybkie wdrożenie (1-3k zł)", color: "bg-blue-100 text-blue-800" },
  { value: "full", label: "Pełne wdrożenie (5-20k zł)", color: "bg-green-100 text-green-800" },
];

const emptyForm = {
  name: "", description: "", leadId: "", package: "diagnosis",
  status: "pending", price: "", startDate: "", endDate: "", notes: "",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects").then((r) => r.json()).then(setProjects);
    fetch("/api/leads").then((r) => r.json()).then(setLeads);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const body = editId ? { ...form, id: editId } : form;
    const res = await fetch("/api/projects", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      const updated = await fetch("/api/projects").then((r) => r.json());
      setProjects(updated);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Usunąć ten projekt?")) return;
    await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
    setProjects(projects.filter((p) => p.id !== id));
  }

  function startEdit(project: Project) {
    setEditId(project.id);
    setForm({
      name: project.name,
      description: project.description || "",
      leadId: project.leadId || "",
      package: project.package,
      status: project.status,
      price: project.price?.toString() || "",
      startDate: project.startDate ? project.startDate.slice(0, 10) : "",
      endDate: project.endDate ? project.endDate.slice(0, 10) : "",
      notes: project.notes || "",
    });
    setShowForm(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projekty</h1>
          <p className="text-gray-500 mt-1">Wdrożenia i diagnozy AI</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nowy projekt
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {packageOptions.map((pkg) => {
          const count = projects.filter((p) => p.package === pkg.value).length;
          const revenue = projects
            .filter((p) => p.package === pkg.value)
            .reduce((sum, p) => sum + (p.price || 0), 0);
          return (
            <div key={pkg.value} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${pkg.color}`}>{pkg.label}</span>
              <p className="text-2xl font-bold mt-2">{count}</p>
              <p className="text-xs text-gray-400">{revenue.toLocaleString("pl-PL")} zł pipeline</p>
            </div>
          );
        })}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{editId ? "Edytuj projekt" : "Nowy projekt"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa projektu *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Klient</label>
                  <select value={form.leadId} onChange={(e) => setForm({ ...form, leadId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">— brak —</option>
                    {leads.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pakiet</label>
                  <select value={form.package} onChange={(e) => setForm({ ...form, package: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {packageOptions.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cena (zł)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notatki</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                  {editId ? "Zapisz" : "Dodaj"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project) => {
          const statusOpt = statusOptions.find((s) => s.value === project.status);
          const pkgOpt = packageOptions.find((p) => p.value === project.package);
          const totalTasks = project.tasks.length;
          const doneTasks = project.tasks.filter((t) => t.status === "done").length;
          const isExpanded = expandedId === project.id;

          return (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div
                className="p-5 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : project.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${pkgOpt?.color || "bg-gray-100"}`}>
                      {pkgOpt?.label.split(" (")[0] || project.package}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusOpt?.color || "bg-gray-100"}`}>
                      {statusOpt?.label || project.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {project.price && <span className="text-sm font-medium text-gray-700">{project.price.toLocaleString("pl-PL")} zł</span>}
                    <button onClick={(e) => { e.stopPropagation(); startEdit(project); }} className="text-blue-600 hover:text-blue-800 text-sm">Edytuj</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }} className="text-red-500 hover:text-red-700 text-sm">Usuń</button>
                  </div>
                </div>
                {project.description && <p className="text-sm text-gray-500 mt-1">{project.description}</p>}
                {project.lead && <p className="text-xs text-gray-400 mt-1">Klient: {project.lead.name}</p>}
                {totalTasks > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Postęp: {doneTasks}/{totalTasks} zadań</span>
                      <span>{Math.round((doneTasks / totalTasks) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${(doneTasks / totalTasks) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
              {isExpanded && project.tasks.length > 0 && (
                <div className="border-t border-gray-100 p-5">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Zadania</h4>
                  <div className="space-y-2">
                    {project.tasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${task.status === "done" ? "bg-green-500" : task.status === "in_progress" ? "bg-blue-500" : "bg-gray-300"}`} />
                        <span className={`text-sm ${task.status === "done" ? "text-gray-400 line-through" : "text-gray-700"}`}>{task.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${task.priority === "high" ? "bg-red-50 text-red-600" : task.priority === "medium" ? "bg-yellow-50 text-yellow-600" : "bg-gray-50 text-gray-500"}`}>
                          {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {projects.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">Brak projektów</p>
        )}
      </div>
    </div>
  );
}
