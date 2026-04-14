import { prisma } from "@/lib/db";
import { getNewCalendarEvents } from "@/lib/google-calendar";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cron/sync-calendar
 *
 * Synchronizuje Google Calendar z bazą leadów.
 * Wywoływany przez cron (co 15 min) lub ręcznie z dashboardu.
 *
 * Header: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  // Autoryzacja — prosty bearer token
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Brak autoryzacji" },
        { status: 401 }
      );
    }
  }

  try {
    // Sprawdź czy credentials są skonfigurowane
    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.GOOGLE_CLIENT_SECRET ||
      !process.env.GOOGLE_REFRESH_TOKEN
    ) {
      return NextResponse.json(
        {
          error: "Google Calendar nie jest skonfigurowany",
          setup:
            "Uruchom: npx tsx scripts/google-auth.ts i dodaj credentials do .env",
        },
        { status: 503 }
      );
    }

    // Znajdź datę ostatniego synca (ostatni lead z calendly) lub 7 dni wstecz
    const lastCalendlyLead = await prisma.lead.findFirst({
      where: { source: "calendly" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    const since = lastCalendlyLead
      ? lastCalendlyLead.createdAt
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 dni wstecz

    // Pobierz nowe eventy z Google Calendar
    const events = await getNewCalendarEvents(since);

    // Filtruj eventy które już mamy w bazie
    const existingEventIds = new Set(
      (
        await prisma.lead.findMany({
          where: {
            googleEventId: { in: events.map((e) => e.googleEventId) },
          },
          select: { googleEventId: true },
        })
      ).map((l) => l.googleEventId)
    );

    const newEvents = events.filter(
      (e) => !existingEventIds.has(e.googleEventId)
    );

    // Twórz leady z nowych eventów
    const createdLeads = [];
    for (const event of newEvents) {
      const lead = await prisma.lead.create({
        data: {
          name: event.attendeeName || event.attendeeEmail || event.summary,
          contact: event.attendeeName || event.attendeeEmail || "—",
          email: event.attendeeEmail,
          source: "calendly",
          status: "new",
          callDate: event.startTime,
          googleEventId: event.googleEventId,
          notes: `Auto-import z Google Calendar. Spotkanie: ${event.summary}`,
        },
      });
      createdLeads.push(lead);
    }

    return NextResponse.json({
      success: true,
      synced: createdLeads.length,
      skipped: events.length - newEvents.length,
      total_events: events.length,
      leads: createdLeads.map((l) => ({
        id: l.id,
        name: l.name,
        email: l.email,
        callDate: l.callDate,
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nieznany błąd synca";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/cron/sync-calendar
 *
 * Ręczny trigger synca z dashboardu (bez potrzeby auth headera).
 */
export async function POST(request: NextRequest) {
  // Dla POST z dashboardu — dodajemy auth header i przekierowujemy do GET
  const url = new URL(request.url);
  const headers = new Headers(request.headers);

  // Jeśli jest CRON_SECRET, dodaj go automatycznie dla wewnętrznych requestów
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    headers.set("authorization", `Bearer ${cronSecret}`);
  }

  const internalRequest = new NextRequest(url, { headers });
  return GET(internalRequest);
}
