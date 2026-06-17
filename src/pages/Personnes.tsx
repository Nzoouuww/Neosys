import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, Search, Plus } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { organisations } from "../data/mockData";

const personnes = organisations.flatMap((o) =>
  o.membres.map((m) => ({ ...m, org: o })),
);

export default function Personnes() {
  const [q, setQ] = useState("");
  const needle = q.toLowerCase();
  const filtres = personnes.filter(
    (p) =>
      !needle ||
      p.nom.toLowerCase().includes(needle) ||
      p.fonction.toLowerCase().includes(needle) ||
      p.org.libelle.toLowerCase().includes(needle),
  );

  return (
    <div>
      <PageHeader
        titre="Personnes"
        sousTitre={`${personnes.length} contacts au sein des organisations partenaires`}
        actions={
          <button className="btn-primary">
            <Plus className="h-4 w-4" /> Nouveau contact
          </button>
        }
      />

      <div className="card mb-4 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un contact, une fonction ou une organisation…"
            className="input pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtres.map((p) => (
          <div key={p.id} className="card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {p.nom.split(" ").map((x) => x[0]).slice(0, 2).join("")}
              </span>
              <div>
                <div className="font-bold text-ink-800">{p.nom}</div>
                <div className="text-xs text-ink-500">{p.fonction}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm text-ink-600">
              <a href={`mailto:${p.email}`} className="flex items-center gap-2 hover:text-brand-600">
                <Mail className="h-4 w-4 text-ink-400" /> {p.email}
              </a>
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-ink-400" /> {p.telephone}
              </span>
            </div>
            <Link
              to={`/partenaires/${p.org.id}`}
              className="mt-3 inline-block rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-semibold text-ink-600 hover:bg-brand-50 hover:text-brand-700"
            >
              {p.org.sigle} — {p.org.libelle}
            </Link>
          </div>
        ))}
        {filtres.length === 0 && (
          <p className="col-span-full py-10 text-center text-ink-400">Aucun contact trouvé.</p>
        )}
      </div>
    </div>
  );
}
