import { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  ClipboardList,
  Wallet,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { getOrganisation } from "../data/mockData";
import type { Projet as ProjetType } from "../data/types";

type RappelType = "rapport-analyser" | "rapport-demander" | "versement";

interface Rappel {
  id: string;
  projetId: string;
  orgId: string;
  code: string;
  titre: string;
  sigle: string;
  type: RappelType;
  label: string;
  date: string; // ISO yyyy-mm-dd
}

const TYPE_META: Record<RappelType, { label: string; icon: typeof Bell; color: string; dot: string; chip: string }> = {
  "rapport-analyser": {
    label: "Rapport à analyser",
    icon: FileSearch,
    color: "text-indigo-600",
    dot: "bg-indigo-500",
    chip: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  },
  "rapport-demander": {
    label: "Rapport à demander",
    icon: ClipboardList,
    color: "text-amber-600",
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  versement: {
    label: "Versement à faire",
    icon: Wallet,
    color: "text-emerald-600",
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const parseISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const diffDays = (from: Date, to: Date) =>
  Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86400000);
const fmtNb = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const fmtDate = (s: string) =>
  parseISO(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

function buildRappels(projets: ProjetType[]): Rappel[] {
  const out: Rappel[] = [];
  for (const p of projets) {
    if (p.projetTermine) continue;
    const org = getOrganisation(p.organisationId);
    const sigle = org?.sigle ?? "";
    // 1. Rapports reçus dans Suivi → à analyser
    for (const e of p.suiviEvenements ?? []) {
      if (e.type === "Rapport" && e.date) {
        out.push({
          id: `${p.id}-analyser-${e.id}`,
          projetId: p.id,
          orgId: p.organisationId,
          code: p.code,
          titre: p.titre,
          sigle,
          type: "rapport-analyser",
          label: `Analyser le rapport reçu${e.infos ? ` (${e.infos})` : ""}`,
          date: e.date,
        });
      }
    }
    // 2. Rapports à demander → dates du Suivi du protocole (Décisions)
    for (const etape of p.protocole ?? []) {
      if (/rapport/i.test(etape.label) && etape.date) {
        out.push({
          id: `${p.id}-demander-${etape.id}`,
          projetId: p.id,
          orgId: p.organisationId,
          code: p.code,
          titre: p.titre,
          sigle,
          type: "rapport-demander",
          label: `Demander : ${etape.label}`,
          date: etape.date,
        });
      }
    }
    // 3. Versements planifiés (Décisions) → à effectuer
    for (const v of p.versementsPlanifies ?? []) {
      if (v.date) {
        out.push({
          id: `${p.id}-versement-${v.id}`,
          projetId: p.id,
          orgId: p.organisationId,
          code: p.code,
          titre: p.titre,
          sigle,
          type: "versement",
          label: `Effectuer le versement de ${fmtNb(v.montant)} ${v.deviseBase ?? "EUR"}`,
          date: v.date,
        });
      }
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

function urgence(date: string, today: Date) {
  const d = diffDays(today, parseISO(date));
  if (d < 0) return { kind: "retard" as const, jours: d };
  if (d <= 7) return { kind: "semaine" as const, jours: d };
  return { kind: "venir" as const, jours: d };
}

function urgenceLabel(date: string, today: Date) {
  const u = urgence(date, today);
  if (u.kind === "retard") return `En retard de ${Math.abs(u.jours)} j`;
  if (u.jours === 0) return "Aujourd'hui";
  if (u.jours === 1) return "Demain";
  return `Dans ${u.jours} j`;
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function RappelsView({
  projets,
  onOpen,
}: {
  projets: ProjetType[];
  onOpen: (orgId: string, projetId: string) => void;
}) {
  const today = startOfDay(new Date());
  const rappels = useMemo(() => buildRappels(projets), [projets]);

  const [filtre, setFiltre] = useState<RappelType | "tous">("tous");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Mois affiché : par défaut le mois du prochain rappel à venir (sinon mois courant).
  const moisInitial = useMemo(() => {
    const prochain = rappels.find((r) => diffDays(today, parseISO(r.date)) >= 0) ?? rappels[0];
    const base = prochain ? parseISO(prochain.date) : today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  }, [rappels, today]);
  const [mois, setMois] = useState(moisInitial);

  const filtres = filtre === "tous" ? rappels : rappels.filter((r) => r.type === filtre);

  const nbRetard = filtres.filter((r) => urgence(r.date, today).kind === "retard").length;
  const nbSemaine = filtres.filter((r) => urgence(r.date, today).kind === "semaine").length;
  const nbVenir = filtres.filter((r) => urgence(r.date, today).kind === "venir").length;

  // Construction de la grille du mois (lundi → dimanche).
  const annee = mois.getFullYear();
  const moisIdx = mois.getMonth();
  const premier = new Date(annee, moisIdx, 1);
  const decalage = (premier.getDay() + 6) % 7; // lundi = 0
  const nbJours = new Date(annee, moisIdx + 1, 0).getDate();
  const cellules: (Date | null)[] = [];
  for (let i = 0; i < decalage; i++) cellules.push(null);
  for (let j = 1; j <= nbJours; j++) cellules.push(new Date(annee, moisIdx, j));
  while (cellules.length % 7 !== 0) cellules.push(null);

  const rappelsDuJour = (d: Date) => {
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return filtres.filter((r) => r.date === iso);
  };

  const liste = selectedDay
    ? filtres.filter((r) => r.date === selectedDay)
    : filtres;

  const isToday = (d: Date) => diffDays(today, d) === 0;

  return (
    <div className="space-y-4">
      {/* Bandeau */}
      <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-ink-900">Rappels du chargé de projet</h2>
            <p className="text-sm text-ink-500">
              Échéances reliées automatiquement à vos projets — nous sommes le{" "}
              {today.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}.
            </p>
          </div>
        </div>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total des rappels" value={filtres.length} icon={Bell} tone="brand" />
        <StatCard label="En retard" value={nbRetard} icon={AlertTriangle} tone="rose" />
        <StatCard label="Dans les 7 jours" value={nbSemaine} icon={Clock} tone="amber" />
        <StatCard label="À venir" value={nbVenir} icon={CalendarDays} tone="ink" />
      </div>

      {/* Filtres par type */}
      <div className="flex flex-wrap items-center gap-2">
        <Chip active={filtre === "tous"} onClick={() => setFiltre("tous")} dot="bg-brand-500">
          Tous
        </Chip>
        {(Object.keys(TYPE_META) as RappelType[]).map((t) => (
          <Chip key={t} active={filtre === t} onClick={() => setFiltre(t)} dot={TYPE_META[t].dot}>
            {TYPE_META[t].label}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Calendrier */}
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <button
              className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100"
              onClick={() => setMois(new Date(annee, moisIdx - 1, 1))}
              title="Mois précédent"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <p className="text-sm font-bold capitalize text-ink-800">
              {mois.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </p>
            <button
              className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100"
              onClick={() => setMois(new Date(annee, moisIdx + 1, 1))}
              title="Mois suivant"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-ink-400">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-1">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cellules.map((d, i) => {
              if (!d) return <div key={i} />;
              const rs = rappelsDuJour(d);
              const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              const sel = selectedDay === iso;
              const types = Array.from(new Set(rs.map((r) => r.type)));
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(sel ? null : iso)}
                  className={`relative flex h-12 flex-col items-center justify-start rounded-lg border p-1 text-xs transition-colors ${
                    sel
                      ? "border-brand-500 bg-brand-50"
                      : rs.length
                        ? "border-ink-200 hover:bg-ink-50"
                        : "border-transparent hover:bg-ink-50"
                  }`}
                  title={rs.length ? `${rs.length} rappel(s)` : undefined}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      isToday(d) ? "bg-brand-600 font-bold text-white" : "text-ink-700"
                    }`}
                  >
                    {d.getDate()}
                  </span>
                  {rs.length > 0 && (
                    <span className="mt-0.5 flex gap-0.5">
                      {types.slice(0, 3).map((t) => (
                        <span key={t} className={`h-1.5 w-1.5 rounded-full ${TYPE_META[t].dot}`} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 border-t border-ink-100 pt-3 text-xs text-ink-500">
            {(Object.keys(TYPE_META) as RappelType[]).map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${TYPE_META[t].dot}`} /> {TYPE_META[t].label}
              </span>
            ))}
          </div>
        </div>

        {/* Agenda / liste */}
        <div className="card flex flex-col p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-ink-800">
              {selectedDay ? `Rappels du ${fmtDate(selectedDay)}` : "Prochains rappels"}
            </p>
            {selectedDay && (
              <button className="text-xs font-semibold text-brand-600 hover:underline" onClick={() => setSelectedDay(null)}>
                Voir tout
              </button>
            )}
          </div>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
            {liste.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-center text-ink-400">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                <p className="text-sm">Aucun rappel {selectedDay ? "ce jour-là" : "pour ce filtre"}.</p>
              </div>
            )}
            {liste.map((r) => {
              const meta = TYPE_META[r.type];
              const Icon = meta.icon;
              const u = urgence(r.date, today);
              return (
                <button
                  key={r.id}
                  onClick={() => onOpen(r.orgId, r.projetId)}
                  className="flex w-full items-start gap-3 rounded-xl border border-ink-200 p-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${meta.chip}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-brand-700">{r.code}</span>
                      <span className="text-xs text-ink-400">·</span>
                      <span className="truncate text-xs text-ink-500">{r.sigle}</span>
                    </div>
                    <p className="text-sm font-semibold text-ink-800">{r.label}</p>
                    <p className="truncate text-xs text-ink-400">{r.titre}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-xs font-medium text-ink-500">{fmtDate(r.date)}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        u.kind === "retard"
                          ? "bg-rose-100 text-rose-700"
                          : u.kind === "semaine"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-ink-100 text-ink-600"
                      }`}
                    >
                      {urgenceLabel(r.date, today)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Bell;
  tone: "brand" | "rose" | "amber" | "ink";
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
    ink: "bg-ink-100 text-ink-700",
  };
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-ink-400">{label}</p>
        <p className="text-xl font-extrabold text-ink-900">{value}</p>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  dot,
  children,
}: {
  active: boolean;
  onClick: () => void;
  dot: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
        active ? "bg-brand-600 text-white" : "bg-white text-ink-600 ring-1 ring-inset ring-ink-200 hover:bg-ink-50"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${active ? "bg-white" : dot}`} />
      {children}
    </button>
  );
}
