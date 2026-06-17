import type { ReactNode } from "react";

export function PageHeader({
  titre,
  sousTitre,
  actions,
}: {
  titre: string;
  sousTitre?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
          {titre}
        </h1>
        {sousTitre && <p className="mt-0.5 text-sm text-ink-500">{sousTitre}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
