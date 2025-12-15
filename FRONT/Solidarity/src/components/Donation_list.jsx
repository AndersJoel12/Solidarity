import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import DonacionesABI from '../contracts/Donaciones.json';

const donacionesAddress = "0xFcE0405b3119028159cfB0EB1F115773edfE807F"; 

const DonationsList = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      // 1. Verificación básica
      if (!window.ethereum) {
        setLoading(false);
        return;
      }

      try {
        console.log("Iniciando carga de historial...");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(donacionesAddress, DonacionesABI.abi, provider);

        // 2. Definir Filtro
        const filter = contract.filters.NuevaDonacion();

        // 3. OBTENER EVENTOS (CORRECCIÓN IMPORTANTE)
        // En lugar de buscar desde el principio de los tiempos (que falla),
        // buscamos en los últimos 50,000 bloques o desde el despliegue.
        // Si usas "undefined" en los argumentos, busca todo (riesgoso).
        // Probamos buscar TODO pero manejando el error si es muy grande.
        let events = [];
        try {
            // Intenta traer todo el historial
            events = await contract.queryFilter(filter);
        } catch (e) {
            console.warn("Error leyendo todo el historial, intentando últimos 10,000 bloques...");
            // Si falla, trae solo lo reciente (fallback)
            events = await contract.queryFilter(filter, -10000, "latest");
        }

        console.log(`Se encontraron ${events.length} eventos.`);

        if (events.length === 0) {
            setDonations([]);
            setLoading(false);
            return;
        }

        // 4. Formatear datos (Con cuidado del Rate Limit)
        // Procesamos los eventos para obtener el timestamp
        const history = await Promise.all(events.map(async (event) => {
          try {
            // Intentamos obtener el bloque
            const block = await event.getBlock();
            
            return {
              donante: event.args[0], 
              monto: ethers.formatEther(event.args[1]), 
              // Si falla getBlock, usamos la fecha actual como fallback
              timestamp: block ? new Date(block.timestamp * 1000).toLocaleString() : "Fecha desconocida", 
              hash: event.transactionHash
            };
          } catch (err) {
            console.error("Error obteniendo bloque individual:", err);
            return null; // Retornamos null si falla uno individual
          }
        }));

        // Filtramos los nulos (por si alguno falló) y ordenamos
        const cleanHistory = history.filter(item => item !== null).reverse();
        
        setDonations(cleanHistory);

      } catch (error) {
        console.error("Error CRÍTICO cargando el historial:", error);
        setErrorMsg("Error de conexión con Blockchain");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="
      bg-white/80 backdrop-blur-xl border border-white/90 
      rounded-3xl p-8 w-full max-w-[480px] shadow-xl mt-5 
      max-h-[400px] overflow-y-auto scrollbar-hide
    ">
      <h3 className="text-slate-800 text-xl font-extrabold mb-5 border-b-2 border-slate-100 pb-3 flex justify-between items-center">
        <span>Historial de Donaciones</span>
        {!loading && <span className="text-xs bg-slate-200 text-slate-500 px-2 py-1 rounded-full">{donations.length} total</span>}
      </h3>
      
      {loading ? (
        <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-2"></div>
            <p className="text-slate-400 text-sm">Escaneando Blockchain...</p>
        </div>
      ) : errorMsg ? (
        <div className="text-center text-red-400 p-5 bg-red-50 rounded-xl">
           ⚠️ {errorMsg} <br/>
           <span className="text-xs text-red-300">Revisa la consola (F12)</span>
        </div>
      ) : donations.length === 0 ? (
        <div className="text-center text-slate-400 italic p-5">
           No se encontraron donaciones históricas.
        </div>
      ) : (
        <div className="space-y-3">
          {donations.map((don) => (
            <div 
              key={don.hash} 
              className="
                bg-slate-50 border border-slate-200 rounded-2xl p-4 
                flex justify-between items-center 
                transition-all duration-500 hover:shadow-md hover:bg-white
              "
            >
              <div>
                <div className="text-sm text-slate-500 font-medium">
                  {don.donante.substring(0, 6)}...{don.donante.substring(38)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {don.timestamp}
                </div>
              </div>
              <div className="text-sky-600 font-bold text-lg">
                + {don.monto} <span className="text-xs text-sky-400">ETH</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationsList;