import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './pages/i18n.ts'
import { GameSessionProvider } from "./context/GameSessionProvider";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameSessionProvider>
      <App />
    </GameSessionProvider>
  </React.StrictMode>,
)
