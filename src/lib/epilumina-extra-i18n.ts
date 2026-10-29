/* Extra UI strings added in the production upgrade (calendar, travel checklist,
 * PDF buttons, profiles, keto extensions). 6 languages, pl is the fallback. */

type Dict = Record<string, string>;

const pl: Dict = {
  "premium.deviceLimit":
    "Ten kod jest już aktywny na 3 urządzeniach. Aby użyć go na kolejnym, zwolnij jedno — napisz na epilumina.app@gmail.com.",
  "premium.recoverTitle": "Mam już płatność",
  "premium.recoverHint":
    "Wklej kod licencji skopiowany z Ustawień innego urządzenia albo identyfikator z Stripe — zaczyna się od cs_, sub_ lub si_.",
  "premium.recoverButton": "Sprawdź",
  "premium.recoverInvalid":
    "To nie wygląda na identyfikator sesji Stripe (powinien zaczynać się od cs_).",
  "backup.reminder":
    "Twoje wpisy są tylko na tym telefonie. Zrób kopię zapasową w Ustawieniach, żeby ich nie stracić.",
  "backup.askTitle": "Kopia zapasowa",
  "backup.askBody":
    "Czy pobrałaś już kopię zapasową (ZIP lub JSON)? Dziennik jest tylko na tym telefonie — bez kopii przepadnie, jeśli usuniesz aplikację albo zgubisz telefon.",
  "backup.download": "Zrób kopię teraz",
  "backup.later": "Przypomnij za 30 dni",
  "cal.title": "Kalendarz medyczny",
  "cal.desc": "Zaplanuj wizyty, badania i przypomnienia. Kropki pokazują dni z wpisami.",
  "cal.add": "+ Dodaj wydarzenie",
  "cal.newEvent": "Nowe wydarzenie",
  "cal.name": "Nazwa wydarzenia",
  "cal.namePh": "np. Wizyta u neurologa, Badanie EEG",
  "cal.date": "Data",
  "cal.time": "Godzina",
  "cal.remind": "Ustaw godzinę przypomnienia",
  "cal.remindTime": "Godzina przypomnienia",
  "cal.save": "Zapisz wydarzenie",
  "cal.cancel": "Anuluj",
  "common.save": "Zapisz",
  "cal.delete": "Usuń",
  "cal.empty": "Brak zaplanowanych wydarzeń.",
  "cal.upcoming": "Nadchodzące wydarzenia",
  "cal.dayEvents": "Wydarzenia tego dnia",
  "cal.legendSeizure": "Napad",
  "cal.legendEvent": "Wydarzenie",
  "cal.legendNote": "Notatka",
  "cal.legendMed": "Leki",
  "cal.today": "Dziś",
  "cal.notifAsk": "Włącz powiadomienia systemowe",
  "cal.notifOn": "Powiadomienia włączone",
  "cal.icsButton": "Dodaj przypomnienia do kalendarza telefonu",
  "cal.icsHint":
    "Najpewniejszy sposób: system przypomni nawet przy zamkniętej aplikacji. Otwórz pobrany plik i dodaj go do kalendarza.",
  "cal.icsAfter":
    "Plik zapisany w Pobranych. Otwórz go w aplikacji Kalendarz (nie w Chrome) — jeśli telefon nie ma takiej aplikacji, zaimportuj plik w Kalendarzu Google na komputerze.",
  "cal.icsShared":
    "Wybierz Kalendarz w oknie, które się otworzyło — wydarzenie dopisze się samo.",
  "meds.icsButton": "Dodaj leki do kalendarza telefonu",
  "meds.icsHint":
    "Codzienne przypomnienia o dawkach w kalendarzu systemowym. Działa też przy zamkniętej aplikacji. Otwórz plik i dodaj do kalendarza.",
  "meds.addTime": "Dodaj godzinę",
  "meds.editAria": "Edytuj lek",
  "cal.notifDenied": "Powiadomienia zablokowane w przeglądarce.",
  "cal.notifTitle": "Przypomnienie: {name}",
  "cal.notifBody": "Zaplanowano na {time}",
  "trip.title": "Podróż",
  "trip.desc": "Lista rzeczy do spakowania przed wyjazdem.",
  "trip.placeholder": "Co spakować?",
  "trip.add": "+ Dodaj",
  "trip.importMeds": "+ Dodaj leki z bazy",
  "trip.empty": "Lista jest pusta.",
  "trip.noMeds": "Brak leków w ustawieniach.",
  "journal.save": "Zapisz wpis",
  "pdf.download": "Pobierz PDF",
  "pdf.failed":
    "Nie udało się wygenerować PDF na tym urządzeniu. Spróbuj na komputerze albo zrób eksport kopii w Ustawieniach.",
  "pdf.partial":
    "Zapisano raport, ale {n} z {total} bloków nie udało się wyrenderować na tym urządzeniu. Sprawdź PDF — brakujące sekcje dorysuje się na komputerze.",
  "pdf.print": "Drukuj",
  "profiles.title": "Profile pacjentów",
  "profiles.desc": "Prowadź osobny dziennik dla każdego pacjenta.",
  "profiles.active": "Aktywny",
  "profiles.main": "Profil główny",
  "profiles.newName": "Nazwa nowego profilu",
  "profiles.add": "Dodaj",
  "keto.customTitle": "Własny produkt",
  "keto.customName": "Nazwa produktu",
  "keto.customAdd": "Dodaj własny produkt",
  "keto.target": "Cel",
  "keto.progress": "Postęp do celu {target}:1",
  "keto.sectionMeal": "Posiłek i produkty",
  "keto.sectionResult": "Wynik i ratio",
  "keto.sectionCustom": "Własne produkty",
};

