// Additional dictionary for new features (Etap 1-3). English is authoritative;
// missing keys fall back to English inside the app helper.
export type CommonLang = "pl" | "en" | "de" | "zh" | "es" | "fr";

export interface CommonStrings {
  settings: {
    title: string;
    open: string;
    language: string;
    dataSection: string;
    exportBackup: string;
    exportJson?: string;
    exportZip?: string;
    importBackup: string;
    exportHint: string;
    exportSuccess: string;
    importSuccess: string;
    importError: string;
    legal: string;
    terms: string;
    resetTerms?: string;
  };
  meds?: {
    title: string;
    desc: string;
    enableNotifs: string;
    name: string;
    dose: string;
    timesPlaceholder: string;
    add: string;
    empty: string;
    notifTitle: string;
    notifBody: string;
  };
  terms: {
    title: string;
    accept: string;
    intro: string;
    body: string;
  };
  quota: {
    title: string;
    body: string;
    ok: string;
  };
  files: {
    uploadButton: string;
    countLabel: string; // "Uploaded files (N)"
    empty: string;
    expand: string;
    collapse: string;
    preview: string;
    close: string;
    download: string;
    rename: string;
    delete: string;
    confirmDelete: string;
    tooLarge: string; // uses {size}
    unreadable: string;
  };
  chronicle: {
    from: string;
    to: string;
    expand: string;
    collapse: string;
    empty: string;
    reset: string;
  };
  ai: {
    from: string;
    to: string;
    run: string;
    summary: string;
    docsInsights: string;
    patterns: string;
    noDataInRange: string;
    disclaimer: string;
    bulletCount: string; // "Recorded seizures: {n}"
    bulletSevere: string; // "Severe episodes: {n}"
    bulletTopTrigger: string; // "Most common trigger: {name}"
    bulletTopType: string; // "Most common type: {name}"
    docsParsed: string; // "Documents analysed: {n}"
    docsNoContent: string;
    patternSleep: string;
    patternRecurring: string; // uses {trigger}
    patternClustered: string; // uses {days}
    patternNone: string;
  };
  pdf: {
    reportTitle: string;
    periodLabel: string; // "Report period"
    generated: string;
    range: string; // "from {from} to {to}"
    typesTitle: string;
    chartTitle: string;
    triggersTitle: string;
    fullLog: string;
    date: string;
    type: string;
    duration: string;
    severity: string;
    symptoms: string;
    triggers: string;
    notes: string;
    empty: string;
    printButton: string;
    disclaimer: string;
    openedNewTab: string;
    configTitle?: string;
    secStats?: string;
    secTypes?: string;
    secTriggers?: string;
    secLog?: string;
    secKeto?: string;
    secJournal?: string;
    ketoTitle?: string;
    ketoAvgKet?: string;
    ketoAvgGlu?: string;
    ketoReadings?: string;
    ketoEmpty?: string;
    journalTitle?: string;
    journalEmpty?: string;
  };
  premium: {
    monthly: string;
    annual: string;
    monthlyPrice: string; // localized
    annualPrice: string; // localized
    perMonth: string;
    perYear: string;
    save35: string;
    bestValue: string;
    choosePlan: string;
  };
  keto?: {
    title: string;
    subtitle: string;
    tabCalc: string;
    tabTrack: string;
    ratioLabel: string;
    addFood: string;
    searchPlaceholder: string;
    grams: string;
    meal: string;
    empty: string;
    clear: string;
    remove: string;
    ratioNow: string;
    fat: string;
    protein: string;
    carbs: string;
    tipStart: string;
    tipAddFat: string;
    tipOk: string;
    disclaimer: string;
    addReading: string;
    ketones: string;
    glucose: string;
    save: string;
    units: string;
    chart30: string;
    noReadings: string;
    history: string;
    lockedTitle: string;
    lockedBody: string;
    unlock: string;
  };
  common: {
    save: string;
    cancel: string;
    settingsBtn: string;
  };
}

