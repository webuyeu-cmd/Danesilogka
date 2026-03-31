# DANESILOGIKA — Plan rozwoju (next steps)

## Stan obecny
- Next.js 16 + TypeScript + Tailwind + Prisma/SQLite
- 4 strony: Dashboard, Leady, Projekty, Case Studies
- Pełne CRUD API dla wszystkich encji
- Seed data z przykładowymi danymi
- Build przechodzi, app działa

---

## FAZA 1: Naprawy i brakujące elementy (fundamenty)

### 1.1 Task CRUD — brakujący UI + API
**Problem:** Zadania (Task) istnieją w bazie, ale nie ma interfejsu do ich tworzenia/edycji/usuwania. Można je tylko widzieć w projekcie.

**Co zrobić:**
- Dodać `/api/tasks` endpoint (GET/POST/PUT/DELETE)
- Dodać inline task editor w projekcie (dodaj zadanie, zmień status, usuń)
- Drag & drop statusów: todo → in_progress → done

### 1.2 Fix endDate w formularzu projektów
**Problem:** Formularz projektów nie ma pola endDate, mimo że baza to obsługuje.

**Co zrobić:**
- Dodać input `endDate` w formularzu projektu obok `startDate`

### 1.3 Walidacja API + error handling
**Problem:** Żaden endpoint nie ma try-catch ani walidacji inputu. Złe requesty mogą crashować app.

**Co zrobić:**
- Dodać try-catch do każdego API route
- Walidacja wymaganych pól (name, contact dla leadów; name dla projektów)
- Zwracanie sensownych błędów (400/500) z komunikatami po polsku

### 1.4 Shared types i constants
**Problem:** Typy (Lead, Project, etc.) i kolory statusów są zduplikowane w wielu plikach.

**Co zrobić:**
- `src/types/index.ts` — wspólne interfejsy
- `src/lib/constants.ts` — statusy, kolory, labele, pakiety (jedno źródło prawdy)
- Posprzątać importy we wszystkich stronach

---

## FAZA 2: UX i funkcjonalność (użyteczność)

### 2.1 Wyszukiwarka i sortowanie
- Search bar na stronie leadów (szukaj po nazwie, kontakcie, emailu)
- Search bar na stronie projektów
- Klikalne nagłówki tabeli do sortowania (nazwa, data, cena, status)

### 2.2 Polskie tłumaczenie priorytetów
- Zamienić "low/medium/high" → "Niski/Średni/Wysoki" w wyświetlaniu tasków

### 2.3 Responsywność mobile
- Sidebar: hamburger menu na małych ekranach zamiast fixed 256px
- Tabele: karty zamiast tabel na mobile
- Formularze: pełna szerokość na mobile

### 2.4 Szybkie akcje na dashboardzie
- Przycisk "Dodaj lead" i "Dodaj projekt" bezpośrednio z dashboardu
- Klikalne karty leadów/projektów → link do szczegółów

---

## FAZA 3: Analityka i eksport (wartość biznesowa)

### 3.1 Wykresy na dashboardzie
- Funnel sprzedażowy (ile leadów na każdym etapie)
- Przychód miesięczny (bar chart)
- Konwersja leadów (% z nowego do wygranego)
- Biblioteka: lightweight chart lib (np. recharts lub chart.js)

### 3.2 Eksport danych
- Eksport leadów do CSV
- Eksport case studies do PDF (gotowe do wysłania klientowi)
- Eksport raportu dashboardu

### 3.3 Widok timeline/kalendarz
- Gantt-like widok projektów (start → end)
- Widok kalendarza z zaplanowanymi konsultacjami (callDate z leadów)

---

## FAZA 4: Integracje i automatyzacja (skalowanie)

### 4.1 Autentykacja
- NextAuth.js z prostym loginem email/hasło
- Zabezpieczenie wszystkich routes

### 4.2 Integracja z Calendly
- Webhook z Calendly → automatyczne tworzenie leada
- Sync dat konsultacji

### 4.3 Powiadomienia
- Email reminder o nadchodzących konsultacjach
- Notyfikacja gdy lead jest "nowy" dłużej niż 48h

### 4.4 Public case studies API
- Endpoint `/api/public/case-studies` (tylko published=true)
- Do osadzenia na danesilogika.com

---

## Rekomendacja: zaczynamy od Fazy 1

Faza 1 to ~2-3h pracy, a naprawia fundamenty:
- **1.1** Task CRUD (najważniejsze — bez tego projekty są połowiczne)
- **1.2** Fix endDate (szybki fix, 5 min)
- **1.3** Walidacja API (bezpieczeństwo)
- **1.4** Shared types/constants (porządek w kodzie)

Po Fazie 1 masz solidną bazę do dalszej rozbudowy.