const en: Dict = {
  "premium.deviceLimit":
    "This code is already active on 3 devices. To use it on another one, free a device — email epilumina.app@gmail.com.",
  "premium.recoverTitle": "I already paid",
  "premium.recoverHint":
    "Paste the licence code copied from Settings on your other device, or a Stripe identifier — it starts with cs_, sub_ or si_.",
  "premium.recoverButton": "Check",
  "premium.recoverInvalid":
    "That does not look like a Stripe session id (it should start with cs_).",
  "backup.reminder":
    "Your entries live only on this phone. Make a backup in Settings so you don't lose them.",
  "backup.askTitle": "Backup",
  "backup.askBody":
    "Have you downloaded your backup (ZIP or JSON) yet? The diary lives only on this phone — without a backup it is lost if you delete the app or lose the phone.",
  "backup.download": "Back up now",
  "backup.later": "Remind me in 30 days",
  "cal.title": "Medical calendar",
  "cal.desc": "Plan visits, tests and reminders. Dots mark days with entries.",
  "cal.add": "+ Add event",
  "cal.newEvent": "New event",
  "cal.name": "Event name",
  "cal.namePh": "e.g. Neurologist visit, EEG test",
  "cal.date": "Date",
  "cal.time": "Time",
  "cal.remind": "Set a reminder time",
  "cal.remindTime": "Reminder time",
  "cal.save": "Save event",
  "cal.cancel": "Cancel",
  "common.save": "Save",
  "cal.delete": "Delete",
  "cal.empty": "No events planned.",
  "cal.upcoming": "Upcoming events",
  "cal.dayEvents": "Events on this day",
  "cal.legendSeizure": "Seizure",
  "cal.legendEvent": "Event",
  "cal.legendNote": "Note",
  "cal.legendMed": "Medication",
  "cal.today": "Today",
  "cal.notifAsk": "Enable system notifications",
  "cal.notifOn": "Notifications enabled",
  "cal.icsButton": "Add reminders to the phone calendar",
  "cal.icsHint":
    "The most reliable way: your phone reminds you even with the app closed. Open the downloaded file and add it to your calendar.",
  "cal.icsAfter":
    "File saved to Downloads. Open it in your Calendar app (not Chrome) — if the phone has no calendar app that opens .ics, import the file in Google Calendar on a computer.",
  "cal.icsShared":
    "Pick Calendar in the window that opened — the event will be added.",
  "meds.icsButton": "Add medication reminders to the phone calendar",
  "meds.icsHint":
    "Daily dose reminders in your system calendar. Works with the app closed too. Open the file and add it to your calendar.",
  "meds.addTime": "Add time",
  "meds.editAria": "Edit medication",
  "cal.notifDenied": "Notifications are blocked in the browser.",
  "cal.notifTitle": "Reminder: {name}",
  "cal.notifBody": "Scheduled for {time}",
  "trip.title": "Travel",
  "trip.desc": "Packing checklist before you leave.",
  "trip.placeholder": "What to pack?",
  "trip.add": "+ Add",
  "trip.importMeds": "+ Add medication from list",
  "trip.empty": "The list is empty.",
  "trip.noMeds": "No medication saved in settings.",
  "journal.save": "Save entry",
  "pdf.download": "Download PDF",
  "pdf.failed":
    "Could not generate the PDF on this device. Try on a computer, or export a backup in Settings.",
  "pdf.partial":
    "The report was saved, but {n} of {total} blocks could not be rendered on this device. Check the PDF — missing sections render fine on a computer.",
  "pdf.print": "Print",
  "profiles.title": "Patient profiles",
  "profiles.desc": "Keep a separate diary for every patient.",
  "profiles.active": "Active",
  "profiles.main": "Main profile",
  "profiles.newName": "New profile name",
  "profiles.add": "Add",
  "keto.customTitle": "Custom food",
  "keto.customName": "Food name",
  "keto.customAdd": "Add custom food",
  "keto.target": "Target",
  "keto.progress": "Progress towards {target}:1",
  "keto.sectionMeal": "Meal and foods",
  "keto.sectionResult": "Result and ratio",
  "keto.sectionCustom": "Custom foods",
};

const de: Dict = {
  "premium.deviceLimit":
    "Dieser Code ist bereits auf 3 Geräten aktiv. Um ihn auf einem weiteren zu nutzen, gib ein Gerät frei – schreib an epilumina.app@gmail.com.",
  "premium.recoverTitle": "Ich habe bereits bezahlt",
  "premium.recoverHint":
    "Füge den aus den Einstellungen eines anderen Geräts kopierten Lizenzcode ein oder eine Stripe-ID – sie beginnt mit cs_, sub_ oder si_.",
  "premium.recoverButton": "Prüfen",
  "premium.recoverInvalid":
    "Das sieht nicht nach einer Stripe-Sitzungs-ID aus (sie sollte mit cs_ beginnen).",
  "backup.reminder":
    "Deine Einträge liegen nur auf diesem Telefon. Erstelle in den Einstellungen eine Sicherung, damit sie nicht verloren gehen.",
  "backup.askTitle": "Sicherung",
  "backup.askBody":
    "Hast du schon eine Sicherung (ZIP oder JSON) heruntergeladen? Das Tagebuch liegt nur auf diesem Telefon — ohne Sicherung ist es weg, wenn du die App löschst oder das Telefon verlierst.",
  "backup.download": "Jetzt sichern",
  "backup.later": "In 30 Tagen erinnern",
  "cal.title": "Medizinischer Kalender",
  "cal.desc":
    "Termine, Untersuchungen und Erinnerungen planen. Punkte markieren Tage mit Einträgen.",
  "cal.add": "+ Termin hinzufügen",
  "cal.newEvent": "Neuer Termin",
  "cal.name": "Bezeichnung",
  "cal.namePh": "z. B. Neurologe, EEG",
  "cal.date": "Datum",
  "cal.time": "Uhrzeit",
  "cal.remind": "Erinnerungszeit festlegen",
  "cal.remindTime": "Erinnerungszeit",
  "cal.save": "Termin speichern",
  "cal.cancel": "Abbrechen",
  "common.save": "Speichern",
  "cal.delete": "Löschen",
  "cal.empty": "Keine Termine geplant.",
  "cal.upcoming": "Nächste Termine",
  "cal.dayEvents": "Termine an diesem Tag",
  "cal.legendSeizure": "Anfall",
  "cal.legendEvent": "Termin",
  "cal.legendNote": "Notiz",
  "cal.legendMed": "Medikamente",
  "cal.today": "Heute",
  "cal.notifAsk": "Systembenachrichtigungen aktivieren",
  "cal.notifOn": "Benachrichtigungen aktiv",
  "cal.icsButton": "Erinnerungen in den Telefonkalender übernehmen",
  "cal.icsHint":
    "Der sicherste Weg: das Telefon erinnert auch bei geschlossener App. Öffne die Datei und füge sie dem Kalender hinzu.",
  "cal.icsAfter":
    "Datei in Downloads gespeichert. Öffne sie in der Kalender-App (nicht in Chrome) — falls das Telefon keine passende App hat, importiere die Datei am Computer in Google Kalender.",
  "cal.icsShared":
    "Wähle im geöffneten Fenster Kalender — der Termin wird übernommen.",
  "meds.icsButton": "Medikamente in den Telefonkalender übernehmen",
  "meds.icsHint":
    "Tägliche Dosis-Erinnerungen im Systemkalender. Funktioniert auch bei geschlossener App. Datei öffnen und zum Kalender hinzufügen.",
  "meds.addTime": "Uhrzeit hinzufügen",
  "meds.editAria": "Medikament bearbeiten",
  "cal.notifDenied": "Benachrichtigungen im Browser blockiert.",
  "cal.notifTitle": "Erinnerung: {name}",
  "cal.notifBody": "Geplant für {time}",
  "trip.title": "Reise",
  "trip.desc": "Packliste vor der Abreise.",
  "trip.placeholder": "Was einpacken?",
  "trip.add": "+ Hinzufügen",
  "trip.importMeds": "+ Medikamente übernehmen",
  "trip.empty": "Die Liste ist leer.",
  "trip.noMeds": "Keine Medikamente gespeichert.",
  "journal.save": "Eintrag speichern",
  "pdf.download": "PDF herunterladen",
  "pdf.failed":
    "PDF konnte auf diesem Gerät nicht erstellt werden. Versuche es am Computer oder exportiere eine Sicherung in den Einstellungen.",
  "pdf.partial":
    "Der Bericht wurde gespeichert, aber {n} von {total} Blöcken konnten auf diesem Gerät nicht gerendert werden. Fehlende Abschnitte erscheinen am Computer.",
  "pdf.print": "Drucken",
  "profiles.title": "Patientenprofile",
  "profiles.desc": "Führe für jeden Patienten ein eigenes Tagebuch.",
  "profiles.active": "Aktiv",
  "profiles.main": "Hauptprofil",
  "profiles.newName": "Name des neuen Profils",
  "profiles.add": "Hinzufügen",
  "keto.customTitle": "Eigenes Lebensmittel",
  "keto.customName": "Bezeichnung",
  "keto.customAdd": "Eigenes Lebensmittel hinzufügen",
  "keto.target": "Ziel",
  "keto.progress": "Fortschritt zu {target}:1",
  "keto.sectionMeal": "Mahlzeit und Lebensmittel",
  "keto.sectionResult": "Ergebnis und Ratio",
  "keto.sectionCustom": "Eigene Lebensmittel",
};

