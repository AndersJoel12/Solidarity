import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import DonacionesABI from '../contracts/Donaciones.json';

// --- COLORES TEMA ---
const THEME = {
    orange: '#F97316',
    darkBg: '#1f2937', 
    textWhite: '#ffffff',
    textGray: '#9ca3af'
};

const DonationsList = ({ contractAddress }) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🛡️ SEGURIDAD
    if (!contractAddress || !window.ethereum) return;

    const fetchHistory = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, DonacionesABI.abi, provider);

        const filter = contract.filters.NuevaDonacion();
        
        // Calculamos bloque inicial seguro
        const currentBlock = await provider.getBlockNumber();
        const startBlock = Math.max(0, currentBlock - 5000);
        
        const events = await contract.queryFilter(filter, startBlock, "latest");

        const history = await Promise.all(events.map(async (event) => {
            const block = await event.getBlock();
            return {
                // 🛑 CORRECCIÓN AQUÍ: Usamos String() para evitar que explote si viene un objeto
                cedula: String(event.args[0]), 
                nombreCompleto: `${event.args[1]} ${event.args[2]}`, 
                monto: ethers.formatEther(event.args[3]), 
                timestamp: block ? new Date(block.timestamp * 1000).toLocaleDateString() : "-",
                hash: event.transactionHash
            };
        }));

        setDonations(history.reverse()); 
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
    
    // Listener corregido para manejar los argumentos
    const listener = (cedula, nom, ape, monto, event) => {
        // En Ethers v6, el último argumento es el objeto del evento
        // A veces el evento viene como el 5to argumento, a veces dentro del 4to.
        // Verificamos si 'event' existe, si no, usamos 'monto' si es que ahí cayó el objeto Log.
        const log = event || monto; 
        const hashReal = log && log.log ? log.log.transactionHash : "Tx reciente";

        setDonations(prev => [{
            cedula: String(cedula), // Forzamos a String
            nombreCompleto: `${nom} ${ape}`,
            monto: ethers.formatEther(monto),
            timestamp: "Hace un momento",
            hash: hashReal
        }, ...prev]);
    };

    contract.on("NuevaDonacion", listener);

    return () => {
        contract.off("NuevaDonacion", listener);
    };

  }, [contractAddress]);

  return (
    <div className="w-full max-w-[480px] mx-auto mt-8 rounded-2xl p-6 border border-gray-700 shadow-2xl" 
         style={{ backgroundColor: THEME.darkBg }}>
      
      <h3 className="text-xl font-bold mb-4 flex justify-between items-center text-white border-b border-gray-700 pb-2">
        <span>📜 Últimas Donaciones</span>
        <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 rounded-full border border-orange-500/50">
            {donations.length} total
        </span>
      </h3>
      
      <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
           <p className="text-center text-gray-500 py-4 animate-pulse">Cargando bloques...</p>
        ) : donations.length === 0 ? (
           <p className="text-center text-gray-500 py-4">Aún no hay donaciones.</p>
        ) : (
           donations.map((don, idx) => (
            // Usamos idx en la key por seguridad si el hash se repite o falla
            <div key={`${don.hash}-${idx}`} className="mb-3 last:mb-0 p-3 rounded-lg bg-black/20 border border-white/5 hover:border-orange-500/30 transition-colors flex justify-between items-center">
                <div>
                    <div className="text-sm font-bold text-gray-200">
                        {don.nombreCompleto}
                    </div>
                    <div className="text-xs text-gray-500 flex flex-col">
                        <span>{don.timestamp}</span>
                        {/* Renderizamos la cédula con cuidado */}
                        <span className="text-[10px] opacity-70">
                            ID: {don.cedula.length > 20 ? "Hash Oculto" : don.cedula}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-orange-500 font-bold font-mono">
                        +{don.monto} ETH
                    </div>
                    <a href={`https://etherscan.io/tx/${don.hash}`} target="_blank" rel="noreferrer" className="text-[10px] text-gray-600 hover:text-white underline">
                        Ver Hash
                    </a>
                </div>
            </div>
           ))
        )}
      </div>
    </div>
  );
};

export default DonationsList;