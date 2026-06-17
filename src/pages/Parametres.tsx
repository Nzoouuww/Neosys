import { PageHeader } from "../components/PageHeader";
import { Database, Globe, Coins, Bell, ShieldCheck, Users } from "lucide-react";

const sections = [
  { icon: Database, titre: "Base de données", desc: "Connexion serveur, sauvegardes et import des données historiques." },
  { icon: Globe, titre: "Pays & devises", desc: "Référentiel ISO 3166 et taux de change des devises." },
  { icon: Coins, titre: "Agences de transfert", desc: "Gestion des canaux de versement vers les partenaires." },
  { icon: Users, titre: "Utilisateurs & rôles", desc: "Droits d'accès des chargés de projet et administrateurs." },
  { icon: Bell, titre: "Notifications", desc: "Alertes sur les échéances de versement et de rapport." },
  { icon: ShieldCheck, titre: "Conformité", desc: "Principe de non-discrimination et règles de conformité." },
];

export default function Parametres() {
  return (
    <div>
      <PageHeader titre="Paramètres" sousTitre="Configuration de l'application Néosys" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <button key={s.titre} className="card p-5 text-left transition-shadow hover:shadow-soft">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <s.icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-ink-800">{s.titre}</h3>
            <p className="mt-1 text-xs text-ink-500">{s.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