const es: Dict = {
  "premium.deviceLimit":
    "Este código ya está activo en 3 dispositivos. Para usarlo en otro, libera uno: escribe a epilumina.app@gmail.com.",
  "premium.recoverTitle": "Ya he pagado",
  "premium.recoverHint":
    "Pega el código de licencia copiado de Ajustes en tu otro dispositivo, o un identificador de Stripe: empieza por cs_, sub_ o si_.",
  "premium.recoverButton": "Comprobar",
  "premium.recoverInvalid":
    "No parece un identificador de sesión de Stripe (debería empezar por cs_).",
  "backup.reminder":
    "Tus entradas solo están en este teléfono. Haz una copia en Ajustes para no perderlas.",
  "backup.askTitle": "Copia de seguridad",
  "backup.askBody":
    "¿Ya has descargado tu copia de seguridad (ZIP o JSON)? El diario solo está en este teléfono: sin copia se pierde si borras la app o pierdes el teléfono.",
  "backup.download": "Hacer copia ahora",
  "backup.later": "Recordar en 30 días",
  "cal.title": "Calendario médico",
  "cal.desc": "Planifica visitas, pruebas y recordatorios. Los puntos marcan días con registros.",
  "cal.add": "+ Añadir evento",
  "cal.newEvent": "Nuevo evento",
  "cal.name": "Nombre del evento",
  "cal.namePh": "p. ej. Visita al neurólogo, EEG",
  "cal.date": "Fecha",
  "cal.time": "Hora",
  "cal.remind": "Establecer hora de recordatorio",
  "cal.remindTime": "Hora del recordatorio",
  "cal.save": "Guardar evento",
  "cal.cancel": "Cancelar",
  "common.save": "Guardar",
  "cal.delete": "Eliminar",
  "cal.empty": "No hay eventos planificados.",
  "cal.upcoming": "Próximos eventos",
  "cal.dayEvents": "Eventos de este día",
  "cal.legendSeizure": "Crisis",
  "cal.legendEvent": "Evento",
  "cal.legendNote": "Nota",
  "cal.legendMed": "Medicación",
  "cal.today": "Hoy",
  "cal.notifAsk": "Activar notificaciones del sistema",
  "cal.notifOn": "Notificaciones activadas",
  "cal.icsButton": "Añadir recordatorios al calendario del teléfono",
  "cal.icsHint":
    "La forma más fiable: el teléfono avisa incluso con la app cerrada. Abre el archivo y añádelo al calendario.",
  "cal.icsAfter":
    "Archivo guardado en Descargas. Ábrelo en la app Calendario (no en Chrome); si el teléfono no tiene una app que abra .ics, importa el archivo en Google Calendar en un ordenador.",
  "cal.icsShared":
    "Elige Calendario en la ventana que se abrió: el evento se añadirá.",
  "meds.icsButton": "Añadir medicación al calendario del teléfono",
  "meds.icsHint":
    "Recordatorios diarios de dosis en el calendario del sistema. Funciona también con la app cerrada. Abre el archivo y añádelo al calendario.",
  "meds.addTime": "Añadir hora",
  "meds.editAria": "Editar medicación",
  "cal.notifDenied": "Notificaciones bloqueadas en el navegador.",
  "cal.notifTitle": "Recordatorio: {name}",
  "cal.notifBody": "Programado para {time}",
  "trip.title": "Viaje",
  "trip.desc": "Lista de equipaje antes de salir.",
  "trip.placeholder": "¿Qué llevar?",
  "trip.add": "+ Añadir",
  "trip.importMeds": "+ Añadir medicación guardada",
  "trip.empty": "La lista está vacía.",
  "trip.noMeds": "No hay medicación guardada.",
  "journal.save": "Guardar registro",
  "pdf.download": "Descargar PDF",
  "pdf.failed":
    "No se pudo generar el PDF en este dispositivo. Prueba en un ordenador o exporta una copia en Ajustes.",
  "pdf.partial":
    "El informe se guardó, pero {n} de {total} bloques no se pudieron renderizar en este dispositivo. Las secciones que faltan aparecen en un ordenador.",
  "pdf.print": "Imprimir",
  "profiles.title": "Perfiles de pacientes",
  "profiles.desc": "Lleva un diario separado para cada paciente.",
  "profiles.active": "Activo",
  "profiles.main": "Perfil principal",
  "profiles.newName": "Nombre del nuevo perfil",
  "profiles.add": "Añadir",
  "keto.customTitle": "Alimento propio",
  "keto.customName": "Nombre del alimento",
  "keto.customAdd": "Añadir alimento propio",
  "keto.target": "Objetivo",
  "keto.progress": "Progreso hacia {target}:1",
  "keto.sectionMeal": "Comida y alimentos",
  "keto.sectionResult": "Resultado y ratio",
  "keto.sectionCustom": "Alimentos propios",
};

