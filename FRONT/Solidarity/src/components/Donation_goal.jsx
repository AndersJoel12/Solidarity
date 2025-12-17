import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import '../components/Tailwind.css'; // Ajusta la ruta si es necesario
import { DONACIONES_ADDRESS } from '../config'; 

// ⚠️ ACTUALIZAMOS EL ABI: Ahora incluimos el Evento para poder escucharlo
const abi = [
    "function totalRecaudado() view returns (uint256)",
    "event NuevaDonacion(address donante, string cedula, string nombres, string apellidos, uint256 monto, uint256 fecha)"
];

const Donation_goal = () => {
    const [currentEth, setCurrentEth] = useState(0);
    const [percentage, setPercentage] = useState(0);
    
    // 🎯 TU META: Ponlo bajito para probar (Ej: 2 ETH)
    const GOAL_ETH = 50; 

    const contractAddress = DONACIONES_ADDRESS;

    const calculateProgress = async () => {
        if (!window.ethereum) return;
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            
            // Verificamos que sea una dirección válida antes de llamar
            if (!ethers.isAddress(contractAddress)) return;

            const contrato = new ethers.Contract(contractAddress, abi, provider);
            
            // 1. Leemos el total actual
            const totalWei = await contrato.totalRecaudado();
            const totalEth = parseFloat(ethers.formatEther(totalWei)); 
            
            console.log("💰 Total en contrato:", totalEth); // Para ver en consola
            setCurrentEth(totalEth);

            // 2. Calculamos porcentaje
            let calcPercent = (totalEth / GOAL_ETH) * 100;
            if (calcPercent > 100) calcPercent = 100;
            
            setPercentage(calcPercent.toFixed(1)); 

        } catch (error) {
            console.error("Error cargando meta:", error);
        }
    };

    useEffect(() => {
        // 1. Carga inicial
        calculateProgress();

        // 2. ESCUCHAR EVENTOS EN VIVO 🎧
        // Esto hace que la barra se mueva sola cuando alguien dona
        let contratoListener;
        
        const setupListener = async () => {
            if (window.ethereum && ethers.isAddress(contractAddress)) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                contratoListener = new ethers.Contract(contractAddress, abi, provider);

                // "Cuando ocurra 'NuevaDonacion', vuelve a calcular el progreso"
                contratoListener.on("NuevaDonacion", () => {
                    console.log("¡Ding Ding! 🔔 Nueva donación detectada. Actualizando barra...");
                    calculateProgress();
                });
            }
        };

        setupListener();

        // Limpieza al desmontar el componente (buena práctica React)
        return () => {
            if (contratoListener) {
                contratoListener.removeAllListeners("NuevaDonacion");
            }
        };
    }, [contractAddress]); // Se reinicia si cambia la dirección

    return (
        <div className="w-full max-w-[480px] mx-auto mt-6 mb-8 transform transition-all hover:scale-[1.02]">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl relative overflow-hidden group">
                
                {/* Texto de cabecera */}
                <div className="flex justify-between items-end mb-4 relative z-10">
                    <div>
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            Meta de Recaudación
                            {/* Puntito verde que indica que está 'escuchando' */}
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        </h3>
                        <p className="text-2xl font-black text-white mt-1">
                            {currentEth} <span className="text-gray-500 text-lg">/ {GOAL_ETH} ETH</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <span className={`text-3xl font-bold ${percentage > 99 ? 'text-green-500' : 'text-orange-500'}`}>
                            {percentage}%
                        </span>
                    </div>
                </div>

                {/* BARRA DE FONDO */}
                <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden relative z-10 box-border border border-gray-600">
                    {/* BARRA DE PROGRESO ANIMADA */}
                    <div 
                        className="h-full bg-linear-to-r from-orange-600 via-orange-500 to-yellow-400 rounded-full transition-all duration-1500ms ease-out shadow-[0_0_20px_rgba(249,115,22,0.5)] relative"
                        style={{ width: `${percentage}%` }}
                    >
                        {/* Brillo que recorre la barra */}
                        <div className="absolute top-0 left-0 bottom-0 right-0 bg-linear-to-r from-transparent via-white to-transparent opacity-20 w-full -skew-x-12 animate-shimmer"></div>
                    </div>
                </div>

                {/* Mensaje dinámico */}
                <p className="text-center text-xs mt-4 text-gray-400 italic">
                    {percentage <= 0 && "🌱 La alcancía está vacía. ¡Sé el primero!"}
                    {percentage > 0 && percentage < 50 && "🚀 ¡Despegando! Gracias por el apoyo."}
                    {percentage >= 50 && percentage < 100 && "🔥 ¡Vamos a mitad de camino!"}
                    {percentage >= 100 && "🎉 ¡LO LOGRAMOS! Misión Cumplida."}
                </p>

                {/* Fondo decorativo */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-orange-500 rounded-full mix-blend-overlay filter blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
            </div>
        </div>
    );
};

export default Donation_goal;