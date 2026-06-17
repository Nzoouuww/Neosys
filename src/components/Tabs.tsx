type Props = {
  tabs: string[];
  actif: string;
  onChange: (t: string) => void;
};

export function Tabs({ tabs, actif, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-ink-200">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`-mb-px border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-colors ${
            actif === t
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-700"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