const en: CommonStrings = {
  settings: {
    title: "Settings",
    open: "Open settings",
    language: "Language",
    dataSection: "Data & backup",
    exportBackup: "Export backup",
    exportJson: "Export to system file (JSON)",
    exportZip: "Export full archive (ZIP)",
    importBackup: "Import backup",
    exportHint:
      'Your full backup includes everything — also personal reflections from "How do you feel today?". Store the file somewhere safe.',
    exportSuccess: "Backup saved to your device.",
    importSuccess: "Backup imported successfully.",
    importError: "This file is not a valid Epilumina backup.",
    legal: "Legal",
    terms: "Terms & medical disclaimer",
    resetTerms: "Show terms again on next launch",
  },
  terms: {
    title: "Terms & medical disclaimer",
    accept: "I accept",
    intro: "Please read before you continue.",
    body: "1. Scope of service & medical disclaimer: Epilumina is strictly a digital logging assistant and is not a certified medical device. It does not provide diagnoses and is not a substitute for professional medical advice or treatment.\n\n2. User responsibility: The user holds sole and exclusive responsibility for the physical and digital security of their device and for making regular backups. The developer shall not be held liable for data loss, theft or unauthorised access resulting from device loss, a missing screen lock or malware infection.\n\n3. Premium subscription: the seller of the subscription is Stripe, which handles payment, taxes and refunds. You can cancel at any time in Settings; cancelling stops the next renewal and access remains active until the end of the paid period. Purchase terms and the right of withdrawal are governed by Stripe's terms.\n\n4. Privacy: how data is stored and processed is described in the Privacy Policy available at epilumina.vercel.app (Legal section).",
  },
  quota: {
    title: "Device storage is full",
    body: "Your browser has run out of space to save new data. Please free some space (export a backup, then delete older entries or uploaded files) and try again.",
    ok: "OK",
  },
  files: {
    uploadButton: "Upload files (PDF or images)",
    countLabel: "Uploaded files ({n})",
    empty: "No files uploaded yet.",
    expand: "Expand",
    collapse: "Collapse",
    preview: "Preview",
    close: "Close",
    download: "Download",
    rename: "Rename",
    delete: "Delete",
    confirmDelete: "Delete this file?",
    tooLarge: "File too large (limit {size} for local storage).",
    unreadable: "Could not read the file.",
  },
  chronicle: {
    from: "From",
    to: "To",
    expand: "Expand details",
    collapse: "Collapse",
    empty: "No seizures in the selected range.",
    reset: "Reset dates",
  },
  ai: {
    from: "From",
    to: "To",
    run: "Run analysis",
    summary: "Summary",
    docsInsights: "Documentation insights",
    patterns: "Correlative patterns",
    noDataInRange: "No entries in the selected date range.",
    disclaimer:
      "AI may make mistakes. This analysis is for informational purposes only and does not replace clinical diagnosis. Please bring these data to your next pediatric neurologist appointment.",
    bulletCount: "Recorded seizures: {n}",
    bulletSevere: "Severe episodes: {n}",
    bulletTopTrigger: "Most common trigger: {name}",
    bulletTopType: "Most common seizure type: {name}",
    docsParsed: "Medical documents in range: {n}",
    docsNoContent: "No medical documents in the selected range.",
    patternSleep:
      "Recurring theme in post-ictal notes: fatigue and shortened sleep before the episode.",
    patternRecurring: "Recurring trigger noted in this window: {trigger}.",
    patternClustered:
      "Episodes cluster within {days} days — worth discussing with the neurologist.",
    patternNone: "Not enough entries to detect a clear pattern in this range.",
  },
  pdf: {
    reportTitle: "Epilumina — Report for the doctor",
    periodLabel: "Report period",
    generated: "Generated",
    range: "from {from} to {to}",
    typesTitle: "Seizure types",
    chartTitle: "Seizures and ketones over time",
    triggersTitle: "Possible triggers",
    fullLog: "Full log",
    date: "Date",
    type: "Type",
    duration: "Duration",
    severity: "Severity",
    symptoms: "Symptoms",
    triggers: "Triggers",
    notes: "Notes",
    empty: "No entries in this period",
    printButton: "Print / Save as PDF",
    disclaimer:
      "Data comes exclusively from the user's local diary (device localStorage). Informational document — not a substitute for medical diagnosis.",
    openedNewTab:
      'We opened a preview of the report in a new tab. Use "Print / Save as PDF" to save it on your device.',
    configTitle: "Report sections",
    secStats: "Summary",
    secTypes: "Seizure types",
    secTriggers: "Triggers",
    secLog: "Full log",
    secKeto: "Ketogenic diet",
    secJournal: "Progress journal",
    ketoTitle: "Ketogenic diet — ketones & glucose",
    ketoAvgKet: "Average ketones",
    ketoAvgGlu: "Average glucose",
    ketoReadings: "Readings",
    ketoEmpty: "No ketone/glucose readings in this period",
    journalTitle: "Progress journal",
    journalEmpty: "No journal notes in this period",
  },
  premium: {
    monthly: "Monthly",
    annual: "Annual",
    monthlyPrice: "9,99 €",
    annualPrice: "79,99 €",
    perMonth: "/ month",
    perYear: "/ year",
    save35: "Save 36%",
    bestValue: "Best value",
    choosePlan: "Choose plan",
  },
  meds: {
    title: "Medication reminders",
    desc: "Local reminders that fire at each dose time.",
    enableNotifs: "Enable notifications",
    name: "Medication name",
    dose: "Dose (e.g. 250 mg)",
    timesPlaceholder: "Times, e.g. 08:00, 20:00",
    add: "Add reminder",
    empty: "No reminders yet.",
    notifTitle: "Time for medication",
    notifBody: "{name} — {dose}",
  },
  keto: {
    title: "Ketogenic diet",
    subtitle: "Ratio calculator and ketone tracking — all on your device.",
    tabCalc: "Ratio calculator",
    tabTrack: "Ketones & glucose",
    ratioLabel: "Target ratio",
    addFood: "Add food",
    searchPlaceholder: "Search food…",
    grams: "Grams",
    meal: "Meal",
    empty: "No foods added yet.",
    clear: "Clear meal",
    remove: "Remove",
    ratioNow: "Current ratio",
    fat: "Fat",
    protein: "Protein",
    carbs: "Carbs",
    tipStart: "Add foods to see the ketogenic ratio of the meal.",
    tipAddFat: "Add about {g} g of pure fat (e.g. MCT or olive oil) to reach {target}:1.",
    tipOk: "This meal already meets the {target}:1 ratio.",
    disclaimer:
      "Values are approximate (per 100 g). Always follow the plan set by your ketogenic-diet team.",
    addReading: "New reading",
    ketones: "Ketones",
    glucose: "Glucose",
    save: "Save reading",
    units: "Ketones in mmol/L, glucose in mg/dL.",
    chart30: "Last 30 days",
    noReadings: "No readings yet.",
    history: "History",
    lockedTitle: "Keto module is Premium",
    lockedBody:
      "Unlock the ratio calculator, the 80-item food database and ketone/glucose tracking.",
    unlock: "Unlock Premium",
  },
  common: { save: "Save", cancel: "Cancel", settingsBtn: "Settings" },
};

