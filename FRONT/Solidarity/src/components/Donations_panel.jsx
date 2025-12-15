import React, { useState } from "react";
import { ethers } from "ethers";

// --- 1. ICONO DE ETHEREUM (Regresamos al original) ---
const EthIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.925 23.96L16 24.075L16.08 23.96L24.585 18.96L16 32L7.41 18.96L15.925 23.96ZM16.08 0L16 0.255V21.84L24.59 16.82L16.08 0Z" fill="#627EEA"/>
    <path d="M16 0L7.41 16.82L16 21.84V0Z" fill="#C0CBF6"/>
    <path d="M16 22.99V31.995L24.59 18.96L16 22.99Z" fill="#627EEA"/>
    <path d="M7.41 18.96L16 31.995V22.99L7.41 18.96Z" fill="#C0CBF6"/>
    <path d="M16 21.84L24.59 16.82L16 12.87V21.84Z" fill="#141F30"/>
    <path d="M7.41 16.82L16 21.84V12.87L7.41 16.82Z" fill="#627EEA"/>
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// --- 2. COMPONENTE PRINCIPAL ---
function Donations() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  // TUS OPCIONES (Ahora en ETH)
  const presets = [5, 15, 25, 50];

  const handleDonate = async () => {
    if (!amount) return alert("Por favor selecciona un monto primero.");
    try {
      if (!window.ethereum) return alert("¡Necesitas MetaMask instalada!");
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Dirección del contrato (Pendiente de tu compañero)
      const contractAddress = "0x0000000000000000000000000000000000000000"; 
      
      const tx = await signer.sendTransaction({
        to: contractAddress,
        value: ethers.parseEther(amount.toString()) 
      });
      await tx.wait();
      // Alerta actualizada a ETH
      alert(`¡Has donado ${amount} ETH exitosamente! 🌳`);
      setAmount('');
    } catch (error) {
      console.error(error);
      if (error.code !== 'ACTION_REJECTED') alert("Hubo un error en la transacción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-green-50 to-emerald-100 px-4 font-sans relative overflow-hidden">
      
      <div className="absolute top-10 right-10 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

      {/* Tarjeta Principal */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/50 relative z-10">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-800 uppercase tracking-wide leading-tight">
              ¡Únete y dona ahora con Solidarity!
            </h2>
            <p className="text-gray-500 font-medium mt-3">
              Tu apoyo hace la diferencia en la Blockchain
            </p>
          </div>

          {/* Botones de selección (Actualizados a ETH) */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className={`
                  py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 border
                  ${amount === preset.toString() 
                    ? 'bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 scale-105 border-transparent' 
                    : 'bg-gray-50 text-gray-600 hover:bg-white hover:shadow-md border-gray-100' 
                  }
                `}
              >
                {preset} ETH
              </button>
            ))}
          </div>

          {/* Input Manual con Icono de ETH */}
          <div className="relative mb-8 group">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-opacity duration-300 ${amount ? 'opacity-100' : 'opacity-50'}`}>
               {/* Usamos el EthIcon aquí */}
               <EthIcon />
            </div>
            <input
              type="number"
              step="0.01"
              placeholder="Otra cantidad"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-50 border-2 border-transparent focus:bg-white text-gray-800 font-bold text-2xl rounded-2xl py-4 pl-12 pr-16 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all text-center shadow-inner"
            />
            {/* Etiqueta actualizada a ETH */}
            <span className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold text-sm tracking-wider">
              ETH
            </span>
          </div>

          {/* Botón Donar */}
          <button 
            className={`w-full group relative flex items-center justify-center py-4 rounded-full shadow-lg transform transition-all duration-300
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-linear-to-r from-orange-500 to-orange-600 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-95'
              }
            `}
            onClick={handleDonate}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner />
                <span className="text-white font-bold">Procesando...</span>
              </>
            ) : (
              <span className="text-white font-extrabold text-xl tracking-wide uppercase">
                Donar Ahora
              </span>
            )}
          </button>

          <div className="text-center mt-6">
            <button className="text-sm font-semibold text-gray-400 hover:text-green-600 underline decoration-2 underline-offset-2 transition-colors">
               ¿Cómo funciona esta dApp?
            </button>
          </div>
      </div>
    </div>
  );
};   

export default Donations;