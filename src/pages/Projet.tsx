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
  X,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { Accordion } from "../components/Accordion";
import { organisations, projets as projetsSeed, documents, getOrganisation } from "../data/mockData";
import { formatMontant, formatDate } from "../lib/format";
import type {
  EtapeProjet,
  Organisation,
  Projet as ProjetType,
  Correspondance,
  SuiviEvenement,
  TypeEvenementSuivi,
  EtapeProtocole,
} from "../data/types";

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

const uid = () => Math.random().toString(36).slice(2, 9);

export default function Projet() {
  // Copie éditable des projets : tout est modifiable et persiste pendant la session.
  const [projets, setProjets] = useState<ProjetType[]>(() => projetsSeed.map((p) => ({ ...p })));
  const [orgId, setOrgId] = useState(organisations[0]?.id ?? "");
  const [projetId, setProjetId] = useState<string>("");
  const [tab, setTab] = useState<TopTab>("Org. porteuse");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const org = getOrganisation(orgId) ?? organisations[0];
  const projet = projets.find((p) => p.id === projetId);

  const updateProjet = (id: string, patch: Partial<ProjetType>) =>
    setProjets((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));

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
          <h1 className="text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">Projet</h1>
          <p className="mt-0.5 text-sm text-ink-500">
            Gestion des organisations porteuses et de leurs projets
          </p>
        </div>
        {projet && (
          <div className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-800 ring-1 ring-inset ring-brand-600/20">
            <span className="font-mono">
              {org.paysIso} · {org.sigle} · {projet.code}
            </span>
            <span className="text-brand-900">{projet.titre}</span>
          </div>
        )}
      </div>

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
          projets={projets}
          selectedProjetId={projetId}
          onSelectOrg={selectOrg}
          onOpenProjet={openProjet}
        />
      )}

      {tab === "Projet" &&
        (projet ? (
          <ProjetDetail
            org={org}
            projet={projet}
            projets={projets}
            savedAt={savedAt}
            onSave={() =>
              setSavedAt(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }))
            }
            set={(patch) => updateProjet(projet.id, patch)}
            onOpenProjet={openProjet}
          />
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

      {tab === "Statistiques" && <StatsView projets={projets} />}
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
/* ORG. PORTEUSE                                                       */
/* ================================================================== */
function OrgPorteuseView({
  org,
  projets,
  selectedProjetId,
  onSelectOrg,
  onOpenProjet,
}: {
  org: Organisation;
  projets: ProjetType[];
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

      <div className="space-y-3 lg:col-span-7">
        <OrgFiche
          org={org}
          projets={projets}
          selectedProjetId={selectedProjetId}
          onOpenProjet={onOpenProjet}
        />
      </div>
    </div>
  );
}

function OrgFiche({
  org,
  projets,
  selectedProjetId,
  onOpenProjet,
}: {
  org: Organisation;
  projets: ProjetType[];
  selectedProjetId: string;
  onOpenProjet: (id: string) => void;
}) {
  const [selection, setSelection] = useState<string[]>([]);
  const projetsOrg = projets.filter((p) => p.organisationId === org.id);
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
/* PROJET — sous-onglets éditables                                    */
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

type Setter = (patch: Partial<ProjetType>) => void;

function ProjetDetail({
  org,
  projet,
  projets,
  set,
  onSave,
  savedAt,
  onOpenProjet,
}: {
  org: Organisation;
  projet: ProjetType;
  projets: ProjetType[];
  set: Setter;
  onSave: () => void;
  savedAt: string | null;
  onOpenProjet: (id: string) => void;
}) {
  const [sub, setSub] = useState<SubTab>("Contrôle");
  const projetsOrg = projets.filter((p) => p.organisationId === org.id);

  return (
    <div className="space-y-4">
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
            {savedAt && <span className="text-xs font-medium text-emerald-600">Enregistré à {savedAt}</span>}
            <Link to={`/projets/${projet.id}`} className="btn-outline">
              <ExternalLink className="h-4 w-4" /> Vue détail
            </Link>
            <button className="btn-primary" onClick={onSave}>
              <Save className="h-4 w-4" /> Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>

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

      <div>
        {sub === "Contrôle" && <ControleTab projet={projet} set={set} />}
        {sub === "Description" && <DescriptionTab projet={projet} set={set} />}
        {sub === "Moyens" && <MoyensTab projet={projet} set={set} />}
        {sub === "Décisions" && <DecisionsTab projet={projet} set={set} />}
        {sub === "Documents" && <DocumentsTab org={org} projet={projet} />}
        {sub === "Suivi" && <SuiviTab projet={projet} set={set} />}
        {sub === "Correspondance" && <CorrespondanceTab projet={projet} set={set} />}
      </div>

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

/* ---------- Primitives de formulaire contrôlées ---------- */
function TextField({
  label,
  value,
  onChange,
  className = "input",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div>
      <p className="label">{label}</p>
      <input className={className} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function AreaField({
  label,
  value,
  onChange,
  minH = "min-h-[90px]",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  minH?: string;
}) {
  return (
    <div>
      <p className="label">{label}</p>
      <textarea className={`input ${minH}`} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  className = "input",
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  className?: string;
}) {
  return (
    <div>
      <p className="label">{label}</p>
      <input
        type="number"
        className={className}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const opts = value && !options.includes(value) ? [value, ...options] : options;
  return (
    <div>
      <p className="label">{label}</p>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {opts.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-ink-300"
      />
      {label}
    </label>
  );
}

/* ---------- Contrôle ---------- */
function ControleTab({ projet, set }: { projet: ProjetType; set: Setter }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="card space-y-4 p-5 lg:col-span-2">
        <TextField label="Code du projet" value={projet.code} onChange={(v) => set({ code: v })} />
        <TextField label="Titre du projet" value={projet.titre} onChange={(v) => set({ titre: v })} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Ville (le village)" value={projet.ville} onChange={(v) => set({ ville: v })} />
          <TextField label="Région" value={projet.region} onChange={(v) => set({ region: v })} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Pays" value={projet.pays} onChange={(v) => set({ pays: v })} />
          <TextField
            label="Coordinateur du projet"
            value={projet.coordinateur}
            onChange={(v) => set({ coordinateur: v })}
          />
        </div>
        <NumField
          label="Nombre de bénéficiaires"
          value={projet.nbBeneficiaires}
          onChange={(v) => set({ nbBeneficiaires: v ?? 0 })}
          className="input max-w-[160px]"
        />
        <CheckRow
          label="Respect du principe de non-discrimination"
          checked={projet.respectNonDiscrimination}
          onChange={(v) => set({ respectNonDiscrimination: v })}
        />
        <AreaField
          label="Profil des bénéficiaires"
          value={projet.profilBeneficiaires}
          onChange={(v) => set({ profilBeneficiaires: v })}
        />
      </div>

      <div className="space-y-4 lg:col-span-1">
        <AreaField
          label="Le milieu (géographique, social, politique, son histoire)"
          value={projet.milieu ?? ""}
          onChange={(v) => set({ milieu: v })}
          minH="min-h-[150px]"
        />
        <AreaField
          label="Historique / recommandations"
          value={projet.historiqueRecommandations ?? ""}
          onChange={(v) => set({ historiqueRecommandations: v })}
          minH="min-h-[150px]"
        />
      </div>
    </div>
  );
}

/* ---------- Description ---------- */
const OPTS_COCODEV = ["Santé, hygiène, nutrition", "Éducation", "Eau & assainissement", "Agriculture", "Développement communautaire"];
const OPTS_OCDE = ["Nutrition de base", "Éducation de base", "Santé de base", "Eau et assainissement"];
const OPTS_PNUD = ["Santé", "Éducation", "Environnement", "Gouvernance"];
const OPTS_SEL = ["Soutien alimentaire", "Parrainage", "Développement", "Urgence"];

function DescriptionTab({ projet, set }: { projet: ProjetType; set: Setter }) {
  return (
    <div className="card space-y-4 p-5">
      <AreaField
        label="Objectifs"
        value={projet.objectifs ?? ""}
        onChange={(v) => set({ objectifs: v })}
        minH="min-h-[100px]"
      />
      <AreaField
        label="Les activités"
        value={projet.activites ?? ""}
        onChange={(v) => set({ activites: v })}
        minH="min-h-[100px]"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField label="Classement COCODEV" value={projet.classementCocodev ?? ""} options={OPTS_COCODEV} onChange={(v) => set({ classementCocodev: v })} />
        <div className="flex items-end pb-2">
          <CheckRow label="Composante autonome" checked={!!projet.composanteAutonome} onChange={(v) => set({ composanteAutonome: v })} />
        </div>
        <SelectField label="Classement OCDE" value={projet.classementOcde ?? ""} options={OPTS_OCDE} onChange={(v) => set({ classementOcde: v })} />
        <div className="flex items-end pb-2">
          <CheckRow label="Début dès que le financement commence" checked={!!projet.debutDesFinancement} onChange={(v) => set({ debutDesFinancement: v })} />
        </div>
        <SelectField label="Classement PNUD" value={projet.classementPnud ?? ""} options={OPTS_PNUD} onChange={(v) => set({ classementPnud: v })} />
        <div>
          <p className="label">Date de début de réalisation prévue</p>
          <input type="date" className="input" value={projet.dateDebutRealisation ?? ""} onChange={(e) => set({ dateDebutRealisation: e.target.value })} />
        </div>
        <SelectField label="Classement SEL" value={projet.classementSel ?? ""} options={OPTS_SEL} onChange={(v) => set({ classementSel: v })} />
        <div>
          <p className="label">Date de fin de réalisation prévue</p>
          <input type="date" className="input" value={projet.dateFinRealisation ?? ""} onChange={(e) => set({ dateFinRealisation: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

/* ---------- Moyens ---------- */
function MoyensTab({ projet, set }: { projet: ProjetType; set: Setter }) {
  const dev = projet.devise || "EUR";
  const total = (projet.apportPartenaire ?? 0) + (projet.apportSollicite ?? 0) + (projet.apportAutresBailleurs ?? 0);
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="card space-y-4 p-5 lg:col-span-2">
        <AreaField label="Moyens matériels et autres" value={projet.moyensMateriels ?? ""} onChange={(v) => set({ moyensMateriels: v })} minH="min-h-[120px]" />
        <AreaField label="Moyens humains" value={projet.moyensHumains ?? ""} onChange={(v) => set({ moyensHumains: v })} minH="min-h-[120px]" />
      </div>
      <div className="card space-y-3 p-5 lg:col-span-1">
        <div className="grid grid-cols-2 gap-3">
          <NumField label="Nb versements planifiés" value={projet.nbVersementsPlanifies} onChange={(v) => set({ nbVersementsPlanifies: v })} />
          <NumField label="Nb d'autres bailleurs" value={projet.nbAutresBailleurs} onChange={(v) => set({ nbAutresBailleurs: v })} />
        </div>
        <NumField label={`Apport du partenaire (${dev})`} value={projet.apportPartenaire} onChange={(v) => set({ apportPartenaire: v })} />
        <NumField label={`Apport sollicité (SEL) (${dev})`} value={projet.apportSollicite} onChange={(v) => set({ apportSollicite: v })} />
        <NumField label={`Apport autres bailleurs (${dev})`} value={projet.apportAutresBailleurs} onChange={(v) => set({ apportAutresBailleurs: v })} />
        <TextField label="Devise locale" value={projet.deviseLocale ?? ""} onChange={(v) => set({ deviseLocale: v })} className="input max-w-[120px]" />
        <div className="flex items-center justify-between border-t border-ink-200 pt-3">
          <span className="text-sm font-semibold text-ink-600">Total</span>
          <span className="text-lg font-extrabold text-ink-900">{formatMontant(total, dev)}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Décisions ---------- */
const DEFAULT_PROTOCOLE: EtapeProtocole[] = [
  { id: "pr1", label: "Rapport intermédiaire", date: "", afficherCpd: false },
  { id: "pr2", label: "Rapport final", date: "", afficherCpd: false },
  { id: "pr3", label: "Envoi de la décision CPD", date: "", afficherCpd: false },
  { id: "pr4", label: "Réception du protocole signé (OP)", date: "", afficherCpd: false },
  { id: "pr5", label: "Envoi du protocole (proposition)", date: "", afficherCpd: false },
  { id: "pr6", label: "Signature du protocole (SEL)", date: "", afficherCpd: false },
  { id: "pr7", label: "Confirmation du protocole OP", date: "", afficherCpd: false },
  { id: "pr8", label: "Confirmer coordonnées bancaires", date: "", afficherCpd: false },
];

function DecisionsTab({ projet, set }: { projet: ProjetType; set: Setter }) {
  const dev = projet.devise || "EUR";
  const decision = projet.decisionCpd ?? "En instruction";
  const protocole = projet.protocole ?? DEFAULT_PROTOCOLE;
  const updateProto = (id: string, patch: Partial<EtapeProtocole>) =>
    set({ protocole: protocole.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card space-y-3 p-5">
          <p className="label">Décision de la CPD</p>
          {(["En instruction", "Accepté", "Refusé"] as const).map((d) => (
            <label key={d} className="flex items-center gap-2 text-sm font-medium text-ink-700">
              <input type="radio" name="decisionCpd" checked={decision === d} onChange={() => set({ decisionCpd: d })} className="h-4 w-4" />
              {d}
            </label>
          ))}
          <hr className="border-ink-200" />
          <CheckRow label="Acceptation du projet sous condition" checked={!!projet.acceptationSousCondition} onChange={(v) => set({ acceptationSousCondition: v })} />
          <CheckRow label="La condition a-t-elle été levée ?" checked={!!projet.conditionLevee} onChange={(v) => set({ conditionLevee: v })} />
          <AreaField label="Description de la condition" value={projet.descriptionCondition ?? ""} onChange={(v) => set({ descriptionCondition: v })} minH="min-h-[80px]" />
        </div>

        <div className="card space-y-3 p-5">
          <div>
            <p className="label">Date de soumission à la CPD</p>
            <input type="date" className="input" value={projet.dateSoumissionCpd ?? ""} onChange={(e) => set({ dateSoumissionCpd: e.target.value })} />
          </div>
          <CheckRow label="Acceptation du projet sous recommandation" checked={!!projet.acceptationSousRecommandation} onChange={(v) => set({ acceptationSousRecommandation: v })} />
          <AreaField label="Description de la recommandation" value={projet.descriptionRecommandation ?? ""} onChange={(v) => set({ descriptionRecommandation: v })} minH="min-h-[140px]" />
        </div>

        <div className="card space-y-3 p-5">
          <NumField label={`Montant alloué par la CPD (${dev})`} value={projet.montantAlloueCpd} onChange={(v) => set({ montantAlloueCpd: v })} />
          <NumField label={`Apport du partenaire (${dev})`} value={projet.apportPartenaire} onChange={(v) => set({ apportPartenaire: v })} />
          <NumField label={`Apport d'autres bailleurs (${dev})`} value={projet.apportAutresBailleurs} onChange={(v) => set({ apportAutresBailleurs: v })} />
          <hr className="border-ink-200" />
          <p className="label">Versement</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
              <input type="radio" name="versementType" checked={!projet.versementRecurrent} onChange={() => set({ versementRecurrent: false })} className="h-4 w-4" /> Normal
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
              <input type="radio" name="versementType" checked={!!projet.versementRecurrent} onChange={() => set({ versementRecurrent: true })} className="h-4 w-4" /> Récurrent
            </label>
          </div>
          <NumField label="Nombre de versements annuel" value={projet.nbVersementsAnnuel} onChange={(v) => set({ nbVersementsAnnuel: v })} className="input max-w-[120px]" />
          <button className="btn-outline w-full justify-center">Créer les prochaines planifications</button>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ink-700">Suivi du protocole</p>
          <p className="text-xs text-ink-400">
            Cochez « Afficher sur la fiche CPD » pour faire apparaître la date dans le document généré (onglet Documents).
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {protocole.map((p) => (
            <div key={p.id} className="rounded-xl border border-ink-200 bg-ink-50 p-3">
              <p className="mb-2 text-sm font-semibold text-ink-700">{p.label}</p>
              <input
                type="date"
                className="input bg-white"
                value={p.date ?? ""}
                onChange={(e) => updateProto(p.id, { date: e.target.value })}
              />
              <label className="mt-2 flex items-center gap-2 text-xs font-medium text-ink-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-ink-300"
                  checked={p.afficherCpd}
                  onChange={(e) => updateProto(p.id, { afficherCpd: e.target.checked })}
                />
                Afficher sur la fiche CPD
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Documents ---------- */
function DocumentsTab({ org, projet }: { org: Organisation; projet: ProjetType }) {
  const [preview, setPreview] = useState<string | null>(null);
  const boutons = [
    { id: "details", label: "Détails et commentaires", icon: FileText },
    { id: "cpd", label: "Prévisualisation Fiche projet (CPD)", icon: FileBarChart },
    { id: "finance", label: "Informations financières", icon: FileBarChart },
    { id: "protocole", label: "Prévisualisation Protocole d'accord", icon: FileSignature },
    { id: "protocole2", label: "Prévisualisation Protocole d'accord 2", icon: FileSignature },
  ];
  return (
    <div className="space-y-4">
      <div className="card p-5">
        <p className="mb-4 text-sm font-semibold text-ink-700">Génération de documents pré-remplis</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {boutons.map((b) => (
            <button
              key={b.id}
              onClick={() => setPreview(b.id)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-left text-sm font-semibold shadow-card transition-colors ${
                preview === b.id
                  ? "border-brand-500 bg-brand-50 text-brand-800"
                  : "border-ink-200 bg-white text-ink-700 hover:border-brand-400 hover:bg-brand-50"
              }`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                <b.icon className="h-5 w-5" />
              </span>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {preview === "cpd" && <FicheCpdPreview org={org} projet={projet} onClose={() => setPreview(null)} />}
      {preview && preview !== "cpd" && (
        <div className="card flex items-center justify-between p-5 text-sm text-ink-500">
          <span>Aperçu « {boutons.find((b) => b.id === preview)?.label} » — gabarit à définir avec votre équipe.</span>
          <button className="btn-outline" onClick={() => setPreview(null)}>Fermer</button>
        </div>
      )}
    </div>
  );
}

function FicheCpdPreview({
  org,
  projet,
  onClose,
}: {
  org: Organisation;
  projet: ProjetType;
  onClose: () => void;
}) {
  const datesCpd = (projet.protocole ?? []).filter((p) => p.afficherCpd && p.date);
  const dev = projet.devise || "EUR";
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink-200 bg-ink-50 px-5 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-ink-800">
          <FileBarChart className="h-4 w-4 text-brand-600" /> Fiche projet (CPD) — aperçu
        </span>
        <button className="btn-outline" onClick={onClose}><X className="h-4 w-4" /> Fermer</button>
      </div>
      <div className="mx-auto max-w-3xl space-y-5 p-8">
        <div className="border-b border-ink-200 pb-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-400">Fiche projet — Commission Partenariat & Développement</p>
          <h3 className="mt-1 text-xl font-extrabold text-ink-900">{projet.titre}</h3>
          <p className="mt-1 font-mono text-sm text-ink-500">{org.paysIso} · {org.sigle} · {projet.code}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <FicheLine label="Organisation porteuse" value={org.libelle} />
          <FicheLine label="Pays" value={projet.pays} />
          <FicheLine label="Ville / région" value={`${projet.ville}${projet.region ? `, ${projet.region}` : ""}`} />
          <FicheLine label="Coordinateur" value={projet.coordinateur} />
          <FicheLine label="Bénéficiaires" value={projet.nbBeneficiaires.toLocaleString("fr-FR")} />
          <FicheLine label="Montant alloué (CPD)" value={formatMontant(projet.montantAlloueCpd ?? projet.montantAlloue, dev)} />
        </div>
        {projet.objectifs && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Objectifs</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-700">{projet.objectifs}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Dates clés du protocole</p>
          {datesCpd.length === 0 ? (
            <p className="mt-1 text-sm italic text-ink-400">
              Aucune date sélectionnée. Cochez « Afficher sur la fiche CPD » dans l'onglet Décisions.
            </p>
          ) : (
            <table className="mt-2 w-full text-sm">
              <tbody className="divide-y divide-ink-100">
                {datesCpd.map((p) => (
                  <tr key={p.id}>
                    <td className="py-1.5 text-ink-600">{p.label}</td>
                    <td className="py-1.5 text-right font-semibold tabular-nums text-ink-800">{formatDate(p.date!)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function FicheLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-0.5 font-semibold text-ink-800">{value}</p>
    </div>
  );
}

/* ---------- Suivi ---------- */
function SuiviTab({ projet, set }: { projet: ProjetType; set: Setter }) {
  const events = projet.suiviEvenements ?? [];
  const dev = projet.devise || "EUR";

  const addEvent = (type: TypeEvenementSuivi) => {
    const ev: SuiviEvenement = {
      id: uid(),
      date: new Date().toISOString().slice(0, 10),
      type,
      infos: "",
      commentaire: "",
    };
    set({ suiviEvenements: [...events, ev] });
  };
  const updateEvent = (id: string, patch: Partial<SuiviEvenement>) =>
    set({ suiviEvenements: events.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  const removeEvent = (id: string) => set({ suiviEvenements: events.filter((e) => e.id !== id) });

  const nbVersements = events.filter((e) => e.type === "Versement").length;
  const totalVerse = events
    .filter((e) => e.type === "Versement")
    .reduce((s, e) => s + (parseFloat(e.infos.replace(/[^0-9.,]/g, "").replace(",", ".")) || 0), 0);
  const montantCpd = projet.montantAlloueCpd ?? projet.montantAlloue;
  const solde = montantCpd - totalVerse;

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-outline" onClick={() => addEvent("Versement")}><Plus className="h-4 w-4" /> Ajouter un versement</button>
          <button className="btn-outline" onClick={() => addEvent("Rapport")}><Plus className="h-4 w-4" /> Ajouter un rapport</button>
          <button className="btn-outline" onClick={() => addEvent("Visite")}><Plus className="h-4 w-4" /> Ajouter une visite</button>
          <button className="btn-outline" onClick={() => addEvent("Évaluation")}><Plus className="h-4 w-4" /> Ajouter une évaluation</button>
          <div className="ml-auto">
            <CheckRow label="Projet terminé" checked={!!projet.projetTermine} onChange={(v) => set({ projetTermine: v })} />
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Infos sur l'événement</th>
                <th className="px-3 py-2">Commentaire</th>
                <th className="w-12 px-3 py-2 text-center">Suppr.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {events.map((e) => (
                <tr key={e.id} className="align-top">
                  <td className="px-2 py-1.5">
                    <input type="date" className="input" value={e.date} onChange={(ev) => updateEvent(e.id, { date: ev.target.value })} />
                  </td>
                  <td className="px-2 py-1.5">
                    <select className="input" value={e.type} onChange={(ev) => updateEvent(e.id, { type: ev.target.value as TypeEvenementSuivi })}>
                      <option>Versement</option>
                      <option>Rapport</option>
                      <option>Visite</option>
                      <option>Évaluation</option>
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <input className="input" value={e.infos} onChange={(ev) => updateEvent(e.id, { infos: ev.target.value })} placeholder="ex. 7916.00 EUR" />
                  </td>
                  <td className="px-2 py-1.5">
                    <input className="input" value={e.commentaire} onChange={(ev) => updateEvent(e.id, { commentaire: ev.target.value })} />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button onClick={() => removeEvent(e.id)} className="rounded p-1.5 text-ink-400 hover:bg-rose-50 hover:text-rose-600" title="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-ink-400">
                    Aucun événement. Utilisez les boutons ci-dessus pour en ajouter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card space-y-2 p-5 text-sm">
          <div className="flex justify-between"><span className="text-ink-500">Nb versements planifiés</span><span className="font-semibold">{projet.nbVersementsPlanifies ?? 0}</span></div>
          <div className="flex justify-between"><span className="text-ink-500">Nb versements effectués</span><span className="font-semibold">{nbVersements}</span></div>
          <div className="flex justify-between"><span className="text-ink-500">Solde</span><span className="font-semibold">{formatMontant(solde, dev)}</span></div>
        </div>
        <div className="card space-y-2 p-5 text-sm">
          <div className="flex justify-between"><span className="text-ink-500">Montant alloué par la CPD</span><span className="font-semibold">{formatMontant(montantCpd, dev)}</span></div>
          <div className="flex justify-between"><span className="text-ink-500">Montant total versé</span><span className="font-semibold">{formatMontant(totalVerse, dev)}</span></div>
        </div>
        <div className="card p-5">
          <p className="label">Date de début de projet réalisée</p>
          <input type="date" className="input" value={projet.dateDebutRealisee ?? ""} onChange={(e) => set({ dateDebutRealisee: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

/* ---------- Correspondance ---------- */
function CorrespondanceTab({ projet, set }: { projet: ProjetType; set: Setter }) {
  const corr = projet.correspondances ?? [];
  const add = () => {
    const c: Correspondance = {
      id: uid(),
      date: new Date().toISOString().slice(0, 10),
      type: "E-mail",
      objet: "",
      auteur: "",
    };
    set({ correspondances: [...corr, c] });
  };
  const update = (id: string, patch: Partial<Correspondance>) =>
    set({ correspondances: corr.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const remove = (id: string) => set({ correspondances: corr.filter((c) => c.id !== id) });

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between bg-ink-50 px-4 py-3">
        <span className="text-sm font-semibold text-ink-800">Correspondance ({corr.length})</span>
        <button className="btn-primary" onClick={add}><Plus className="h-4 w-4" /> Nouvelle correspondance</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Objet</th>
              <th className="px-3 py-2">Auteur</th>
              <th className="w-12 px-3 py-2 text-center">Suppr.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {corr.map((c) => (
              <tr key={c.id} className="align-top">
                <td className="px-2 py-1.5">
                  <input type="date" className="input" value={c.date} onChange={(e) => update(c.id, { date: e.target.value })} />
                </td>
                <td className="px-2 py-1.5">
                  <select className="input" value={c.type} onChange={(e) => update(c.id, { type: e.target.value as Correspondance["type"] })}>
                    <option>Courrier</option>
                    <option>E-mail</option>
                    <option>Appel</option>
                    <option>Réunion</option>
                  </select>
                </td>
                <td className="px-2 py-1.5">
                  <input className="input" value={c.objet} onChange={(e) => update(c.id, { objet: e.target.value })} />
                </td>
                <td className="px-2 py-1.5">
                  <input className="input" value={c.auteur} onChange={(e) => update(c.id, { auteur: e.target.value })} />
                </td>
                <td className="px-2 py-1.5 text-center">
                  <button onClick={() => remove(c.id)} className="rounded p-1.5 text-ink-400 hover:bg-rose-50 hover:text-rose-600" title="Supprimer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {corr.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-ink-400">Aucune correspondance. Cliquez « Nouvelle correspondance ».</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================================================================== */
/* PHASES                                                             */
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
        <div className="card p-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-700">Avancement</p>
            <span className="text-lg font-extrabold text-brand-700">{projet.avancement}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-ink-100">
            <div className="h-full rounded-full bg-brand-600" style={{ width: `${projet.avancement}%` }} />
          </div>
          <div className="mt-4 space-y-2">
            {projet.jalons.map((j) => (
              <div key={j.id} className="flex items-center gap-3 text-sm">
                {j.fait ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-ink-300" />}
                <span className={`flex-1 ${j.fait ? "text-ink-700" : "text-ink-500"}`}>{j.titre}</span>
                <span className="text-xs text-ink-400">{formatDate(j.echeance)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="bg-ink-50 px-4 py-3 text-sm font-semibold text-ink-800">Décisions ({phase})</div>
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
                  <td className="px-4 py-2 text-right tabular-nums text-ink-800">{d.montant ? formatMontant(d.montant) : "—"}</td>
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
function StatsView({ projets }: { projets: ProjetType[] }) {
  const etapes: EtapeProjet[] = ["Pré-instruction", "Instruction", "Versements à venir", "Suivi des projets", "Clôturé"];
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
