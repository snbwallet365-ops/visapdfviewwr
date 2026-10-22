import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PdfViewer } from "@/components/PdfViewer";
import {
  blankFillProfile,
  fillPdfTemplate,
  type DocumentCatalog,
  type FillProfile,
  type VisaDocument,
} from "@/lib/document-suite";

export const Route = createFileRoute("/document-suite")({
  head: () => ({
    meta: [
      { title: "VisaMOTion Document Suite" },
      {
        name: "description",
        content: "Country-wise recruitment and visa document templates with smart PDF filling.",
      },
    ],
  }),
  component: DocumentSuitePage,
});

const fieldClass =
  "w-full rounded-xl border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

function DocumentSuitePage() {
  const [catalog, setCatalog] = useState<DocumentCatalog | null>(null);
  const [countryCode, setCountryCode] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [profile, setProfile] = useState<FillProfile>(blankFillProfile);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filledCount, setFilledCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/document-suite/catalog.json")
      .then((response) => response.json() as Promise<DocumentCatalog>)
      .then((data) => {
        setCatalog(data);
        setCountryCode(data.countries[0]?.code ?? "");
        setDocumentId(data.documents[0]?.id ?? "");
      })
      .catch(() => setMessage("Document catalog could not be loaded."));
  }, []);

  const countries = catalog?.countries ?? [];
  const documents = useMemo(
    () => catalog?.documents.filter((doc) => doc.countryCode === countryCode) ?? [],
    [catalog, countryCode],
  );
  const selected = useMemo<VisaDocument | null>(
    () => catalog?.documents.find((doc) => doc.id === documentId) ?? documents[0] ?? null,
    [catalog, documentId, documents],
  );

  useEffect(() => {
    if (documents.length && !documents.some((doc) => doc.id === documentId))
      setDocumentId(documents[0].id);
  }, [documents, documentId]);

  function updateProfile(key: keyof FillProfile, value: string) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  async function fillAndPreview() {
    if (!selected) return;
    setBusy(true);
    setMessage(null);
    try {
      const result = await fillPdfTemplate(selected, profile);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(new Blob([result.bytes], { type: "application/pdf" }));
      setPreviewUrl(url);
      setFilledCount(result.filledCount);
      setMessage(
        result.filledCount
          ? `${result.filledCount} matching fields filled automatically.`
          : "Add profile details to fill matching PDF fields.",
      );
    } catch (error) {
      setMessage((error as Error).message || "Could not fill this PDF.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadFilled() {
    if (!selected) return;
    setBusy(true);
    setMessage(null);
    try {
      const result = await fillPdfTemplate(selected, profile);
      const url = URL.createObjectURL(new Blob([result.bytes], { type: "application/pdf" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${selected.id}-VisaMOTion-filled.pdf`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setFilledCount(result.filledCount);
      setMessage(`${result.filledCount} fields filled. The PDF download has started.`);
    } catch (error) {
      setMessage((error as Error).message || "Could not create the filled PDF.");
    } finally {
      setBusy(false);
    }
  }

  const activeUrl = previewUrl ?? selected?.templatePath ?? "";

  return (
    <div className="min-h-screen bg-background pb-10 text-foreground">
      <header className="sticky top-0 z-30 border-b bg-card/95 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"
            aria-label="Back to VisaMOTion home"
          >
            <span className="text-lg font-black">V</span>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold uppercase tracking-[0.22em] text-primary">
              VisaMOTion
            </p>
            <h1 className="truncate text-lg font-extrabold tracking-tight">
              Recruitment Document Suite
            </h1>
          </div>
          <a
            href="/document-suite/index.html"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-xl border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted sm:inline-flex"
          >
            Original catalog
          </a>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)_360px]">
        <aside className="space-y-4">
          <section className="rounded-2xl border bg-card p-4 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Countries</p>
            <div className="mt-3 grid gap-2">
              {countries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => setCountryCode(country.code)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition ${country.code === countryCode ? "border-primary bg-primary/10 font-bold text-primary" : "bg-background hover:bg-muted"}`}
                >
                  <span>{country.name}</span>
                  <span className="text-xs text-muted-foreground">{country.documentCount}</span>
                </button>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border bg-card p-4 shadow-soft">
            <label
              className="text-xs font-bold uppercase tracking-[0.18em] text-primary"
              htmlFor="document-select"
            >
              Documents
            </label>
            <select
              id="document-select"
              value={selected?.id ?? ""}
              onChange={(event) => setDocumentId(event.target.value)}
              className={`${fieldClass} mt-3`}
            >
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.id} · {doc.title}
                </option>
              ))}
            </select>
            {selected && (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {selected.pages} pages · {selected.fields.length} fillable fields
              </p>
            )}
          </section>
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-soft sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  {selected?.id ?? "Loading"}
                </p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {selected?.title ?? "Loading document"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {selected?.description}
                </p>
              </div>
              {selected && (
                <a
                  href={selected.samplePath}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10"
                >
                  View filled sample
                </a>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {selected?.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="h-[72vh] min-h-[520px] overflow-hidden rounded-2xl border bg-[#525659] shadow-lift">
            <PdfViewer url={activeUrl} />
          </div>
        </section>

        <aside className="h-fit space-y-4 lg:sticky lg:top-20">
          <section className="rounded-2xl border bg-card p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  Smart fill
                </p>
                <h2 className="mt-1 text-xl font-extrabold">Applicant profile</h2>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-[0.65rem] font-bold text-primary">
                AcroForm
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Enter common details once. VisaMOTion matches them to the exact fields in the selected
              country document.
            </p>
            <div className="mt-4 space-y-3">
              <label className="block text-xs font-semibold">
                Worker full name
                <input
                  value={profile.workerName}
                  onChange={(e) => updateProfile("workerName", e.target.value)}
                  className={`${fieldClass} mt-1`}
                  placeholder="As shown in passport"
                />
              </label>
              <label className="block text-xs font-semibold">
                Passport / ID number
                <input
                  value={profile.passportNumber}
                  onChange={(e) => updateProfile("passportNumber", e.target.value)}
                  className={`${fieldClass} mt-1`}
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-semibold">
                  Nationality
                  <input
                    value={profile.nationality}
                    onChange={(e) => updateProfile("nationality", e.target.value)}
                    className={`${fieldClass} mt-1`}
                  />
                </label>
                <label className="block text-xs font-semibold">
                  Date of birth
                  <input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => updateProfile("dateOfBirth", e.target.value)}
                    className={`${fieldClass} mt-1`}
                  />
                </label>
              </div>
              <label className="block text-xs font-semibold">
                Employer / company
                <input
                  value={profile.employerName}
                  onChange={(e) => updateProfile("employerName", e.target.value)}
                  className={`${fieldClass} mt-1`}
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-semibold">
                  Occupation
                  <input
                    value={profile.occupation}
                    onChange={(e) => updateProfile("occupation", e.target.value)}
                    className={`${fieldClass} mt-1`}
                  />
                </label>
                <label className="block text-xs font-semibold">
                  Salary
                  <input
                    value={profile.salary}
                    onChange={(e) => updateProfile("salary", e.target.value)}
                    className={`${fieldClass} mt-1`}
                  />
                </label>
              </div>
              <label className="block text-xs font-semibold">
                Contract start
                <input
                  type="date"
                  value={profile.contractStart}
                  onChange={(e) => updateProfile("contractStart", e.target.value)}
                  className={`${fieldClass} mt-1`}
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-semibold">
                  Email
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateProfile("email", e.target.value)}
                    className={`${fieldClass} mt-1`}
                  />
                </label>
                <label className="block text-xs font-semibold">
                  Phone
                  <input
                    value={profile.phone}
                    onChange={(e) => updateProfile("phone", e.target.value)}
                    className={`${fieldClass} mt-1`}
                  />
                </label>
              </div>
              <label className="block text-xs font-semibold">
                Address
                <textarea
                  value={profile.address}
                  onChange={(e) => updateProfile("address", e.target.value)}
                  className={`${fieldClass} mt-1 min-h-20 resize-y`}
                />
              </label>
            </div>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                disabled={!selected || busy}
                onClick={fillAndPreview}
                className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-50"
              >
                {busy ? "Preparing PDF…" : "Fill & preview PDF"}
              </button>
              <button
                type="button"
                disabled={!selected || busy}
                onClick={downloadFilled}
                className="rounded-xl border px-4 py-3 text-sm font-bold text-foreground hover:bg-muted disabled:opacity-50"
              >
                Download filled PDF
              </button>
            </div>
            {message && (
              <p
                role="status"
                className="mt-3 rounded-xl bg-muted px-3 py-2 text-xs font-medium text-muted-foreground"
              >
                {message}
              </p>
            )}
            {filledCount > 0 && (
              <p className="mt-2 text-center text-xs font-semibold text-primary">
                {filledCount} fields matched in this document
              </p>
            )}
          </section>
          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Important:</strong> Review every filled field before
            signing or submitting. These templates are document aids and do not replace official
            immigration or employment advice.
          </section>
        </aside>
      </main>
    </div>
  );
}
