"use client";

import { useEffect, useState } from "react";

interface CaseStudy {
  id: string;
  title: string;
  client: string;
  industry: string | null;
  problem: string;
  solution: string;
  result: string;
  tools: string | null;
  published: boolean;
  createdAt: string;
}

const emptyForm = {
  title: "", client: "", industry: "", problem: "",
  solution: "", result: "", tools: "", published: false,
};

export default function CaseStudiesPage() {
  const [studies, setStudies] = useState<CaseStudy[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetch("/api/case-studies").then((r) => r.json()).then(setStudies);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const body = editId ? { ...form, id: editId } : form;
    const res = await fetch("/api/case-studies", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      const updated = await fetch("/api/case-studies").then((r) => r.json());
      setStudies(updated);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Usunąć to case study?")) return;
    await fetch(`/api/case-studies?id=${id}`, { method: "DELETE" });
    setStudies(studies.filter((s) => s.id !== id));
  }

  function startEdit(study: CaseStudy) {
    setEditId(study.id);
    setForm({
      title: study.title,
      client: study.client,
      industry: study.industry || "",
      problem: study.problem,
      solution: study.solution,
      result: study.result,
      tools: study.tools || "",
      published: study.published,
    });
    setShowForm(true);
  }

  async function togglePublished(study: CaseStudy) {
    const res = await fetch("/api/case-studies", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...study, published: !study.published }),
    });
    if (res.ok) {
      setStudies(studies.map((s) => s.id === study.id ? { ...s, published: !s.published } : s));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Case Studies</h1>
          <p className="text-gray-500 mt-1">Twoje wdrożenia — problem, rozwiązanie, efekt</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nowe case study
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{editId ? "Edytuj case study" : "Nowe case study"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tytuł *</label>
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Klient *</label>
                  <input required value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branża</label>
                  <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Narzędzia</label>
                  <input value={form.tools} onChange={(e) => setForm({ ...form, tools: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="np. Botpress, GPT, Zapier" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Problem *</label>
                <textarea required value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Jaki problem miał klient? Co nie działało?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rozwiązanie *</label>
                <textarea required value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Co zrobiłeś? Jakie narzędzia wdrożyłeś?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Efekt *</label>
                <textarea required value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Jaki był wynik? Ile czasu/pieniędzy zaoszczędził klient?" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="rounded" />
                <label htmlFor="published" className="text-sm text-gray-700">Opublikowany (widoczny na stronie)</label>
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

      {/* Case Studies Cards */}
      <div className="grid grid-cols-1 gap-6">
        {studies.map((study) => (
          <div key={study.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{study.title}</h3>
                    <button
                      onClick={() => togglePublished(study)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${study.published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}
                    >
                      {study.published ? "Opublikowany" : "Szkic"}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">{study.client} {study.industry && `— ${study.industry}`}</p>
                  {study.tools && (
                    <div className="flex gap-1.5 mt-2">
                      {study.tools.split(",").map((tool) => (
                        <span key={tool.trim()} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{tool.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(study)} className="text-blue-600 hover:text-blue-800 text-sm">Edytuj</button>
                  <button onClick={() => handleDelete(study.id)} className="text-red-500 hover:text-red-700 text-sm">Usuń</button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Problem</h4>
                  <p className="text-sm text-gray-700">{study.problem}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Rozwiązanie</h4>
                  <p className="text-sm text-gray-700">{study.solution}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Efekt</h4>
                  <p className="text-sm text-gray-700">{study.result}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {studies.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">Brak case studies — dodaj swoje pierwsze wdrożenie!</p>
        )}
      </div>
    </div>
  );
}
