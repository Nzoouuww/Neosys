import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Globe,
  MapPin,
  Mail,
  Phone,
  Star,
  FileText,
  Building2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Badge } from "../components/Badge";
import { Accordion } from "../components/Accordion";
import { Tabs } from "../components/Tabs";
import {
  getOrganisation,
  getProjetsByOrganisation,
  documents,
  getModele,
} from "../data/mockData";
import { formatMontant, formatDate } from "../lib/format";

const TABS = ["Suivi des projets", "Versements à venir", "Statistiques"];

export default function PartenaireDetail() {
  const { id } = useParams();
  const org = getOrganisation(id);
  const [tab, setTab] = useState(TABS[0]);
  const [selection, setSelection] = useState<string[]>([]);

  if (!org) {
    return (
      <div className="card p-10 text-center text-ink-500">
        Organisation introuvable.{" "}
        <Link to="/partenaires" className="font-semibold text-brand-600">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const projetsOrg = getProjetsByOrganisation(org.id);
  const docsOrg = documents.filter((d) => d.organisationId === org.id);
  const versements = projetsOrg
    .flatMap((p) => p.versements.map((v) => ({ ...v, projet: p })))
    .filter((v) => v.statut === "À venir")
    .sort((a, b) => a.date.localeCompare(b.date));

  const toggle = (pid: string) =>
    setSelection((s) => (s.includes(pid) ? s.filter((x) => x !== pid) : [...s, pid]));

  return (
    <div>
      {/* Breadcrumb + title */}
      <div className="mb-4">
        <Link
          to="/partenaires"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" /> Partenaires
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Building2 className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-ink-100 px-2 py-0.5 font-mono text-xs font-bold text-ink-600">
                  {org.paysIso} · {org.sigle}
                </span>
                <Badge>{org.statut}</Badge>
              </div>
              <h1 className="mt-1 text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
                {org.libelle}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-outline">
              <Save className="h-4 w-4" /> Enregistrer
            </button>
            <button className="btn-primary">
              <Plus className="h-4 w-4" /> Ajouter un projet
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: identity + accordions */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Info label="Type" value={org.type} />
              <Info label="Pays" value={org.pays} />
              <Info label="Partenaire depuis" value={formatDate(org.depuis)} />
              <Info
                label="Fiabilité"
                value={
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {org.noteFiabilite.toFixed(1)} / 5
                  </span>
                }
              />
              <div className="col-span-2">
                <p className="label">Montant alloué cumulé</p>
                <p className="text-lg font-extrabold text-ink-900">
                  {formatMontant(org.montantAlloue)}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {org.secteurs.map((s) => (
                <span key={s} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                  {s}
                </span>
              ))}
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
                <Globe className="h-4 w-4" /> {org.siteWeb.replace("https://", "")}
              </a>
            )}
          </Accordion>

          <Accordion titre="Adresses - contact">
            <div className="space-y-2 text-sm text-ink-600">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                <span>
                  {org.adresse.rue && <>{org.adresse.rue}, </>}
                  {org.adresse.ville} {org.adresse.codePostal}
                  <br />
                  {org.adresse.region}, {org.adresse.pays}
                </span>
              </p>
            </div>
          </Accordion>

          <Accordion titre="Membres" compteur={org.membres.length}>
            {org.membres.length === 0 ? (
              <p className="text-sm text-ink-400">Aucun membre enregistré.</p>
            ) : (
              <ul className="space-y-3">
                {org.membres.map((m) => (
                  <li key={m.id} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-xs font-bold text-ink-600">
                      {m.nom.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                    </span>
                    <div className="text-sm">
                      <div className="font-semibold text-ink-800">{m.nom}</div>
                      <div className="text-ink-500">{m.fonction}</div>
                      <div className="mt-1 flex flex-col gap-0.5 text-xs text-ink-500">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {m.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {m.telephone}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Accordion>

          <Accordion titre="Documents" compteur={docsOrg.length}>
            {docsOrg.length === 0 ? (
              <p className="text-sm text-ink-400">Aucun document.</p>
            ) : (
              <ul className="space-y-2">
                {docsOrg.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 rounded-lg border border-ink-200 p-2.5">
                    <FileText className="h-4 w-4 text-brand-500" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink-800">{d.nom}</div>
                      <div className="text-xs text-ink-400">{getModele(d.modeleId)?.nom}</div>
                    </div>
                    <Badge>{d.statut}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Accordion>
        </div>

        {/* Right column: tabs */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="px-4 pt-2">
              <Tabs tabs={TABS} actif={tab} onChange={setTab} />
            </div>

            {tab === "Suivi des projets" && (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
                        <th className="w-10 px-3 py-2.5"></th>
                        <th className="px-3 py-2.5">Code</th>
                        <th className="px-3 py-2.5">Titre du projet</th>
                        <th className="px-3 py-2.5">Étape</th>
                        <th className="px-3 py-2.5 text-right">Montant</th>
                        <th className="px-3 py-2.5">Avancement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {projetsOrg.map((p) => (
                        <tr key={p.id} className="hover:bg-brand-50/40">
                          <td className="px-3 py-2.5">
                            <input
                              type="checkbox"
                              checked={selection.includes(p.id)}
                              onChange={() => toggle(p.id)}
                              className="h-4 w-4 rounded border-ink-300"
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <Link to={`/projets/${p.id}`} className="font-mono font-bold text-brand-700 hover:underline">
                              {p.code}
                            </Link>
                          </td>
                          <td className="px-3 py-2.5 font-medium text-ink-800">{p.titre}</td>
                          <td className="px-3 py-2.5">
                            <Badge>{p.etape}</Badge>
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                            {formatMontant(p.montantAlloue)}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-ink-100">
                                <div className="h-full rounded-full bg-brand-500" style={{ width: `${p.avancement}%` }} />
                              </div>
                              <span className="text-xs font-semibold text-ink-500">{p.avancement}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {projetsOrg.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-3 py-10 text-center text-ink-400">
                            Aucun projet pour cette organisation.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-ink-200 p-3">
                  <button className="btn-outline border-rose-200 text-rose-600 hover:bg-rose-50" disabled={selection.length === 0}>
                    <Trash2 className="h-4 w-4" /> Supprimer la sélection ({selection.length})
                  </button>
                  <button className="btn-primary">
                    <Plus className="h-4 w-4" /> Ajouter un projet
                  </button>
                </div>
              </div>
            )}

            {tab === "Versements à venir" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
                      <th className="px-3 py-2.5">Échéance</th>
                      <th className="px-3 py-2.5">Projet</th>
                      <th className="px-3 py-2.5">Libellé</th>
                      <th className="px-3 py-2.5 text-right">Montant</th>
                      <th className="px-3 py-2.5">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {versements.map((v) => (
                      <tr key={v.id} className="hover:bg-brand-50/40">
                        <td className="px-3 py-2.5 font-medium text-ink-700">{formatDate(v.date)}</td>
                        <td className="px-3 py-2.5">
                          <Link to={`/projets/${v.projet.id}`} className="font-mono font-bold text-brand-700 hover:underline">
                            {v.projet.code}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-ink-700">{v.libelle}</td>
                        <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                          {formatMontant(v.montant, v.devise)}
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge>{v.statut}</Badge>
                        </td>
                      </tr>
                    ))}
                    {versements.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-10 text-center text-ink-400">
                          Aucun versement à venir.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "Statistiques" && (
              <div className="p-5">
                {projetsOrg.length === 0 ? (
                  <p className="py-10 text-center text-ink-400">Aucune donnée à afficher.</p>
                ) : (
                  <>
                    <div className="mb-5 grid grid-cols-3 gap-3">
                      <MiniStat label="Projets" value={String(projetsOrg.length)} />
                      <MiniStat
                        label="Bénéficiaires"
                        value={String(projetsOrg.reduce((s, p) => s + p.nbBeneficiaires, 0))}
                      />
                      <MiniStat
                        label="Budget"
                        value={formatMontant(projetsOrg.reduce((s, p) => s + p.montantAlloue, 0))}
                      />
                    </div>
                    <h3 className="mb-3 text-sm font-bold text-ink-800">Montant alloué par projet</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={projetsOrg.map((p) => ({ name: p.code, value: p.montantAlloue }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eceef2" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#8593a9" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#8593a9" tickFormatter={(v) => `${v / 1000}k`} />
                        <Tooltip formatter={(v) => formatMontant(Number(v))} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#1d66f0" />
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink-50 p-3 text-center">
      <div className="text-lg font-extrabold text-ink-900">{value}</div>
      <div className="text-xs font-medium text-ink-500">{label}</div>
    </div>
  );
}
