/* PDF text extraction + medical keyword matching. Client-only, dynamic import. */

// Curated multilingual medical keyword dictionary → normalized category tags.
// Keys are lowercased word/phrase substrings. Values are stable category ids
// consumed by AiSection to produce correlation bullets.
const KEYWORDS: Record<string, string> = {
  // EEG findings
  eeg: "eeg",
  elektroencefalograf: "eeg",
  elektroenzephalograph: "eeg",
  iglica: "epileptiform",
  spike: "epileptiform",
  "spike-wave": "epileptiform",
  wyładowani: "epileptiform",
  epileptyform: "epileptiform",
  epileptiform: "epileptiform",
  napadow: "epileptiform",
  // MRI
  mri: "mri",
  "mr mózg": "mri",
  "rezonans magn": "mri",
  kernspintomograph: "mri",
  irm: "mri",
  hiperintensj: "mriLesion",
  hyperintens: "mriLesion",
  hipokamp: "hippocampus",
  hippocamp: "hippocampus",
  sclerosis: "sclerosis",
  stwardnien: "sclerosis",
  // Labs
  sód: "sodium",
  sodu: "sodium",
  natrium: "sodium",
  sodium: "sodium",
  potas: "potassium",
  kalium: "potassium",
  potassium: "potassium",
  glukoz: "glucose",
  glucose: "glucose",
  wapń: "calcium",
  calcium: "calcium",
  magnez: "magnesium",
  magnesium: "magnesium",
  ketone: "ketones",
  keton: "ketones",
  "β-hydroxy": "ketones",
  // Meds (AEDs)
  valpro: "valproate",
  depakine: "valproate",
  levetiracet: "levetiracetam",
  keppra: "levetiracetam",
  lamotrigin: "lamotrigine",
  lamictal: "lamotrigine",
  carbamazep: "carbamazepine",
  tegretol: "carbamazepine",
  oxcarbazep: "oxcarbazepine",
  topiramat: "topiramate",
  clonazep: "clonazepam",
  clobazam: "clobazam",
  phenobarb: "phenobarbital",
  fenobarb: "phenobarbital",
  vigabatrin: "vigabatrin",
  sabril: "vigabatrin",
  cannabidiol: "cbd",
  epidiolex: "cbd",
};

export type PdfExtraction = {
  text: string;
  keywords: string[]; // normalized category ids, unique
  pageCount: number;
};

/** Extract text from a PDF File/Blob using pdfjs-dist. */
export async function extractPdf(file: Blob): Promise<PdfExtraction | null> {
  try {
    // @ts-ignore  — no local types shim needed
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    // @ts-ignore
    const worker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

    const buf = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: buf, disableFontFace: true }).promise;
    let full = "";
    const max = Math.min(doc.numPages, 20);
    for (let i = 1; i <= max; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      full += content.items.map((it: any) => it.str).join(" ") + "\n";
    }
    const lower = full.toLowerCase();
    const found = new Set<string>();
    for (const k in KEYWORDS) {
      if (lower.includes(k)) found.add(KEYWORDS[k]);
    }
    return { text: full.slice(0, 40000), keywords: Array.from(found), pageCount: doc.numPages };
  } catch (e) {
    console.warn("[epilumina] PDF parse failed", e);
    return null;
  }
}
