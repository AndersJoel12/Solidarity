import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import '../components/Tailwind.css'; // Asegúrate de que esta ruta sea correcta

const Donation_total = () => {
    // 1. ESTADOS: Guardamos el total y un estado de carga
    const [totalEth, setTotalEth] = useState("0.0");
    const [loading, setLoading] = useState(true);

    // 2. CONFIGURACIÓN:
    // Reemplaza esto con la dirección real de tu contrato 'Donaciones' en Ganache
    const contractAddress = "0xTU_DIRECCION_DEL_CONTRATO_AQUI"; 

    // ABI Parcial: Solo definimos lo que vamos a leer para no complicarnos con archivos JSON ahora
    const abi = [
        "function totalRecaudado() view returns (uint256)"
    ];

    // 3. LÓGICA: Función para pedir el dato a la Blockchain
    const obtenerTotal = async () => {
        try {
            // Verificamos si hay una billetera (MetaMask) instalada
            if (window.ethereum) {
                // Conectamos a la red
                const provider = new ethers.BrowserProvider(window.ethereum);
                
                // Creamos la instancia del contrato (Dirección + ABI + Proveedor)
                const contrato = new ethers.Contract(contractAddress, abi, provider);

                // Llamamos a la variable pública 'totalRecaudado'
                const totalWei = await contrato.totalRecaudado();

                // TRUCO DE MENTOR: Convertimos Wei a Ether para que sea legible
                // Ejemplo: 1000000000000000000 Wei -> 1.0 ETH
                const totalFormateado = ethers.formatEther(totalWei);

                setTotalEth(totalFormateado);
            } else {
                console.log("Por favor instala MetaMask");
            }
        } catch (error) {
            console.error("Error obteniendo el total:", error);
        } finally {
            setLoading(false);
        }
    };

    // 4. EFECTO: Ejecutar esto automáticamente al cargar el componente
    useEffect(() => {
        obtenerTotal();
        
        // Opcional: Escuchar eventos para actualizar en tiempo real
        // Si alguien dona, podríamos actualizar esto automáticamente (lo veremos luego)
    }, []);

    return (
        <div>
            <div>                
                <div className="mt-4">
                    {loading ? (
                        <span className="counter text-6xl sm:text-8xl lg:text-hero font-black pb-6 text-gray-600 dark:text-gray-200">Cargando bloques...</span>
                    ) : (
                        <h2 className="counter text-6xl sm:text-8xl lg:text-hero font-black pb-6 text-gray-600 dark:text-gray-200">
                            {totalEth} <span className="counter text-6xl sm:text-8xl lg:text-hero font-black pb-6 text-gray-500">ETH</span>
                        </h2>
                    )}
                </div>

                <p className="mt-2 font-black pb-6 text-gray-600 dark:text-gray-200 text-sm">
                    Fondos seguros en la Blockchain
                </p>

                {/* Botón simple para refrescar manualmente */}
                <button 
                    onClick={obtenerTotal}
                    className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 dark:text-gray-200 text-xs font-bold rounded-full transition duration-300"
                >
                    🔄 Actualizar
                </button>
            </div>
        </div>
    );
}

export default Donation_total;