import { Link } from "react-router-dom";
import {
  Building2,
  FolderKanban,
  Users,
  Euro,
  ArrowUpRight,
  CircleDot,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/Badge";
import { organisations, projets, activites } from "../data/mockData";
import { formatMontant, formatNombre } from "../lib/format";

const COLORS = ["#1d66f0", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899"];

export default function Dashboard() {
  const budgetTotal = projets.reduce((s, p) => s + p.montantAlloue, 0);
  const beneficiaires = projets.reduce((s, p) => s + p.nbBeneficiaires, 0);
  const projetsActifs = projets.filter((p) => p.statut === "En cours").length;

  const parSecteur = Object.entries(
    projets.reduce<Record<string, number>>((acc, p) => {
      acc[p.secteur] = (acc[p.secteur] ?? 0) + p.montantAlloue;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const parEtape = Object.entries(
    projets.reduce<Record<string, number>>((acc, p) => {
      acc[p.etape] = (acc[p.etape] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const stats = [
    { label: "Partenaires", value: formatNombre(organisations.length), icon: Building2, to: "/partenaires", delta: "+3 cette année" },
    { label: "Projets actifs", value: formatNombre(projetsActifs), icon: FolderKanban, to: "/projets", delta: `${projets.length} au total` },
    { label: "Budget alloué", value: formatMontant(budgetTotal), icon: Euro, to: "/statistiques", delta: "12 projets financés" },
    { label: "Bénéficiaires", value: formatNombre(beneficiaires), icon: Users, to: "/statistiques", delta: "directs estimés" },
  ];

  return (
    <div>
      <PageHeader
        titre="Tableau de bord"
        sousTitre="Vue d'ensemble des partenaires, projets et financements"
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="card group p-5 transition-shadow hover:shadow-soft"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <s.icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-ink-300 transition-colors group-hover:text-brand-500" />
            </div>
            <div className="mt-4 text-2xl font-extrabold text-ink-900">{s.value}</div>
            <div className="text-sm font-medium text-ink-500">{s.label}</div>
            <div className="mt-1 text-xs text-ink-400">{s.delta}</div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Budget par secteur */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-bold text-ink-800">Budget alloué par secteur</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={parSecteur} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eceef2" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} stroke="#8593a9" />
              <YAxis tick={{ fontSize: 11 }} stroke="#8593a9" tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v) => formatMontant(Number(v))} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#1d66f0" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Projets par étape */}
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-bold text-ink-800">Projets par étape</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={parEtape} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {parEtape.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {parEtape.map((e, i) => (
              <div key={e.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-ink-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {e.name}
                </span>
                <span className="font-semibold text-ink-800">{e.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Projets récents */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-ink-200 px-5 py-3">
            <h2 className="text-sm font-bold text-ink-800">Projets récents</h2>
            <Link to="/projets" className="text-xs font-semibold text-brand-600 hover:underline">
              Tout voir
            </Link>
          </div>
          <div className="divide-y divide-ink-100">
            {projets.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                to={`/projets/${p.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-ink-50"
              >
                <span className="rounded-md bg-ink-100 px-2 py-1 font-mono text-xs font-bold text-ink-600">
                  {p.code}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink-800">{p.titre}</div>
                  <div className="text-xs text-ink-400">
                    {p.pays} · {p.secteur}
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-semibold text-ink-800">{formatMontant(p.montantAlloue)}</div>
                  <div className="text-xs text-ink-400">{p.avancement}% réalisé</div>
                </div>
                <Badge>{p.etape}</Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Activité récente */}
        <div className="card">
          <div className="border-b border-ink-200 px-5 py-3">
            <h2 className="text-sm font-bold text-ink-800">Activité récente</h2>
          </div>
          <ul className="space-y-4 p-5">
            {activites.map((a) => (
              <li key={a.id} className="flex gap-3">
                <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <div>
                  <p className="text-sm text-ink-700">{a.texte}</p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {a.auteur} · {a.date}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
