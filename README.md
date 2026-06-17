# Néosys — prototype modernisé (Gestion Projet Sud)

Prototype cliquable et interactif d'une refonte modernisée de **Néosys**, le logiciel
de gestion des partenaires et projets de développement du SEL.

Il reproduit fidèlement les écrans existants (liste des organisations porteuses,
fiche partenaire, fiche projet) tout en proposant une interface web moderne.

## Modules

- **Tableau de bord** — KPIs, budget par secteur, projets par étape, activité récente.
- **Partenaires** — liste filtrable (Sigle, Libellé, Pays ISO 3166, Montant alloué)
  et fiche détaillée (Détails, Adresses-contact, Membres, Documents, Projets) avec
  les onglets Suivi des projets / Versements à venir / Statistiques.
- **Projets** — liste + fiche avec sous-onglets Contrôle, Description, Moyens,
  Décisions, Documents, Suivi, Correspondance.
- **Documents** — modèles et générateur de documents pré-remplis.
- **Personnes**, **Statistiques**, **Paramètres**.

> Les données affichées sont fictives (jeu de démonstration).

## Stack

React 19 · TypeScript · Vite · Tailwind CSS · React Router · Recharts · lucide-react.

## Démarrer en local

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run build              # build statique classique -> dist/
SINGLE_FILE=1 npm run build  # bundle tout dans un seul dist/index.html partageable
```

Le routage utilise `HashRouter`, donc le build fonctionne sur n'importe quel
hébergement statique (et même en ouvrant directement le fichier `index.html`).
