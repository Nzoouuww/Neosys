import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Check,
  FileDown,
  CheckCircle2,
  Circle,
  Send,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { Tabs } from "../components/Tabs";
import {
  getProjet,
  getOrganisation,
  documents,
  getModele,
} from "../data/mockData";
import { formatMontant, formatDate } from "../lib/format";

const TABS = [
  "Contrôle",
  "Description",
  "Moyens",
  "Décisions",
  "Documents",
  "Suivi",
  "Correspondance",
];

export default function ProjetDetail() {
  const { id } = useParams();
  const projet = getProjet(id);
  const [tab, setTab] = useState("Contrôle");

  if (!projet) {
    return (
      <div className="card p-10 text-center text-ink-500">
        Projet introuvable.{" "}
        <Link to="/projets" className="font-semibold text-brand-600">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const org = getOrganisation(projet.organisationId);
  const docsProjet = documents.filter((d) => d.projetId === projet.id);

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/projets"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" /> Projets
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-ink-100 px-2 py-0.5 font-mono text-xs font-bold text-ink-600">
                {projet.paysIso} · {org?.sigle} · {projet.code}
              </span>
              <Badge>{projet.etape}</Badge>
              <Badge>{projet.statut}</Badge>
            </div>
            <h1 className="mt-1 text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
              {projet.titre}
            </h1>
            {org && (
              <Link to={`/partenaires/${org.id}`} className="text-sm font-semibold text-brand-600 hover:underline">
                {org.libelle}
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-outline">
              <FileDown className="h-4 w-4" /> Générer un document
            </button>
            <button className="btn-primary">
              <Save className="h-4 w-4" /> Enregistrer
            </button>
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Strip label="Montant alloué" value={formatMontant(projet.montantAlloue, projet.devise)} />
        <Strip label="Consommé" value={formatMontant(projet.consomme, projet.devise)} />
        <Strip label="Bénéficiaires" value={String(projet.nbBeneficiaires)} />
        <Strip label="Avancement" value={`${projet.avancement} %`} />
      </div>

      <div className="card">
        <div className="px-4 pt-2">
          <Tabs tabs={TABS} actif={tab} onChange={setTab} />
        </div>

        {tab === "Contrôle" && (
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
            <Field label="Code du projet" value={projet.code} mono />
            <Field label="Titre du projet" value={projet.titre} />
            <Field label="La ville / village et sa région" value={`${projet.ville}, Région ${projet.region}`} />
            <Field label="Pays" value={projet.pays} select />
            <Field label="Coordinateur du projet" value={projet.coordinateur} select />
            <Field label="Nombre de bénéficiaires" value={String(projet.nbBeneficiaires)} />
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 rounded-lg border border-ink-200 p-3">
                <input
                  type="checkbox"
                  checked={projet.respectNonDiscrimination}
                  readOnly
                  className="h-4 w-4 rounded border-ink-300"
                />
                <span className="text-sm font-medium text-ink-700">
                  Respect du principe de non-discrimination
                </span>
                {projet.respectNonDiscrimination && (
                  <Check className="ml-auto h-4 w-4 text-emerald-600" />
                )}
              </label>
            </div>
            <div className="md:col-span-2">
              <p className="label">Profil des bénéficiaires</p>
              <textarea
                readOnly
                value={projet.profilBeneficiaires}
                rows={4}
                className="input resize-none"
              />
            </div>
          </div>
        )}

        {tab === "Description" && (
          <div className="p-5">
            <p className="text-sm leading-relaxed text-ink-700">{projet.description}</p>
          </div>
        )}

        {tab === "Moyens" && (
          <div className="p-5">
            <p className="text-sm leading-relaxed text-ink-700">{projet.moyens}</p>
          </div>
        )}

        {tab === "Décisions" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Instance</th>
                  <th className="px-4 py-2.5">Décision</th>
                  <th className="px-4 py-2.5 text-right">Montant</th>
                  <th className="px-4 py-2.5">Commentaire</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {projet.decisions.map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 py-2.5 text-ink-700">{formatDate(d.date)}</td>
                    <td className="px-4 py-2.5 text-ink-700">{d.instance}</td>
                    <td className="px-4 py-2.5">
                      <Badge>{d.decision}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {d.montant ? formatMontant(d.montant) : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-ink-500">{d.commentaire || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "Documents" && (
          <div className="p-5">
            {docsProjet.length === 0 ? (
              <p className="text-sm text-ink-400">Aucun document lié à ce projet.</p>
            ) : (
              <ul className="space-y-2">
                {docsProjet.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 rounded-lg border border-ink-200 p-3">
                    <FileDown className="h-4 w-4 text-brand-500" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-ink-800">{d.nom}</div>
                      <div className="text-xs text-ink-400">
                        {getModele(d.modeleId)?.nom} · {d.auteur} · {formatDate(d.creeLe)}
                      </div>
                    </div>
                    <Badge>{d.statut}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "Suivi" && (
          <div className="p-5">
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-semibold text-ink-700">Avancement global</span>
                <span className="font-bold text-brand-700">{projet.avancement}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${projet.avancement}%` }} />
              </div>
              <p className="mt-1 text-xs text-ink-400">
                {formatDate(projet.dateDebut)} → {formatDate(projet.dateFin)}
              </p>
            </div>
            <h3 className="mb-2 text-sm font-bold text-ink-800">Jalons</h3>
            <ul className="space-y-2">
              {projet.jalons.map((j) => (
                <li key={j.id} className="flex items-center gap-3 rounded-lg border border-ink-200 p-3">
                  {j.fait ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-ink-300" />
                  )}
                  <span className={`flex-1 text-sm ${j.fait ? "text-ink-500 line-through" : "font-medium text-ink-800"}`}>
                    {j.titre}
                  </span>
                  <span className="text-xs text-ink-400">{formatDate(j.echeance)}</span>
                </li>
              ))}
              {projet.jalons.length === 0 && <p className="text-sm text-ink-400">Aucun jalon défini.</p>}
            </ul>
          </div>
        )}

        {tab === "Correspondance" && (
          <div className="p-5">
            <div className="rounded-lg border border-dashed border-ink-300 p-8 text-center">
              <Send className="mx-auto mb-2 h-6 w-6 text-ink-400" />
              <p className="text-sm font-semibold text-ink-600">Aucune correspondance enregistrée</p>
              <p className="mt-1 text-xs text-ink-400">
                Les courriers et échanges avec le partenaire apparaîtront ici.
              </p>
              <button className="btn-outline mt-4">
                <Send className="h-4 w-4" /> Nouveau message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Strip({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-ink-900">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  select,
}: {
  label: string;
  value: string;
  mono?: boolean;
  select?: boolean;
}) {
  return (
    <div>
      <p className="label">{label}</p>
      <div className={`input flex items-center justify-between bg-ink-50/60 ${mono ? "font-mono font-semibold" : ""}`}>
        <span>{value}</span>
        {select && <span className="text-ink-400">▾</span>}
      </div>
    </div>
  );
}
