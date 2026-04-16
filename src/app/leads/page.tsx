"use client";

import { useEffect, useState } from "react";
import { LEAD_STATUSES, LEAD_SOURCES } from "@/lib/constants";
import { LeadKanban } from "@/components/lead-kanban";

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

const emptyForm = {
  name: "", contact: "", email: "", phone: "", source: "website",
  status: "new", industry: "", painPoints: "", callDate: "", notes: "",
};

type View = "kanban" | "table";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState("all");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [view, setView] = useState<View>("kanban");

  useEffect(() => {
    fetch("/api/leads").then((r) => r.json()).then(setLeads);
    // persisted view preference
    const saved = typeof window !== "undefined" ? localStorage.getItem("leads-view") : null;
    if (saved === "kanban" || saved === "table") setView(saved);
  }, []);

  function changeView(next: View) {
    setView(next);
    if (typeof window !== "undefined") localStorage.setItem("leads-view", next);
  }

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/cron/sync-calendar", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncResult(`Zsynchronizowano: ${data.synced} nowych, ${data.skipped} pominiętych`);
        if (data.synced > 0) {
          const updated = await fetch("/api/leads").then((r) => r.json());
          setLeads(updated);
        }
      } else {
        setSyncResult(`Błąd: ${data.error}`);
      }
    } catch {
      setSyncResult("Błąd połączenia z Google Calendar");
    }
    setSyncing(false);
    setTimeout(() => setSyncResult(null), 5000);
  }

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

  async function handleStatusChange(leadId: string, newStatus: string) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    // Optimistic update
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
    const res = await fetch("/api/leads", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...lead, status: newStatus }),
    });
    if (!res.ok) {
      // revert on error
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: lead.status } : l)));
    }
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
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leady</h1>
          <p className="text-gray-500 mt-1">Pipeline sprzedażowy</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="bg-gray-100 rounded-lg p-0.5 flex">
            <button
              onClick={() => changeView("kanban")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${view === "kanban" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              Kanban
            </button>
            <button
              onClick={() => changeView("table")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${view === "table" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Tabela
            </button>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncing ? "Syncuję..." : "Sync z kalendarza"}
          </button>
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Nowy lead
          </button>
        </div>
      </div>

      {syncResult && (
        <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm ${syncResult.startsWith("Błąd") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {syncResult}
        </div>
      )}

      {/* Status filters — only in table view */}
      {view === "table" && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "all" ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            Wszystkie ({leads.length})
          </button>
          {LEAD_STATUSES.map((s) => {
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
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                    {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {LEAD_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
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
              <div className="flex gap-3 pt-2 justify-between">
                <div className="flex gap-3">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    {editId ? "Zapisz" : "Dodaj"}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                    Anuluj
                  </button>
                </div>
                {editId && (
                  <button type="button" onClick={() => { handleDelete(editId); setShowForm(false); setEditId(null); }} className="text-red-600 hover:text-red-800 px-4 py-2 text-sm font-medium">
                    Usuń
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {view === "kanban" ? (
        <LeadKanban leads={leads} onStatusChange={handleStatusChange} onEdit={startEdit} />
      ) : (
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
                const statusOpt = LEAD_STATUSES.find((s) => s.value === lead.status);
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
                    <td className="px-4 py-3 text-sm">
                      {lead.source === "calendly" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Calendly
                        </span>
                      ) : (
                        <span className="text-gray-600">{lead.source}</span>
                      )}
                    </td>
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
      )}
    </div>
  );
}
