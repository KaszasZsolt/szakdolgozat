import { motion } from "framer-motion";
import { navLinks } from "../../constants";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { routesConfig } from "../../config/routesConfig";
import GameSaveSection from "../game/GameSaveSection";
import { GameConfig } from "../../utils/GameEngine";

interface NavbarProps {
  previewConfig?: GameConfig | null;
  generatedCode?: string;
  gameId?: string | null;
  setGameId?: (id: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  previewConfig = null,
  generatedCode = '',
  gameId = null,
  setGameId = () => {}
}) => {
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
      className="w-full h-16 fixed top-0 left-0 bg-white shadow-md flex items-center justify-between px-4 z-50"
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

      {/* Asztali mentési gombok: csak sm felett */}
      <div className="hidden sm:flex flex-1 justify-center">
        {path.pathname === "/gamecreationpage" && previewConfig && (
          <GameSaveSection
            previewConfig={previewConfig}
            generatedCode={generatedCode}
            gameId={gameId}
            setGameId={setGameId}
          />
        )}
      </div>

      {/* Asztali menü (jobb oldalon): csak sm felett */}
      <ul className="hidden sm:flex items-center space-x-6">
        {isLoggedIn ? (
          <>
            {/* Bejelentkezett felhasználóknak: dashboard (Főoldal), Játék készítés, majd kijelentkezés */}
            <Link to={currentRoutes.dashboard}>
              <li className="text-base text-primary font-medium cursor-pointer hover:text-gray-600">
                {t("navbar.dashboard", "Főoldal")}
              </li>
            </Link>
            <Link to={currentRoutes.gameCreation}>
              <li className="text-base text-primary font-medium cursor-pointer hover:text-gray-600">
                {t("navbar.game_creation", "Játék készítés")}
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
        <button onClick={() => setIsOpen(!isOpen)} className="text-primary text-2xl">
          ☰
        </button>
      </div>

      {/* Mobil lenyíló menü */}
      {isOpen && (
        <ul className="absolute top-full right-4 bg-black text-white shadow-md w-48 rounded-lg sm:hidden z-50">
          {isLoggedIn ? (
            <>
              <Link to={currentRoutes.dashboard} onClick={() => setIsOpen(false)}>
                <li className="px-4 py-3 border-b border-gray-700 hover:bg-gray-800">
                  {t("navbar.dashboard", "Főoldal")}
                </li>
              </Link>
              <Link to={currentRoutes.gameCreation} onClick={() => setIsOpen(false)}>
                <li className="px-4 py-3 border-b border-gray-700 hover:bg-gray-800">
                  {t("navbar.game_creation", "Játék készítés")}
                </li>
              </Link>
              <li
                className="px-4 py-3 border-b border-gray-700 hover:bg-gray-800 cursor-pointer"
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
                <li className="px-4 py-3 border-b border-gray-700 hover:bg-gray-800">
                  {t(nav.title)}
                </li>
              </Link>
            ))
          )}
          {path.pathname === "/gamecreationpage" && previewConfig && (
            <li className="px-4 py-3 hover:bg-gray-800">
              <GameSaveSection
                previewConfig={previewConfig}
                generatedCode={generatedCode}
                gameId={gameId}
                setGameId={setGameId}
              />
            </li>
          )}
        </ul>
      )}
    </motion.nav>
  );
};

export default Navbar;
