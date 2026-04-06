"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

type LegalType = 'impressum' | 'datenschutz' | 'agb' | 'cookies' | null;

interface LegalModalsProps {
  type: LegalType;
  onClose: () => void;
}

export function LegalModals({ type, onClose }: LegalModalsProps) {
  const content = {
    impressum: {
      title: "Impressum",
      description: "Angaben gemäß § 5 TMG / § 25 MedienG",
      body: (
        <div className="space-y-6 text-sm text-gray-300">
          <div>
            <h4 className="font-bold text-white text-base">Medieninhaber & Herausgeber</h4>
            <p>Volkan Meral</p>
            <p>FastRoute Kurier & Kleintransporte</p>
            <p>Achstrasse 42</p>
            <p>6922 Wolfurt, Österreich</p>
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Kontakt</h4>
            <p>Telefon: +43 676 9419393</p>
            <p>E-Mail: office@qqxsoft.com</p>
            <p>Web: www.qqxsoft.com</p>
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Unternehmensdaten</h4>
            <p>Rechtsform: Einzelunternehmen</p>
            <p>UID-Nummer: ATU71572719</p>
            <p>GLN: 9110024223259</p>
            <p>GISA-Zahl: 29194212</p>
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Aufsichtsbehörde</h4>
            <p>Bezirkshauptmannschaft Bregenz</p>
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Kammerzugehörigkeit</h4>
            <p>Mitglied der Wirtschaftskammer Vorarlberg</p>
            <p>Fachgruppe: Güterbeförderungsgewerbe</p>
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Haftungsausschluss</h4>
            <p>Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.</p>
          </div>
        </div>
      )
    },
    datenschutz: {
      title: "Datenschutzerklärung",
      description: "Informationen gemäß Art. 13 DSGVO",
      body: (
        <div className="space-y-6 text-sm text-gray-300">
          <p>Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir verarbeiten Ihre Daten daher ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, TKG 2003).</p>
          <div>
            <h4 className="font-bold text-white text-base">1. Kontakt mit uns</h4>
            <p>Wenn Sie per Formular auf der Website oder per E-Mail Kontakt mit uns aufnehmen, werden Ihre angegebenen Daten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen sechs Monate bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p>
          </div>
          <div>
            <h4 className="font-bold text-white text-base">2. Datenspeicherung</h4>
            <p>Wir weisen darauf hin, dass zum Zweck des einfacheren Einkaufsvorganges und zur späteren Vertragsabwicklung vom Webshop-Betreiber im Rahmen von Cookies die IP-Daten des Anschlussinhabers gespeichert werden, ebenso wie Name, Anschrift und Kreditkartennummer des Einkäufers.</p>
          </div>
          <div>
            <h4 className="font-bold text-white text-base">3. Cookies</h4>
            <p>Unsere Website verwendet so genannte Cookies. Dabei handelt es sich um kleine Textdateien, die mit Hilfe des Browsers auf Ihrem Endgerät abgelegt werden. Sie richten keinen Schaden an. Wir nutzen Cookies dazu, unser Angebot nutzerfreundlich zu gestalten. Einige Cookies bleiben auf Ihrem Endgerät gespeichert, bis Sie diese löschen. Sie ermöglichen es uns, Ihren Browser beim nächsten Besuch wiederzuerkennen.</p>
          </div>
          <div>
            <h4 className="font-bold text-white text-base">4. Ihre Rechte</h4>
            <p>Ihnen stehen grundsätzlich die Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerruf und Widerspruch zu. Wenn Sie glauben, dass die Verarbeitung Ihrer Daten gegen das Datenschutzrecht verstößt oder Ihre datenschutzrechtlichen Ansprüche sonst in einer Weise verletzt worden sind, können Sie sich bei der Aufsichtsbehörde beschweren. In Österreich ist dies die Datenschutzbehörde.</p>
          </div>
        </div>
      )
    },
    agb: {
      title: "Allgemeine Geschäftsbedingungen",
      description: "Nutzungsbedingungen für QQX Soft",
      body: (
        <div className="space-y-6 text-sm text-gray-300">
          <div>
            <h4 className="font-bold text-white text-base">1. Geltungsbereich</h4>
            <p>Für die Geschäftsbeziehung zwischen QQX Soft (Einzelunternehmen Volkan Meral) und dem Kunden gelten ausschließlich die nachfolgenden Allgemeinen Geschäftsbedingungen in ihrer zum Zeitpunkt der Bestellung gültigen Fassung.</p>
          </div>
          <div>
            <h4 className="font-bold text-white text-base">2. Vertragsabschluss</h4>
            <p>Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot, sondern einen unverbindlichen Online-Katalog dar.</p>
          </div>
          <div>
            <h4 className="font-bold text-white text-base">3. Leistungen</h4>
            <p>QQX Soft stellt dem Kunden eine Cloud-basierte Softwarelösung für das Flottenmanagement zur Verfügung. Der genaue Funktionsumfang ergibt sich aus der jeweiligen Produktbeschreibung.</p>
          </div>
          <div>
            <h4 className="font-bold text-white text-base">4. Zahlungsbedingungen</h4>
            <p>Die Abrechnung erfolgt monatlich oder jährlich im Voraus. Bei Zahlungsverzug ist QQX Soft berechtigt, den Zugang zur Software vorübergehend zu sperren.</p>
          </div>
          <div>
            <h4 className="font-bold text-white text-base">5. Haftung</h4>
            <p>QQX Soft haftet für Schäden nur bei Vorsatz oder grober Fahrlässigkeit. Eine Haftung für indirekte Schäden oder entgangenen Gewinn ist ausgeschlossen.</p>
          </div>
        </div>
      )
    },
    cookies: {
      title: "Cookie-Einstellungen",
      description: "Verwalten Sie Ihre Privatsphäre",
      body: (
        <div className="space-y-6 text-sm text-gray-300 font-medium">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-white font-bold">Notwendige Cookies</p>
              <p className="text-xs text-gray-500">Erforderlich für den technischen Betrieb der Seite.</p>
            </div>
            <div className="text-[#3B82F6] font-bold text-xs uppercase">Immer Aktiv</div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-white font-bold">Analyse Cookies</p>
              <p className="text-xs text-gray-500">Helfen uns, die Website zu verbessern.</p>
            </div>
            <div className="w-10 h-5 bg-white/10 rounded-full relative">
              <div className="w-4 h-4 bg-white/30 rounded-full absolute top-0.5 left-0.5" />
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-white font-bold">Marketing Cookies</p>
              <p className="text-xs text-gray-500">Für personalisierte Werbung.</p>
            </div>
            <div className="w-10 h-5 bg-white/10 rounded-full relative">
              <div className="w-4 h-4 bg-white/30 rounded-full absolute top-0.5 left-0.5" />
            </div>
          </div>
          <div className="pt-4">
            <Button onClick={onClose} className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white">
              Einstellungen Speichern
            </Button>
          </div>
        </div>
      )
    }
  };

  const active = type ? content[type] : null;

  return (
    <Dialog open={!!type} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] bg-[#0F172A] text-white border-white/10 max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {active && (
          <>
            <div className="p-6 border-b border-white/10">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{active.title}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  {active.description}
                </DialogDescription>
              </DialogHeader>
            </div>
            <ScrollArea className="flex-1 p-6">
              {active.body}
            </ScrollArea>
            <div className="p-6 border-t border-white/10 flex justify-end">
              <Button onClick={onClose} variant="outline" className="border-white/10 hover:bg-white/5">
                Schließen
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