const fr: Dict = {
  "premium.deviceLimit":
    "Ce code est déjà actif sur 3 appareils. Pour l'utiliser sur un autre, libérez un appareil — écrivez à epilumina.app@gmail.com.",
  "premium.recoverTitle": "J'ai déjà payé",
  "premium.recoverHint":
    "Collez le code de licence copié depuis les Réglages de votre autre appareil, ou un identifiant Stripe — il commence par cs_, sub_ ou si_.",
  "premium.recoverButton": "Vérifier",
  "premium.recoverInvalid":
    "Cela ne ressemble pas à un identifiant de session Stripe (il doit commencer par cs_).",
  "backup.reminder":
    "Vos entrées ne sont que sur ce téléphone. Faites une sauvegarde dans les Réglages pour ne pas les perdre.",
  "backup.askTitle": "Sauvegarde",
  "backup.askBody":
    "Avez-vous déjà téléchargé votre sauvegarde (ZIP ou JSON) ? Le journal n'existe que sur ce téléphone : sans sauvegarde, il est perdu si vous supprimez l'application ou perdez le téléphone.",
  "backup.download": "Sauvegarder maintenant",
  "backup.later": "Me rappeler dans 30 jours",
  "cal.title": "Calendrier médical",
  "cal.desc":
    "Planifiez visites, examens et rappels. Les points marquent les jours avec des entrées.",
  "cal.add": "+ Ajouter un événement",
  "cal.newEvent": "Nouvel événement",
  "cal.name": "Nom de l'événement",
  "cal.namePh": "ex. Visite chez le neurologue, EEG",
  "cal.date": "Date",
  "cal.time": "Heure",
  "cal.remind": "Définir une heure de rappel",
  "cal.remindTime": "Heure du rappel",
  "cal.save": "Enregistrer l'événement",
  "cal.cancel": "Annuler",
  "common.save": "Enregistrer",
  "cal.delete": "Supprimer",
  "cal.empty": "Aucun événement planifié.",
  "cal.upcoming": "Événements à venir",
  "cal.dayEvents": "Événements de ce jour",
  "cal.legendSeizure": "Crise",
  "cal.legendEvent": "Événement",
  "cal.legendNote": "Note",
  "cal.legendMed": "Médicaments",
  "cal.today": "Aujourd'hui",
  "cal.notifAsk": "Activer les notifications système",
  "cal.notifOn": "Notifications activées",
  "cal.icsButton": "Ajouter les rappels au calendrier du téléphone",
  "cal.icsHint":
    "Le plus fiable : le téléphone rappelle même application fermée. Ouvrez le fichier et ajoutez-le au calendrier.",
  "cal.icsAfter":
    "Fichier enregistré dans Téléchargements. Ouvrez-le dans l’application Calendrier (pas Chrome) ; si le téléphone n’a pas d’app adaptée, importez le fichier dans Google Agenda sur un ordinateur.",
  "cal.icsShared":
    "Choisissez Calendrier dans la fenêtre ouverte — l’événement sera ajouté.",
  "meds.icsButton": "Ajouter les médicaments au calendrier du téléphone",
  "meds.icsHint":
    "Rappels quotidiens des doses dans le calendrier système. Fonctionne aussi application fermée. Ouvrez le fichier et ajoutez-le au calendrier.",
  "meds.addTime": "Ajouter une heure",
  "meds.editAria": "Modifier le médicament",
  "cal.notifDenied": "Notifications bloquées dans le navigateur.",
  "cal.notifTitle": "Rappel : {name}",
  "cal.notifBody": "Prévu à {time}",
  "trip.title": "Voyage",
  "trip.desc": "Liste des affaires à emporter.",
  "trip.placeholder": "Quoi emporter ?",
  "trip.add": "+ Ajouter",
  "trip.importMeds": "+ Ajouter les médicaments",
  "trip.empty": "La liste est vide.",
  "trip.noMeds": "Aucun médicament enregistré.",
  "journal.save": "Enregistrer l'entrée",
  "pdf.download": "Télécharger le PDF",
  "pdf.failed":
    "Impossible de générer le PDF sur cet appareil. Essayez sur un ordinateur ou exportez une sauvegarde dans les Réglages.",
  "pdf.partial":
    "Le rapport a été enregistré, mais {n} blocs sur {total} n'ont pas pu être rendus sur cet appareil. Les sections manquantes apparaissent sur un ordinateur.",
  "pdf.print": "Imprimer",
  "profiles.title": "Profils des patients",
  "profiles.desc": "Tenez un journal distinct pour chaque patient.",
  "profiles.active": "Actif",
  "profiles.main": "Profil principal",
  "profiles.newName": "Nom du nouveau profil",
  "profiles.add": "Ajouter",
  "keto.customTitle": "Aliment personnalisé",
  "keto.customName": "Nom de l'aliment",
  "keto.customAdd": "Ajouter un aliment",
  "keto.target": "Objectif",
  "keto.progress": "Progression vers {target}:1",
  "keto.sectionMeal": "Repas et aliments",
  "keto.sectionResult": "Résultat et ratio",
  "keto.sectionCustom": "Aliments personnalisés",
};

const zh: Dict = {
  "premium.deviceLimit":
    "该代码已在 3 台设备上激活。如需在其他设备使用，请先释放一台设备——请发送邮件至 epilumina.app@gmail.com。",
  "premium.recoverTitle": "我已经付款",
  "premium.recoverHint":
    "请粘贴从另一台设备设置中复制的许可证代码，或 Stripe 标识符——以 cs_、sub_ 或 si_ 开头。",
  "premium.recoverButton": "检查",
  "premium.recoverInvalid": "这不像 Stripe 会话编号（应以 cs_ 开头）。",
  "backup.reminder": "你的记录只保存在这台手机上。请在设置中做好备份，以免丢失。",
  "backup.askTitle": "备份",
  "backup.askBody":
    "你是否已经下载了备份（ZIP 或 JSON）？日记只保存在这台手机上——如果没有备份，删除应用或丢失手机后就会永久丢失。",
  "backup.download": "立即备份",
  "backup.later": "30 天后提醒",
  "cal.title": "医疗日历",
  "cal.desc": "安排就诊、检查与提醒。圆点表示当天有记录。",
  "cal.add": "+ 添加事件",
  "cal.newEvent": "新事件",
  "cal.name": "事件名称",
  "cal.namePh": "例如：神经科就诊、脑电图检查",
  "cal.date": "日期",
  "cal.time": "时间",
  "cal.remind": "设置提醒时间",
  "cal.remindTime": "提醒时间",
  "cal.save": "保存事件",
  "cal.cancel": "取消",
  "common.save": "保存",
  "cal.delete": "删除",
  "cal.empty": "暂无计划事件。",
  "cal.upcoming": "即将到来的事件",
  "cal.dayEvents": "当天事件",
  "cal.legendSeizure": "发作",
  "cal.legendEvent": "事件",
  "cal.legendNote": "笔记",
  "cal.legendMed": "药物",
  "cal.today": "今天",
  "cal.notifAsk": "开启系统通知",
  "cal.notifOn": "通知已开启",
  "cal.icsButton": "将提醒添加到手机日历",
  "cal.icsHint":
    "最可靠的方式：即使应用关闭，手机也会提醒。打开下载的文件并添加到日历。",
  "cal.icsAfter":
    "文件已保存到“下载”。请在日历应用（不是 Chrome）中打开；如果手机没有可打开 .ics 的日历应用，请在电脑上用 Google 日历导入。",
  "cal.icsShared":
    "在弹出的窗口中选择“日历”，事件将自动添加。",
  "meds.icsButton": "将用药提醒添加到手机日历",
  "meds.icsHint":
    "在系统日历中设置每日服药提醒，应用关闭时同样有效。打开文件并添加到日历。",
  "meds.addTime": "添加时间",
  "meds.editAria": "编辑药物",
  "cal.notifDenied": "浏览器已阻止通知。",
  "cal.notifTitle": "提醒：{name}",
  "cal.notifBody": "计划时间 {time}",
  "trip.title": "出行",
  "trip.desc": "出发前的行李清单。",
  "trip.placeholder": "需要带什么？",
  "trip.add": "+ 添加",
  "trip.importMeds": "+ 添加已保存的药物",
  "trip.empty": "清单为空。",
  "trip.noMeds": "设置中没有药物。",
  "journal.save": "保存记录",
  "pdf.download": "下载 PDF",
  "pdf.failed":
    "无法在此设备上生成 PDF。请在电脑上重试，或在设置中导出备份。",
  "pdf.partial":
    "报告已保存，但有 {n}/{total} 个区块在此设备上无法渲染。缺失部分在电脑上可正常显示。",
  "pdf.print": "打印",
  "profiles.title": "患者档案",
  "profiles.desc": "为每位患者单独记录日记。",
  "profiles.active": "当前",
  "profiles.main": "主档案",
  "profiles.newName": "新档案名称",
  "profiles.add": "添加",
  "keto.customTitle": "自定义食物",
  "keto.customName": "食物名称",
  "keto.customAdd": "添加自定义食物",
  "keto.target": "目标",
  "keto.progress": "距离 {target}:1 的进度",
  "keto.sectionMeal": "餐食与食材",
  "keto.sectionResult": "结果与比例",
  "keto.sectionCustom": "自定义食物",
};

