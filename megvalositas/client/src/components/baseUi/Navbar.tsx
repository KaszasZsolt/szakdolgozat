import { motion } from "framer-motion";
import { navLinks } from "../../constants";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { routesConfig } from "../../config/routesConfig";
import GameSaveSection from "../game/GameSaveSection";
import { GameConfig } from "../../utils/GameEngine";
import { useGameSession } from "../../hooks/useGameSession";

interface NavbarProps {
  previewConfig?: GameConfig | null;
  generatedCode?: string;
  gameId?: string | null;
  setGameId?: (id: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  previewConfig = null,
  generatedCode = "",
  gameId = null,
  setGameId = () => {}
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language || "hu";
  const currentRoutes = routesConfig[currentLang as "hu"] || routesConfig.hu;
  const [isOpen, setIsOpen] = useState(false);
  const path = useLocation();

  const { resetGameSession, gameName, roomCode } = useGameSession();

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    resetGameSession();               
    navigate("/login");
  };

  return (
    <motion.nav
      className="w-full h-16 fixed top-0 left-0 bg-white shadow-md flex items-center justify-between px-4 z-50"
      initial="hidden"
      animate="visible"
      custom={0}
    >
      {/* Cégnév: IDE hívd meg a resetGameSession-t, ha rákattintanak */}
      <Link to={currentRoutes.home} onClick={() => resetGameSession()}>
        <motion.h1 className="sm:text-5xl text-3xl cursor-pointer font-brush text-primary">
          {t("navbar.company")}
        </motion.h1>
      </Link>

      {/* Asztali mentési gombok: csak sm felett */}
      <div className="hidden sm:flex flex-1 justify-center">
        {path.pathname === "/gamecreationpage" && previewConfig ? (
          <GameSaveSection
            previewConfig={previewConfig}
            generatedCode={generatedCode}
            gameId={gameId}
            setGameId={setGameId}
          />
        ) : (
          gameName && (
            <div className="flex flex-col items-center">
              <div className="text-xl font-semibold text-primary">{gameName}</div>
              {roomCode && (
                <div className="text-sm font-medium text-gray-500 mt-1">
                  Szoba kód: {roomCode}
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Asztali menü (jobb oldalon): csak sm felett */}
      <ul className="hidden sm:flex items-center space-x-6">
        {isLoggedIn ? (
          <>
            <Link to={currentRoutes.dashboard} onClick={() => resetGameSession()}>
              <li className="text-base text-primary font-medium cursor-pointer hover:text-gray-600">
                {t("navbar.dashboard", "Főoldal")}
              </li>
            </Link>
            <Link to={currentRoutes.game}>
              <li className="text-base text-primary font-medium cursor-pointer hover:text-gray-600">
                {t("navbar.play_game", "Játék")}
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
              <Link
                to={currentRoutes.dashboard}
                onClick={() => {
                  resetGameSession();
                  setIsOpen(false);
                }}
              >
                <li className="px-4 py-3 border-b border-gray-700 hover:bg-gray-800">
                  {t("navbar.dashboard", "Főoldal")}
                </li>
              </Link>
              <Link to={currentRoutes.game} onClick={() => setIsOpen(false)}>
                <li className="px-4 py-3 border-b border-gray-700 hover:bg-gray-800">
                  {t("navbar.play_game", "Játék")}
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
                  handleLogout();
                  setIsOpen(false);
                }}
              >
                {t("navbar.logout", "Kijelentkezés")}
              </li>
            </>
          ) : (
            navLinks.map((nav) => (
              <Link
                key={nav.id}
                to={currentRoutes[nav.id as "home"]}
                onClick={() => setIsOpen(false)}
              >
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
