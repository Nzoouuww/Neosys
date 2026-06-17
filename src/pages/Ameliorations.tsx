import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Clock, RefreshCw } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/Badge";
import { axes, derniereMaj, type StatutAxe } from "../data/roadmap";

const statutTone: Record<StatutAxe, "green" | "amber" | "gray"> = {
  Fait: "green",
  "En cours": "amber",
  "À faire": "gray",
};

const statutIcon: Record<StatutAxe, typeof Circle> = {
  Fait: CheckCircle2,
  "En cours": Clock,
  "À faire": Circle,
};

const filtres: Array<"Tous" | StatutAxe> = ["Tous", "À faire", "En cours", "Fait"];

export default function Ameliorations() {
  const [filtre, setFiltre] = useState<"Tous" | StatutAxe>("Tous");

  const stats = useMemo(() => {
    const fait = axes.filter((a) => a.statut === "Fait").length;
    const enCours = axes.filter((a) => a.statut === "En cours").length;
    const aFaire = axes.filter((a) => a.statut === "À faire").length;
    const progression = Math.round(
      axes.reduce((s, a) => s + a.avancement, 0) / (axes.length || 1)
    );
    return { fait, enCours, aFaire, progression, total: axes.length };
  }, []);

  const liste = useMemo(
    () => (filtre === "Tous" ? axes : axes.filter((a) => a.statut === filtre)),
    [filtre]
  );

  return (
    <div>
      <PageHeader
        titre="Suivi des améliorations"
        sousTitre={`40 axes d'amélioration de Néosys · dernière mise à jour le ${derniereMaj}`}
        actions={
          <span className="hidden items-center gap-1.5 rounded-lg bg-ink-100 px-3 py-1.5 text-xs font-medium text-ink-600 sm:inline-flex">
            <RefreshCw className="h-3.5 w-3.5" /> Mis à jour à chaque livraison
          </span>
        }
      />

      {/* Progression globale */}
      <div className="card mb-5 p-5">
        <div className="mb-2 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-700">Avancement global</p>
            <p className="text-xs text-ink-400">
              {stats.fait} terminé(s) · {stats.enCours} en cours · {stats.aFaire} à faire
            </p>
          </div>
          <span className="text-2xl font-extrabold text-brand-700">{stats.progression}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${stats.progression}%` }}
          />
        </div>
      </div>

      {/* KPI */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total", val: stats.total, tone: "text-ink-900" },
          { label: "Faits", val: stats.fait, tone: "text-emerald-700" },
          { label: "En cours", val: stats.enCours, tone: "text-amber-700" },
          { label: "À faire", val: stats.aFaire, tone: "text-ink-500" },
        ].map((k) => (
          <div key={k.label} className="card p-4">
            <p className="text-xs font-medium text-ink-400">{k.label}</p>
            <p className={`mt-1 text-2xl font-extrabold ${k.tone}`}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap gap-2">
        {filtres.map((f) => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filtre === f
                ? "bg-brand-600 text-white"
                : "bg-white text-ink-600 ring-1 ring-inset ring-ink-200 hover:bg-ink-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Liste des axes */}
      <div className="space-y-2.5">
        {liste.map((a) => {
          const Icon = statutIcon[a.statut];
          return (
            <div key={a.id} className="card flex items-start gap-3 p-4">
              <Icon
                className={`mt-0.5 h-5 w-5 shrink-0 ${
                  a.statut === "Fait"
                    ? "text-emerald-600"
                    : a.statut === "En cours"
                      ? "text-amber-500"
                      : "text-ink-300"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-ink-400">#{a.id}</span>
                  <span className="font-semibold text-ink-900">{a.titre}</span>
                  <Badge tone={statutTone[a.statut]}>{a.statut}</Badge>
                  <span className="rounded-md bg-ink-50 px-2 py-0.5 text-[11px] font-medium text-ink-500 ring-1 ring-inset ring-ink-200">
                    {a.categorie}
                  </span>
                </div>
                {a.description && (
                  <p className="mt-1 text-sm text-ink-500">{a.description}</p>
                )}
                {a.note && (
                  <p className="mt-1 text-xs italic text-ink-400">{a.note}</p>
                )}
                {a.statut === "En cours" && (
                  <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${a.avancement}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