/* PIN lock, profile deletion and checkout strings. */
const MORE: Record<string, Dict> = {
  pl: {
    "pin.title": "Ochrona kodem PIN",
    "pin.desc":
      "Blokada ekranu aplikacji 4-cyfrowym kodem — chroni przed przypadkowym wglądem osób postronnych. To nie jest szyfrowanie danych medycznych.",
    "pin.change": "Zmień kod PIN",
    "pin.set": "Ustaw 4-cyfrowy kod PIN",
    "pin.repeat": "Powtórz kod PIN",
    "pin.mismatch": "Kody się różnią — spróbuj ponownie",
    "pin.wrong": "Nieprawidłowy kod PIN",
    "pin.forgot": "Nie pamiętam PIN-u",
    "pin.recoveryTitle": "Kod odzyskiwania",
    "pin.warnTitle": "Zanim włączysz blokadę",
    "pin.warn1":
      "Bez PIN-u i bez kodu odzyskiwania nie ma żadnego sposobu, żeby wejść do dziennika.",
    "pin.warn2":
      "Jedynym ratunkiem byłoby wtedy usunięcie aplikacji — a to kasuje wszystkie dane.",
    "pin.warn3": "Dlatego: zapisz kod na papierze i zrób kopię zapasową.",
    "pin.retype":
      "Przepisz kod, żeby potwierdzić, że go zapisałeś",
    "pin.retypeMismatch":
      "Kod się nie zgadza. Sprawdź, czy przepisałaś go dokładnie (myślnik nie ma znaczenia).",
    "pin.backup": "Zrób kopię zapasową teraz",
    "pin.recoveryIntro":
      "Zapisz ten kod na papierze albo w menedżerze haseł. To jedyny sposób, żeby odblokować aplikację, gdy zapomnisz PIN-u.",
    "pin.recoveryConfirm": "Zapisałem kod — włącz blokadę",
    "pin.recoveryAsk": "Wpisz kod odzyskiwania",
    "pin.recoveryWrong": "Nieprawidłowy kod odzyskiwania",
    "pin.recoveryUnlock": "Odblokuj",
    "pin.recoveryNone":
      "Ten PIN ustawiono przed wprowadzeniem kodów odzyskiwania, więc nie ma do niego kodu. Możesz wyłączyć blokadę i ustawić nowy PIN — wtedy dostaniesz kod odzyskiwania.",
    "pin.recoveryNoneBtn": "Wyłącz blokadę i ustaw nowy PIN",
    "pin.enter": "Wpisz kod PIN, aby odblokować",
    "pin.delete": "Usuń",
    "pin.cancel": "Anuluj",
    "profiles.deleteConfirm": "Usunąć profil „{name}” i wszystkie jego dane?",
    "premium.checkoutError": "Nie udało się otworzyć płatności.",
  },
  en: {
    "pin.title": "PIN protection",
    "pin.desc":
      "A 4-digit screen lock for the app — it prevents accidental viewing by others. It does not encrypt your medical data.",
    "pin.change": "Change PIN",
    "pin.set": "Set a 4-digit PIN",
    "pin.repeat": "Repeat the PIN",
    "pin.mismatch": "The codes differ — try again",
    "pin.wrong": "Incorrect PIN",
    "pin.forgot": "I don't remember the PIN",
    "pin.recoveryTitle": "Recovery code",
    "pin.warnTitle": "Before you turn the lock on",
    "pin.warn1":
      "Without the PIN and without the recovery code there is no way into the diary.",
    "pin.warn2":
      "The only way out would then be deleting the app — which erases all data.",
    "pin.warn3": "So: write the code down and make a backup.",
    "pin.retype":
      "Retype the code to confirm you saved it",
    "pin.retypeMismatch":
      "The code does not match. Check that you copied it exactly (the dash does not matter).",
    "pin.backup": "Make a backup now",
    "pin.recoveryIntro":
      "Write this code on paper or save it in a password manager. It is the only way to unlock the app if you forget the PIN.",
    "pin.recoveryConfirm": "I saved the code — enable the lock",
    "pin.recoveryAsk": "Enter the recovery code",
    "pin.recoveryWrong": "Incorrect recovery code",
    "pin.recoveryUnlock": "Unlock",
    "pin.recoveryNone":
      "This PIN was set before recovery codes existed, so it has no code. You can turn the lock off and set a new PIN — you will get a recovery code then.",
    "pin.recoveryNoneBtn": "Turn the lock off and set a new PIN",
    "pin.enter": "Enter your PIN to unlock",
    "pin.delete": "Delete",
    "pin.cancel": "Cancel",
    "profiles.deleteConfirm": "Delete profile \u201C{name}\u201D and all of its data?",
    "premium.checkoutError": "Could not open the payment page.",
  },
  de: {
    "pin.title": "PIN-Schutz",
    "pin.desc":
      "Eine 4-stellige Bildschirmsperre für die App – schützt vor versehentlichem Einblick durch andere. Medizinische Daten werden dadurch nicht verschlüsselt.",
    "pin.change": "PIN ändern",
    "pin.set": "4-stelligen PIN festlegen",
    "pin.repeat": "PIN wiederholen",
    "pin.mismatch": "Die Codes stimmen nicht überein — erneut versuchen",
    "pin.wrong": "Falscher PIN",
    "pin.forgot": "Ich kenne die PIN nicht",
    "pin.recoveryTitle": "Wiederherstellungscode",
    "pin.warnTitle": "Bevor du die Sperre aktivierst",
    "pin.warn1":
      "Ohne PIN und ohne Wiederherstellungscode gibt es keinen Weg ins Tagebuch.",
    "pin.warn2":
      "Die einzige Rettung wäre dann das Löschen der App — und das löscht alle Daten.",
    "pin.warn3": "Also: Code aufschreiben und eine Sicherung erstellen.",
    "pin.retype":
      "Code erneut eingeben, um zu bestätigen, dass du ihn gespeichert hast",
    "pin.retypeMismatch":
      "Der Code stimmt nicht. Prüfe, ob du ihn genau abgeschrieben hast (der Bindestrich zählt nicht).",
    "pin.backup": "Jetzt eine Sicherung erstellen",
    "pin.recoveryIntro":
      "Schreibe diesen Code auf oder speichere ihn im Passwortmanager. Nur damit kannst du die App entsperren, wenn du die PIN vergisst.",
    "pin.recoveryConfirm": "Code gespeichert — Sperre aktivieren",
    "pin.recoveryAsk": "Wiederherstellungscode eingeben",
    "pin.recoveryWrong": "Falscher Wiederherstellungscode",
    "pin.recoveryUnlock": "Entsperren",
    "pin.recoveryNone":
      "Diese PIN wurde vor Einführung der Wiederherstellungscodes gesetzt und hat keinen Code. Du kannst die Sperre deaktivieren und eine neue PIN setzen — dann erhältst du einen Code.",
    "pin.recoveryNoneBtn": "Sperre deaktivieren und neue PIN setzen",
    "pin.enter": "PIN eingeben zum Entsperren",
    "pin.delete": "Löschen",
    "pin.cancel": "Abbrechen",
    "profiles.deleteConfirm": "Profil \u201E{name}\u201C und alle Daten löschen?",
    "premium.checkoutError": "Die Zahlungsseite konnte nicht geöffnet werden.",
  },
  es: {
    "pin.title": "Protección con PIN",
    "pin.desc":
      "Bloqueo de pantalla de la app con un código de 4 dígitos: evita miradas accidentales de otras personas. No cifra tus datos médicos.",
    "pin.change": "Cambiar el PIN",
    "pin.set": "Establece un PIN de 4 dígitos",
    "pin.repeat": "Repite el PIN",
    "pin.mismatch": "Los códigos no coinciden — inténtalo de nuevo",
    "pin.wrong": "PIN incorrecto",
    "pin.forgot": "No recuerdo el PIN",
    "pin.recoveryTitle": "Código de recuperación",
    "pin.warnTitle": "Antes de activar el bloqueo",
    "pin.warn1":
      "Sin el PIN y sin el código de recuperación no hay forma de entrar en el diario.",
    "pin.warn2":
      "La única salida sería entonces eliminar la aplicación, y eso borra todos los datos.",
    "pin.warn3": "Por eso: anota el código y haz una copia de seguridad.",
    "pin.retype":
      "Vuelve a escribir el código para confirmar que lo guardaste",
    "pin.retypeMismatch":
      "El código no coincide. Comprueba que lo copiaste exactamente (el guion no importa).",
    "pin.backup": "Hacer una copia de seguridad ahora",
    "pin.recoveryIntro":
      "Anota este código en papel o guárdalo en un gestor de contraseñas. Es la única forma de desbloquear la app si olvidas el PIN.",
    "pin.recoveryConfirm": "He guardado el código — activar el bloqueo",
    "pin.recoveryAsk": "Introduce el código de recuperación",
    "pin.recoveryWrong": "Código de recuperación incorrecto",
    "pin.recoveryUnlock": "Desbloquear",
    "pin.recoveryNone":
      "Este PIN se estableció antes de que existieran los códigos de recuperación, así que no tiene código. Puedes desactivar el bloqueo y poner un PIN nuevo — entonces recibirás un código.",
    "pin.recoveryNoneBtn": "Desactivar el bloqueo y poner un PIN nuevo",
    "pin.enter": "Introduce tu PIN para desbloquear",
    "pin.delete": "Eliminar",
    "pin.cancel": "Cancelar",
    "profiles.deleteConfirm": "¿Eliminar el perfil «{name}» y todos sus datos?",
    "premium.checkoutError": "No se pudo abrir la página de pago.",
  },
  fr: {
    "pin.title": "Protection par code PIN",
    "pin.desc":
      "Verrouillage de l'écran de l'application par code à 4 chiffres — il évite les regards indiscrets accidentels. Il ne chiffre pas vos données médicales.",
    "pin.change": "Modifier le code PIN",
    "pin.set": "Définir un code PIN à 4 chiffres",
    "pin.repeat": "Répétez le code PIN",
    "pin.mismatch": "Les codes diffèrent — réessayez",
    "pin.wrong": "Code PIN incorrect",
    "pin.forgot": "Je ne me souviens pas du PIN",
    "pin.recoveryTitle": "Code de récupération",
    "pin.warnTitle": "Avant d'activer le verrou",
    "pin.warn1":
      "Sans le PIN ni le code de récupération, il n'y a aucun moyen d'entrer dans le journal.",
    "pin.warn2":
      "La seule issue serait alors de supprimer l'application — ce qui efface toutes les données.",
    "pin.warn3": "Donc : notez le code et faites une sauvegarde.",
    "pin.retype":
      "Saisissez à nouveau le code pour confirmer que vous l'avez noté",
    "pin.retypeMismatch":
      "Le code ne correspond pas. Vérifiez que vous l'avez copié exactement (le tiret n'a pas d'importance).",
    "pin.backup": "Faire une sauvegarde maintenant",
    "pin.recoveryIntro":
      "Notez ce code sur papier ou dans un gestionnaire de mots de passe. C'est le seul moyen de déverrouiller l'application si vous oubliez le PIN.",
    "pin.recoveryConfirm": "J'ai noté le code — activer le verrou",
    "pin.recoveryAsk": "Saisissez le code de récupération",
    "pin.recoveryWrong": "Code de récupération incorrect",
    "pin.recoveryUnlock": "Déverrouiller",
    "pin.recoveryNone":
      "Ce PIN a été défini avant l'arrivée des codes de récupération, il n'a donc pas de code. Vous pouvez désactiver le verrou et définir un nouveau PIN — vous recevrez alors un code.",
    "pin.recoveryNoneBtn": "Désactiver le verrou et définir un nouveau PIN",
    "pin.enter": "Saisissez votre code PIN pour déverrouiller",
    "pin.delete": "Supprimer",
    "pin.cancel": "Annuler",
    "profiles.deleteConfirm": "Supprimer le profil «\u00A0{name}\u00A0» et toutes ses données ?",
    "premium.checkoutError": "Impossible d'ouvrir la page de paiement.",
  },
  zh: {
    "pin.title": "PIN 码保护",
    "pin.desc": "应用的 4 位数字屏幕锁——防止他人无意中查看。它不会加密您的医疗数据。",
    "pin.change": "修改 PIN 码",
    "pin.set": "设置 4 位 PIN 码",
    "pin.repeat": "再次输入 PIN 码",
    "pin.mismatch": "两次输入不一致，请重试",
    "pin.wrong": "PIN 码错误",
    "pin.forgot": "我忘记 PIN 了",
    "pin.recoveryTitle": "恢复代码",
    "pin.warnTitle": "启用锁定之前",
    "pin.warn1":
      "没有 PIN 也没有恢复代码，就无法进入日记。",
    "pin.warn2":
      "那时唯一的出路是删除应用，而删除会清除所有数据。",
    "pin.warn3": "因此：请把代码写下来，并做一次备份。",
    "pin.retype":
      "请重新输入代码，以确认你已保存",
    "pin.retypeMismatch":
      "代码不匹配。请检查是否完全照抄（短横线不影响）。",
    "pin.backup": "现在备份",
    "pin.recoveryIntro":
      "请将此代码写在纸上或保存到密码管理器。忘记 PIN 时，这是解锁应用的唯一方式。",
    "pin.recoveryConfirm": "我已保存代码 — 启用锁定",
    "pin.recoveryAsk": "输入恢复代码",
    "pin.recoveryWrong": "恢复代码不正确",
    "pin.recoveryUnlock": "解锁",
    "pin.recoveryNone":
      "此 PIN 是在恢复代码功能之前设置的，因此没有对应代码。你可以关闭锁定并设置新的 PIN，届时会获得恢复代码。",
    "pin.recoveryNoneBtn": "关闭锁定并设置新 PIN",
    "pin.enter": "输入 PIN 码解锁",
    "pin.delete": "删除",
    "pin.cancel": "取消",
    "profiles.deleteConfirm": "删除档案“{name}”及其全部数据？",
    "premium.checkoutError": "无法打开支付页面。",
  },
};

