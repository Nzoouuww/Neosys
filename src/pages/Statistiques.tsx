import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { PageHeader } from "../components/PageHeader";
import { organisations, projets } from "../data/mockData";
import { formatMontant, formatNombre } from "../lib/format";

const COLORS = ["#1d66f0", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899", "#64748b"];

function groupBy<T>(arr: T[], key: (t: T) => string, val: (t: T) => number) {
  const m: Record<string, number> = {};
  arr.forEach((t) => {
    m[key(t)] = (m[key(t)] ?? 0) + val(t);
  });
  return Object.entries(m).map(([name, value]) => ({ name, value }));
}

export default function Statistiques() {
  const budgetParPays = groupBy(projets, (p) => p.pays, (p) => p.montantAlloue).sort((a, b) => b.value - a.value);
  const beneficiairesParSecteur = groupBy(projets, (p) => p.secteur, (p) => p.nbBeneficiaires);
  const projetsParStatut = groupBy(projets, (p) => p.statut, () => 1);
  const partenairesParType = groupBy(organisations, (o) => o.type, () => 1);

  const budgetTotal = projets.reduce((s, p) => s + p.montantAlloue, 0);
  const consomme = projets.reduce((s, p) => s + p.consomme, 0);
  const beneficiaires = projets.reduce((s, p) => s + p.nbBeneficiaires, 0);

  return (
    <div>
      <PageHeader titre="Statistiques" sousTitre="Indicateurs consolidés du portefeuille de projets" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Budget total" value={formatMontant(budgetTotal)} />
        <Kpi label="Décaissé" value={formatMontant(consomme)} />
        <Kpi label="Taux d'exécution" value={`${Math.round((consomme / budgetTotal) * 100)} %`} />
        <Kpi label="Bénéficiaires" value={formatNombre(beneficiaires)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel titre="Budget alloué par pays">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetParPays} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eceef2" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#8593a9" tickFormatter={(v) => `${v / 1000}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} stroke="#8593a9" />
              <Tooltip formatter={(v) => formatMontant(Number(v))} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#1d66f0" />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel titre="Bénéficiaires par secteur">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={beneficiairesParSecteur} margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eceef2" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={70} stroke="#8593a9" />
              <YAxis tick={{ fontSize: 11 }} stroke="#8593a9" />
              <Tooltip formatter={(v) => formatNombre(Number(v))} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel titre="Projets par statut">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={projetsParStatut} dataKey="value" nameKey="name" outerRadius={100} label>
                {projetsParStatut.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel titre="Partenaires par type">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={partenairesParType} dataKey="value" nameKey="name" innerRadius={55} outerRadius={100} label>
                {partenairesParType.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="text-2xl font-extrabold text-ink-900">{value}</div>
      <div className="text-sm font-medium text-ink-500">{label}</div>
    </div>
  );
}

function Panel({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="mb-4 text-sm font-bold text-ink-800">{titre}</h2>
      {children}
    </div>
  );
}
