import type { ReactNode } from "react";

type Tone = "green" | "blue" | "amber" | "red" | "gray" | "violet";

const tones: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  blue: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/20",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  red: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
  gray: "bg-ink-100 text-ink-700 ring-1 ring-inset ring-ink-300/40",
  violet: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/20",
};

const statusTone: Record<string, Tone> = {
  // Organisations
  Actif: "green",
  "En cours": "blue",
  Inactif: "gray",
  Prospect: "violet",
  // Projets - statut
  Planifié: "amber",
  Terminé: "green",
  Suspendu: "red",
  Refusé: "red",
  // Étapes
  "Pré-instruction": "violet",
  Instruction: "amber",
  "Versements à venir": "blue",
  "Suivi des projets": "green",
  Clôturé: "gray",
  // Documents
  Brouillon: "gray",
  Généré: "blue",
  Validé: "green",
  Envoyé: "violet",
  // Versements / décisions
  Versé: "green",
  "À venir": "amber",
  "En attente": "amber",
  Accepté: "green",
  Reporté: "gray",
};

export function Badge({
  children,
  tone,
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  const t = tone ?? (typeof children === "string" ? statusTone[children] : undefined) ?? "gray";
  return <span className={`badge ${tones[t]}`}>{children}</span>;
}
