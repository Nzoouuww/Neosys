import { useState } from "react";
import { FileText, FileDown, Wand2, X } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/Badge";
import { Tabs } from "../components/Tabs";
import {
  documents,
  modelesDocuments,
  organisations,
  projets,
  getModele,
  getOrganisation,
  getProjet,
} from "../data/mockData";
import { formatDate, formatMontant } from "../lib/format";

const TABS = ["Documents générés", "Modèles", "Générateur"];

export default function Documents() {
  const [tab, setTab] = useState(TABS[0]);

  return (
    <div>
      <PageHeader
        titre="Documents"
        sousTitre="Génération de documents à partir des données pré-remplies"
      />
      <div className="card">
        <div className="px-4 pt-2">
          <Tabs tabs={TABS} actif={tab} onChange={setTab} />
        </div>

        {tab === "Documents générés" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
                  <th className="px-4 py-3">Document</th>
                  <th className="px-4 py-3">Modèle</th>
                  <th className="px-4 py-3">Lié à</th>
                  <th className="px-4 py-3">Auteur</th>
                  <th className="px-4 py-3">Créé le</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {documents.map((d) => {
                  const org = getOrganisation(d.organisationId);
                  return (
                    <tr key={d.id} className="hover:bg-brand-50/40">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 font-semibold text-ink-800">
                          <FileText className="h-4 w-4 text-brand-500" /> {d.nom}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-600">{getModele(d.modeleId)?.nom}</td>
                      <td className="px-4 py-3 text-ink-600">{org?.sigle ?? "—"}</td>
                      <td className="px-4 py-3 text-ink-600">{d.auteur}</td>
                      <td className="px-4 py-3 text-ink-600">{formatDate(d.creeLe)}</td>
                      <td className="px-4 py-3">
                        <Badge>{d.statut}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="btn-ghost px-2 py-1 text-brand-600">
                          <FileDown className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === "Modèles" && (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {modelesDocuments.map((m) => (
              <div key={m.id} className="rounded-xl border border-ink-200 p-4">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-ink-800">{m.nom}</h3>
                <p className="mt-1 text-xs text-ink-500">{m.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {m.champs.map((c) => (
                    <span key={c} className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-500">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Générateur" && <Generateur />}
      </div>
    </div>
  );
}

function Generateur() {
  const [modeleId, setModeleId] = useState(modelesDocuments[0].id);
  const [orgId, setOrgId] = useState(organisations[0].id);
  const [projetId, setProjetId] = useState(projets[0].id);
  const [apercu, setApercu] = useState(false);

  const modele = getModele(modeleId);
  const org = getOrganisation(orgId);
  const projet = getProjet(projetId);

  return (
    <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <p className="label">Modèle de document</p>
          <select className="input" value={modeleId} onChange={(e) => setModeleId(e.target.value)}>
            {modelesDocuments.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="label">Organisation porteuse</p>
          <select className="input" value={orgId} onChange={(e) => setOrgId(e.target.value)}>
            {organisations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.sigle} — {o.libelle}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="label">Projet</p>
          <select className="input" value={projetId} onChange={(e) => setProjetId(e.target.value)}>
            {projets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.titre}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-primary w-full" onClick={() => setApercu(true)}>
          <Wand2 className="h-4 w-4" /> Générer l'aperçu
        </button>
        <p className="text-xs text-ink-400">
          Le document est pré-rempli automatiquement à partir des données du partenaire et du projet sélectionnés.
        </p>
      </div>

      <div className="rounded-xl border border-ink-200 bg-ink-50 p-1">
        {!apercu ? (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center text-ink-400">
            <FileText className="mb-2 h-8 w-8" />
            <p className="text-sm font-semibold">Aperçu du document</p>
            <p className="text-xs">Sélectionnez un modèle puis cliquez sur « Générer l'aperçu ».</p>
          </div>
        ) : (
          <div className="relative h-full rounded-lg bg-white p-6 text-sm shadow-card">
            <button
              onClick={() => setApercu(false)}
              className="absolute right-3 top-3 rounded p-1 text-ink-400 hover:bg-ink-100"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">SEL · Néosys</p>
            <h3 className="mt-1 text-lg font-extrabold text-ink-900">{modele?.nom}</h3>
            <hr className="my-3 border-ink-200" />
            <dl className="space-y-2">
              <Row k="Organisation" v={`${org?.sigle} — ${org?.libelle}`} />
              <Row k="Pays" v={org?.pays ?? ""} />
              <Row k="Projet" v={`${projet?.code} — ${projet?.titre}`} />
              <Row k="Coordinateur" v={projet?.coordinateur ?? ""} />
              <Row k="Montant alloué" v={projet ? formatMontant(projet.montantAlloue, projet.devise) : ""} />
              <Row k="Bénéficiaires" v={String(projet?.nbBeneficiaires ?? "")} />
              <Row k="Date" v={formatDate(new Date().toISOString())} />
            </dl>
            <p className="mt-4 text-xs italic text-ink-400">
              Une action chrétienne dans un monde en détresse.
            </p>
            <button className="btn-primary mt-4 w-full">
              <FileDown className="h-4 w-4" /> Télécharger en PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-dashed border-ink-100 pb-1">
      <dt className="font-semibold text-ink-500">{k}</dt>
      <dd className="text-right font-medium text-ink-800">{v}</dd>
    </div>
  );
}