const pl: CommonStrings = {
  settings: {
    title: "Ustawienia",
    open: "Otwórz ustawienia",
    language: "Język",
    dataSection: "Dane i backup",
    exportBackup: "Eksportuj kopię zapasową",
    exportJson: "Eksportuj do pliku systemowego (JSON)",
    exportZip: "Eksportuj pełne archiwum (ZIP)",
    importBackup: "Wczytaj kopię zapasową",
    exportHint:
      "Pełna kopia obejmuje wszystko — także osobiste notatki z sekcji „Zrzuć swój ciężar”. Przechowuj plik w bezpiecznym miejscu.",
    exportSuccess: "Kopia zapasowa zapisana na urządzeniu.",
    importSuccess: "Kopia zapasowa wczytana pomyślnie.",
    importError: "Ten plik nie jest prawidłową kopią zapasową Epilumina.",
    legal: "Informacje prawne",
    terms: "Regulamin i zastrzeżenie medyczne",
    resetTerms: "Pokaż regulamin ponownie przy następnym uruchomieniu",
  },
  terms: {
    title: "Regulamin i zastrzeżenie medyczne",
    accept: "Akceptuję",
    intro: "Przeczytaj zanim przejdziesz dalej.",
    body: "1. Zakres usługi i zastrzeżenie medyczne: Epilumina jest wyłącznie cyfrowym dziennikiem pomocniczym i nie jest wyrobem medycznym. Nie stawia diagnoz i nie zastępuje profesjonalnej porady lekarskiej ani leczenia.\n\n2. Odpowiedzialność użytkownika: Użytkownik ponosi pełną i wyłączną odpowiedzialność za bezpieczeństwo fizyczne i cyfrowe swojego urządzenia oraz za regularne wykonywanie kopii zapasowej. Deweloper nie ponosi odpowiedzialności za utratę, kradzież lub nieautoryzowany dostęp do danych wynikający z zagubienia telefonu, braku blokady ekranu lub zainfekowania złośliwym oprogramowaniem.\n\n3. Subskrypcja Premium: sprzedawcą subskrypcji jest Stripe, który obsługuje płatność, podatki oraz zwroty. Subskrypcję anulujesz w dowolnym momencie w Ustawieniach; anulowanie zatrzymuje kolejne odnowienie, a dostęp pozostaje aktywny do końca opłaconego okresu. Zasady zakupu i prawo odstąpienia określa regulamin Stripe.\n\n4. Prywatność: zasady przechowywania i przetwarzania danych opisuje Polityka prywatności dostępna na stronie epilumina.vercel.app (sekcja Informacje prawne).",
  },
  quota: {
    title: "Pamięć urządzenia jest pełna",
    body: "Przeglądarka nie ma już miejsca na zapisanie nowych danych. Zwolnij trochę miejsca (zrób kopię zapasową, następnie usuń starsze wpisy lub pliki) i spróbuj ponownie.",
    ok: "Rozumiem",
  },
  files: {
    uploadButton: "Wgraj pliki (PDF lub zdjęcia)",
    countLabel: "Wgrane pliki ({n})",
    empty: "Brak wgranych plików.",
    expand: "Rozwiń",
    collapse: "Zwiń",
    preview: "Podgląd",
    close: "Zamknij",
    download: "Pobierz",
    rename: "Zmień nazwę",
    delete: "Usuń",
    confirmDelete: "Usunąć ten plik?",
    tooLarge: "Plik zbyt duży (limit {size} dla lokalnego zapisu).",
    unreadable: "Nie udało się odczytać pliku.",
  },
  chronicle: {
    from: "Od",
    to: "Do",
    expand: "Rozwiń szczegóły",
    collapse: "Zwiń",
    empty: "Brak napadów w wybranym zakresie.",
    reset: "Resetuj daty",
  },
  ai: {
    from: "Od",
    to: "Do",
    run: "Uruchom analizę",
    summary: "Podsumowanie",
    docsInsights: "Wnioski z dokumentacji",
    patterns: "Wzorce korelacyjne",
    noDataInRange: "Brak wpisów w wybranym zakresie dat.",
    disclaimer:
      "AI może popełniać błędy. Ta analiza ma charakter poglądowy i nie zastępuje diagnostyki klinicznej. Zabierz te dane na najbliższą wizytę u neurologa dziecięcego.",
    bulletCount: "Zarejestrowanych napadów: {n}",
    bulletSevere: "Silne epizody: {n}",
    bulletTopTrigger: "Najczęstszy czynnik wyzwalający: {name}",
    bulletTopType: "Najczęstszy typ napadu: {name}",
    docsParsed: "Dokumentów medycznych w zakresie: {n}",
    docsNoContent: "Brak dokumentów medycznych w wybranym zakresie.",
    patternSleep:
      "Powtarzający się motyw w notatkach po napadzie: zmęczenie i skrócony sen poprzedzający epizod.",
    patternRecurring: "Powtarzający się czynnik wyzwalający w tym oknie: {trigger}.",
    patternClustered: "Epizody skupiają się w ciągu {days} dni — warto omówić z neurologiem.",
    patternNone: "Za mało wpisów, aby wykryć wyraźny wzorzec w tym zakresie.",
  },
  pdf: {
    reportTitle: "Epilumina — Raport dla lekarza",
    periodLabel: "Raport za okres",
    generated: "Wygenerowano",
    range: "od {from} do {to}",
    typesTitle: "Typy napadów",
    chartTitle: "Napady i ketony w czasie",
    triggersTitle: "Czynniki wyzwalające",
    fullLog: "Pełen dziennik",
    date: "Data",
    type: "Typ",
    duration: "Czas",
    severity: "Nasilenie",
    symptoms: "Objawy",
    triggers: "Czynniki",
    notes: "Notatki",
    empty: "Brak wpisów w tym okresie",
    printButton: "Drukuj / Zapisz jako PDF",
    disclaimer:
      "Dane pochodzą wyłącznie z lokalnego dziennika użytkownika (localStorage urządzenia). Dokument informacyjny — nie zastępuje diagnozy lekarskiej.",
    openedNewTab:
      "Otworzyliśmy podgląd raportu w nowej karcie. Użyj przycisku „Drukuj / Zapisz jako PDF”, aby zapisać plik na telefonie.",
    configTitle: "Sekcje raportu",
    secStats: "Podsumowanie",
    secTypes: "Typy napadów",
    secTriggers: "Czynniki wyzwalające",
    secLog: "Pełen dziennik",
    secKeto: "Dieta ketogenna",
    secJournal: "Dziennik postępów",
    ketoTitle: "Dieta ketogenna — ketony i glukoza",
    ketoAvgKet: "Średnie ketony",
    ketoAvgGlu: "Średnia glukoza",
    ketoReadings: "Pomiary",
    ketoEmpty: "Brak pomiarów ketonów/glukozy w tym okresie",
    journalTitle: "Dziennik postępów",
    journalEmpty: "Brak notatek w tym okresie",
  },
  premium: {
    monthly: "Miesięcznie",
    annual: "Rocznie",
    monthlyPrice: "9,99 €",
    annualPrice: "79,99 €",
    perMonth: "/ miesiąc",
    perYear: "/ rok",
    save35: "Oszczędź 36%",
    bestValue: "Najlepsza wartość",
    choosePlan: "Wybierz plan",
  },
  meds: {
    title: "Przypomnienia o lekach",
    desc: "Lokalne przypomnienia w porze każdej dawki.",
    enableNotifs: "Włącz powiadomienia",
    name: "Nazwa leku",
    dose: "Dawka (np. 250 mg)",
    timesPlaceholder: "Godziny, np. 08:00, 20:00",
    add: "Dodaj przypomnienie",
    empty: "Brak przypomnień.",
    notifTitle: "Czas na lek",
    notifBody: "{name} — {dose}",
  },
  keto: {
    title: "Dieta ketogenna",
    subtitle: "Kalkulator ratio i monitoring ketonów — wszystko na Twoim urządzeniu.",
    tabCalc: "Kalkulator ratio",
    tabTrack: "Ketony i glukoza",
    ratioLabel: "Docelowe ratio",
    addFood: "Dodaj produkt",
    searchPlaceholder: "Szukaj produktu…",
    grams: "Gramy",
    meal: "Posiłek",
    empty: "Nie dodano jeszcze produktów.",
    clear: "Wyczyść posiłek",
    remove: "Usuń",
    ratioNow: "Aktualne ratio",
    fat: "Tłuszcz",
    protein: "Białko",
    carbs: "Węglow.",
    tipStart: "Dodaj produkty, aby zobaczyć ratio ketogenne posiłku.",
    tipAddFat:
      "Dodaj około {g} g czystego tłuszczu (np. olej MCT lub oliwa), aby osiągnąć {target}:1.",
    tipOk: "Ten posiłek spełnia już ratio {target}:1.",
    disclaimer:
      "Wartości są przybliżone (na 100 g). Zawsze stosuj się do planu ustalonego przez zespół dietoterapii ketogennej.",
    addReading: "Nowy pomiar",
    ketones: "Ketony",
    glucose: "Glukoza",
    save: "Zapisz pomiar",
    units: "Ketony w mmol/l, glukoza w mg/dl.",
    chart30: "Ostatnie 30 dni",
    noReadings: "Brak pomiarów.",
    history: "Historia",
    lockedTitle: "Moduł keto jest w Premium",
    lockedBody: "Odblokuj kalkulator ratio, bazę 80 produktów oraz monitoring ketonów i glukozy.",
    unlock: "Odblokuj Premium",
  },
  common: { save: "Zapisz", cancel: "Anuluj", settingsBtn: "Ustawienia" },
};

