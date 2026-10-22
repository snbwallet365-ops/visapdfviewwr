import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  COUNTRIES,
  DOC_TYPES,
  type Country,
  type DocType,
  flagUrl,
  pdfUrl,
  photoUrl,
} from "@/lib/visa-data";
import { PdfViewer } from "@/components/PdfViewer";
import globeImg from "@/assets/hero-globe.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VisaMOTion — Visa Countries & Documents" },
      {
        name: "description",
        content:
          "VisaMOTion: explore visa countries, preview documents, and smart-fill recruitment templates for international mobility.",
      },
      { property: "og:title", content: "VisaMOTion — Your Visa, In Motion" },
      {
        property: "og:description",
        content: "Explore country-wise visa documents and smart-fill recruitment templates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

async function downloadPdf(slug: string, doc: DocType) {
  const url = pdfUrl(slug, doc);
  const filename = `${slug}_${doc}.pdf`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

const Icon = ({ d, className = "h-5 w-5" }: { d: string; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);
const I = {
  doc: "M7 3h7l5 5v13H7z M14 3v5h5 M10 13h6 M10 17h6",
  chev: "M9 6l6 6-6 6",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M21 21l-5-5",
  bell: "M6 16V11a6 6 0 1 1 12 0v5l2 2H4z M10 20a2 2 0 0 0 4 0",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0",
  sliders: "M4 6h10 M18 6h2 M4 12h4 M12 12h8 M4 18h12 M20 18h0 M16 4v4 M10 10v4 M18 16v4",
  home: "M3 11l9-7 9 7v9H5v-9 M10 20v-5h4v5",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18",
  plus: "M12 5v14 M5 12h14",
  chat: "M4 5h16v11H8l-4 4z M8 10h.01 M12 10h.01 M16 10h.01",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  dl: "M12 4v11 M7 10l5 5 5-5 M5 20h14",
  x: "M6 6l12 12 M18 6L6 18",
};

function Dashboard() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<Country | null>(null);
  const [preview, setPreview] = useState<{ country: Country; doc: DocType } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    const docHit = DOC_TYPES.some((d) => d.label.toLowerCase().includes(q));
    return COUNTRIES.filter(
      (c) => docHit || c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <header className="flex items-center gap-3 px-5 pt-5">
          <div className="flex flex-1 items-center gap-2">
            <span className="gradient-blue grid h-12 w-12 place-items-center rounded-2xl text-card shadow-glow">
              <Icon d={I.globe} className="h-7 w-7" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-2xl font-extrabold italic tracking-tight">
                <span className="text-blue">Visa</span>
                <span className="text-gold">MOTion</span>
              </p>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-navy">
                Global Mobility
              </p>
              <p className="text-[0.62rem] text-muted-foreground">Your Visa, In Motion</p>
            </div>
          </div>
          <button
            className="relative grid h-11 w-11 place-items-center rounded-full text-navy"
            aria-label="Notifications"
          >
            <Icon d={I.bell} className="h-6 w-6" />
            <span className="absolute right-1 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-fail text-[0.65rem] font-bold text-card">
              3
            </span>
          </button>
          <button
            className="grid h-12 w-12 place-items-center rounded-full bg-muted text-navy"
            aria-label="Profile"
          >
            <Icon d={I.user} className="h-6 w-6" />
          </button>
        </header>

        {/* Search */}
        <div className="px-5 pt-4">
          <label className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3.5 shadow-soft">
            <Icon d={I.search} className="h-5 w-5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search countries, visa types..."
              className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
            />
            <span className="h-6 w-px bg-border" />
            <Icon d={I.sliders} className="h-5 w-5 text-navy" />
          </label>
        </div>

        {/* Hero */}
        <section className="gradient-hero relative mx-5 mt-4 overflow-hidden rounded-3xl px-1 py-5">
          <div className="relative z-10 w-[62%]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky">Visa Countries</p>
            <h1 className="mt-2 text-[1.75rem] font-extrabold leading-[1.1] text-navy">
              Explore Your Dream Destination
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Find visa information, requirements and latest updates for your desired country.
            </p>
          </div>
          <img
            src={globeImg}
            alt="Globe with airplane and passport"
            width={896}
            height={752}
            className="absolute -right-6 top-1/2 w-[48%] -translate-y-1/2"
          />
        </section>

        <Link
          to="/document-suite"
          className="mx-5 mt-4 flex items-center justify-between rounded-2xl border border-blue/20 bg-card px-4 py-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
        >
          <span>
            <span className="block text-xs font-bold uppercase tracking-[0.16em] text-blue">
              New
            </span>
            <span className="text-sm font-extrabold text-navy">
              Open the 30-template Document Suite
            </span>
          </span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-blue/10 text-blue">
            <Icon d={I.chev} className="h-4 w-4" />
          </span>
        </Link>

        {/* Grid */}
        <section className="grid grid-cols-2 gap-3 px-5 pt-4">
          {filtered.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCountry(c)}
              className="overflow-hidden rounded-2xl border bg-card text-left shadow-soft transition active:scale-[0.98]"
            >
              <div className="relative aspect-[4/3]">
                <img
                  src={photoUrl(c.slug)}
                  alt={`${c.name} landmark`}
                  loading="lazy"
                  width={992}
                  height={672}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card to-transparent" />
                <span className="glass absolute right-2 top-2 rounded-xl px-2 py-1 text-[0.58rem] leading-tight">
                  <span className="block font-semibold text-blue">Latest Update</span>
                  <span className="text-navy">{c.updated}</span>
                </span>
                <img
                  src={flagUrl(c.slug)}
                  alt=""
                  className="absolute -bottom-3 left-3 h-11 w-11 rounded-full border-[3px] border-card object-cover shadow-soft"
                />
              </div>
              <div className="px-3 pb-3 pt-4">
                <div className="flex items-center gap-2">
                  <h3 className="min-w-0 flex-1 truncate text-base font-bold text-navy">
                    {c.name}
                  </h3>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-card text-blue shadow-soft">
                    <Icon d={I.chev} className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon d={I.doc} className="h-3.5 w-3.5" /> {DOC_TYPES.length} Documents
                </p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-2 py-10 text-center text-sm text-muted-foreground">
              No countries match "{query}".
            </p>
          )}
        </section>
      </div>

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pb-2 pt-1 text-[0.68rem]">
          {[
            { l: "Home", d: I.home },
            { l: "Countries", d: I.globe, active: true },
            { l: "New Applicant", d: I.plus, center: true },
            { l: "Documents", d: I.doc },
            { l: "Chat", d: I.chat },
          ].map((t) =>
            t.center ? (
              <Link
                key={t.l}
                to="/cases/new"
                className="flex flex-col items-center gap-1 text-muted-foreground"
              >
                <span className="gradient-blue -mt-7 grid h-14 w-14 place-items-center rounded-full text-card shadow-glow">
                  <Icon d={t.d} className="h-7 w-7" />
                </span>
                {t.l}
              </Link>
            ) : t.l === "Chat" ? (
              <Link
                key={t.l}
                to="/chat"
                className="flex flex-col items-center gap-1 py-1 text-muted-foreground"
              >
                <Icon d={t.d} className="h-6 w-6" />
                {t.l}
              </Link>
            ) : t.l === "Documents" ? (
              <Link
                key={t.l}
                to="/document-suite"
                className="flex flex-col items-center gap-1 py-1 text-muted-foreground"
              >
                <Icon d={t.d} className="h-6 w-6" />
                {t.l}
              </Link>
            ) : (
              <button
                key={t.l}
                className={`flex flex-col items-center gap-1 py-1 ${t.active ? "font-semibold text-blue" : "text-muted-foreground"}`}
              >
                <Icon d={t.d} className="h-6 w-6" />
                {t.l}
                {t.active && <span className="h-0.5 w-8 rounded bg-blue" />}
              </button>
            ),
          )}
        </div>
      </nav>

      {country && (
        <CountrySheet
          country={country}
          onClose={() => setCountry(null)}
          onPreview={(doc) => setPreview({ country, doc })}
        />
      )}
      {preview && <PreviewModal {...preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

function CountrySheet({
  country,
  onClose,
  onPreview,
}: {
  country: Country;
  onClose: () => void;
  onPreview: (d: DocType) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-navy/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${country.name} documents`}
    >
      <div
        className="max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-background pb-[calc(env(safe-area-inset-bottom)+1rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-40">
          <img src={photoUrl(country.slug)} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="glass absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-navy"
          >
            <Icon d={I.x} className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-5 flex items-center gap-3">
            <img
              src={flagUrl(country.slug)}
              alt=""
              className="h-12 w-12 rounded-full border-[3px] border-card object-cover shadow-soft"
            />
            <div>
              <h2 className="text-2xl font-extrabold text-navy">{country.name}</h2>
              <p className="text-xs text-muted-foreground">
                {country.region} · {DOC_TYPES.length} documents
              </p>
            </div>
          </div>
        </div>
        <ul className="space-y-2.5 px-5 pt-4">
          {DOC_TYPES.map((d) => (
            <li
              key={d.key}
              className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-soft"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-blue">
                <Icon d={I.doc} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug text-navy">{d.label}</p>
                <p className="truncate text-[0.68rem] text-muted-foreground">
                  {d.isNew && (
                    <span className="mr-1 rounded bg-blue px-1.5 py-0.5 font-bold text-card">
                      NEW
                    </span>
                  )}
                  {country.slug}_{d.key}.pdf
                </p>
              </div>
              <button
                onClick={() => onPreview(d.key)}
                aria-label={`Preview ${d.label}`}
                className="grid h-9 w-9 place-items-center rounded-full bg-muted text-navy"
              >
                <Icon d={I.eye} className="h-4 w-4" />
              </button>
              <button
                onClick={() => downloadPdf(country.slug, d.key)}
                aria-label={`Download ${d.label}`}
                className="gradient-blue grid h-9 w-9 place-items-center rounded-full text-card shadow-glow"
              >
                <Icon d={I.dl} className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PreviewModal({
  country,
  doc,
  onClose,
}: {
  country: Country;
  doc: DocType;
  onClose: () => void;
}) {
  const url = pdfUrl(country.slug, doc);
  const label = DOC_TYPES.find((d) => d.key === doc)?.label ?? doc;
  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-navy/70 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${country.name} ${label} preview`}
    >
      <div
        className="flex h-[100dvh] w-full flex-col overflow-hidden bg-card shadow-lift sm:h-[85vh] sm:max-w-4xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
          <img src={flagUrl(country.slug)} alt="" className="h-9 w-9 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-navy">{country.name}</p>
            <p className="truncate text-[0.7rem] text-muted-foreground">{label}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-muted text-navy"
            aria-label="Close preview"
          >
            <Icon d={I.x} className="h-4 w-4" />
          </button>
        </div>
        <div className="relative flex-1 overflow-hidden bg-viewer">
          <PdfViewer url={url} />
        </div>
        <div className="flex gap-2 border-t p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-xl border bg-muted py-2.5 text-center text-sm font-bold text-navy"
          >
            Open
          </a>
          <button
            onClick={() => downloadPdf(country.slug, doc)}
            className="gradient-blue flex-1 rounded-xl py-2.5 text-center text-sm font-bold text-card shadow-glow"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
