export const formatMontant = (montant: number, devise = "EUR") =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: devise,
    maximumFractionDigits: 0,
  }).format(montant);

export const formatNombre = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n);

export const formatDate = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
};
