import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Przykładowe leady
  const lead1 = await prisma.lead.create({
    data: {
      name: "Hurtownia Kowalski",
      contact: "Jan Kowalski",
      email: "jan@hurtowniakowalski.pl",
      phone: "+48 600 100 200",
      source: "facebook",
      status: "qualified",
      industry: "hurtownia",
      painPoints: "Ręczne wystawianie ofert, chaos w zamówieniach, brak bazy wiedzy dla pracowników",
      callDate: new Date("2026-04-05T10:00:00"),
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      name: "Salon Fryzjerski Beauty",
      contact: "Anna Nowak",
      email: "anna@salonbeauty.pl",
      source: "website",
      status: "called",
      industry: "usługi",
      painPoints: "Dużo pytań od klientów na FB/IG, brak automatycznej rezerwacji",
    },
  });

  await prisma.lead.create({
    data: {
      name: "Sklep Budowlany Max",
      contact: "Piotr Wiśniewski",
      email: "piotr@sklepmax.pl",
      source: "linkedin",
      status: "new",
      industry: "handel",
      painPoints: "Ręczna obsługa zapytań cenowych, powtarzalne maile",
    },
  });

  // Projekty
  await prisma.project.create({
    data: {
      name: "Chatbot obsługi klienta",
      description: "Wdrożenie chatbota Botpress na stronie z bazą wiedzy FAQ",
      leadId: lead1.id,
      package: "quick_win",
      status: "in_progress",
      price: 2500,
      startDate: new Date("2026-04-01"),
      tasks: {
        create: [
          { title: "Analiza FAQ i procesów obsługi", status: "done", priority: "high" },
          { title: "Konfiguracja Botpress + KB", status: "in_progress", priority: "high" },
          { title: "Integracja z stroną www", status: "todo", priority: "medium" },
          { title: "Testy i szkolenie zespołu", status: "todo", priority: "medium" },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      name: "Diagnoza AI — Salon Beauty",
      description: "Audyt procesów + rekomendacje automatyzacji",
      leadId: lead2.id,
      package: "diagnosis",
      status: "pending",
      price: 499,
    },
  });

  // Case Studies
  await prisma.caseStudy.create({
    data: {
      title: "Automatyzacja obsługi zapytań — Outlet",
      client: "Własny projekt (Outlet)",
      industry: "e-commerce",
      problem: "Dziesiątki powtarzalnych pytań dziennie na Facebooku i mailu. Ręczna obsługa zajmowała 3h dziennie.",
      solution: "Wdrożenie chatbota Botpress z bazą wiedzy (KB) zawierającą FAQ, regulamin, info o dostawach. Automatyczne odpowiedzi na 80% pytań.",
      result: "Redukcja czasu obsługi o 70%. Klienci dostają odpowiedź w <30 sekund zamiast 2-4h.",
      tools: "Botpress, Knowledge Base",
      published: true,
    },
  });

  await prisma.caseStudy.create({
    data: {
      title: "System wiedzy RAG dla zespołu",
      client: "Danesilogika (wewnętrzny)",
      industry: "consulting",
      problem: "Rozproszone dokumenty, procedury i know-how w mailach, Dysku i notatkach. Nowi pracownicy potrzebowali tygodni na wdrożenie.",
      solution: "Budowa systemu RAG opartego na GPT + embeddingi. Centralna baza wiedzy z wyszukiwarką semantyczną.",
      result: "Czas onboardingu skrócony o 60%. Zespół znajduje odpowiedzi w sekundy zamiast godzin.",
      tools: "GPT API, Embeddings, Vector DB",
      published: false,
    },
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
