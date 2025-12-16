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
    // 🛡️ ESCUDO DE SEGURIDAD (CRUCIAL)
    // Si no hay dirección del contrato o no hay Metamask, NO HACEMOS NADA.
    // Esto evita el error "invalid value for Contract target".
    if (!contractAddress || !window.ethereum) return;

    const fetchHistory = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, DonacionesABI.abi, provider);

        // 1. Filtro del evento
        const filter = contract.filters.NuevaDonacion();
        
        // 2. Traemos eventos (últimos 10k bloques para ser rápidos)
        const events = await contract.queryFilter(filter, -10000, "latest");

        // 3. Formateamos
        const history = await Promise.all(events.map(async (event) => {
            const block = await event.getBlock();
            return {
                // Indices: 0:Cedula, 1:Nombres, 2:Apellidos, 3:Monto
                cedula: event.args[0],
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

    // Ejecutamos la carga inicial
    fetchHistory();
    
    // --- LISTENER EN TIEMPO REAL (Ahora está protegido por el if inicial) ---
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, DonacionesABI.abi, provider);
    
    const listener = (cedula, nom, ape, monto, event) => {
        setDonations(prev => [{
            cedula,
            nombreCompleto: `${nom} ${ape}`,
            monto: ethers.formatEther(monto),
            timestamp: "Hace un momento",
            hash: event.log.transactionHash
        }, ...prev]);
    };

    contract.on("NuevaDonacion", listener);

    // Limpieza al desmontar
    return () => {
        contract.off("NuevaDonacion", listener);
    };

  }, [contractAddress]); // Se reinicia solo si cambia la dirección

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
           <p className="text-center text-gray-500 py-4">Aún no hay donaciones. ¡Sé el primero!</p>
        ) : (
           donations.map((don, idx) => (
            <div key={don.hash + idx} className="mb-3 last:mb-0 p-3 rounded-lg bg-black/20 border border-white/5 hover:border-orange-500/30 transition-colors flex justify-between items-center">
                <div>
                    <div className="text-sm font-bold text-gray-200">
                        {don.nombreCompleto}
                    </div>
                    <div className="text-xs text-gray-500">
                        {don.timestamp} • {don.cedula}
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