/**
 * Jednorazowy skrypt do uzyskania Google OAuth refresh token.
 *
 * INSTRUKCJA:
 *
 * 1. Wejdź na https://console.cloud.google.com
 * 2. Stwórz nowy projekt (np. "Danesilogika")
 * 3. Włącz Google Calendar API:
 *    → APIs & Services → Library → szukaj "Google Calendar API" → Enable
 * 4. Stwórz OAuth credentials:
 *    → APIs & Services → Credentials → Create Credentials → OAuth client ID
 *    → Application type: "Desktop app" (lub "Web application")
 *    → Nazwa: "Danesilogika Sync"
 *    → Zapisz Client ID i Client Secret
 * 5. Skonfiguruj OAuth consent screen:
 *    → APIs & Services → OAuth consent screen
 *    → User type: External
 *    → Dodaj swój email jako test user
 * 6. Wpisz credentials do .env:
 *    GOOGLE_CLIENT_ID=twoj_client_id
 *    GOOGLE_CLIENT_SECRET=twoj_client_secret
 * 7. Uruchom ten skrypt:
 *    npx tsx scripts/google-auth.ts
 * 8. Otwórz URL w przeglądarce, zaloguj się, skopiuj kod
 * 9. Wklej kod tutaj → otrzymasz refresh token
 * 10. Dodaj do .env:
 *     GOOGLE_REFRESH_TOKEN=twoj_refresh_token
 *
 * GOTOWE! Sync z Google Calendar jest skonfigurowany.
 */

import "dotenv/config";
import { google } from "googleapis";
import * as readline from "readline";

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

async function main() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("❌ Brak GOOGLE_CLIENT_ID lub GOOGLE_CLIENT_SECRET w .env");
    console.error("");
    console.error("Dodaj do pliku .env:");
    console.error("  GOOGLE_CLIENT_ID=twoj_client_id");
    console.error("  GOOGLE_CLIENT_SECRET=twoj_client_secret");
    console.error("");
    console.error("Instrukcja: patrz komentarz na górze tego pliku.");
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "urn:ietf:wg:oauth:2.0:oob"
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  console.log("");
  console.log("=== DANESILOGIKA — Google Calendar Setup ===");
  console.log("");
  console.log("1. Otwórz ten URL w przeglądarce:");
  console.log("");
  console.log(`   ${authUrl}`);
  console.log("");
  console.log("2. Zaloguj się na swoje konto Google");
  console.log('3. Kliknij "Zezwalaj" (Allow)');
  console.log("4. Skopiuj kod autoryzacji");
  console.log("");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise<string>((resolve) => {
    rl.question("Wklej kod autoryzacji tutaj: ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      console.error("");
      console.error("❌ Nie otrzymano refresh tokena.");
      console.error(
        "   Spróbuj ponownie — upewnij się, że w consent screen kliknąłeś 'Zezwalaj'."
      );
      process.exit(1);
    }

    console.log("");
    console.log("✅ Sukces! Dodaj ten refresh token do pliku .env:");
    console.log("");
    console.log(`   GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log("");
    console.log("Opcjonalnie dodaj też:");
    console.log(
      "   GOOGLE_CALENDAR_ID=primary   (lub ID konkretnego kalendarza)"
    );
    console.log(
      "   CRON_SECRET=jakis-losowy-string   (do zabezpieczenia sync endpointu)"
    );
    console.log("");
    console.log("Po dodaniu do .env, sync jest gotowy!");
    console.log("Test: curl http://localhost:3000/api/cron/sync-calendar");
  } catch (error) {
    console.error("");
    console.error("❌ Błąd podczas wymiany kodu na token:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