const es: CommonStrings = {
  settings: {
    title: "Ajustes",
    open: "Abrir ajustes",
    language: "Idioma",
    dataSection: "Datos y copia de seguridad",
    exportJson: "Exportar a un archivo del sistema (JSON)",
    exportZip: "Exportar archivo completo (ZIP)",
    exportBackup: "Exportar copia",
    importBackup: "Importar copia",
    exportHint:
      "La copia completa incluye todo, también las reflexiones personales de «¿Cómo te sientes hoy?». Guarda el archivo en un lugar seguro.",
    exportSuccess: "Copia guardada en el dispositivo.",
    importSuccess: "Copia importada correctamente.",
    importError: "Este archivo no es una copia válida de Epilumina.",
    legal: "Aviso legal",
    terms: "Términos y aviso médico",
    resetTerms: "Volver a mostrar los términos al reiniciar",
  },
  meds: {
    title: "Recordatorios de medicación",
    desc: "Recordatorios locales que suenan a la hora de cada dosis.",
    enableNotifs: "Activar notificaciones",
    name: "Nombre del medicamento",
    dose: "Dosis (p. ej. 250 mg)",
    timesPlaceholder: "Horas, p. ej. 08:00, 20:00",
    add: "Añadir recordatorio",
    empty: "Todavía no hay recordatorios.",
    notifTitle: "Hora de la medicación",
    notifBody: "{name} {dose}",
  },
  terms: {
    title: "Términos y aviso médico",
    accept: "Acepto",
    intro: "Léelo antes de continuar.",
    body: "1. Alcance del servicio y descargo médico: Epilumina es estrictamente un asistente de registro digital y no es un dispositivo médico certificado. No emite diagnósticos ni sustituye el consejo o tratamiento médico profesional.\n\n2. Responsabilidad del usuario: el usuario es el único responsable de la seguridad física y digital de su dispositivo y de realizar copias de seguridad periódicas. El desarrollador no se responsabiliza de la pérdida, el robo o el acceso no autorizado derivados de la pérdida del dispositivo, la falta de bloqueo de pantalla o una infección de malware.\n\n3. Suscripción Premium: el vendedor de la suscripción es Stripe, que gestiona el pago, los impuestos y los reembolsos. Puedes cancelar en cualquier momento en Ajustes; la cancelación detiene la siguiente renovación y el acceso sigue activo hasta el final del periodo pagado. Las condiciones de compra y el derecho de desistimiento se rigen por las condiciones de Stripe.\n\n4. Privacidad: el modo en que se almacenan y tratan los datos se describe en la Política de privacidad disponible en epilumina.vercel.app (sección Legal).",
  },
  quota: {
    title: "Almacenamiento del dispositivo lleno",
    body: "El navegador se quedó sin espacio para guardar datos nuevos. Libera espacio (exporta una copia y elimina entradas o archivos antiguos) e inténtalo de nuevo.",
    ok: "Entendido",
  },
  files: {
    uploadButton: "Subir archivos (PDF o imágenes)",
    countLabel: "Archivos subidos ({n})",
    empty: "Aún no se han subido archivos.",
    expand: "Expandir",
    collapse: "Contraer",
    preview: "Vista previa",
    close: "Cerrar",
    download: "Descargar",
    rename: "Renombrar",
    delete: "Eliminar",
    confirmDelete: "¿Eliminar este archivo?",
    tooLarge: "Archivo demasiado grande (límite {size} para almacenamiento local).",
    unreadable: "No se pudo leer el archivo.",
  },
  chronicle: {
    from: "Desde",
    to: "Hasta",
    expand: "Ver detalles",
    collapse: "Ocultar",
    empty: "Sin crisis en el rango seleccionado.",
    reset: "Restablecer fechas",
  },
  ai: {
    from: "Desde",
    to: "Hasta",
    run: "Ejecutar análisis",
    summary: "Resumen",
    docsInsights: "Hallazgos de la documentación",
    patterns: "Patrones de correlación",
    noDataInRange: "Sin entradas en el rango seleccionado.",
    disclaimer:
      "La IA puede cometer errores. Este análisis es solo informativo y no reemplaza el diagnóstico clínico. Lleve estos datos a su próxima cita con el neurólogo pediátrico.",
    bulletCount: "Crisis registradas: {n}",
    bulletSevere: "Episodios graves: {n}",
    bulletTopTrigger: "Desencadenante más frecuente: {name}",
    bulletTopType: "Tipo de crisis más frecuente: {name}",
    docsParsed: "Documentos médicos en el rango: {n}",
    docsNoContent: "Sin documentos médicos en el rango.",
    patternSleep:
      "Tema recurrente en las notas post-ictales: fatiga y sueño corto antes del episodio.",
    patternRecurring: "Desencadenante recurrente en esta ventana: {trigger}.",
    patternClustered:
      "Los episodios se agrupan en {days} días — conviene discutirlo con el neurólogo.",
    patternNone: "Datos insuficientes para detectar un patrón claro.",
  },
  pdf: {
    reportTitle: "Epilumina — Informe para el médico",
    periodLabel: "Período del informe",
    generated: "Generado",
    range: "del {from} al {to}",
    typesTitle: "Tipos de crisis",
    chartTitle: "Crisis y cetonas en el tiempo",
    triggersTitle: "Posibles desencadenantes",
    fullLog: "Diario completo",
    date: "Fecha",
    type: "Tipo",
    duration: "Duración",
    severity: "Gravedad",
    symptoms: "Síntomas",
    triggers: "Desencadenantes",
    notes: "Notas",
    empty: "Sin entradas en este período",
    printButton: "Imprimir / Guardar como PDF",
    disclaimer:
      "Los datos provienen exclusivamente del diario local del usuario (localStorage del dispositivo). Documento informativo — no sustituye un diagnóstico médico.",
    openedNewTab:
      "Abrimos una vista previa del informe en una nueva pestaña. Usa «Imprimir / Guardar como PDF» para guardarlo en tu dispositivo.",
    configTitle: "Secciones del informe",
    secStats: "Resumen",
    secTypes: "Tipos de crisis",
    secTriggers: "Desencadenantes",
    secLog: "Diario completo",
    secKeto: "Dieta cetogénica",
    secJournal: "Diario de progreso",
    ketoTitle: "Dieta cetogénica — cetonas y glucosa",
    ketoAvgKet: "Cetonas medias",
    ketoAvgGlu: "Glucosa media",
    ketoReadings: "Mediciones",
    ketoEmpty: "Sin mediciones en este período",
    journalTitle: "Diario de progreso",
    journalEmpty: "Sin notas en este período",
  },
  premium: {
    monthly: "Mensual",
    annual: "Anual",
    monthlyPrice: "9,99 €",
    annualPrice: "79,99 €",
    perMonth: "/ mes",
    perYear: "/ año",
    save35: "Ahorra 36%",
    bestValue: "Mejor valor",
    choosePlan: "Elegir plan",
  },
  keto: {
    title: "Dieta cetogénica",
    subtitle: "Calculadora de ratio y seguimiento de cetonas — todo en tu dispositivo.",
    tabCalc: "Calculadora de ratio",
    tabTrack: "Cetonas y glucosa",
    ratioLabel: "Ratio objetivo",
    addFood: "Añadir alimento",
    searchPlaceholder: "Buscar alimento…",
    grams: "Gramos",
    meal: "Comida",
    empty: "Aún no hay alimentos.",
    clear: "Vaciar comida",
    remove: "Eliminar",
    ratioNow: "Ratio actual",
    fat: "Grasa",
    protein: "Proteína",
    carbs: "Carbos",
    tipStart: "Añade alimentos para ver el ratio cetogénico de la comida.",
    tipAddFat: "Añade unos {g} g de grasa pura (aceite MCT u oliva) para alcanzar {target}:1.",
    tipOk: "Esta comida ya cumple el ratio {target}:1.",
    disclaimer:
      "Valores aproximados (por 100 g). Sigue siempre el plan de tu equipo de dieta cetogénica.",
    addReading: "Nueva medición",
    ketones: "Cetonas",
    glucose: "Glucosa",
    save: "Guardar medición",
    units: "Cetonas en mmol/L, glucosa en mg/dL.",
    chart30: "Últimos 30 días",
    noReadings: "Sin mediciones.",
    history: "Historial",
    lockedTitle: "El módulo keto es Premium",
    lockedBody:
      "Desbloquea la calculadora de ratio, la base de 80 alimentos y el seguimiento de cetonas y glucosa.",
    unlock: "Desbloquear Premium",
  },
  common: { save: "Guardar", cancel: "Cancelar", settingsBtn: "Ajustes" },
};

