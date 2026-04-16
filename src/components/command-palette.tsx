"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchResults {
  leads: Array<{ id: string; name: string; contact: string; status: string; email: string | null }>;
  projects: Array<{ id: string; name: string; status: string; description: string | null }>;
  tasks: Array<{ id: string; title: string; status: string; projectId: string }>;
  caseStudies: Array<{ id: string; title: string; client: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  new: "Nowy", called: "Po rozmowie", qualified: "Kwalifikowany", proposal: "Oferta",
  won: "Wygrany", lost: "Przegrany", pending: "Oczekuje", in_progress: "W trakcie",
  review: "Review", completed: "Ukończony", todo: "Do zrobienia", done: "Ukończone",
};

const QUICK_ACTIONS = [
  { label: "Dashboard", href: "/", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3" },
  { label: "Leady", href: "/leads", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857" },
  { label: "Projekty", href: "/projects", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" },
  { label: "Analityka", href: "/analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" },
  { label: "Case Studies", href: "/case-studies", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults(null);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const search = useCallback((q: string) => {
    if (q.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data);
        setSelectedIndex(0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleInput(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 250);
  }

  function getAllItems(): Array<{ type: string; label: string; sub: string; href: string }> {
    if (!query.trim()) {
      return QUICK_ACTIONS.map((a) => ({
        type: "action",
        label: a.label,
        sub: "Nawigacja",
        href: a.href,
      }));
    }
    if (!results) return [];
    const items: Array<{ type: string; label: string; sub: string; href: string }> = [];
    results.leads.forEach((l) =>
      items.push({ type: "lead", label: l.name, sub: `${l.contact} — ${STATUS_LABELS[l.status] || l.status}`, href: "/leads" })
    );
    results.projects.forEach((p) =>
      items.push({ type: "project", label: p.name, sub: STATUS_LABELS[p.status] || p.status, href: "/projects" })
    );
    results.tasks.forEach((t) =>
      items.push({ type: "task", label: t.title, sub: STATUS_LABELS[t.status] || t.status, href: "/projects" })
    );
    results.caseStudies.forEach((c) =>
      items.push({ type: "case", label: c.title, sub: c.client, href: "/case-studies" })
    );
    return items;
  }

  const items = getAllItems();

  function handleSelect(href: string) {
    setOpen(false);
    router.push(href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && items[selectedIndex]) {
      e.preventDefault();
      handleSelect(items[selectedIndex].href);
    }
  }

  const typeIcons: Record<string, string> = {
    lead: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    project: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2",
    task: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    case: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586",
    action: "M13 10V3L4 14h7v7l9-11h-7z",
  };

  const typeColors: Record<string, string> = {
    lead: "text-blue-500",
    project: "text-green-500",
    task: "text-yellow-500",
    case: "text-purple-500",
    action: "text-gray-400",
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center border-b border-gray-200 px-4">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Szukaj leadów, projektów, zadań..."
            className="flex-1 py-4 px-3 text-sm outline-none placeholder:text-gray-400"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-[10px] text-gray-500 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {loading && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">Szukam...</div>
          )}

          {!loading && items.length === 0 && query.length >= 2 && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              Brak wyników dla &ldquo;{query}&rdquo;
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="py-2">
              {!query.trim() && (
                <div className="px-4 py-1.5 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                  Szybka nawigacja
                </div>
              )}
              {items.map((item, i) => (
                <button
                  key={`${item.type}-${item.label}-${i}`}
                  onClick={() => handleSelect(item.href)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    i === selectedIndex ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <svg className={`w-4 h-4 shrink-0 ${typeColors[item.type] || "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeIcons[item.type] || typeIcons.action} />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.label}</p>
                    <p className="text-xs text-gray-500 truncate">{item.sub}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0 uppercase">{item.type === "action" ? "" : item.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-4 text-[10px] text-gray-400">
          <span><kbd className="px-1 py-0.5 bg-gray-100 rounded font-mono">↑↓</kbd> nawiguj</span>
          <span><kbd className="px-1 py-0.5 bg-gray-100 rounded font-mono">↵</kbd> otwórz</span>
          <span><kbd className="px-1 py-0.5 bg-gray-100 rounded font-mono">esc</kbd> zamknij</span>
        </div>
      </div>
    </div>
  );
}
