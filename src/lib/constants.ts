// Centralized constants for Danesilogika

export const LEAD_STATUSES = [
  { value: "new", label: "Nowy", color: "bg-blue-100 text-blue-800", border: "border-blue-200" },
  { value: "called", label: "Po rozmowie", color: "bg-yellow-100 text-yellow-800", border: "border-yellow-200" },
  { value: "qualified", label: "Kwalifikowany", color: "bg-purple-100 text-purple-800", border: "border-purple-200" },
  { value: "proposal", label: "Oferta", color: "bg-orange-100 text-orange-800", border: "border-orange-200" },
  { value: "won", label: "Wygrany", color: "bg-green-100 text-green-800", border: "border-green-200" },
  { value: "lost", label: "Przegrany", color: "bg-red-100 text-red-800", border: "border-red-200" },
] as const;

export const PROJECT_STATUSES = [
  { value: "pending", label: "Oczekuje", color: "bg-gray-100 text-gray-800" },
  { value: "in_progress", label: "W trakcie", color: "bg-blue-100 text-blue-800" },
  { value: "review", label: "Review", color: "bg-yellow-100 text-yellow-800" },
  { value: "completed", label: "Ukończony", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Anulowany", color: "bg-red-100 text-red-800" },
] as const;

export const PROJECT_PACKAGES = [
  { value: "diagnosis", label: "Diagnoza AI (299-999 zł)", color: "bg-purple-100 text-purple-800" },
  { value: "quick_win", label: "Szybkie wdrożenie (1-3k zł)", color: "bg-blue-100 text-blue-800" },
  { value: "full", label: "Pełne wdrożenie (5-20k zł)", color: "bg-green-100 text-green-800" },
] as const;

export const TASK_PRIORITIES = [
  { value: "low", label: "Niski", color: "bg-gray-50 text-gray-500" },
  { value: "medium", label: "Średni", color: "bg-yellow-50 text-yellow-600" },
  { value: "high", label: "Wysoki", color: "bg-red-50 text-red-600" },
] as const;

// Project templates — pre-built task lists for common engagements
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  package: "diagnosis" | "quick_win" | "full";
  suggestedPrice: number;
  tasks: Array<{ title: string; priority: "low" | "medium" | "high" }>;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "blank",
    name: "— Pusty projekt (bez szablonu) —",
    description: "",
    package: "diagnosis",
    suggestedPrice: 0,
    tasks: [],
  },
  {
    id: "diagnosis_ai",
    name: "Diagnoza AI",
    description: "Audyt procesów firmy + rekomendacje automatyzacji + PDF roadmapa",
    package: "diagnosis",
    suggestedPrice: 499,
    tasks: [
      { title: "Wywiad z klientem (30-60 min)", priority: "high" },
      { title: "Analiza procesów i bottleneckow", priority: "high" },
      { title: "Identyfikacja obszarów do automatyzacji", priority: "medium" },
      { title: "Research narzędzi i rozwiązań", priority: "medium" },
      { title: "Przygotowanie PDF z rekomendacjami", priority: "high" },
      { title: "Prezentacja wyników klientowi", priority: "high" },
    ],
  },
  {
    id: "chatbot_botpress",
    name: "Chatbot obsługi klienta (Botpress)",
    description: "Chatbot na stronę WWW z bazą wiedzy FAQ — automatyzacja typowych zapytań",
    package: "quick_win",
    suggestedPrice: 2500,
    tasks: [
      { title: "Analiza FAQ i powtarzalnych zapytań", priority: "high" },
      { title: "Zebranie contentu do Knowledge Base", priority: "high" },
      { title: "Konfiguracja Botpress + KB", priority: "high" },
      { title: "Projektowanie flow rozmowy", priority: "medium" },
      { title: "Integracja z stroną WWW klienta", priority: "high" },
      { title: "Testy i QA", priority: "medium" },
      { title: "Szkolenie zespołu klienta (30 min)", priority: "medium" },
      { title: "Handoff + dokumentacja", priority: "low" },
    ],
  },
  {
    id: "automation_process",
    name: "Automatyzacja procesu (Make/Zapier)",
    description: "Automatyzacja powtarzalnego procesu (np. wystawianie ofert, segregacja maili)",
    package: "quick_win",
    suggestedPrice: 1800,
    tasks: [
      { title: "Mapowanie obecnego procesu", priority: "high" },
      { title: "Identyfikacja triggerów i akcji", priority: "high" },
      { title: "Wybór narzędzia (Make/Zapier/n8n)", priority: "medium" },
      { title: "Budowa automatyzacji", priority: "high" },
      { title: "Testy na rzeczywistych danych", priority: "high" },
      { title: "Deploy + monitoring", priority: "medium" },
      { title: "Szkolenie obsługi", priority: "low" },
    ],
  },
  {
    id: "rag_knowledge",
    name: "RAG — Baza wiedzy dla zespołu",
    description: "System wyszukiwania w dokumentach firmy oparty o AI (GPT + embeddings)",
    package: "full",
    suggestedPrice: 8500,
    tasks: [
      { title: "Inwentaryzacja dokumentów i źródeł wiedzy", priority: "high" },
      { title: "Przygotowanie i czyszczenie danych", priority: "high" },
      { title: "Setup vector database", priority: "high" },
      { title: "Generowanie embeddingów", priority: "high" },
      { title: "Implementacja RAG pipeline", priority: "high" },
      { title: "UI do zadawania pytań", priority: "medium" },
      { title: "Integracja z systemami klienta", priority: "medium" },
      { title: "Testy jakości odpowiedzi", priority: "high" },
      { title: "Szkolenie zespołu + dokumentacja", priority: "medium" },
      { title: "Monitoring i optymalizacja (2 tyg)", priority: "low" },
    ],
  },
  {
    id: "email_automation",
    name: "Automatyzacja maili i odpowiedzi",
    description: "AI draft odpowiedzi na maile + segregacja + priorytetyzacja",
    package: "quick_win",
    suggestedPrice: 2200,
    tasks: [
      { title: "Audyt skrzynki i typów maili", priority: "high" },
      { title: "Definicja kategorii i priorytetów", priority: "high" },
      { title: "Setup AI klasyfikatora (GPT)", priority: "high" },
      { title: "Szablony odpowiedzi per kategoria", priority: "medium" },
      { title: "Integracja z Gmail/Outlook", priority: "high" },
      { title: "Testy i tuning", priority: "medium" },
      { title: "Handoff", priority: "low" },
    ],
  },
];

export const LEAD_SOURCES = ["website", "facebook", "linkedin", "referral", "calendly"] as const;
