"use client";

import { useState } from "react";
import { LEAD_STATUSES } from "@/lib/constants";

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

interface Props {
  leads: Lead[];
  onStatusChange: (leadId: string, newStatus: string) => void;
  onEdit: (lead: Lead) => void;
}

export function LeadKanban({ leads, onStatusChange, onEdit }: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  function handleDragStart(e: React.DragEvent, leadId: string) {
    setDraggingId(leadId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", leadId);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverColumn(null);
  }

  function handleDragOver(e: React.DragEvent, status: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  }

  function handleDragLeave(e: React.DragEvent) {
    // Only clear if leaving the column itself
    if (e.currentTarget === e.target) {
      setDragOverColumn(null);
    }
  }

  function handleDrop(e: React.DragEvent, status: string) {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain");
    const lead = leads.find((l) => l.id === leadId);
    if (lead && lead.status !== status) {
      onStatusChange(leadId, status);
    }
    setDragOverColumn(null);
    setDraggingId(null);
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-4 min-w-max">
        {LEAD_STATUSES.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.value);
          const isDragOver = dragOverColumn === col.value;

          return (
            <div
              key={col.value}
              onDragOver={(e) => handleDragOver(e, col.value)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.value)}
              className={`w-72 shrink-0 rounded-xl p-3 transition-colors ${
                isDragOver ? "bg-blue-50 ring-2 ring-blue-400" : "bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="text-xs text-gray-500">{colLeads.length}</span>
                </div>
              </div>

              <div className="space-y-2 min-h-[100px]">
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onEdit(lead)}
                    className={`bg-white rounded-lg border p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
                      draggingId === lead.id ? "opacity-40" : ""
                    } ${col.border}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-sm text-gray-900 truncate">{lead.name}</p>
                      {lead.source === "calendly" && (
                        <span className="shrink-0 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-medium">
                          Cal
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{lead.contact}</p>
                    {lead.industry && (
                      <p className="text-xs text-gray-400 mt-1">{lead.industry}</p>
                    )}
                    {lead.painPoints && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2 border-t border-gray-100 pt-2">
                        {lead.painPoints}
                      </p>
                    )}
                    {lead.callDate && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(lead.callDate).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    )}
                  </div>
                ))}

                {colLeads.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    Brak leadów
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
