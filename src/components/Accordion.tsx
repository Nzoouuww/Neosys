import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function Accordion({
  titre,
  compteur,
  defautOuvert = false,
  children,
}: {
  titre: string;
  compteur?: number;
  defautOuvert?: boolean;
  children: ReactNode;
}) {
  const [ouvert, setOuvert] = useState(defautOuvert);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOuvert((v) => !v)}
        className="flex w-full items-center justify-between bg-ink-50 px-4 py-3 text-left hover:bg-ink-100"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-ink-800">
          {titre}
          {compteur !== undefined && (
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700">
              {compteur}
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-ink-500 transition-transform ${ouvert ? "rotate-180" : ""}`}
        />
      </button>
      {ouvert && <div className="border-t border-ink-200 p-4">{children}</div>}
    </div>
  );
}
