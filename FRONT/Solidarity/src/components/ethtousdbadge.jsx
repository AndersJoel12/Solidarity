import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { DONACIONES_ADDRESS } from '../config';

// ABI Mínimo para leer el total
const abi = ["function totalRecaudado() view returns (uint256)"];

const EthToUsdBadge = () => {
    const [ethPrice, setEthPrice] = useState(0);
    const [totalEth, setTotalEth] = useState(0);
    const [loading, setLoading] = useState(true);

    // 1. Obtener precio de ETH desde CoinGecko (API Web2)
    const fetchEthPrice = async () => {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
            const data = await response.json();
            setEthPrice(data.ethereum.usd);
        } catch (error) {
            console.error("Error buscando precio ETH:", error);
            // Precio fallback por si falla la API
            setEthPrice(2500); 
        }
    };

    // 2. Obtener total de la Blockchain (Web3)
    const fetchBlockchainData = async () => {
        if (!window.ethereum) return;
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contrato = new ethers.Contract(DONACIONES_ADDRESS, abi, provider);
            const rawBalance = await contrato.totalRecaudado();
            setTotalEth(parseFloat(ethers.formatEther(rawBalance)));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        setLoading(true);
        // Ejecutamos ambas promesas en paralelo
        Promise.all([fetchEthPrice(), fetchBlockchainData()]).then(() => {
            setLoading(false);
        });

        // Actualizar precio cada 60 segundos (opcional)
        const interval = setInterval(fetchEthPrice, 60000);
        return () => clearInterval(interval);
    }, []);

    // Cálculo del total en USD
    const totalUsd = (totalEth * ethPrice).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    });

    return (
        // Tarjeta flotante con diseño Glassmorphism
        <div className="fixed bottom-4 right-4 z-50 animate-bounce-slow">
            <div className="bg-gray-900/80 backdrop-blur-md border border-gray-600 rounded-xl p-4 shadow-2xl flex items-center gap-4 hover:scale-105 transition-transform cursor-default">
                
                {/* Icono de Dinero */}
                <div className="bg-green-500/20 p-3 rounded-full">
                    <span className="text-2xl">💵</span>
                </div>

                <div>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                        Impacto Real
                    </p>
                    {loading ? (
                        <div className="h-6 w-24 bg-gray-700 rounded animate-pulse mt-1"></div>
                    ) : (
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-green-400">
                                {totalUsd}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                                1 ETH = ${ethPrice.toLocaleString()} USD
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EthToUsdBadge;