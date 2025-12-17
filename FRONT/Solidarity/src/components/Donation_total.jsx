import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import '../components/Tailwind.css'; 
import { DONACIONES_ADDRESS } from '../config';

const Donation_total = () => {
    // 1. ESTADOS
    const [totalEth, setTotalEth] = useState("0.0");
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(""); 

    const contractAddress = DONACIONES_ADDRESS; 

    // ⚠️ ABI ACTUALIZADO: Agregamos el "event" para poder escucharlo
    const abi = [
        "function totalRecaudado() view returns (uint256)",
        "event NuevaDonacion(address donante, string cedula, string nombres, string apellidos, uint256 monto, uint256 fecha)"
    ];

    // 3. LÓGICA
    // Agregamos un parametro 'silent' para no mostrar el "Cargando..." cuando es automático
    const obtenerTotal = async (silent = false) => {
        if (!silent) setLoading(true); // Solo mostramos spinner si es carga manual o inicial
        setErrorMsg(""); 

        try {
            if (!ethers.isAddress(contractAddress)) {
                throw new Error("Dirección de contrato inválida");
            }

            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const contrato = new ethers.Contract(contractAddress, abi, provider);

                const totalWei = await contrato.totalRecaudado();
                const totalFormateado = ethers.formatEther(totalWei);

                setTotalEth(totalFormateado);
            } else {
                setErrorMsg("Instala MetaMask");
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMsg("Error de conexión"); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // A) Carga Inicial
        obtenerTotal();

        // B) Configurar el OÍDO de la Blockchain (Listener)
        let contratoListener;
        
        const setupListener = async () => {
            if (window.ethereum && ethers.isAddress(contractAddress)) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                contratoListener = new ethers.Contract(contractAddress, abi, provider);

                // ESCUCHAMOS: Cuando alguien done...
                contratoListener.on("NuevaDonacion", (donante, cedula, nombres, ape, monto) => {
                    console.log(`🔔 ¡Ding! Nueva donación de ${ethers.formatEther(monto)} ETH detectada.`);
                    
                    // Actualizamos el total en SILENCIO (true) para que no parpadee la pantalla
                    obtenerTotal(true); 
                });
            }
        };

        setupListener();

        // C) Limpieza: Dejamos de escuchar cuando el componente se cierra
        return () => {
            if (contratoListener) {
                contratoListener.removeAllListeners("NuevaDonacion");
            }
        };
    }, []);

    // 4. RENDERIZADO (Tu Diseño Guapo Mantenido)
    return (
        <div className="text-center transition-all duration-500"> 
            
            {errorMsg && (
                <p className="text-red-500 font-bold mb-4 bg-red-100 inline-block px-3 py-1 rounded">
                    ⚠️ {errorMsg}
                </p>
            )}

            <div className="mt-4">
                {loading ? (
                    <span className="counter text-6xl sm:text-8xl lg:text-hero font-black pb-6 text-gray-400 dark:text-gray-500 animate-pulse">
                        Cargando...
                    </span>
                ) : (
                    // Agregamos una animación simple 'animate-in' para cuando cambie el número
                    <h2 className="counter text-6xl sm:text-8xl lg:text-hero font-black pb-6 text-gray-600 dark:text-gray-200 animate-in fade-in zoom-in duration-300">
                        {totalEth} <span className="counter text-4xl sm:text-6xl lg:text-8xl font-black text-gray-900">ETH</span>
                    </h2>
                )}
            </div>

            <p className="mt-2 font-black pb-6 text-gray-500 dark:text-gray-900 text-sm uppercase tracking-widest flex justify-center items-center gap-2">
                Fondos seguros en la Blockchain
                {/* Indicador visual de que está "En Vivo" */}
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Conexión en tiempo real activa"></span>
            </p>

            <button 
                onClick={() => obtenerTotal(false)}
                className="mt-2 px-6 py-2 bg-gray-800 hover:bg-black text-white dark:bg-gray-200 dark:hover:bg-white dark:text-gray-400 text-xs font-bold rounded-full transition duration-300 shadow-lg active:scale-95"
            >
                🔄 Actualizar Marcador
            </button>
        </div>
    );
}

export default Donation_total;