import React, { useState, useCallback } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2, Settings, Plus, X, Trophy } from 'lucide-react';
import { analyzeBill } from './services/geminiService';
import { AnalysisResult } from './types';
import Dashboard from './components/Dashboard';

function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // Advanced Training/Context State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");
  const [contextFile, setContextFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    // Basic validation
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Ei torcedor! Envia uma imagem (JPG, PNG) ou PDF. Cartão amarelo pra você!');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await analyzeBill(file, contextFile, customInstructions);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Deu zebra! Ocorreu um erro ao processar a fatura. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [contextFile, customInstructions]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleContextFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setContextFile(e.target.files[0]);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setError(null);
  };

  // If we have results, show dashboard
  if (result) {
    return <Dashboard result={result} onReset={resetAnalysis} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-orange-200 to-red-200 flex flex-col font-sans">
      {/* Tabajara Header */}
      <header className="bg-yellow-400 border-b-4 border-red-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
           <div className="bg-red-600 p-2 rounded-full border-2 border-black transform -rotate-6 shadow-lg">
             <Trophy className="w-8 h-8 text-yellow-300" />
           </div>
           <div>
             <h1 className="text-3xl font-extrabold text-red-600 tracking-tighter drop-shadow-sm uppercase" style={{ textShadow: '1px 1px 0px #000' }}>
               Faturator Tabajara
             </h1>
             <p className="text-xs text-black font-bold uppercase tracking-widest bg-yellow-300 inline-block px-1">
               Análise de Faturas Padrão FIFA
             </p>
           </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-slate-900 mb-3 drop-shadow-sm">
              Manda a conta aí, campeão!
            </h2>
            <p className="text-slate-800 text-lg font-medium">
              A gente analisa tudo. Se vier caro, a culpa é do bandeirinha.
            </p>
          </div>

          {/* Training / Context Toggle */}
          <div className="mb-6">
             <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-bold text-red-700 hover:text-red-900 transition-colors mx-auto bg-white/50 px-4 py-2 rounded-full border border-red-200"
             >
                <Settings className="w-4 h-4" />
                {showAdvanced ? 'Esconder a Tática Secreta' : 'Configurar Tática (Contexto/Treino)'}
             </button>

             {showAdvanced && (
                <div className="mt-4 bg-white p-6 rounded-xl border-4 border-yellow-400 shadow-xl animate-in slide-in-from-top-2">
                   <h3 className="text-sm font-bold text-red-600 uppercase mb-3 flex items-center gap-2">
                     <FileText className="w-4 h-4" />
                     Prancheta do Técnico (Opcional)
                   </h3>
                   <p className="text-xs text-slate-600 mb-4 font-medium">
                     Ensine a nossa IA a jogar bonito. Mande um gabarito ou dê instruções.
                   </p>
                   
                   <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1 uppercase">Instruções pro Time</label>
                        <textarea 
                          value={customInstructions}
                          onChange={(e) => setCustomInstructions(e.target.value)}
                          placeholder="Ex: Escuta aqui, nessa fatura da Enel o valor total tá escondido lá embaixo..."
                          className="w-full text-sm p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none h-24 resize-none bg-yellow-50"
                        />
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-slate-900 mb-1 uppercase">Exemplo de Jogada (Gabarito)</label>
                         {!contextFile ? (
                           <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-red-300 rounded-lg cursor-pointer hover:bg-red-50 transition-colors bg-white">
                              <Plus className="w-4 h-4 text-red-500 mr-2" />
                              <span className="text-sm font-bold text-red-600">Subir Exemplo</span>
                              <input type="file" className="hidden" onChange={handleContextFileChange} accept="image/*,application/pdf" />
                           </label>
                         ) : (
                           <div className="flex items-center justify-between px-4 py-3 bg-red-50 border-2 border-red-200 rounded-lg">
                              <div className="flex items-center gap-2 truncate">
                                 <FileText className="w-4 h-4 text-red-600 flex-shrink-0" />
                                 <span className="text-sm font-bold text-red-800 truncate">{contextFile.name}</span>
                              </div>
                              <button onClick={() => setContextFile(null)} className="p-1 hover:bg-red-200 rounded-full transition-colors">
                                 <X className="w-4 h-4 text-red-600" />
                              </button>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
             )}
          </div>

          <div 
            className={`
              relative group cursor-pointer
              bg-white rounded-2xl border-4 border-dashed transition-all duration-300
              flex flex-col items-center justify-center py-16 px-6 shadow-2xl
              ${isDragging 
                ? 'border-red-500 bg-red-50 scale-[1.02]' 
                : 'border-slate-300 hover:border-yellow-500 hover:bg-yellow-50'
              }
              ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <input 
              type="file" 
              id="fileInput" 
              className="hidden" 
              accept="image/*,application/pdf"
              onChange={handleFileInput}
            />
            
            <div className="bg-red-100 p-4 rounded-full mb-6 group-hover:bg-yellow-200 transition-colors border-2 border-red-200 group-hover:border-yellow-400">
              <UploadCloud className={`w-12 h-12 text-red-600 group-hover:text-red-700 ${isDragging ? 'animate-bounce' : ''}`} />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Joga a fatura aqui!
            </h3>
            <p className="text-slate-500 mb-6 text-center max-w-md font-medium">
              Pode ser PDF, JPG ou PNG. <br/>
              <span className="text-xs text-red-500 uppercase font-bold">Sem impedimento!</span>
            </p>

            <div className="flex gap-4 text-xs font-black text-slate-400 uppercase tracking-wider">
              <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">PDF</span>
              <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">JPG</span>
              <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">PNG</span>
            </div>
          </div>

          {isAnalyzing && (
            <div className="mt-8 flex flex-col items-center animate-in fade-in duration-500 bg-white/80 p-6 rounded-xl border-2 border-yellow-400 shadow-lg">
               <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-3" />
               <p className="text-slate-900 font-bold text-lg">Aquecendo os motores...</p>
               <p className="text-slate-600">Nossa IA está driblando os dados.</p>
               {contextFile && <p className="text-red-600 text-xs mt-2 font-bold uppercase bg-red-100 px-2 py-1 rounded">Usando Tática Especial (Contexto)</p>}
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-100 border-2 border-red-500 rounded-xl p-4 flex items-start gap-3 text-red-900 animate-in slide-in-from-bottom-2 shadow-lg">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5 text-red-600" />
              <div>
                <h4 className="font-black text-sm uppercase">Falta Grave!</h4>
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-slate-900 border-t-4 border-yellow-400 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-yellow-400 font-bold text-lg mb-1">Faturator Tabajara &copy; {new Date().getFullYear()}</p>
          <p className="text-slate-400 text-sm">Desenvolvido com tecnologia de ponta (e muita raça) usando Google Gemini 2.5 Flash.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;