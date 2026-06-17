import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search, Download, Upload, Star } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/Badge";
import { organisations } from "../data/mockData";
import { formatMontant } from "../lib/format";
import type { StatutOrganisation } from "../data/types";

const statuts: (StatutOrganisation | "Tous")[] = ["Tous", "Actif", "En cours", "Prospect", "Inactif"];

export default function Partenaires() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [statut, setStatut] = useState<(typeof statuts)[number]>("Tous");

  const filtres = useMemo(() => {
    const needle = q.toLowerCase();
    return organisations
      .filter((o) => (statut === "Tous" ? true : o.statut === statut))
      .filter(
        (o) =>
          !needle ||
          o.sigle.toLowerCase().includes(needle) ||
          o.libelle.toLowerCase().includes(needle) ||
          o.pays.toLowerCase().includes(needle) ||
          o.paysIso.toLowerCase().includes(needle),
      );
  }, [q, statut]);

  return (
    <div>
      <PageHeader
        titre="Partenaires"
        sousTitre={`${organisations.length} organisations porteuses`}
        actions={
          <>
            <button className="btn-outline">
              <Upload className="h-4 w-4" /> Importer
            </button>
            <button className="btn-outline">
              <Download className="h-4 w-4" /> Exporter
            </button>
            <button className="btn-primary">
              <Plus className="h-4 w-4" /> Nouvelle organisation
            </button>
          </>
        }
      />

      {/* Filtres */}
      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher par sigle, libellé ou pays…"
            className="input pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {statuts.map((s) => (
            <button
              key={s}
              onClick={() => setStatut(s)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                statut === s ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-ink-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">Sigle</th>
                <th className="px-4 py-3">Libellé</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Pays</th>
                <th className="px-4 py-3 text-center">ISO 3166</th>
                <th className="px-4 py-3 text-center">Fiabilité</th>
                <th className="px-4 py-3 text-right">Montant alloué</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filtres.map((o) => (
                <tr key={o.id} className="group hover:bg-brand-50/40">
                  <td className="px-4 py-3">
                    <Link to={`/partenaires/${o.id}`} className="font-mono font-bold text-brand-700 group-hover:underline">
                      {o.sigle}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/partenaires/${o.id}`} className="font-semibold text-ink-800 group-hover:text-brand-700">
                      {o.libelle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{o.type}</td>
                  <td className="px-4 py-3 text-ink-600">{o.pays}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="rounded bg-ink-100 px-2 py-0.5 font-mono text-xs font-semibold text-ink-600">
                      {o.paysIso}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center justify-center gap-1 text-ink-700">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {o.noteFiabilite.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-ink-800">
                    {formatMontant(o.montantAlloue)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge>{o.statut}</Badge>
                  </td>
                </tr>
              ))}
              {filtres.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-ink-400">
                    Aucune organisation ne correspond à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
