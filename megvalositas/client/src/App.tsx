import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NotFound, Home, Register, Login } from "./pages";
import Navbar from "./components/baseUi/Navbar";
import Footer from "./components/baseUi/Footer";
import { routesConfig } from "./config/routesConfig";
import Dashboard from "./pages/Dashboard";
import GameCreationPage from "./pages/GameCreationPage";
import { useState } from "react";

function App() {
  const currentRoutes =routesConfig.hu;
  const defaultPreviewConfig = null;
  const defaultGeneratedCode = "";
  const [gameId, setGameId] = useState<string | null>(null);
  return (
    <BrowserRouter>
      <Navbar
        previewConfig={defaultPreviewConfig}
        generatedCode={defaultGeneratedCode}
        gameId={gameId}
        setGameId={setGameId}
      />
      <Routes>
        <Route path={currentRoutes.home} element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gamecreationpage" element={<GameCreationPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
 