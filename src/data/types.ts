// Domain model mirroring Neosys (SEL - Gestion Projet Sud), modernized.

export type StatutOrganisation = "Actif" | "En cours" | "Inactif" | "Prospect";

export type TypeOrganisation =
  | "ONG locale"
  | "Église / Mission"
  | "Association"
  | "Institution"
  | "Collectivité";

export type Secteur =
  | "Éducation"
  | "Santé"
  | "Eau & Assainissement"
  | "Sécurité alimentaire"
  | "Agriculture"
  | "Développement spirituel"
  | "Aide d'urgence"
  | "Développement communautaire";

// Project lifecycle as shown by the top tabs of the partner sheet.
export type EtapeProjet =
  | "Pré-instruction"
  | "Instruction"
  | "Versements à venir"
  | "Suivi des projets"
  | "Clôturé";

export type StatutProjet =
  | "En cours"
  | "Planifié"
  | "Terminé"
  | "Suspendu"
  | "Refusé";

export interface Membre {
  id: string;
  nom: string;
  fonction: string;
  email: string;
  telephone: string;
}

export interface Adresse {
  rue: string;
  ville: string;
  region: string;
  codePostal: string;
  pays: string;
}

export interface Organisation {
  id: string;
  sigle: string;
  libelle: string;
  type: TypeOrganisation;
  pays: string;
  paysIso: string; // ISO 3166 alpha-3
  statut: StatutOrganisation;
  montantAlloue: number; // EUR cumulative
  depuis: string; // ISO date
  description: string;
  siteWeb?: string;
  adresse: Adresse;
  membres: Membre[];
  secteurs: Secteur[];
  noteFiabilite: number; // 0-5
  projets: string[]; // project ids
}

export interface Versement {
  id: string;
  date: string;
  montant: number;
  devise: string;
  statut: "À venir" | "Versé" | "En attente";
  libelle: string;
}

export interface Decision {
  id: string;
  date: string;
  instance: string;
  decision: "Accepté" | "Refusé" | "En attente" | "Reporté";
  montant?: number;
  commentaire: string;
}

export interface Jalon {
  id: string;
  titre: string;
  echeance: string;
  fait: boolean;
}

export interface Projet {
  id: string;
  code: string; // PJ SEL, e.g. DT2617
  titre: string;
  organisationId: string;
  etape: EtapeProjet;
  statut: StatutProjet;
  secteur: Secteur;
  pays: string;
  paysIso: string;
  ville: string;
  region: string;
  coordinateur: string;
  nbBeneficiaires: number;
  respectNonDiscrimination: boolean;
  profilBeneficiaires: string;
  montantAlloue: number;
  consomme: number;
  devise: string;
  dateDebut: string;
  dateFin: string;
  avancement: number; // 0-100
  description: string; // "Description" tab
  moyens: string; // "Moyens" tab
  jalons: Jalon[];
  decisions: Decision[];
  versements: Versement[];

  // --- Onglet Contrôle ---
  milieu?: string; // Le milieu (géographique, social, politique, son histoire)
  historiqueRecommandations?: string;

  // --- Onglet Description ---
  objectifs?: string;
  activites?: string;
  classementCocodev?: string;
  classementOcde?: string;
  classementPnud?: string;
  classementSel?: string;
  composanteAutonome?: boolean;
  debutDesFinancement?: boolean;
  dateDebutRealisation?: string;
  dateFinRealisation?: string;

  // --- Onglet Moyens ---
  moyensMateriels?: string;
  moyensHumains?: string;
  nbVersementsPlanifies?: number;
  nbAutresBailleurs?: number;
  apportPartenaire?: number;
  apportSollicite?: number;
  apportAutresBailleurs?: number;
  deviseLocale?: string;

  // --- Onglet Décisions ---
  decisionCpd?: "En instruction" | "Accepté" | "Refusé";
  dateSoumissionCpd?: string;
  acceptationSousCondition?: boolean;
  conditionLevee?: boolean;
  descriptionCondition?: string;
  acceptationSousRecommandation?: boolean;
  descriptionRecommandation?: string;
  montantAlloueCpd?: number;
  versementRecurrent?: boolean;
  nbVersementsAnnuel?: number;
  versementsPlanifies?: VersementPlanifie[];
  conditionProchainVersement?: string;

  // Détails de change associés à certains montants (clé = nom du champ).
  montantsDetails?: Record<string, MontantDetail>;

  // --- Onglet Correspondance ---
  correspondances?: Correspondance[];

  // --- Onglet Décisions : suivi du protocole ---
  protocole?: EtapeProtocole[];

  // --- Onglet Suivi ---
  suiviEvenements?: SuiviEvenement[];
  projetTermine?: boolean;
  dateDebutRealisee?: string;
}

// Détail de change d'un montant (fenêtre « Modification d'un montant »).
export interface MontantDetail {
  date?: string;
  taux?: number; // cours de change planifié/choisi/effectif
  frais?: number;
  deviseBase?: string;
  deviseCible?: string;
}

export interface VersementPlanifie {
  id: string;
  date: string;
  montant: number;
  taux?: number;
  frais?: number;
  deviseBase?: string;
  deviseCible?: string;
}

export interface EtapeProtocole {
  id: string;
  label: string;
  date?: string;
  // Si vrai, la date est affichée dans la fiche CPD générée (onglet Documents).
  afficherCpd: boolean;
}

export interface Correspondance {
  id: string;
  date: string;
  type: "Courrier" | "E-mail" | "Appel" | "Réunion";
  objet: string;
  auteur: string;
}

export type TypeEvenementSuivi = "Versement" | "Rapport" | "Visite" | "Évaluation";

export interface SuiviEvenement {
  id: string;
  date: string;
  type: TypeEvenementSuivi;
  infos: string;
  commentaire: string;
}

export type StatutDocument = "Brouillon" | "Généré" | "Validé" | "Envoyé";

export interface ModeleDocument {
  id: string;
  nom: string;
  description: string;
  champs: string[];
}

export interface Document {
  id: string;
  nom: string;
  modeleId: string;
  organisationId?: string;
  projetId?: string;
  statut: StatutDocument;
  creeLe: string;
  auteur: string;
}

export interface Activite {
  id: string;
  date: string;
  auteur: string;
  type: "organisation" | "projet" | "document" | "systeme";
  texte: string;
}
