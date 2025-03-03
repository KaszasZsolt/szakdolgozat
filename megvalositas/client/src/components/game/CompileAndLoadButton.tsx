import React, { useState } from 'react';
import { transpileInBrowser } from '../../utils/transpile';

interface CompileAndLoadButtonProps {
  tsCode: string;
  className: string;
  onSuccess?: () => void;
}

const CompileAndLoadButton: React.FC<CompileAndLoadButtonProps> = ({ tsCode, className, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompile = async () => {
    setLoading(true);
    setError('');
    try {
      const jsCode = await transpileInBrowser(tsCode);
      eval(jsCode);
      if (!(window as any)[className]) {
        throw new Error(`A ${className} osztály nem regisztrálódott a globális scope-ban.`);
      }
      
      alert("Sikeres fordítás és betöltés!");
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      console.error("Fordítási hiba:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '1rem 0' }}>
      <button 
        onClick={handleCompile} 
        disabled={loading} 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {loading ? "Fordítás folyamatban..." : "Fordítás & Betöltés"}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default CompileAndLoadButton;
