# QQX Projektplan: Multi-Tenant Flottenmanagement-SaaS

Dieses Dokument beschreibt die Architektur, Benutzerstruktur und den Implementierungsplan für die QQX-Plattform.

## 1. System-Architektur & Multi-Tenancy

Die Plattform wird als **Multi-Tenant SaaS** aufgebaut. Jedes Unternehmen (Kunde) erhält eine isolierte Umgebung.

-   **Isolation**: Daten werden auf Datenbankebene über eine `tenantId` getrennt.
-   **Zugriff**: Trennung erfolgt über Subdomains (z.B. `firma1.qqx-app.de`).
-   **Middleware**: Eine zentrale Middleware erkennt den Tenant anhand des Hostnames und leitet Anfragen sicher weiter.

## 2. Benutzer-Struktur & Rollen

| Rolle | Beschreibung | Berechtigungen |
| :--- | :--- | :--- |
| **Super Admin** | QQX-Eigentümer / Systeminhaber | Voller Zugriff auf alle Tenants, Abonnements und Systemeinstellungen. |
| **Admin** | Mitarbeiter der Softwarefirma | Verwaltung von Kunden-Setups, Support-Zugriff und Systemwartung. |
| **Tenant Admin** | Inhaber des Kunden-Unternehmens | Verwaltung der eigenen Flotte, Fahrer, Berichte und Buchhaltung. |
| **Mitarbeiter** | Disponenten / Büroangestellte | Tägliche operative Verwaltung, Zuweisung von Fahrten. |
| **Fahrer (Driver)** | Endnutzer (Gewerblich) | Zeiterfassung, Profilverwaltung, Einsicht in eigene Berichte. |

## 3. Kernmodule & Funktionen

### 🕒 Zeiterfassung (Time Tracking)
- Digitale Stempeluhr für Fahrer.
- Erfassung von Pausen und Lenkzeiten.
- Standortbasierte Validierung (GPS-Check bei Start/Stopp).

### 📊 Reporting & Analyse
- **Fahrer-Reports**: Automatische Erstellung von wöchentlichen/monatlichen Leistungsnachweisen.
- **Fahrer-Bewertung**: Feedback-System zur Qualitätssicherung und Motivation.
- **Export-Modul**: Bereitstellung von Daten als PDF oder Excel für Behörden oder Buchhaltung.

### 💰 Buchhaltung & Invoicing
- Rechnungserstellung für gewerbliche Fahrer (Subunternehmer).
- Übersicht über Honorare und offene Posten.
- Automatisierte Berechnung basierend auf erfassten Zeiten/Kilometern.

### 🚗 Fahrzeug- & Wartungsmanagement
- Inventarliste aller Fahrzeuge.
- Überwachung von Kilometerständen.
- Automatische Erinnerung an TÜV, UVV und Wartungsintervalle.

### 📍 GPS-Tracking & Geofencing
- **Echtzeit-Tracking**: Native Integration von Browser-Geolocation (Driver App) & optionaler Hardware-Tracker Anbindung.
- **WebSocket-Sync**: Standorte werden via WebSockets (Socket.io) an das Admin-Dashboard in Echtzeit gestreamt.
- **Geofencing-Engine**: Prüfung von Standortdaten gegen vordefinierte Polygone (Kundenstandorte, Sperrzonen) im Backend (PostGIS oder einfache Geo-Mathematik).
- **Benachrichtigungen**: Push-Benachrichtigungen bei Unregelmäßigkeiten (z.B. Fahrzeug verlässt Einsatzgebiet).

### ☁️ Cloud-Infrastruktur
- **Frontend**: Next.js App Router, optimiert für Vercel Edge Runtime.
- **Backend API**: Node.js Cluster auf AWS, skalierbar je nach Last.
- **Datenbank**: Managed PostgreSQL mit automatischer Replikation und Backups.
- **File Storage**: AWS S3 für Rechnungen (PDFs) und Fahrer-Dokumente.
- **Isolation**: Strikte Subdomain-zu-Tenant Zuordnung über Middleware.

## 4. Technischer Stack

-   **Frontend**: Next.js 16 (React Compiler) + Tailwind CSS 4 + Framer Motion.
-   **Backend**: Node.js / Express mit TypeScript.
-   **Datenbank**: PostgreSQL (via Prisma ORM).
-   **Authentifizierung**: Custom Solution (identifiziert via Header/JWT) oder Clerk Integration mit Tenant-Context.
-   **Infrastruktur**: Cloud-Hosting (Vercel für Frontend, AWS für Backend).

## 5. Phasenplan (Roadmap)

### Phase 1: Fundament (Erledigt/In Arbeit)
- [x] Multi-Tenant Datenbank-Schema (Prisma).
- [x] Modernes UI Framework & Landing Page.
- [x] Admin Dashboard Layout.
- [ ] Tenant-Setup-Mechanismus (Subdomain-Routing).

### Phase 2: Core Features (Nächste Schritte)
- [ ] Implementierung der Zeiterfassung.
- [ ] Fahrer-Management (CRUD & Profile).
- [ ] Fahrzeug-Management & Wartungsplaner.

### Phase 3: Buchhaltung & Reports
- [ ] PDF-Generierung für Reports.
- [ ] Rechnungsmodul für Subunternehmer.
- [ ] Dashboard-Statistiken (Charts).

### Phase 4: Tracking & Mobil
- [ ] Integration der Echtzeit-GPS-Daten.
- [ ] Mobile App für Fahrer (Zeiterfassung & Tracking).
