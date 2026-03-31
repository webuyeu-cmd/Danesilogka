"use client";

import { useEffect, useState } from "react";

interface Lead {
  id: string;
  name: string;
  contact: string;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  industry: string | null;
  painPoints: string | null;
  callDate: string | null;
  notes: string | null;
  createdAt: string;
}

const statusOptions = [
  { value: "new", label: "Nowy", color: "bg-blue-100 text-blue-800" },
  { value: "called", label: "Po rozmowie", color: "bg-yellow-100 text-yellow-800" },
  { value: "qualified", label: "Kwalifikowany", color: "bg-purple-100 text-purple-800" },
  { value: "proposal", label: "Oferta wysłana", color: "bg-orange-100 text-orange-800" },
  { value: "won", label: "Wygrany", color: "bg-green-100 text-green-800" },
  { value: "lost", label: "Przegrany", color: "bg-red-100 text-red-800" },
];

const sourceOptions = ["website", "facebook", "linkedin", "referral"];

const emptyForm = {
  name: "", contact: "", email: "", phone: "", source: "website",
  status: "new", industry: "", painPoints: "", callDate: "", notes: "",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/leads").then((r) => r.json()).then(setLeads);
  }, []);

  const filteredLeads = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const body = editId ? { ...form, id: editId } : form;
    const res = await fetch("/api/leads", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      const updated = await fetch("/api/leads").then((r) => r.json());
      setLeads(updated);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Usunąć ten lead?")) return;
    await fetch(`/api/leads?id=${id}`, { method: "DELETE" });
    setLeads(leads.filter((l) => l.id !== id));
  }

  function startEdit(lead: Lead) {
    setEditId(lead.id);
    setForm({
      name: lead.name,
      contact: lead.contact,
      email: lead.email || "",
      phone: lead.phone || "",
      source: lead.source,
      status: lead.status,
      industry: lead.industry || "",
      painPoints: lead.painPoints || "",
      callDate: lead.callDate ? lead.callDate.slice(0, 16) : "",
      notes: lead.notes || "",
    });
    setShowForm(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leady</h1>
          <p className="text-gray-500 mt-1">Pipeline sprzedażowy</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nowy lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "all" ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
        >
          Wszystkie ({leads.length})
        </button>
        {statusOptions.map((s) => {
          const count = leads.filter((l) => l.status === s.value).length;
          return (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s.value ? "bg-gray-900 text-white" : `${s.color} hover:opacity-80`}`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{editId ? "Edytuj lead" : "Nowy lead"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Firma *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kontakt *</label>
                  <input required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Źródło</label>
                  <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {sourceOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branża</label>
                  <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="np. hurtownia" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Problemy / Pain points</label>
                <textarea value={form.painPoints} onChange={(e) => setForm({ ...form, painPoints: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data konsultacji</label>
                <input type="datetime-local" value={form.callDate} onChange={(e) => setForm({ ...form, callDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
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

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Firma</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Kontakt</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Źródło</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Branża</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLeads.map((lead) => {
              const statusOpt = statusOptions.find((s) => s.value === lead.status);
              return (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 text-sm">{lead.name}</p>
                    {lead.painPoints && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{lead.painPoints}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900">{lead.contact}</p>
                    <p className="text-xs text-gray-400">{lead.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{lead.source}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{lead.industry || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusOpt?.color || "bg-gray-100"}`}>
                      {statusOpt?.label || lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(lead)} className="text-blue-600 hover:text-blue-800 text-sm mr-3">Edytuj</button>
                    <button onClick={() => handleDelete(lead.id)} className="text-red-500 hover:text-red-700 text-sm">Usuń</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredLeads.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">Brak leadów</p>
        )}
      </div>
    </div>
  );
}
