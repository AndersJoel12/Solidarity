import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import '../components/Tailwind.css'; 
import { DONACIONES_ADDRESS } from '../config';

const Donation_total = () => {
    // 1. ESTADOS
    const [totalEth, setTotalEth] = useState("0.0");
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(""); // Para mostrar errores visualmente si ocurren

    // 2. CONFIGURACIÓN
    // ⚠️ IMPORTANTE: Pega aquí la dirección de tu terminal (truffle migrate)
    // Debe empezar por '0x' y no tener espacios extra.
    const contractAddress = DONACIONES_ADDRESS; 

    const abi = [
        "function totalRecaudado() view returns (uint256)"
    ];

    // 3. LÓGICA
    const obtenerTotal = async () => {
        setLoading(true);
        setErrorMsg(""); // Limpiamos errores previos

        try {
            // 🛡️ ESCUDO DE SEGURIDAD: Evita el error "ENS network"
            if (!ethers.isAddress(contractAddress)) {
                throw new Error("Dirección de contrato inválida (Revisa la línea 13)");
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
            // Si es el error de ENS o dirección, mostramos un mensaje amigable
            setErrorMsg("Error de conexión"); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        obtenerTotal();
    }, []);

    // 4. RENDERIZADO (Tu Diseño Guapo)
    return (
        <div className="text-center"> {/* Centramos todo el contenedor */}
            
            {/* Si hay error, lo mostramos en rojo pequeño arriba */}
            {errorMsg && (
                <p className="text-red-500 font-bold mb-4 bg-red-100 inline-block px-3 py-1 rounded">
                    ⚠️ {errorMsg}
                </p>
            )}

            <div className="mt-4">
                {loading ? (
                    // Animación de pulso para que se vea vivo mientras carga
                    <span className="counter text-6xl sm:text-8xl lg:text-hero font-black pb-6 text-gray-400 dark:text-gray-500 animate-pulse">
                        Cargando...
                    </span>
                ) : (
                    // TU DISEÑO ORIGINAL
                    <h2 className="counter text-6xl sm:text-8xl lg:text-hero font-black pb-6 text-gray-600 dark:text-gray-200">
                        {totalEth} <span className="counter text-4xl sm:text-6xl lg:text-8xl font-black text-gray-400">ETH</span>
                    </h2>
                )}
            </div>

            <p className="mt-2 font-black pb-6 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-widest">
                Fondos seguros en la Blockchain
            </p>

            {/* Botón mejorado para que combine */}
            <button 
                onClick={obtenerTotal}
                className="mt-2 px-6 py-2 bg-gray-800 hover:bg-black text-white dark:bg-gray-200 dark:hover:bg-white dark:text-gray-400 text-xs font-bold rounded-full transition duration-300 shadow-lg"
            >
                🔄 Actualizar Marcador
            </button>
        </div>
    );
}

export default Donation_total;