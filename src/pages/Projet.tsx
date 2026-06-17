import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Trash2,
  Star,
  MapPin,
  Mail,
  Phone,
  Globe,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { Accordion } from "../components/Accordion";
import {
  organisations,
  projets,
  documents,
  getProjetsByOrganisation,
  getOrganisation,
} from "../data/mockData";
import { formatMontant, formatDate } from "../lib/format";
import type { EtapeProjet } from "../data/types";

const TOP_TABS = [
  "Org. porteuse",
  "Projet",
  "Pré-instruction",
  "Instruction",
  "Versements à venir",
  "Suivi des projets",
  "Statistiques",
] as const;

type TopTab = (typeof TOP_TABS)[number];

const ETAPES: EtapeProjet[] = [
  "Pré-instruction",
  "Instruction",
  "Versements à venir",
  "Suivi des projets",
];

export default function Projet() {
  const [tab, setTab] = useState<TopTab>("Org. porteuse");

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
          Projet
        </h1>
        <p className="mt-0.5 text-sm text-ink-500">
          Gestion des organisations porteuses et de leurs projets
        </p>
      </div>

      {/* Onglets du haut, comme dans Néosys */}
      <div className="mb-4 flex flex-wrap gap-1 rounded-xl bg-white p-1 shadow-card ring-1 ring-ink-200">
        {TOP_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
              tab === t
                ? "bg-brand-600 text-white shadow-sm"
                : "text-ink-600 hover:bg-ink-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Org. porteuse" && <OrgPorteuseView />}
      {tab === "Projet" && <ProjetsTable />}
      {ETAPES.includes(tab as EtapeProjet) && (
        <ProjetsTable etape={tab as EtapeProjet} />
      )}
      {tab === "Statistiques" && <StatsView />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Org. porteuse — liste à gauche, fiche détaillée à droite           */
/* ------------------------------------------------------------------ */
function OrgPorteuseView() {
  const [q, setQ] = useState("");
  const [selId, setSelId] = useState(organisations[0]?.id ?? "");

  const liste = useMemo(() => {
    const n = q.toLowerCase();
    return organisations.filter(
      (o) =>
        !n ||
        o.sigle.toLowerCase().includes(n) ||
        o.libelle.toLowerCase().includes(n) ||
        o.paysIso.toLowerCase().includes(n),
    );
  }, [q]);

  const org = getOrganisation(selId) ?? organisations[0];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Liste des organisations */}
      <div className="card overflow-hidden lg:col-span-5">
        <div className="border-b border-ink-200 p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une organisation…"
              className="input pl-9"
            />
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-ink-50">
              <tr className="text-left text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-3 py-2">Sigle</th>
                <th className="px-3 py-2">Libellé</th>
                <th className="px-3 py-2 text-center">ISO</th>
                <th className="px-3 py-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {liste.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelId(o.id)}
                  className={`cursor-pointer ${
                    o.id === org.id ? "bg-brand-50" : "hover:bg-ink-50"
                  }`}
                >
                  <td className="px-3 py-2 font-mono font-bold text-brand-700">
                    {o.sigle}
                  </td>
                  <td className="px-3 py-2 text-ink-700">{o.libelle}</td>
                  <td className="px-3 py-2 text-center">
                    <span className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-ink-600">
                      {o.paysIso}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-ink-700">
                    {formatMontant(o.montantAlloue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fiche de l'organisation sélectionnée */}
      <div className="space-y-3 lg:col-span-7">
        <OrgFiche org={org} />
      </div>
    </div>
  );
}

function OrgFiche({ org }: { org: (typeof organisations)[number] }) {
  const [selection, setSelection] = useState<string[]>([]);
  const projetsOrg = getProjetsByOrganisation(org.id);
  const docsOrg = documents.filter((d) => d.organisationId === org.id);

  const toggle = (id: string) =>
    setSelection((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  return (
    <>
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-ink-100 px-2 py-0.5 font-mono text-xs font-bold text-ink-600">
                {org.paysIso} · {org.sigle}
              </span>
              <Badge>{org.statut}</Badge>
            </div>
            <h2 className="mt-1 text-lg font-extrabold text-ink-900">
              {org.libelle}
            </h2>
          </div>
          <Link to={`/partenaires/${org.id}`} className="btn-outline shrink-0">
            <ExternalLink className="h-4 w-4" /> Fiche complète
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Info label="Type" value={org.type} />
          <Info label="Pays" value={org.pays} />
          <Info label="Depuis" value={formatDate(org.depuis)} />
          <Info
            label="Fiabilité"
            value={
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {org.noteFiabilite.toFixed(1)}
              </span>
            }
          />
        </div>
      </div>

      <Accordion titre="Détails" defautOuvert>
        <p className="text-sm leading-relaxed text-ink-600">{org.description}</p>
        {org.siteWeb && (
          <a
            href={org.siteWeb}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"
          >
            <Globe className="h-4 w-4" /> {org.siteWeb}
          </a>
        )}
      </Accordion>

      <Accordion titre="Adresses-contact">
        <div className="flex items-start gap-2 text-sm text-ink-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
          <span>
            {org.adresse.rue}, {org.adresse.codePostal} {org.adresse.ville},{" "}
            {org.adresse.region}, {org.adresse.pays}
          </span>
        </div>
      </Accordion>

      <Accordion titre="Membres" compteur={org.membres.length}>
        <div className="divide-y divide-ink-100">
          {org.membres.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
              <div>
                <p className="font-semibold text-ink-800">{m.nom}</p>
                <p className="text-xs text-ink-400">{m.fonction}</p>
              </div>
              <div className="flex flex-col gap-0.5 text-xs text-ink-500">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {m.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {m.telephone}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion titre="Documents" compteur={docsOrg.length}>
        {docsOrg.length === 0 ? (
          <p className="text-sm text-ink-400">Aucun document.</p>
        ) : (
          <div className="divide-y divide-ink-100">
            {docsOrg.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span className="flex items-center gap-2 text-ink-700">
                  <FileText className="h-4 w-4 text-ink-400" /> {d.nom}
                </span>
                <Badge>{d.statut}</Badge>
              </div>
            ))}
          </div>
        )}
      </Accordion>

      {/* Projets de l'organisation */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between bg-ink-50 px-4 py-3">
          <span className="text-sm font-semibold text-ink-800">
            Projets ({projetsOrg.length})
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="w-10 px-3 py-2"></th>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Titre</th>
                <th className="px-3 py-2">Étape</th>
                <th className="px-3 py-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {projetsOrg.map((p) => (
                <tr key={p.id} className="hover:bg-brand-50/40">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selection.includes(p.id)}
                      onChange={() => toggle(p.id)}
                      className="h-4 w-4 rounded border-ink-300"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Link to={`/projets/${p.id}`} className="font-mono font-bold text-brand-700 hover:underline">
                      {p.code}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-ink-700">{p.titre}</td>
                  <td className="px-3 py-2"><Badge>{p.etape}</Badge></td>
                  <td className="px-3 py-2 text-right tabular-nums text-ink-700">
                    {formatMontant(p.montantAlloue, p.devise)}
                  </td>
                </tr>
              ))}
              {projetsOrg.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-ink-400">
                    Aucun projet pour cette organisation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-ink-200 bg-ink-50 p-3">
          <button className="btn-outline" disabled={selection.length === 0}>
            <Trash2 className="h-4 w-4" /> Supprimer le(s) projet(s) sélectionné(s)
          </button>
          <button className="btn-primary">
            <Plus className="h-4 w-4" /> Ajouter un projet à cette organisation
          </button>
        </div>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className="font-semibold text-ink-800">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tableau des projets (onglet Projet + onglets par étape)            */
/* ------------------------------------------------------------------ */
function ProjetsTable({ etape }: { etape?: EtapeProjet }) {
  const [q, setQ] = useState("");
  const liste = useMemo(() => {
    const n = q.toLowerCase();
    return projets
      .filter((p) => (etape ? p.etape === etape : true))
      .filter(
        (p) =>
          !n ||
          p.code.toLowerCase().includes(n) ||
          p.titre.toLowerCase().includes(n) ||
          p.pays.toLowerCase().includes(n),
      );
  }, [q, etape]);

  return (
    <div>
      <div className="card mb-4 flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher par code, titre ou pays…"
            className="input pl-9"
          />
        </div>
        {etape && <Badge>{etape}</Badge>}
        <button className="btn-primary">
          <Plus className="h-4 w-4" /> Nouveau projet
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Titre du projet</th>
                <th className="px-4 py-3">Organisation</th>
                <th className="px-4 py-3">Pays</th>
                <th className="px-4 py-3 text-right">Montant alloué</th>
                <th className="px-4 py-3">Étape</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {liste.map((p) => {
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
                    <td className="px-4 py-3 text-ink-600">{org?.sigle}</td>
                    <td className="px-4 py-3 text-ink-600">{p.pays}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-ink-800">
                      {formatMontant(p.montantAlloue, p.devise)}
                    </td>
                    <td className="px-4 py-3"><Badge>{p.etape}</Badge></td>
                  </tr>
                );
              })}
              {liste.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-ink-400">
                    Aucun projet à cette étape.
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

/* ------------------------------------------------------------------ */
/* Statistiques projets                                               */
/* ------------------------------------------------------------------ */
function StatsView() {
  const parEtape = ETAPES.concat("Clôturé").map((e) => ({
    etape: e,
    nb: projets.filter((p) => p.etape === e).length,
  }));
  const budgetTotal = projets.reduce((s, p) => s + p.montantAlloue, 0);
  const consomme = projets.reduce((s, p) => s + p.consomme, 0);
  const beneficiaires = projets.reduce((s, p) => s + p.nbBeneficiaires, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Projets", val: projets.length.toString() },
          { label: "Budget alloué", val: formatMontant(budgetTotal) },
          { label: "Budget consommé", val: formatMontant(consomme) },
          { label: "Bénéficiaires", val: beneficiaires.toLocaleString("fr-FR") },
        ].map((k) => (
          <div key={k.label} className="card p-4">
            <p className="text-xs font-medium text-ink-400">{k.label}</p>
            <p className="mt-1 text-xl font-extrabold text-ink-900">{k.val}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <p className="mb-3 text-sm font-semibold text-ink-700">Projets par étape</p>
        <div className="space-y-2">
          {parEtape.map((r) => {
            const pct = projets.length ? Math.round((r.nb / projets.length) * 100) : 0;
            return (
              <div key={r.etape} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-sm text-ink-600">{r.etape}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-sm font-semibold text-ink-700">{r.nb}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
