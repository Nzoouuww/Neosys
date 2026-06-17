import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Partenaires from "./pages/Partenaires";
import PartenaireDetail from "./pages/PartenaireDetail";
import Projets from "./pages/Projets";
import ProjetDetail from "./pages/ProjetDetail";
import Documents from "./pages/Documents";
import Personnes from "./pages/Personnes";
import Statistiques from "./pages/Statistiques";
import Projet from "./pages/Projet";
import Ameliorations from "./pages/Ameliorations";
import Parametres from "./pages/Parametres";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/projet" replace />} />
          <Route path="projet" element={<Projet />} />
          <Route path="tableau-de-bord" element={<Dashboard />} />
          <Route path="partenaires" element={<Partenaires />} />
          <Route path="partenaires/:id" element={<PartenaireDetail />} />
          <Route path="projets" element={<Projets />} />
          <Route path="projets/:id" element={<ProjetDetail />} />
          <Route path="documents" element={<Documents />} />
          <Route path="personnes" element={<Personnes />} />
          <Route path="statistiques" element={<Statistiques />} />
          <Route path="ameliorations" element={<Ameliorations />} />
          <Route path="parametres" element={<Parametres />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