const fr: CommonStrings = {
  settings: {
    title: "Paramètres",
    open: "Ouvrir les paramètres",
    language: "Langue",
    dataSection: "Données et sauvegarde",
    exportJson: "Exporter vers un fichier système (JSON)",
    exportZip: "Exporter l'archive complète (ZIP)",
    exportBackup: "Exporter la sauvegarde",
    importBackup: "Importer une sauvegarde",
    exportHint:
      "La sauvegarde complète inclut tout — y compris les réflexions personnelles de « Comment te sens-tu ? ». Conservez le fichier en lieu sûr.",
    exportSuccess: "Sauvegarde enregistrée sur l'appareil.",
    importSuccess: "Sauvegarde importée avec succès.",
    importError: "Ce fichier n'est pas une sauvegarde Epilumina valide.",
    legal: "Mentions légales",
    terms: "Conditions et avis médical",
    resetTerms: "Réafficher les conditions au prochain lancement",
  },
  meds: {
    title: "Rappels de médicaments",
    desc: "Rappels locaux déclenchés à l'heure de chaque prise.",
    enableNotifs: "Activer les notifications",
    name: "Nom du médicament",
    dose: "Dose (p. ex. 250 mg)",
    timesPlaceholder: "Heures, p. ex. 08:00, 20:00",
    add: "Ajouter un rappel",
    empty: "Aucun rappel pour l'instant.",
    notifTitle: "Heure du médicament",
    notifBody: "{name} {dose}",
  },
  terms: {
    title: "Conditions et avis médical",
    accept: "J'accepte",
    intro: "À lire avant de continuer.",
    body: "1. Étendue du service et avis médical : Epilumina est strictement un assistant de journalisation numérique et n'est pas un dispositif médical certifié. Il ne fournit pas de diagnostic et ne remplace pas un avis ou un traitement médical professionnel.\n\n2. Responsabilité de l'utilisateur : l'utilisateur est seul responsable de la sécurité physique et numérique de son appareil et de la réalisation de sauvegardes régulières. Le développeur n'est pas responsable de la perte, du vol ou de l'accès non autorisé résultant d'un appareil perdu, d'une absence de verrouillage d'écran ou d'une infection par un logiciel malveillant.\n\n3. Abonnement Premium : le vendeur de l'abonnement est Stripe, qui gère le paiement, les taxes et les remboursements. Vous pouvez résilier à tout moment dans les Réglages ; la résiliation arrête le prochain renouvellement et l'accès reste actif jusqu'à la fin de la période payée. Les conditions d'achat et le droit de rétractation relèvent des conditions de Stripe.\n\n4. Confidentialité : la manière dont les données sont stockées et traitées est décrite dans la Politique de confidentialité disponible sur epilumina.vercel.app (section Mentions légales).",
  },
  quota: {
    title: "Stockage de l'appareil plein",
    body: "Le navigateur n'a plus d'espace pour enregistrer de nouvelles données. Libérez de l'espace (exportez une sauvegarde puis supprimez d'anciennes entrées ou fichiers) et réessayez.",
    ok: "Compris",
  },
  files: {
    uploadButton: "Téléverser des fichiers (PDF ou images)",
    countLabel: "Fichiers téléversés ({n})",
    empty: "Aucun fichier téléversé.",
    expand: "Déplier",
    collapse: "Replier",
    preview: "Aperçu",
    close: "Fermer",
    download: "Télécharger",
    rename: "Renommer",
    delete: "Supprimer",
    confirmDelete: "Supprimer ce fichier ?",
    tooLarge: "Fichier trop volumineux (limite {size} pour le stockage local).",
    unreadable: "Impossible de lire le fichier.",
  },
  chronicle: {
    from: "Du",
    to: "Au",
    expand: "Voir les détails",
    collapse: "Masquer",
    empty: "Aucune crise dans la période sélectionnée.",
    reset: "Réinitialiser les dates",
  },
  ai: {
    from: "Du",
    to: "Au",
    run: "Lancer l'analyse",
    summary: "Synthèse",
    docsInsights: "Observations documentaires",
    patterns: "Motifs corrélatifs",
    noDataInRange: "Aucune entrée dans la période sélectionnée.",
    disclaimer:
      "L'IA peut commettre des erreurs. Cette analyse est fournie à titre informatif uniquement et ne remplace pas un diagnostic clinique. Veuillez apporter ces données lors de votre prochain rendez-vous chez le neurologue pédiatrique.",
    bulletCount: "Crises enregistrées : {n}",
    bulletSevere: "Épisodes sévères : {n}",
    bulletTopTrigger: "Déclencheur le plus fréquent : {name}",
    bulletTopType: "Type de crise le plus fréquent : {name}",
    docsParsed: "Documents médicaux dans la période : {n}",
    docsNoContent: "Aucun document médical dans la période.",
    patternSleep:
      "Motif récurrent dans les notes post-critiques : fatigue et sommeil raccourci avant l'épisode.",
    patternRecurring: "Déclencheur récurrent dans cette fenêtre : {trigger}.",
    patternClustered:
      "Les épisodes se regroupent sur {days} jours — à discuter avec le neurologue.",
    patternNone: "Pas assez d'entrées pour détecter un motif clair.",
  },
  pdf: {
    reportTitle: "Epilumina — Rapport pour le médecin",
    periodLabel: "Période du rapport",
    generated: "Généré",
    range: "du {from} au {to}",
    typesTitle: "Types de crises",
    chartTitle: "Crises et cétones dans le temps",
    triggersTitle: "Déclencheurs possibles",
    fullLog: "Journal complet",
    date: "Date",
    type: "Type",
    duration: "Durée",
    severity: "Sévérité",
    symptoms: "Symptômes",
    triggers: "Déclencheurs",
    notes: "Notes",
    empty: "Aucune entrée dans cette période",
    printButton: "Imprimer / Enregistrer en PDF",
    disclaimer:
      "Les données proviennent uniquement du journal local (localStorage). Document informatif — ne remplace pas un diagnostic médical.",
    openedNewTab:
      "Nous avons ouvert un aperçu du rapport dans un nouvel onglet. Utilise « Imprimer / Enregistrer en PDF ».",
    configTitle: "Sections du rapport",
    secStats: "Résumé",
    secTypes: "Types de crises",
    secTriggers: "Déclencheurs",
    secLog: "Journal complet",
    secKeto: "Régime cétogène",
    secJournal: "Journal de progrès",
    ketoTitle: "Régime cétogène — cétones et glucose",
    ketoAvgKet: "Cétones moyennes",
    ketoAvgGlu: "Glucose moyen",
    ketoReadings: "Mesures",
    ketoEmpty: "Aucune mesure dans cette période",
    journalTitle: "Journal de progrès",
    journalEmpty: "Aucune note dans cette période",
  },
  premium: {
    monthly: "Mensuel",
    annual: "Annuel",
    monthlyPrice: "9,99 €",
    annualPrice: "79,99 €",
    perMonth: "/ mois",
    perYear: "/ an",
    save35: "Économisez 36%",
    bestValue: "Meilleure offre",
    choosePlan: "Choisir",
  },
  keto: {
    title: "Régime cétogène",
    subtitle: "Calculateur de ratio et suivi des cétones — 100 % sur votre appareil.",
    tabCalc: "Calculateur de ratio",
    tabTrack: "Cétones et glucose",
    ratioLabel: "Ratio cible",
    addFood: "Ajouter un aliment",
    searchPlaceholder: "Rechercher un aliment…",
    grams: "Grammes",
    meal: "Repas",
    empty: "Aucun aliment ajouté.",
    clear: "Vider le repas",
    remove: "Supprimer",
    ratioNow: "Ratio actuel",
    fat: "Lipides",
    protein: "Protéines",
    carbs: "Glucides",
    tipStart: "Ajoutez des aliments pour voir le ratio cétogène du repas.",
    tipAddFat:
      "Ajoutez environ {g} g de lipides purs (huile MCT ou olive) pour atteindre {target}:1.",
    tipOk: "Ce repas atteint déjà le ratio {target}:1.",
    disclaimer:
      "Valeurs approximatives (pour 100 g). Suivez toujours le plan défini par votre équipe de diététique cétogène.",
    addReading: "Nouvelle mesure",
    ketones: "Cétones",
    glucose: "Glucose",
    save: "Enregistrer la mesure",
    units: "Cétones en mmol/L, glucose en mg/dL.",
    chart30: "30 derniers jours",
    noReadings: "Aucune mesure.",
    history: "Historique",
    lockedTitle: "Le module céto est Premium",
    lockedBody:
      "Débloquez le calculateur de ratio, la base de 80 aliments et le suivi cétones/glucose.",
    unlock: "Débloquer Premium",
  },
  common: { save: "Enregistrer", cancel: "Annuler", settingsBtn: "Paramètres" },
};

