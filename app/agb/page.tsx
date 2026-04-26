import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function AGB() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Allgemeine Geschäftsbedingungen</h1>
        <p className="text-muted-foreground text-sm mb-8">Stand: April 2026 · ImmoAkte, betrieben von Weserbergland Dienstleistungen</p>

        <div className="space-y-8 text-muted-foreground text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">§ 1 Geltungsbereich</h2>
            <p>
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen Weserbergland Dienstleistungen, Inhaber Özgür Tikiz, Chamissostraße 23, 31785 Hameln (nachfolgend „Anbieter") und den Nutzern der Plattform ImmoAkte (nachfolgend „Nutzer").
            </p>
            <p className="mt-2">
              Abweichende Bedingungen des Nutzers gelten nicht, sofern der Anbieter diesen nicht ausdrücklich schriftlich zugestimmt hat.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">§ 2 Leistungsbeschreibung</h2>
            <p>
              ImmoAkte ist eine webbasierte Software-as-a-Service-Plattform (SaaS) zur digitalen Erstellung und Verwaltung von Wohnungsübergabeprotokollen. Die Plattform ermöglicht:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Erfassung von Raumzuständen, Mängeln und Fotos</li>
              <li>Dokumentation von Zählerständen und Schlüsselübergaben</li>
              <li>Digitale Unterschriften beider Parteien</li>
              <li>Generierung rechtssicherer PDF-Protokolle</li>
              <li>Verwaltung mehrerer Objekte und Mietverhältnisse</li>
            </ul>
            <p className="mt-2">
              Der Anbieter stellt die Plattform im Rahmen der jeweils gebuchten Tarifoptionen zur Verfügung. Ein Anspruch auf bestimmte Funktionserweiterungen oder eine ununterbrochene Verfügbarkeit besteht nicht.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">§ 3 Nutzung &amp; Vertragsschluss</h2>
            <p>
              Die Nutzung von ImmoAkte ist kostenlos und ohne Anmeldung möglich.
              Mit dem Aufruf der Plattform kommt ein unentgeltlicher Nutzungsvertrag
              zustande, der jederzeit durch Schließen des Browsers oder Löschen der
              lokalen Daten beendet werden kann.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">§ 4 Tarife &amp; Preise</h2>
            <p>
              Die Plattform wird derzeit kostenfrei angeboten. Es findet keine
              Zahlung statt, es ist kein Zahlungsdienstleister eingebunden und
              es gibt keine kostenpflichtigen Tarife.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">§ 7 Nutzungsrechte & Pflichten</h2>
            <p>
              Der Nutzer erhält ein einfaches, nicht übertragbares Recht zur Nutzung der Plattform im Rahmen dieser Vereinbarung.
            </p>
            <p className="mt-2">
              Der Nutzer ist verantwortlich dafür, dass alle über die Plattform verarbeiteten Daten (insbesondere Mieterdaten) DSGVO-konform erhoben wurden und die betroffenen Personen über die Verarbeitung informiert sind. Der Anbieter ist in diesem Verhältnis Auftragsverarbeiter gemäß Art. 28 DSGVO.
            </p>
            <p className="mt-2">
              Die missbräuchliche Nutzung der Plattform, insbesondere das automatisierte Abgreifen von Daten oder die Umgehung von Sicherheitsmechanismen, ist untersagt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">§ 8 Haftung</h2>
            <p>
              Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung von Leben, Körper oder Gesundheit sowie für Schäden, die auf Vorsatz oder grober Fahrlässigkeit beruhen.
            </p>
            <p className="mt-2">
              Für leichte Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten), und zwar begrenzt auf den vertragstypischen, vorhersehbaren Schaden.
            </p>
            <p className="mt-2">
              Der Anbieter übernimmt keine Haftung für die rechtliche Verwertbarkeit der erstellten Protokolle im Einzelfall. Die Protokolle sind als Dokumentationshilfe konzipiert; eine Rechtsberatung findet nicht statt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">§ 9 Verfügbarkeit & Wartung</h2>
            <p>
              Der Anbieter strebt eine Verfügbarkeit von 99 % im Jahresmittel an, schuldet diese jedoch nicht. Planmäßige Wartungsarbeiten werden nach Möglichkeit außerhalb der Hauptnutzungszeiten durchgeführt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">§ 10 Datenschutz</h2>
            <p>
              Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer <a href="/datenschutz" className="text-primary hover:underline">Datenschutzerklärung</a>. Soweit der Nutzer über die Plattform personenbezogene Daten Dritter (z. B. Mieterdaten) verarbeitet, schließen die Parteien auf Anfrage einen Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO ab.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">§ 11 Änderungen der AGB</h2>
            <p>
              Der Anbieter behält sich das Recht vor, diese AGB mit einer Frist von 30 Tagen zu ändern. Die Änderung wird dem Nutzer per E-Mail mitgeteilt. Widerspricht der Nutzer nicht innerhalb von 30 Tagen, gelten die geänderten AGB als akzeptiert.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">§ 12 Schlussbestimmungen</h2>
            <p>
              Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand für Streitigkeiten mit Kaufleuten oder juristischen Personen des öffentlichen Rechts ist Hameln.
            </p>
            <p className="mt-2">
              Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
            </p>
          </section>

          <p className="text-slate-400 text-xs pt-4 border-t border-slate-200">
            Weserbergland Dienstleistungen · Özgür Tikiz · Chamissostraße 23, 31785 Hameln · info@weserbergland-dienstleistungen.de
          </p>

        </div>
      </main>
      <Footer />
    </div>
  )
}
