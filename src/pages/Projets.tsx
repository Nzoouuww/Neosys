import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Download } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/Badge";
import { projets, getOrganisation } from "../data/mockData";
import { formatMontant, formatDate } from "../lib/format";
import type { EtapeProjet } from "../data/types";

const etapes: (EtapeProjet | "Toutes")[] = [
  "Toutes",
  "Pré-instruction",
  "Instruction",
  "Versements à venir",
  "Suivi des projets",
  "Clôturé",
];

export default function Projets() {
  const [q, setQ] = useState("");
  const [etape, setEtape] = useState<(typeof etapes)[number]>("Toutes");

  const filtres = useMemo(() => {
    const needle = q.toLowerCase();
    return projets
      .filter((p) => (etape === "Toutes" ? true : p.etape === etape))
      .filter(
        (p) =>
          !needle ||
          p.code.toLowerCase().includes(needle) ||
          p.titre.toLowerCase().includes(needle) ||
          p.pays.toLowerCase().includes(needle),
      );
  }, [q, etape]);

  return (
    <div>
      <PageHeader
        titre="Projets"
        sousTitre={`${projets.length} projets suivis`}
        actions={
          <>
            <button className="btn-outline">
              <Download className="h-4 w-4" /> Exporter
            </button>
            <button className="btn-primary">
              <Plus className="h-4 w-4" /> Nouveau projet
            </button>
          </>
        }
      />

      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher par code, titre ou pays…"
            className="input pl-9"
          />
        </div>
        <select
          value={etape}
          onChange={(e) => setEtape(e.target.value as (typeof etapes)[number])}
          className="input max-w-[220px]"
        >
          {etapes.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Titre du projet</th>
                <th className="px-4 py-3">Organisation porteuse</th>
                <th className="px-4 py-3">Pays</th>
                <th className="px-4 py-3 text-right">Montant alloué</th>
                <th className="px-4 py-3">Échéance</th>
                <th className="px-4 py-3">Étape</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filtres.map((p) => {
                const org = getOrganisation(p.organisationId);
                return (
                  <tr key={p.id} className="group hover:bg-brand-50/40">
                    <td className="px-4 py-3">
                      <Link to={`/projets/${p.id}`} className="font-mono font-bold text-brand-700 group-hover:underline">
                        {p.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/projets/${p.id}`} className="font-semibold text-ink-800 group-hover:text-brand-700">
                        {p.titre}
                      </Link>
                      <div className="text-xs text-ink-400">{p.secteur}</div>
                    </td>
                    <td className="px-4 py-3">
                      {org && (
                        <Link to={`/partenaires/${org.id}`} className="text-ink-600 hover:text-brand-700">
                          {org.sigle}
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-600">{p.pays}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-ink-800">
                      {formatMontant(p.montantAlloue, p.devise)}
                    </td>
                    <td className="px-4 py-3 text-ink-600">{formatDate(p.dateFin)}</td>
                    <td className="px-4 py-3">
                      <Badge>{p.etape}</Badge>
                    </td>
                  </tr>
                );
              })}
              {filtres.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-ink-400">
                    Aucun projet ne correspond à votre recherche.
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
