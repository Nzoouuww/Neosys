import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Partenaires from "./pages/Partenaires";
import PartenaireDetail from "./pages/PartenaireDetail";
import Projets from "./pages/Projets";
import ProjetDetail from "./pages/ProjetDetail";
import Documents from "./pages/Documents";
import Personnes from "./pages/Personnes";
import Statistiques from "./pages/Statistiques";
import Parametres from "./pages/Parametres";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="partenaires" element={<Partenaires />} />
          <Route path="partenaires/:id" element={<PartenaireDetail />} />
          <Route path="projets" element={<Projets />} />
          <Route path="projets/:id" element={<ProjetDetail />} />
          <Route path="documents" element={<Documents />} />
          <Route path="personnes" element={<Personnes />} />
          <Route path="statistiques" element={<Statistiques />} />
          <Route path="parametres" element={<Parametres />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
