import { motion } from "framer-motion";
import { navLinks } from "../constants";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { routesConfig } from "../config/routesConfig";

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language || 'hu';
  const currentRoutes = routesConfig[currentLang as 'hu'] || routesConfig.hu;
  const [isOpen, setIsOpen] = useState(false);
  const path = useLocation();

  // Ellenőrizzük, hogy a felhasználó be van-e jelentkezve a token alapján
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  // Kijelentkezés: token törlése és navigáció a bejelentkezési oldalra
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <motion.nav 
      className="w-full h-16 fixed top-0 left-0 bg-white shadow-md flex items-center z-50"
      initial="hidden"
      animate="visible"
      custom={0}
    >
      {/* Cégnév */}
      <Link to={currentRoutes.home}>
        <motion.h1 className="sm:text-5xl text-3xl cursor-pointer font-brush text-primary">
          {t("navbar.company")}
        </motion.h1>
      </Link>
      
      {/* Asztali menü */}
      <ul className="hidden sm:flex flex-1 justify-end items-center space-x-6">
        {isLoggedIn ? (
          <>
            {/* Ha be van jelentkezve, akkor a dashboard (főoldal) és a kijelentkezés linkje jelenjen meg */}
            <Link to={currentRoutes.dashboard}>
              <li className="text-base text-primary font-medium cursor-pointer hover:text-gray-600">
                {t("navbar.dashboard", "Főoldal")}
              </li>
            </Link>
            <li 
              className="text-base text-primary font-medium cursor-pointer hover:text-gray-600"
              onClick={handleLogout}
            >
              {t("navbar.logout", "Kijelentkezés")}
            </li>
          </>
        ) : (
          // Ha nincs bejelentkezve, akkor a login és register linkek jelennek meg
          navLinks.map((nav) => (
            <Link key={nav.id} to={currentRoutes[nav.id as 'home']}>
              <li className="text-base text-primary font-medium cursor-pointer hover:text-gray-600">
                {t(nav.title)}
              </li>
            </Link>
          ))
        )}
      </ul>
      
      {/* Mobil menü */}
      <div className="sm:hidden">
        <button onClick={() => setIsOpen(!isOpen)} className="text-primary text-2xl">☰</button>
        {isOpen && (
          <ul className="absolute top-full right-0 bg-white shadow-md w-48 rounded-lg">
            {isLoggedIn ? (
              <>
                <Link to={currentRoutes.dashboard} onClick={() => setIsOpen(false)}>
                  <li className="px-4 py-3 border-b hover:bg-gray-100">
                    {t("navbar.dashboard", "Főoldal")}
                  </li>
                </Link>
                <li 
                  className="px-4 py-3 border-b hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                >
                  {t("navbar.logout", "Kijelentkezés")}
                </li>
              </>
            ) : (
              navLinks.map((nav) => (
                <Link key={nav.id} to={currentRoutes[nav.id as 'home']} onClick={() => setIsOpen(false)}>
                  <li className="px-4 py-3 border-b hover:bg-gray-100">{t(nav.title)}</li>
                </Link>
              ))
            )}
          </ul>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
