import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NotFound, Home, Register, Login } from "./pages";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { routesConfig } from "./config/routesConfig";
import Dashboard from "./pages/Dashboard";

function App() {
  const currentRoutes =routesConfig.hu;
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path={currentRoutes.home} element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
