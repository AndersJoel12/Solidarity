import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import DonacionesABI from '../contracts/Donaciones.json';

const THEME = {
    orange: '#F97316',
    darkBg: '#1f2937', 
    textWhite: '#ffffff',
    textGray: '#9ca3af',
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32'
};

const DonationsList = ({ contractAddress }) => {
  const [donations, setDonations] = useState([]);       // Lista Cronológica
  const [topDonations, setTopDonations] = useState([]); // Lista Top (Leaderboard)
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar qué pestaña vemos: 'recent' o 'top'
  const [viewMode, setViewMode] = useState('recent'); 

  useEffect(() => {
    if (!contractAddress || !window.ethereum) return;

    const fetchHistory = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, DonacionesABI.abi, provider);

        const filter = contract.filters.NuevaDonacion();
        const currentBlock = await provider.getBlockNumber();
        const startBlock = Math.max(0, currentBlock - 5000);
        
        const events = await contract.queryFilter(filter, startBlock, "latest");

        const history = await Promise.all(events.map(async (event) => {
            const block = await event.getBlock();
            return {
                wallet: event.args[0],
                nombreCompleto: `${event.args[2]} ${event.args[3]}`, 
                monto: ethers.formatEther(event.args[4]), 
                rawMonto: parseFloat(ethers.formatEther(event.args[4])), // Para ordenar numéricamente
                timestamp: block ? new Date(block.timestamp * 1000).toLocaleDateString() : "-",
                hash: event.transactionHash
            };
        }));

        // 1. LISTA RECIENTE (Limitada a 10)
        // Invertimos y cortamos los primeros 10
        setDonations([...history].reverse().slice(0, 10));

        // 2. LEADERBOARD (Limitado a 10)
        // Ordenamos por monto y cortamos los primeros 10
        const top = [...history]
            .sort((a, b) => b.rawMonto - a.rawMonto)
            .slice(0, 10); 
        setTopDonations(top);

      } catch (error) {
        console.error("Error cargando historial:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    
    // --- LISTENER EN TIEMPO REAL ---
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, DonacionesABI.abi, provider);
    
    const listener = (wallet, cedula, nom, ape, monto, fecha, event) => {
        const log = event || monto; 
        const hashReal = log && log.log ? log.log.transactionHash : "Tx reciente";
        const montoEth = ethers.formatEther(monto);

        const nuevaDonacion = {
            wallet: wallet,
            nombreCompleto: `${nom} ${ape}`,
            monto: montoEth,
            rawMonto: parseFloat(montoEth),
            timestamp: "Hace un momento",
            hash: hashReal
        };

        // Actualizamos Recientes (Agregamos la nueva y cortamos a 10)
        setDonations(prev => [nuevaDonacion, ...prev].slice(0, 10));
        
        // Actualizamos Top (Reordenamos y cortamos a 10)
        setTopDonations(prevTop => {
            const nuevaLista = [...prevTop, nuevaDonacion]
                .sort((a, b) => b.rawMonto - a.rawMonto)
                .slice(0, 10);
            return nuevaLista;
        });
    };

    contract.on("NuevaDonacion", listener);

    return () => {
        contract.off("NuevaDonacion", listener);
    };

  }, [contractAddress]);

  // Función auxiliar para medallas
  const renderMedal = (index) => {
      if (index === 0) return <span className="text-xl">🥇</span>;
      if (index === 1) return <span className="text-xl">🥈</span>;
      if (index === 2) return <span className="text-xl">🥉</span>;
      return <span className="font-bold text-gray-500 w-6 text-center">{index + 1}</span>;
  };

  return (
    <div className="w-full max-w-[480px] mx-auto mt-8 rounded-2xl p-6 border border-gray-700 shadow-2xl" 
         style={{ backgroundColor: THEME.darkBg }}>
      
      {/* --- BOTONES DE PESTAÑAS (TABS) --- */}
      <div className="flex bg-black/30 p-1 rounded-xl mb-4">
          <button 
            onClick={() => setViewMode('recent')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'recent' 
                ? 'bg-orange-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🕒 Recientes (10)
          </button>
          <button 
            onClick={() => setViewMode('top')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'top' 
                ? 'bg-orange-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🏆 Top 10
          </button>
      </div>

      {/* --- CONTENIDO DE LA LISTA --- */}
      <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
           <p className="text-center text-gray-500 py-4 animate-pulse">Cargando datos...</p>
        ) : (
            (viewMode === 'recent' ? donations : topDonations).length === 0 ? (
                <p className="text-center text-gray-500 py-4">Aún no hay donaciones.</p>
            ) : (
                (viewMode === 'recent' ? donations : topDonations).map((don, idx) => (
                    <div key={`${don.hash}-${idx}`} className={`mb-3 last:mb-0 p-3 rounded-lg border transition-colors flex justify-between items-center ${
                        viewMode === 'top' && idx < 3 
                            ? 'bg-orange-500/10 border-orange-500/30' // Estilo especial para el Top 3
                            : 'bg-black/20 border-white/5 hover:border-orange-500/30'
                    }`}>
                        <div className="flex items-center gap-3">
                            {/* Si es Top, mostramos medalla o número */}
                            {viewMode === 'top' && (
                                <div className="shrink-0">
                                    {renderMedal(idx)}
                                </div>
                            )}

                            <div>
                                <div className="text-sm font-bold text-gray-200">
                                    {don.nombreCompleto}
                                </div>
                                <div className="text-xs text-gray-500 flex flex-col">
                                    <span>{don.timestamp}</span>
                                    {don.wallet && (
                                        <span className="text-[10px] text-orange-300 font-mono opacity-80">
                                            {don.wallet.substring(0, 6)}...{don.wallet.substring(38)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className={`font-bold font-mono ${viewMode === 'top' && idx < 3 ? 'text-yellow-400 text-lg' : 'text-orange-500'}`}>
                                +{don.monto} ETH
                            </div>
                            <a href={`https://etherscan.io/tx/${don.hash}`} target="_blank" rel="noreferrer" className="text-[10px] text-gray-600 hover:text-white underline">
                                Ver Hash
                            </a>
                        </div>
                    </div>
                ))
            )
        )}
      </div>
    </div>
  );
};

export default DonationsList;