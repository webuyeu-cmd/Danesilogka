import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Brak Google Calendar credentials. Ustaw GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN w .env"
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

export interface CalendarEvent {
  googleEventId: string;
  summary: string;
  attendeeEmail: string | null;
  attendeeName: string | null;
  startTime: Date;
  description: string | null;
}

/**
 * Pobiera nowe eventy z Google Calendar od podanej daty.
 * Filtruje tylko te, które wyglądają na rezerwacje Calendly
 * (mają attendee innego niż właściciel kalendarza).
 */
export async function getNewCalendarEvents(
  since: Date
): Promise<CalendarEvent[]> {
  const auth = getOAuth2Client();
  const calendar = google.calendar({ version: "v3", auth });

  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  const response = await calendar.events.list({
    calendarId,
    timeMin: since.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 50,
  });

  const events = response.data.items || [];

  // Filtruj eventy które mają attendees (rezerwacje, nie własne eventy)
  const calendlyEvents: CalendarEvent[] = [];

  for (const event of events) {
    if (!event.id || !event.start?.dateTime) continue;

    // Szukamy attendee który nie jest właścicielem kalendarza
    const attendees = event.attendees || [];
    const externalAttendee = attendees.find((a) => !a.self && !a.organizer);

    // Jeśli nie ma zewnętrznego attendee, sprawdź czy opis zawiera "Calendly"
    const isCalendly =
      externalAttendee ||
      event.description?.toLowerCase().includes("calendly") ||
      event.summary?.toLowerCase().includes("konsultacja") ||
      event.summary?.toLowerCase().includes("consultation");

    if (!isCalendly) continue;

    calendlyEvents.push({
      googleEventId: event.id,
      summary: event.summary || "Spotkanie",
      attendeeEmail: externalAttendee?.email || null,
      attendeeName: externalAttendee?.displayName || null,
      startTime: new Date(event.start.dateTime),
      description: event.description || null,
    });
  }

  return calendlyEvents;
}

/**
 * Generuje URL do autoryzacji OAuth2 (używane w skrypcie setup).
 */
export function getAuthUrl() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Ustaw GOOGLE_CLIENT_ID i GOOGLE_CLIENT_SECRET w .env");
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "urn:ietf:wg:oauth:2.0:oob"
  );

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}

/**
 * Wymienia auth code na tokeny (używane w skrypcie setup).
 */
export async function getTokensFromCode(code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "urn:ietf:wg:oauth:2.0:oob"
  );

  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}
