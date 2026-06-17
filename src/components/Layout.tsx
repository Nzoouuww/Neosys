import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  FileText,
  Users,
  BarChart3,
  ListChecks,
  Settings,
  Search,
  Bell,
  Plus,
  HeartHandshake,
  ChevronDown,
} from "lucide-react";

const nav = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/partenaires", label: "Partenaires", icon: Building2 },
  { to: "/projets", label: "Projets", icon: FolderKanban },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/personnes", label: "Personnes", icon: Users },
  { to: "/statistiques", label: "Statistiques", icon: BarChart3 },
];

const navConfig = [
  { to: "/ameliorations", label: "Suivi des améliorations", icon: ListChecks },
];

function SidebarLink({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "bg-brand-600 text-white shadow-sm"
            : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
        }`
      }
    >
      <Icon className="h-[18px] w-[18px]" />
      {label}
    </NavLink>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-ink-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-extrabold tracking-tight text-ink-900">Néosys</div>
            <div className="text-[11px] font-medium text-ink-400">Gestion Projet Sud</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-ink-400">
            Pilotage
          </p>
          {nav.map((n) => (
            <SidebarLink key={n.to} {...n} />
          ))}

          <p className="px-3 pb-1 pt-5 text-[11px] font-bold uppercase tracking-wider text-ink-400">
            Configuration
          </p>
          {navConfig.map((n) => (
            <SidebarLink key={n.to} {...n} />
          ))}
          <SidebarLink to="/parametres" label="Paramètres" icon={Settings} />
        </nav>

        <div className="border-t border-ink-200 p-3">
          <div className="rounded-lg bg-ink-50 p-3">
            <p className="text-[11px] font-semibold text-ink-500">Environnement</p>
            <p className="text-xs font-medium text-ink-700">db_neosys · v15 (prototype)</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-ink-200 bg-white px-4 sm:px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) navigate(`/partenaires?q=${encodeURIComponent(q.trim())}`);
            }}
            className="relative hidden max-w-md flex-1 sm:block"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un partenaire, un projet…"
              className="input pl-9"
            />
          </form>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 md:inline">
              Connecté · 192.168.0.252
            </span>
            <button className="btn-primary" onClick={() => navigate("/partenaires")}>
              <Plus className="h-4 w-4" /> Nouveau
            </button>
            <button className="relative rounded-lg p-2 text-ink-500 hover:bg-ink-100">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
            </button>
            <button className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-ink-100">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                CD
              </span>
              <ChevronDown className="hidden h-4 w-4 text-ink-400 sm:block" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-ink-50 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