const de: CommonStrings = {
  settings: {
    title: "Einstellungen",
    open: "Einstellungen öffnen",
    language: "Sprache",
    dataSection: "Daten & Sicherung",
    exportJson: "In Systemdatei exportieren (JSON)",
    exportZip: "Vollständiges Archiv exportieren (ZIP)",
    exportBackup: "Sicherung exportieren",
    importBackup: "Sicherung importieren",
    exportHint:
      "Die vollständige Sicherung enthält alles – auch persönliche Reflexionen aus „Wie fühlst du dich heute?“. Bewahre die Datei sicher auf.",
    exportSuccess: "Sicherung auf dem Gerät gespeichert.",
    importSuccess: "Sicherung erfolgreich importiert.",
    importError: "Diese Datei ist keine gültige Epilumina-Sicherung.",
    legal: "Rechtliches",
    terms: "AGB & medizinischer Hinweis",
    resetTerms: "Bedingungen beim nächsten Start erneut anzeigen",
  },
  meds: {
    title: "Medikamenten-Erinnerungen",
    desc: "Lokale Erinnerungen zur jeweiligen Einnahmezeit.",
    enableNotifs: "Benachrichtigungen aktivieren",
    name: "Name des Medikaments",
    dose: "Dosis (z. B. 250 mg)",
    timesPlaceholder: "Uhrzeiten, z. B. 08:00, 20:00",
    add: "Erinnerung hinzufügen",
    empty: "Noch keine Erinnerungen.",
    notifTitle: "Zeit für das Medikament",
    notifBody: "{name} {dose}",
  },
  terms: {
    title: "AGB & medizinischer Hinweis",
    accept: "Ich akzeptiere",
    intro: "Bitte vor dem Fortfahren lesen.",
    body: "1. Leistungsumfang und medizinischer Haftungsausschluss: Epilumina ist ausschließlich ein digitales Protokollierungswerkzeug und kein zertifiziertes Medizinprodukt. Es stellt keine Diagnosen und ersetzt keine professionelle medizinische Beratung oder Behandlung.\n\n2. Verantwortung des Nutzers: Der Nutzer trägt die alleinige Verantwortung für die physische und digitale Sicherheit seines Geräts sowie für regelmäßige Sicherungen. Der Entwickler haftet nicht für Datenverlust, Diebstahl oder unbefugten Zugriff durch Geräteverlust, fehlende Bildschirmsperre oder Schadsoftware.\n\n3. Premium-Abonnement: Verkäufer des Abonnements ist Stripe, der Zahlung, Steuern und Rückerstattungen abwickelt. Du kannst das Abonnement jederzeit in den Einstellungen kündigen; die Kündigung stoppt die nächste Verlängerung, der Zugang bleibt bis zum Ende des bezahlten Zeitraums aktiv. Die Bedingungen und das Widerrufsrecht richten sich nach den Bedingungen von Stripe.\n\n4. Datenschutz: Wie Daten gespeichert und verarbeitet werden, beschreibt die Datenschutzerklärung unter epilumina.vercel.app (Bereich Rechtliches).",
  },
  quota: {
    title: "Gerätespeicher voll",
    body: "Der Browser hat keinen Platz mehr für neue Daten. Bitte Speicher freigeben (Sicherung exportieren und ältere Einträge oder Dateien löschen) und erneut versuchen.",
    ok: "Verstanden",
  },
  files: {
    uploadButton: "Dateien hochladen (PDF oder Bilder)",
    countLabel: "Hochgeladene Dateien ({n})",
    empty: "Noch keine Dateien hochgeladen.",
    expand: "Aufklappen",
    collapse: "Einklappen",
    preview: "Vorschau",
    close: "Schließen",
    download: "Herunterladen",
    rename: "Umbenennen",
    delete: "Löschen",
    confirmDelete: "Diese Datei löschen?",
    tooLarge: "Datei zu groß (Limit {size} für lokalen Speicher).",
    unreadable: "Datei konnte nicht gelesen werden.",
  },
  chronicle: {
    from: "Von",
    to: "Bis",
    expand: "Details anzeigen",
    collapse: "Zuklappen",
    empty: "Keine Anfälle im gewählten Zeitraum.",
    reset: "Daten zurücksetzen",
  },
  ai: {
    from: "Von",
    to: "Bis",
    run: "Analyse starten",
    summary: "Zusammenfassung",
    docsInsights: "Erkenntnisse aus Dokumenten",
    patterns: "Korrelationsmuster",
    noDataInRange: "Keine Einträge im gewählten Zeitraum.",
    disclaimer:
      "KI kann Fehler machen. Diese Analyse dient nur zu Informationszwecken und ersetzt keine klinische Diagnose. Bitte bringen Sie diese Daten zum nächsten Termin beim Kinderneurologen mit.",
    bulletCount: "Erfasste Anfälle: {n}",
    bulletSevere: "Schwere Episoden: {n}",
    bulletTopTrigger: "Häufigster Auslöser: {name}",
    bulletTopType: "Häufigster Anfallstyp: {name}",
    docsParsed: "Medizinische Dokumente im Zeitraum: {n}",
    docsNoContent: "Keine medizinischen Dokumente im Zeitraum.",
    patternSleep:
      "Wiederkehrendes Motiv in Post-Anfall-Notizen: Müdigkeit und verkürzter Schlaf vor der Episode.",
    patternRecurring: "Wiederkehrender Auslöser in diesem Zeitraum: {trigger}.",
    patternClustered:
      "Episoden häufen sich innerhalb von {days} Tagen — mit dem Neurologen besprechen.",
    patternNone: "Zu wenige Einträge, um ein klares Muster zu erkennen.",
  },
  pdf: {
    reportTitle: "Epilumina — Bericht für den Arzt",
    periodLabel: "Berichtszeitraum",
    generated: "Erstellt",
    range: "vom {from} bis {to}",
    typesTitle: "Anfallstypen",
    chartTitle: "Anfälle und Ketone im Verlauf",
    triggersTitle: "Mögliche Auslöser",
    fullLog: "Gesamtes Tagebuch",
    date: "Datum",
    type: "Typ",
    duration: "Dauer",
    severity: "Schwere",
    symptoms: "Symptome",
    triggers: "Auslöser",
    notes: "Notizen",
    empty: "Keine Einträge in diesem Zeitraum",
    printButton: "Drucken / Als PDF speichern",
    disclaimer:
      "Daten stammen ausschließlich aus dem lokalen Tagebuch (localStorage). Informationsdokument — kein Ersatz für ärztliche Diagnose.",
    openedNewTab:
      "Wir haben eine Vorschau in einem neuen Tab geöffnet. Nutze „Drucken / Als PDF speichern“.",
    configTitle: "Berichtsabschnitte",
    secStats: "Zusammenfassung",
    secTypes: "Anfallstypen",
    secTriggers: "Auslöser",
    secLog: "Gesamtes Tagebuch",
    secKeto: "Ketogene Diät",
    secJournal: "Fortschrittstagebuch",
    ketoTitle: "Ketogene Diät — Ketone und Glukose",
    ketoAvgKet: "Durchschnittliche Ketone",
    ketoAvgGlu: "Durchschnittliche Glukose",
    ketoReadings: "Messungen",
    ketoEmpty: "Keine Messungen in diesem Zeitraum",
    journalTitle: "Fortschrittstagebuch",
    journalEmpty: "Keine Notizen in diesem Zeitraum",
  },
  premium: {
    monthly: "Monatlich",
    annual: "Jährlich",
    monthlyPrice: "9,99 €",
    annualPrice: "79,99 €",
    perMonth: "/ Monat",
    perYear: "/ Jahr",
    save35: "36% sparen",
    bestValue: "Bestes Angebot",
    choosePlan: "Plan wählen",
  },
  keto: {
    title: "Ketogene Diät",
    subtitle: "Ratio-Rechner und Ketonverlauf — vollständig auf deinem Gerät.",
    tabCalc: "Ratio-Rechner",
    tabTrack: "Ketone & Glukose",
    ratioLabel: "Ziel-Ratio",
    addFood: "Lebensmittel hinzufügen",
    searchPlaceholder: "Lebensmittel suchen…",
    grams: "Gramm",
    meal: "Mahlzeit",
    empty: "Noch keine Lebensmittel.",
    clear: "Mahlzeit leeren",
    remove: "Entfernen",
    ratioNow: "Aktuelles Ratio",
    fat: "Fett",
    protein: "Eiweiß",
    carbs: "KH",
    tipStart: "Füge Lebensmittel hinzu, um das ketogene Ratio zu sehen.",
    tipAddFat: "Füge ca. {g} g reines Fett (MCT- oder Olivenöl) hinzu, um {target}:1 zu erreichen.",
    tipOk: "Diese Mahlzeit erfüllt bereits das Ratio {target}:1.",
    disclaimer:
      "Werte sind Näherungswerte (pro 100 g). Folge stets dem Plan deines Keto-Diät-Teams.",
    addReading: "Neue Messung",
    ketones: "Ketone",
    glucose: "Glukose",
    save: "Messung speichern",
    units: "Ketone in mmol/l, Glukose in mg/dl.",
    chart30: "Letzte 30 Tage",
    noReadings: "Keine Messungen.",
    history: "Verlauf",
    lockedTitle: "Keto-Modul ist Premium",
    lockedBody:
      "Schalte den Ratio-Rechner, die Datenbank mit 80 Lebensmitteln und das Keton-/Glukose-Tracking frei.",
    unlock: "Premium freischalten",
  },
  common: { save: "Speichern", cancel: "Abbrechen", settingsBtn: "Einstellungen" },
};

