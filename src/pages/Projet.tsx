import { useMemo, useState, type ReactNode } from "react";
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
  Save,
  CheckCircle2,
  Circle,
  FileBarChart,
  FileSignature,
  Info as InfoIcon,
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
import type { EtapeProjet, Organisation, Projet as ProjetType } from "../data/types";

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

export default function Projet() {
  const [orgId, setOrgId] = useState(organisations[0]?.id ?? "");
  const [projetId, setProjetId] = useState<string>("");
  const [tab, setTab] = useState<TopTab>("Org. porteuse");

  const org = getOrganisation(orgId) ?? organisations[0];
  const projet = projets.find((p) => p.id === projetId);

  const selectOrg = (id: string) => {
    setOrgId(id);
    setProjetId("");
  };

  const openProjet = (id: string) => {
    setProjetId(id);
    setTab("Projet");
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
            Projet
          </h1>
          <p className="mt-0.5 text-sm text-ink-500">
            Gestion des organisations porteuses et de leurs projets
          </p>
        </div>
        {/* Bandeau du projet sélectionné, façon Néosys */}
        {projet && (
          <div className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-800 ring-1 ring-inset ring-brand-600/20">
            <span className="font-mono">
              {org.paysIso} · {org.sigle} · {projet.code}
            </span>
            <span className="text-brand-900">{projet.titre}</span>
          </div>
        )}
      </div>

      {/* Onglets du haut */}
      <div className="mb-4 flex flex-wrap gap-1 rounded-xl bg-white p-1 shadow-card ring-1 ring-ink-200">
        {TOP_TABS.map((t) => {
          const needsProjet = t !== "Org. porteuse" && t !== "Statistiques";
          const disabled = needsProjet && !projet;
          return (
            <button
              key={t}
              disabled={disabled}
              onClick={() => setTab(t)}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                tab === t
                  ? "bg-brand-600 text-white shadow-sm"
                  : disabled
                    ? "cursor-not-allowed text-ink-300"
                    : "text-ink-600 hover:bg-ink-100"
              }`}
              title={disabled ? "Sélectionnez d'abord un projet dans « Org. porteuse »" : undefined}
            >
              {t}
            </button>
          );
        })}
      </div>

      {tab === "Org. porteuse" && (
        <OrgPorteuseView
          org={org}
          selectedProjetId={projetId}
          onSelectOrg={selectOrg}
          onOpenProjet={openProjet}
        />
      )}

      {tab === "Projet" &&
        (projet ? (
          <ProjetDetail org={org} projet={projet} onOpenProjet={openProjet} />
        ) : (
          <EmptyProjet />
        ))}

      {(tab === "Pré-instruction" ||
        tab === "Instruction" ||
        tab === "Versements à venir" ||
        tab === "Suivi des projets") &&
        (projet ? (
          <PhaseView phase={tab as EtapeProjet} projet={projet} org={org} />
        ) : (
          <EmptyProjet />
        ))}

      {tab === "Statistiques" && <StatsView />}
    </div>
  );
}

function EmptyProjet() {
  return (
    <div className="card flex items-center gap-3 p-8 text-ink-500">
      <InfoIcon className="h-5 w-5 text-brand-500" />
      Sélectionnez un projet dans l'onglet <strong>Org. porteuse</strong> pour activer cet onglet.
    </div>
  );
}

/* ================================================================== */
/* ORG. PORTEUSE — liste à gauche, fiche + projets à droite           */
/* ================================================================== */
function OrgPorteuseView({
  org,
  selectedProjetId,
  onSelectOrg,
  onOpenProjet,
}: {
  org: Organisation;
  selectedProjetId: string;
  onSelectOrg: (id: string) => void;
  onOpenProjet: (id: string) => void;
}) {
  const [q, setQ] = useState("");
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

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Liste organisations */}
      <div className="card overflow-hidden lg:col-span-5">
        <div className="border-b border-ink-200 p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un partenaire (sigle, nom, pays)…"
              className="input pl-9"
            />
          </div>
        </div>
        <div className="max-h-[62vh] overflow-y-auto">
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
                  onClick={() => onSelectOrg(o.id)}
                  className={`cursor-pointer ${o.id === org.id ? "bg-brand-50" : "hover:bg-ink-50"}`}
                >
                  <td className="px-3 py-2 font-mono font-bold text-brand-700">{o.sigle}</td>
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
              {liste.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-ink-400">
                    Aucun partenaire trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fiche partenaire + ses projets */}
      <div className="space-y-3 lg:col-span-7">
        <OrgFiche org={org} selectedProjetId={selectedProjetId} onOpenProjet={onOpenProjet} />
      </div>
    </div>
  );
}

function OrgFiche({
  org,
  selectedProjetId,
  onOpenProjet,
}: {
  org: Organisation;
  selectedProjetId: string;
  onOpenProjet: (id: string) => void;
}) {
  const [selection, setSelection] = useState<string[]>([]);
  const projetsOrg = getProjetsByOrganisation(org.id);
  const docsOrg = documents.filter((d) => d.organisationId === org.id);

  const toggle = (id: string) =>
    setSelection((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

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
            <h2 className="mt-1 text-lg font-extrabold text-ink-900">{org.libelle}</h2>
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
            {org.adresse.rue}, {org.adresse.codePostal} {org.adresse.ville}, {org.adresse.region},{" "}
            {org.adresse.pays}
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
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {m.email}</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {m.telephone}</span>
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

      {/* Projets du partenaire */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between bg-ink-50 px-4 py-3">
          <span className="text-sm font-semibold text-ink-800">
            Projets de {org.sigle} ({projetsOrg.length})
          </span>
          <span className="text-xs text-ink-400">Cliquez un projet pour l'ouvrir →</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="w-10 px-3 py-2"></th>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Titre du projet</th>
                <th className="px-3 py-2">Étape</th>
                <th className="px-3 py-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {projetsOrg.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onOpenProjet(p.id)}
                  className={`cursor-pointer ${p.id === selectedProjetId ? "bg-brand-50" : "hover:bg-brand-50/40"}`}
                >
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selection.includes(p.id)}
                      onChange={() => toggle(p.id)}
                      className="h-4 w-4 rounded border-ink-300"
                    />
                  </td>
                  <td className="px-3 py-2 font-mono font-bold text-brand-700">{p.code}</td>
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

/* ================================================================== */
/* PROJET — fiche détaillée à sous-onglets                            */
/* ================================================================== */
const SUB_TABS = [
  "Contrôle",
  "Description",
  "Moyens",
  "Décisions",
  "Documents",
  "Suivi",
  "Correspondance",
] as const;
type SubTab = (typeof SUB_TABS)[number];

function ProjetDetail({
  org,
  projet,
  onOpenProjet,
}: {
  org: Organisation;
  projet: ProjetType;
  onOpenProjet: (id: string) => void;
}) {
  const [sub, setSub] = useState<SubTab>("Contrôle");
  const projetsOrg = getProjetsByOrganisation(org.id);

  return (
    <div className="space-y-4">
      {/* En-tête projet */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded bg-ink-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
              {org.paysIso} {org.sigle} {projet.code}
            </span>
            <span className="font-extrabold text-ink-900">{projet.titre}</span>
            <Badge>{projet.etape}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/projets/${projet.id}`} className="btn-outline">
              <ExternalLink className="h-4 w-4" /> Vue détail
            </Link>
            <button className="btn-primary">
              <Save className="h-4 w-4" /> Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>

      {/* Sous-onglets */}
      <div className="flex flex-wrap gap-1 border-b border-ink-200">
        {SUB_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setSub(t)}
            className={`-mb-px border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-colors ${
              sub === t
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div key={projet.id}>
        {sub === "Contrôle" && <ControleTab projet={projet} />}
        {sub === "Description" && <DescriptionTab projet={projet} />}
        {sub === "Moyens" && <MoyensTab projet={projet} />}
        {sub === "Décisions" && <DecisionsTab projet={projet} />}
        {sub === "Documents" && <DocumentsTab />}
        {sub === "Suivi" && <SuiviTab projet={projet} />}
        {sub === "Correspondance" && <CorrespondanceTab projet={projet} />}
      </div>

      {/* Bandeau projets de l'organisation (comme le panneau bas de Néosys) */}
      <div className="card overflow-hidden">
        <div className="bg-ink-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-ink-500">
          Projets de {org.sigle}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-ink-100">
              {projetsOrg.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onOpenProjet(p.id)}
                  className={`cursor-pointer ${p.id === projet.id ? "bg-brand-50" : "hover:bg-brand-50/40"}`}
                >
                  <td className="px-4 py-2 font-mono font-bold text-brand-700">{p.code}</td>
                  <td className="px-4 py-2 text-ink-700">{p.titre}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-ink-600">
                    {formatMontant(p.montantAlloue, p.devise)}
                  </td>
                  <td className="px-4 py-2 text-ink-500">{p.pays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---- Onglet Contrôle ---- */
function ControleTab({ projet }: { projet: ProjetType }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="card space-y-4 p-5 lg:col-span-2">
        <Field label="Code du projet">
          <input className="input" defaultValue={projet.code} />
        </Field>
        <Field label="Titre du projet">
          <input className="input" defaultValue={projet.titre} />
        </Field>
        <Field label="La ville (le village) et sa région">
          <input className="input" defaultValue={`${projet.ville}, Région ${projet.region}`} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Pays">
            <select className="input" defaultValue={projet.pays}>
              <option>{projet.pays}</option>
            </select>
          </Field>
          <Field label="Coordinateur du projet">
            <select className="input" defaultValue={projet.coordinateur}>
              <option>{projet.coordinateur}</option>
              <option>AUCUN</option>
            </select>
          </Field>
        </div>
        <Field label="Nombre de bénéficiaires">
          <input type="number" className="input max-w-[160px]" defaultValue={projet.nbBeneficiaires} />
        </Field>
        <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
          <input type="checkbox" defaultChecked={projet.respectNonDiscrimination} className="h-4 w-4 rounded border-ink-300" />
          Respect du principe de non-discrimination
        </label>
        <Field label="Profil des bénéficiaires">
          <textarea className="input min-h-[90px]" defaultValue={projet.profilBeneficiaires} />
        </Field>
      </div>

      <div className="space-y-4 lg:col-span-1">
        <Field label="Le milieu (géographique, social, politique, son histoire)">
          <textarea className="input min-h-[150px]" defaultValue={projet.milieu ?? ""} />
        </Field>
        <Field label="Historique / recommandations">
          <textarea className="input min-h-[150px]" defaultValue={projet.historiqueRecommandations ?? ""} />
        </Field>
      </div>
    </div>
  );
}

/* ---- Onglet Description ---- */
const OPTS_COCODEV = ["Santé, hygiène, nutrition", "Éducation", "Eau & assainissement", "Agriculture", "Développement communautaire"];
const OPTS_OCDE = ["Nutrition de base", "Éducation de base", "Santé de base", "Eau et assainissement"];
const OPTS_PNUD = ["Santé", "Éducation", "Environnement", "Gouvernance"];
const OPTS_SEL = ["Soutien alimentaire", "Parrainage", "Développement", "Urgence"];

function DescriptionTab({ projet }: { projet: ProjetType }) {
  return (
    <div className="card space-y-4 p-5">
      <Field label="Objectifs">
        <textarea className="input min-h-[100px]" defaultValue={projet.objectifs ?? projet.description} />
      </Field>
      <Field label="Les activités">
        <textarea className="input min-h-[100px]" defaultValue={projet.activites ?? ""} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ClassementSelect label="Classement COCODEV" value={projet.classementCocodev} options={OPTS_COCODEV} />
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
            <input type="checkbox" defaultChecked={projet.composanteAutonome} className="h-4 w-4 rounded border-ink-300" />
            Composante autonome
          </label>
        </div>
        <ClassementSelect label="Classement OCDE" value={projet.classementOcde} options={OPTS_OCDE} />
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
            <input type="checkbox" defaultChecked={projet.debutDesFinancement} className="h-4 w-4 rounded border-ink-300" />
            Début dès que le financement commence
          </label>
        </div>
        <ClassementSelect label="Classement PNUD" value={projet.classementPnud} options={OPTS_PNUD} />
        <Field label="Date de début de réalisation prévue">
          <input type="date" className="input" defaultValue={projet.dateDebutRealisation ?? ""} />
        </Field>
        <ClassementSelect label="Classement SEL" value={projet.classementSel} options={OPTS_SEL} />
        <Field label="Date de fin de réalisation prévue">
          <input type="date" className="input" defaultValue={projet.dateFinRealisation ?? ""} />
        </Field>
      </div>
    </div>
  );
}

function ClassementSelect({ label, value, options }: { label: string; value?: string; options: string[] }) {
  const opts = value && !options.includes(value) ? [value, ...options] : options;
  return (
    <Field label={label}>
      <select className="input" defaultValue={value ?? ""}>
        <option value="">—</option>
        {opts.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </Field>
  );
}

/* ---- Onglet Moyens ---- */
function MoyensTab({ projet }: { projet: ProjetType }) {
  const dev = projet.devise || "EUR";
  const total =
    (projet.apportPartenaire ?? 0) + (projet.apportSollicite ?? 0) + (projet.apportAutresBailleurs ?? 0);
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="card space-y-4 p-5 lg:col-span-2">
        <Field label="Moyens matériels et autres">
          <textarea className="input min-h-[120px]" defaultValue={projet.moyensMateriels ?? projet.moyens} />
        </Field>
        <Field label="Moyens humains">
          <textarea className="input min-h-[120px]" defaultValue={projet.moyensHumains ?? ""} />
        </Field>
      </div>
      <div className="card space-y-3 p-5 lg:col-span-1">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nb versements planifiés">
            <input type="number" className="input" defaultValue={projet.nbVersementsPlanifies ?? 0} />
          </Field>
          <Field label="Nb d'autres bailleurs">
            <input type="number" className="input" defaultValue={projet.nbAutresBailleurs ?? 0} />
          </Field>
        </div>
        <MoneyRow label={`Apport du partenaire (${dev})`} value={projet.apportPartenaire} />
        <MoneyRow label={`Apport sollicité (SEL) (${dev})`} value={projet.apportSollicite} />
        <MoneyRow label={`Apport autres bailleurs (${dev})`} value={projet.apportAutresBailleurs} />
        <Field label="Devise locale">
          <input className="input max-w-[120px]" defaultValue={projet.deviseLocale ?? ""} />
        </Field>
        <div className="flex items-center justify-between border-t border-ink-200 pt-3">
          <span className="text-sm font-semibold text-ink-600">Total</span>
          <span className="text-lg font-extrabold text-ink-900">{formatMontant(total, dev)}</span>
        </div>
      </div>
    </div>
  );
}

function MoneyRow({ label, value }: { label: string; value?: number }) {
  return (
    <Field label={label}>
      <input type="number" className="input" defaultValue={value ?? 0} />
    </Field>
  );
}

/* ---- Onglet Décisions ---- */
function DecisionsTab({ projet }: { projet: ProjetType }) {
  const dev = projet.devise || "EUR";
  const decision = projet.decisionCpd ?? "En instruction";
  const protocoles = [
    "Rapport intermédiaire",
    "Rapport final",
    "Envoi de la décision CPD",
    "Réception du protocole signé (OP)",
    "Envoi du protocole (proposition)",
    "Signature du protocole (SEL)",
    "Confirmation du protocole OP",
    "Confirmer coordonnées bancaires",
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Décision CPD */}
        <div className="card space-y-3 p-5">
          <p className="label">Décision de la CPD</p>
          {(["En instruction", "Accepté", "Refusé"] as const).map((d) => (
            <label key={d} className="flex items-center gap-2 text-sm font-medium text-ink-700">
              <input type="radio" name="decisionCpd" defaultChecked={decision === d} className="h-4 w-4" />
              {d}
            </label>
          ))}
          <hr className="border-ink-200" />
          <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
            <input type="checkbox" defaultChecked={projet.acceptationSousCondition} className="h-4 w-4 rounded border-ink-300" />
            Acceptation du projet sous condition
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
            <input type="checkbox" defaultChecked={projet.conditionLevee} className="h-4 w-4 rounded border-ink-300" />
            La condition a-t-elle été levée ?
          </label>
          <Field label="Description de la condition">
            <textarea className="input min-h-[80px]" defaultValue={projet.descriptionCondition ?? ""} />
          </Field>
        </div>

        {/* Recommandation */}
        <div className="card space-y-3 p-5">
          <Field label="Date de soumission à la CPD">
            <input type="date" className="input" defaultValue={projet.dateSoumissionCpd ?? ""} />
          </Field>
          <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
            <input type="checkbox" defaultChecked={projet.acceptationSousRecommandation} className="h-4 w-4 rounded border-ink-300" />
            Acceptation du projet sous recommandation
          </label>
          <Field label="Description de la recommandation">
            <textarea className="input min-h-[140px]" defaultValue={projet.descriptionRecommandation ?? ""} />
          </Field>
        </div>

        {/* Montants + versements */}
        <div className="card space-y-3 p-5">
          <MoneyRow label={`Montant alloué par la CPD (${dev})`} value={projet.montantAlloueCpd ?? projet.montantAlloue} />
          <MoneyRow label={`Apport du partenaire (${dev})`} value={projet.apportPartenaire} />
          <MoneyRow label={`Apport d'autres bailleurs (${dev})`} value={projet.apportAutresBailleurs} />
          <hr className="border-ink-200" />
          <p className="label">Versement</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
              <input type="radio" name="versementType" defaultChecked={!projet.versementRecurrent} className="h-4 w-4" /> Normal
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
              <input type="radio" name="versementType" defaultChecked={projet.versementRecurrent} className="h-4 w-4" /> Récurrent
            </label>
          </div>
          <Field label="Nombre de versements annuel">
            <input type="number" className="input max-w-[120px]" defaultValue={projet.nbVersementsAnnuel ?? 0} />
          </Field>
          <button className="btn-outline w-full justify-center">Créer les prochaines planifications</button>
        </div>
      </div>

      {/* Suivi protocole */}
      <div className="card p-5">
        <p className="mb-3 text-sm font-semibold text-ink-700">Suivi du protocole</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {protocoles.map((p) => (
            <label key={p} className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-700">
              <input type="checkbox" className="h-4 w-4 rounded border-ink-300" />
              {p}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Onglet Documents ---- */
function DocumentsTab() {
  const boutons = [
    { label: "Détails et commentaires", icon: FileText },
    { label: "Prévisualisation Fiche projet (CPD)", icon: FileBarChart },
    { label: "Informations financières", icon: FileBarChart },
    { label: "Prévisualisation Protocole d'accord", icon: FileSignature },
    { label: "Prévisualisation Protocole d'accord 2", icon: FileSignature },
  ];
  return (
    <div className="card p-5">
      <p className="mb-4 text-sm font-semibold text-ink-700">Génération de documents pré-remplis</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {boutons.map((b) => (
          <button
            key={b.label}
            className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-4 py-4 text-left text-sm font-semibold text-ink-700 shadow-card transition-colors hover:border-brand-400 hover:bg-brand-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <b.icon className="h-5 w-5" />
            </span>
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---- Onglet Suivi ---- */
function SuiviTab({ projet }: { projet: ProjetType }) {
  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink-700">Avancement</p>
          <span className="text-lg font-extrabold text-brand-700">{projet.avancement}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-ink-100">
          <div className="h-full rounded-full bg-brand-600" style={{ width: `${projet.avancement}%` }} />
        </div>
      </div>

      <div className="card p-5">
        <p className="mb-3 text-sm font-semibold text-ink-700">Jalons</p>
        <div className="space-y-2">
          {projet.jalons.map((j) => (
            <div key={j.id} className="flex items-center gap-3 text-sm">
              {j.fait ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-ink-300" />
              )}
              <span className={`flex-1 ${j.fait ? "text-ink-700" : "text-ink-500"}`}>{j.titre}</span>
              <span className="text-xs text-ink-400">{formatDate(j.echeance)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="bg-ink-50 px-4 py-3 text-sm font-semibold text-ink-800">Versements</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Libellé</th>
              <th className="px-4 py-2 text-right">Montant</th>
              <th className="px-4 py-2">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {projet.versements.map((v) => (
              <tr key={v.id}>
                <td className="px-4 py-2 text-ink-600">{formatDate(v.date)}</td>
                <td className="px-4 py-2 text-ink-700">{v.libelle}</td>
                <td className="px-4 py-2 text-right tabular-nums text-ink-800">{formatMontant(v.montant, v.devise)}</td>
                <td className="px-4 py-2"><Badge>{v.statut}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---- Onglet Correspondance ---- */
function CorrespondanceTab({ projet }: { projet: ProjetType }) {
  const corr = projet.correspondances ?? [];
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between bg-ink-50 px-4 py-3">
        <span className="text-sm font-semibold text-ink-800">Correspondance ({corr.length})</span>
        <button className="btn-primary"><Plus className="h-4 w-4" /> Nouvelle correspondance</button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-200 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Objet</th>
            <th className="px-4 py-2">Auteur</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {corr.map((c) => (
            <tr key={c.id} className="hover:bg-brand-50/40">
              <td className="px-4 py-2 text-ink-600">{formatDate(c.date)}</td>
              <td className="px-4 py-2"><Badge tone="blue">{c.type}</Badge></td>
              <td className="px-4 py-2 text-ink-700">{c.objet}</td>
              <td className="px-4 py-2 text-ink-500">{c.auteur}</td>
            </tr>
          ))}
          {corr.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-ink-400">Aucune correspondance enregistrée.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================== */
/* PHASES (onglets pré-instruction / instruction / versements / suivi)*/
/* ================================================================== */
function PhaseView({ phase, projet, org }: { phase: EtapeProjet; projet: ProjetType; org: Organisation }) {
  const atteinte = projet.etape === phase;
  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2">
          <span className="rounded bg-ink-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
            {org.sigle} {projet.code}
          </span>
          <span className="font-semibold text-ink-800">{projet.titre}</span>
        </div>
        <Badge tone={atteinte ? "green" : "gray"}>
          {atteinte ? "Étape en cours" : `Étape actuelle : ${projet.etape}`}
        </Badge>
      </div>

      {phase === "Versements à venir" ? (
        <div className="card overflow-hidden">
          <div className="bg-ink-50 px-4 py-3 text-sm font-semibold text-ink-800">Versements à venir</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-4 py-2">Date prévue</th>
                <th className="px-4 py-2">Libellé</th>
                <th className="px-4 py-2 text-right">Montant</th>
                <th className="px-4 py-2">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {projet.versements.filter((v) => v.statut !== "Versé").map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-2 text-ink-600">{formatDate(v.date)}</td>
                  <td className="px-4 py-2 text-ink-700">{v.libelle}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-ink-800">{formatMontant(v.montant, v.devise)}</td>
                  <td className="px-4 py-2"><Badge>{v.statut}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : phase === "Suivi des projets" ? (
        <SuiviTab projet={projet} />
      ) : (
        <div className="card overflow-hidden">
          <div className="bg-ink-50 px-4 py-3 text-sm font-semibold text-ink-800">
            Décisions ({phase})
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Instance</th>
                <th className="px-4 py-2">Décision</th>
                <th className="px-4 py-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {projet.decisions.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-2 text-ink-600">{formatDate(d.date)}</td>
                  <td className="px-4 py-2 text-ink-700">{d.instance}</td>
                  <td className="px-4 py-2"><Badge>{d.decision}</Badge></td>
                  <td className="px-4 py-2 text-right tabular-nums text-ink-800">
                    {d.montant ? formatMontant(d.montant) : "—"}
                  </td>
                </tr>
              ))}
              {projet.decisions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-ink-400">Aucune décision enregistrée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* STATISTIQUES                                                        */
/* ================================================================== */
function StatsView() {
  const etapes: EtapeProjet[] = [
    "Pré-instruction",
    "Instruction",
    "Versements à venir",
    "Suivi des projets",
    "Clôturé",
  ];
  const parEtape = etapes.map((e) => ({ etape: e, nb: projets.filter((p) => p.etape === e).length }));
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

/* ================================================================== */
function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className="font-semibold text-ink-800">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="label">{label}</p>
      {children}
    </div>
  );
}
