export type StatutAxe = "À faire" | "En cours" | "Fait";

export interface Axe {
  id: number;
  titre: string;
  description?: string;
  categorie: string;
  statut: StatutAxe;
  /** Avancement 0-100, utile quand statut = "En cours" */
  avancement: number;
  note?: string;
}

/**
 * Suivi des 40 axes d'amélioration de Néosys.
 * Mis à jour au fil de l'eau : chaque amélioration livrée passe en « Fait ».
 * (Titres à remplacer par la liste exacte fournie par l'équipe.)
 */
export const derniereMaj = "17/06/2026";

export const axes: Axe[] = [
  {
    id: 1,
    titre: "Refonte visuelle et modernisation de l'interface",
    description: "Nouvelle charte, navigation latérale, tableaux lisibles, cartes.",
    categorie: "Interface & ergonomie",
    statut: "Fait",
    avancement: 100,
    note: "Livré dans le prototype initial.",
  },
  {
    id: 2,
    titre: "Page de suivi des améliorations (cette page)",
    description: "Visualiser l'avancement de chaque axe en temps réel.",
    categorie: "Interface & ergonomie",
    statut: "Fait",
    avancement: 100,
  },
  ...Array.from({ length: 38 }, (_, i): Axe => ({
    id: i + 3,
    titre: `Axe d'amélioration n°${i + 3}`,
    description: "À préciser — en attente de la liste détaillée.",
    categorie: "À catégoriser",
    statut: "À faire",
    avancement: 0,
  })),
];