const zh: CommonStrings = {
  settings: {
    title: "设置",
    open: "打开设置",
    language: "语言",
    dataSection: "数据与备份",
    exportJson: "导出为系统文件（JSON）",
    exportZip: "导出完整存档（ZIP）",
    exportBackup: "导出备份",
    importBackup: "导入备份",
    exportHint:
      "完整备份包含所有内容，包括「你今天感觉如何？」中的个人反思。请将文件保存在安全的地方。",
    exportSuccess: "备份已保存到设备。",
    importSuccess: "备份导入成功。",
    importError: "这不是有效的 Epilumina 备份文件。",
    legal: "法律信息",
    terms: "条款与医疗声明",
    resetTerms: "下次启动时再次显示条款",
  },
  meds: {
    title: "用药提醒",
    desc: "在每次服药时间触发的本地提醒。",
    enableNotifs: "开启通知",
    name: "药品名称",
    dose: "剂量（例如 250 mg）",
    timesPlaceholder: "时间，例如 08:00, 20:00",
    add: "添加提醒",
    empty: "暂无提醒。",
    notifTitle: "服药时间",
    notifBody: "{name} {dose}",
  },
  terms: {
    title: "条款与医疗声明",
    accept: "我同意",
    intro: "请在继续之前阅读。",
    body: "1. 服务范围与医疗免责声明：Epilumina 仅是一款数字记录助手，不是经过认证的医疗设备。它不提供诊断，也不能替代专业的医疗建议或治疗。\n\n2. 用户责任：用户对其设备的物理与数字安全以及定期备份承担全部责任。对于因设备丢失、未设置屏幕锁或恶意软件感染导致的数据丢失、被盗或未经授权的访问，开发者不承担责任。\n\n3. 高级版订阅：订阅的销售方为 Stripe，由 Stripe 负责付款、税费与退款。你可以随时在设置中取消订阅；取消后不再续订，访问权限将持续到已付费周期结束。购买条款与撤销权适用 Stripe 的条款。\n\n4. 隐私：数据如何存储与处理，请参阅 epilumina.vercel.app 上的隐私政策（法律信息部分）。",
  },
  quota: {
    title: "设备存储已满",
    body: "浏览器已无空间保存新数据。请释放空间(导出备份后删除旧条目或文件)再试。",
    ok: "好的",
  },
  files: {
    uploadButton: "上传文件(PDF 或图片)",
    countLabel: "已上传文件({n})",
    empty: "尚未上传任何文件。",
    expand: "展开",
    collapse: "收起",
    preview: "预览",
    close: "关闭",
    download: "下载",
    rename: "重命名",
    delete: "删除",
    confirmDelete: "删除此文件?",
    tooLarge: "文件过大(本地存储限制 {size})。",
    unreadable: "无法读取该文件。",
  },
  chronicle: {
    from: "从",
    to: "至",
    expand: "展开详情",
    collapse: "收起",
    empty: "所选范围内无发作记录。",
    reset: "重置日期",
  },
  ai: {
    from: "从",
    to: "至",
    run: "运行分析",
    summary: "摘要",
    docsInsights: "文档发现",
    patterns: "相关性模式",
    noDataInRange: "所选日期范围内没有记录。",
    disclaimer:
      "AI 可能出错。此分析仅供参考,不能替代临床诊断。请在下次儿科神经科就诊时携带这些数据。",
    bulletCount: "记录的发作:{n}",
    bulletSevere: "严重发作:{n}",
    bulletTopTrigger: "最常见诱因:{name}",
    bulletTopType: "最常见发作类型:{name}",
    docsParsed: "范围内医疗文档:{n}",
    docsNoContent: "所选范围内无医疗文档。",
    patternSleep: "发作后笔记中反复出现的主题:发作前疲劳和睡眠缩短。",
    patternRecurring: "此期间反复出现的诱因:{trigger}。",
    patternClustered: "发作集中在 {days} 天内 — 值得与神经科医生讨论。",
    patternNone: "记录不足,无法检测明确模式。",
  },
  pdf: {
    reportTitle: "Epilumina — 医生报告",
    periodLabel: "报告期",
    generated: "生成时间",
    range: "从 {from} 至 {to}",
    typesTitle: "发作类型",
    chartTitle: "发作与酮体变化趋势",
    triggersTitle: "可能诱因",
    fullLog: "完整日志",
    date: "日期",
    type: "类型",
    duration: "持续时间",
    severity: "严重程度",
    symptoms: "症状",
    triggers: "诱因",
    notes: "备注",
    empty: "此期间无记录",
    printButton: "打印 / 另存为 PDF",
    disclaimer: "数据仅来自用户的本地日志(设备 localStorage)。信息性文件 — 不能替代医疗诊断。",
    openedNewTab: "已在新标签页打开报告预览。使用「打印 / 另存为 PDF」保存到设备。",
    configTitle: "报告板块",
    secStats: "摘要",
    secTypes: "发作类型",
    secTriggers: "诱因",
    secLog: "完整日志",
    secKeto: "生酮饮食",
    secJournal: "进展日记",
    ketoTitle: "生酮饮食 — 酮体与血糖",
    ketoAvgKet: "平均酮体",
    ketoAvgGlu: "平均血糖",
    ketoReadings: "测量记录",
    ketoEmpty: "此期间无酮体/血糖记录",
    journalTitle: "进展日记",
    journalEmpty: "此期间无日记",
  },
  premium: {
    monthly: "按月",
    annual: "按年",
    monthlyPrice: "9,99 €",
    annualPrice: "79,99 €",
    perMonth: "/ 月",
    perYear: "/ 年",
    save35: "节省 36%",
    bestValue: "最佳价值",
    choosePlan: "选择方案",
  },
  keto: {
    title: "生酮饮食",
    subtitle: "比例计算器与酮体记录 — 全部保存在您的设备上。",
    tabCalc: "比例计算器",
    tabTrack: "酮体与血糖",
    ratioLabel: "目标比例",
    addFood: "添加食物",
    searchPlaceholder: "搜索食物…",
    grams: "克",
    meal: "餐食",
    empty: "尚未添加食物。",
    clear: "清空餐食",
    remove: "删除",
    ratioNow: "当前比例",
    fat: "脂肪",
    protein: "蛋白质",
    carbs: "碳水",
    tipStart: "添加食物以查看这餐的生酮比例。",
    tipAddFat: "再加约 {g} 克纯脂肪(MCT 油或橄榄油)即可达到 {target}:1。",
    tipOk: "这餐已达到 {target}:1 的比例。",
    disclaimer: "数值为每 100 克的近似值。请始终遵循生酮饮食团队制定的方案。",
    addReading: "新增记录",
    ketones: "酮体",
    glucose: "血糖",
    save: "保存记录",
    units: "酮体单位 mmol/L,血糖单位 mg/dL。",
    chart30: "最近 30 天",
    noReadings: "暂无记录。",
    history: "历史",
    lockedTitle: "生酮模块属于 Premium",
    lockedBody: "解锁比例计算器、80 种食物数据库以及酮体/血糖记录。",
    unlock: "解锁 Premium",
  },
  common: { save: "保存", cancel: "取消", settingsBtn: "设置" },
};

const DICT: Record<CommonLang, CommonStrings> = { pl, en, es, fr, de, zh };

export function useCommonT(lang: string) {
  const active = (DICT as any)[lang] ? (DICT as any)[lang] : en;
  return function tc(path: string, vars?: Record<string, string | number>): string {
    const parts = path.split(".");
    let node: any = active;
    for (const p of parts) node = node?.[p];
    if (node === undefined) {
      node = en as any;
      for (const p of parts) node = node?.[p];
    }
    if (typeof node !== "string") return "";
    if (!vars) return node;
    return Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), node);
  };
}
