import Navbar from "./Navbar";
import { useState } from "react";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const defaultPreviewConfig = null; // or your desired default config
  const defaultGeneratedCode = "";
  const [gameId, setGameId] = useState<string | null>(null);
  return (
    <div className="flex flex-col">
     <Navbar
        previewConfig={defaultPreviewConfig}
        generatedCode={defaultGeneratedCode}
        gameId={gameId}
        setGameId={setGameId}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default Layout;