/* Keto ratio tooltip, profile rename prompt, premium unlock aria label, plan modal. */
const MORE2: Record<string, Dict> = {
  pl: {
    "premium.securePayment":
      "Bezpieczna płatność Stripe · subskrypcja, możesz ją anulować w dowolnym momencie.",
    "files.storageWarn":
      "Pamięć przeglądarki jest prawie pełna. Zrób kopię zapasową i usuń niepotrzebne pliki, aby zapisywanie dziennika działało bez problemów.",
    "files.storageFull":
      "Za mało miejsca w pamięci przeglądarki na te pliki. Usuń starsze załączniki lub zrób kopię zapasową.",
    "keto.myMeals": "Moje posiłki",
    "keto.saveMeal": "Zapisz jako mój posiłek",
    "keto.mealName": "Nazwa posiłku (np. Śniadanie keto)",
    "keto.addMeal": "Dodaj",
    "keto.myMealsEmpty":
      "Nie masz jeszcze zapisanych posiłków. Skomponuj posiłek z kilku składników i stuknij „Zapisz jako mój posiłek”.",
    "keto.mealSaved": "Posiłek zapisany w „Moje posiłki”.",
    "premium.paymentVerifying": "Weryfikuję płatność…",
    "premium.paymentOk": "Płatność potwierdzona — Premium aktywne! 👑",
    "premium.manage": "Zarządzaj subskrypcją",
    "premium.manageFailed":
      "Nie udało się otworzyć panelu subskrypcji. Sprawdź połączenie z internetem.",
    "premium.portalNotConfigured":
      "Panel subskrypcji nie jest jeszcze włączony po stronie Stripe (tryb Live). Włącz go w Stripe → Ustawienia → Rozliczenia → Portal klienta i zapisz.",
    "premium.portalNoSub":
      "Ten kod nie jest powiązany z aktywną subskrypcją. Otwórz panel kodem z maila po zakupie albo odśwież licencję w Ustawieniach.",
    "premium.subscription": "Subskrypcja Premium",
    "premium.paymentFailed": "Nie udało się potwierdzić płatności.",
    "premium.paymentCancelled": "Płatność anulowana.",
    "keto.ratioInfo": "Stosunek tłuszczu do węglowodanów i białka w diecie.",
    "profiles.renamePrompt": "Nowa nazwa profilu:",
    "profile.default": "Pacjent",
    "premium.unlockAria": "Odblokuj Premium",
    "premium.selectPlan": "Wybierz plan",
    "premium.selected": "Wybrany",
  },
  en: {
    "premium.securePayment": "Secure Stripe payment · subscription, cancel anytime.",
    "files.storageWarn":
      "Browser storage is almost full. Make a backup and delete files you no longer need so the diary keeps saving reliably.",
    "files.storageFull":
      "Not enough browser storage for these files. Delete older attachments or make a backup first.",
    "keto.myMeals": "My meals",
    "keto.saveMeal": "Save as my meal",
    "keto.mealName": "Meal name (e.g. Keto breakfast)",
    "keto.addMeal": "Add",
    "keto.myMealsEmpty":
      "No saved meals yet. Build a meal from several ingredients and tap “Save as my meal”.",
    "keto.mealSaved": "Meal saved to “My meals”.",
    "premium.paymentVerifying": "Verifying payment…",
    "premium.paymentOk": "Payment confirmed — Premium is active! 👑",
    "premium.manage": "Manage subscription",
    "premium.manageFailed":
      "Couldn't open the subscription portal. Check your internet connection.",
    "premium.portalNotConfigured":
      "The subscription portal is not enabled in Stripe (Live mode) yet. Turn it on in Stripe → Settings → Billing → Customer portal and save.",
    "premium.portalNoSub":
      "This code is not linked to an active subscription. Use the code from your purchase email, or refresh the licence in Settings.",
    "premium.subscription": "Premium subscription",
    "premium.paymentFailed": "Payment could not be confirmed.",
    "premium.paymentCancelled": "Payment cancelled.",
    "keto.ratioInfo": "The ratio of fat to carbohydrates and protein in the diet.",
    "profiles.renamePrompt": "New profile name:",
    "profile.default": "Patient",
    "premium.unlockAria": "Unlock Premium",
    "premium.selectPlan": "Choose plan",
    "premium.selected": "Selected",
  },
  de: {
    "premium.securePayment": "Sichere Zahlung über Stripe · Abo, jederzeit kündbar.",
    "files.storageWarn":
      "Der Browserspeicher ist fast voll. Erstelle eine Sicherung und lösche nicht benötigte Dateien, damit das Tagebuch zuverlässig speichert.",
    "files.storageFull":
      "Nicht genug Browserspeicher für diese Dateien. Lösche ältere Anhänge oder erstelle zuerst eine Sicherung.",
    "keto.myMeals": "Meine Mahlzeiten",
    "keto.saveMeal": "Als meine Mahlzeit speichern",
    "keto.mealName": "Name der Mahlzeit (z. B. Keto-Frühstück)",
    "keto.addMeal": "Hinzufügen",
    "keto.myMealsEmpty":
      "Noch keine gespeicherten Mahlzeiten. Stelle eine Mahlzeit aus mehreren Zutaten zusammen und tippe auf „Als meine Mahlzeit speichern“.",
    "keto.mealSaved": "Mahlzeit unter „Meine Mahlzeiten“ gespeichert.",
    "premium.paymentVerifying": "Zahlung wird überprüft…",
    "premium.paymentOk": "Zahlung bestätigt — Premium ist aktiv! 👑",
    "premium.manage": "Abonnement verwalten",
    "premium.manageFailed":
      "Das Abo-Portal konnte nicht geöffnet werden. Prüfe deine Internetverbindung.",
    "premium.portalNotConfigured":
      "Das Abonnement-Portal ist in Stripe (Live-Modus) noch nicht aktiviert. Aktiviere es unter Stripe → Einstellungen → Abrechnung → Kundenportal und speichere.",
    "premium.portalNoSub":
      "Dieser Code ist mit keinem aktiven Abonnement verknüpft. Nutze den Code aus der Kauf-E-Mail oder aktualisiere die Lizenz in den Einstellungen.",
    "premium.subscription": "Premium-Abonnement",
    "premium.paymentFailed": "Die Zahlung konnte nicht bestätigt werden.",
    "premium.paymentCancelled": "Zahlung abgebrochen.",
    "keto.ratioInfo": "Das Verhältnis von Fett zu Kohlenhydraten und Eiweiß in der Ernährung.",
    "profiles.renamePrompt": "Neuer Profilname:",
    "profile.default": "Patient",
    "premium.unlockAria": "Premium freischalten",
    "premium.selectPlan": "Plan wählen",
    "premium.selected": "Ausgewählt",
  },
  es: {
    "premium.securePayment": "Pago seguro con Stripe · suscripción, cancela cuando quieras.",
    "files.storageWarn":
      "El almacenamiento del navegador está casi lleno. Haz una copia y elimina archivos que ya no necesites para que el diario siga guardando sin problemas.",
    "files.storageFull":
      "No hay suficiente espacio en el navegador para estos archivos. Elimina adjuntos antiguos o haz antes una copia.",
    "keto.myMeals": "Mis comidas",
    "keto.saveMeal": "Guardar como mi comida",
    "keto.mealName": "Nombre de la comida (p. ej. Desayuno keto)",
    "keto.addMeal": "Añadir",
    "keto.myMealsEmpty":
      "Aún no tienes comidas guardadas. Crea una comida con varios ingredientes y pulsa «Guardar como mi comida».",
    "keto.mealSaved": "Comida guardada en «Mis comidas».",
    "premium.paymentVerifying": "Verificando el pago…",
    "premium.paymentOk": "Pago confirmado: ¡Premium activo! 👑",
    "premium.manage": "Gestionar suscripción",
    "premium.manageFailed":
      "No se pudo abrir el portal de suscripción. Comprueba tu conexión a internet.",
    "premium.portalNotConfigured":
      "El portal de suscripción aún no está activado en Stripe (modo Live). Actívalo en Stripe → Ajustes → Facturación → Portal del cliente y guarda.",
    "premium.portalNoSub":
      "Este código no está vinculado a una suscripción activa. Usa el código del correo de compra o actualiza la licencia en Ajustes.",
    "premium.subscription": "Suscripción Premium",
    "premium.paymentFailed": "No se pudo confirmar el pago.",
    "premium.paymentCancelled": "Pago cancelado.",
    "keto.ratioInfo": "La proporción de grasa respecto a carbohidratos y proteínas en la dieta.",
    "profiles.renamePrompt": "Nuevo nombre del perfil:",
    "profile.default": "Paciente",
    "premium.unlockAria": "Desbloquear Premium",
    "premium.selectPlan": "Elegir plan",
    "premium.selected": "Seleccionado",
  },
  fr: {
    "premium.securePayment": "Paiement sécurisé Stripe · abonnement, résiliable à tout moment.",
    "files.storageWarn":
      "Le stockage du navigateur est presque plein. Faites une sauvegarde et supprimez les fichiers inutiles pour que le journal continue d'enregistrer correctement.",
    "files.storageFull":
      "Espace de stockage insuffisant pour ces fichiers. Supprimez d'anciennes pièces jointes ou faites d'abord une sauvegarde.",
    "keto.myMeals": "Mes repas",
    "keto.saveMeal": "Enregistrer comme mon repas",
    "keto.mealName": "Nom du repas (ex. Petit-déjeuner keto)",
    "keto.addMeal": "Ajouter",
    "keto.myMealsEmpty":
      "Aucun repas enregistré. Composez un repas de plusieurs ingrédients puis touchez « Enregistrer comme mon repas ».",
    "keto.mealSaved": "Repas enregistré dans « Mes repas ».",
    "premium.paymentVerifying": "Vérification du paiement…",
    "premium.paymentOk": "Paiement confirmé — Premium est actif ! 👑",
    "premium.manage": "Gérer l'abonnement",
    "premium.manageFailed":
      "Impossible d'ouvrir le portail d'abonnement. Vérifiez votre connexion internet.",
    "premium.portalNotConfigured":
      "Le portail d'abonnement n'est pas encore activé dans Stripe (mode Live). Activez-le dans Stripe → Paramètres → Facturation → Portail client, puis enregistrez.",
    "premium.portalNoSub":
      "Ce code n'est lié à aucun abonnement actif. Utilisez le code de l'e-mail d'achat ou actualisez la licence dans les Réglages.",
    "premium.subscription": "Abonnement Premium",
    "premium.paymentFailed": "Le paiement n'a pas pu être confirmé.",
    "premium.paymentCancelled": "Paiement annulé.",
    "keto.ratioInfo":
      "Le rapport entre les lipides et les glucides plus protéines dans l'alimentation.",
    "profiles.renamePrompt": "Nouveau nom du profil :",
    "profile.default": "Patient",
    "premium.unlockAria": "Débloquer Premium",
    "premium.selectPlan": "Choisir l'offre",
    "premium.selected": "Sélectionné",
  },
  zh: {
    "premium.securePayment": "Stripe 安全支付 · 订阅，可随时取消。",
    "files.storageWarn":
      "浏览器存储空间即将用满。请先备份并删除不需要的文件，以确保日记能正常保存。",
    "files.storageFull": "浏览器存储空间不足，无法保存这些文件。请删除旧附件或先进行备份。",
    "keto.myMeals": "我的餐食",
    "keto.saveMeal": "保存为我的餐食",
    "keto.mealName": "餐食名称（例如：生酮早餐）",
    "keto.addMeal": "添加",
    "keto.myMealsEmpty": "还没有保存的餐食。用多种食材组合一餐，然后点击“保存为我的餐食”。",
    "keto.mealSaved": "餐食已保存到“我的餐食”。",
    "premium.paymentVerifying": "正在验证付款…",
    "premium.paymentOk": "付款已确认——高级版已激活！👑",
    "premium.manage": "管理订阅",
    "premium.manageFailed": "无法打开订阅管理页面，请检查网络连接。",
    "premium.portalNotConfigured":
      "订阅门户尚未在 Stripe（实时模式）中启用。请在 Stripe → 设置 → 账单 → 客户门户中启用并保存。",
    "premium.portalNoSub":
      "此代码未关联有效订阅。请使用购买邮件中的代码，或在“设置”中刷新许可证。",
    "premium.subscription": "高级版订阅",
    "premium.paymentFailed": "无法确认付款。",
    "premium.paymentCancelled": "付款已取消。",
    "keto.ratioInfo": "饮食中脂肪与碳水化合物和蛋白质的比例。",
    "profiles.renamePrompt": "新的档案名称：",
    "profile.default": "患者",
    "premium.unlockAria": "解锁高级版",
    "premium.selectPlan": "选择方案",
    "premium.selected": "已选择",
  },
};

const DICT: Record<string, Dict> = {
  pl: { ...pl, ...MORE.pl, ...MORE2.pl },
  en: { ...en, ...MORE.en, ...MORE2.en },
  de: { ...de, ...MORE.de, ...MORE2.de },
  es: { ...es, ...MORE.es, ...MORE2.es },
  fr: { ...fr, ...MORE.fr, ...MORE2.fr },
  zh: { ...zh, ...MORE.zh, ...MORE2.zh },
};

export function useExtraT(lang: string) {
  const active = DICT[lang] || pl;
  return function tx(key: string, vars?: Record<string, string | number>): string {
    const raw = active[key] ?? pl[key] ?? key;
    if (!vars) return raw;
    return Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), raw);
  };
}
