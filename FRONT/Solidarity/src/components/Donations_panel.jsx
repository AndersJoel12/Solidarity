import React, { useState } from "react";
import { ethers } from "ethers";

// --- 1. ICONOS DECORATIVOS ---
const TokenIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#6366F1" strokeWidth="2"/>
    <path d="M12 6V18" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 10H16" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/>
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
  const presets = [5, 15, 25, 50];

  const handleDonate = async () => {
    if (!amount) return alert("Por favor selecciona un monto primero.");
    try {
      if (!window.ethereum) return alert("¡Necesitas MetaMask instalada!");
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      // AQUÍ VA LA DIRECCIÓN QUE TE PASE TU COMPAÑERO
      const contractAddress = "0x0000000000000000000000000000000000000000"; 
      const tx = await signer.sendTransaction({
        to: contractAddress,
        value: ethers.parseEther(amount.toString()) 
      });
      await tx.wait();
      alert(`¡Has donado ${amount} SLD exitosamente! 🌳`);
      setAmount('');
    } catch (error) {
      console.error(error);
      if (error.code !== 'ACTION_REJECTED') alert("Hubo un error en la transacción");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Este div de afuera es solo para centrar la caja en la pantalla
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 px-4 font-sans relative overflow-hidden">
      
      {/* Decoración de fondo (círculos de colores) */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

      {/* ================================================================================== */}
      {/* 📍 AQUÍ EMPIEZA LA CAJA QUE PIDES */}
      {/* Fíjate en las clases: bg-white/90 (fondo blanco), rounded-3xl (esquinas redondas), shadow-2xl (sombra) */}
      {/* ================================================================================== */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/50 relative z-10">
          
          {/* TODO EL CONTENIDO VA DENTRO DE ESE DIV */}
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-800 uppercase tracking-wide leading-tight">
              ¡Únete y dona ahora con Solidarity!
            </h2>
            <p className="text-gray-500 font-medium mt-3">
              Tu apoyo hace la diferencia en la Blockchain
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className={`
                  py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 border
                  ${amount === preset.toString() 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 scale-105 border-transparent' 
                    : 'bg-gray-50 text-gray-600 hover:bg-white hover:shadow-md border-gray-100' 
                  }
                `}
              >
                {preset} SLD
              </button>
            ))}
          </div>

          <div className="relative mb-8 group">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-opacity duration-300 ${amount ? 'opacity-100' : 'opacity-50'}`}>
               <TokenIcon />
            </div>
            <input
              type="number"
              step="0.01"
              placeholder="Otra cantidad"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-50 border-2 border-transparent focus:bg-white text-gray-800 font-bold text-2xl rounded-2xl py-4 pl-12 pr-16 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all text-center shadow-inner"
            />
            <span className="absolute right-9 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold text-sm tracking-wider">
              SLD
            </span>
          </div>

          <button 
            className={`w-full group relative flex items-center justify-center py-4 rounded-full shadow-lg transform transition-all duration-300
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-95'
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

      {/* ================================================================================== */}
      {/* 📍 AQUÍ TERMINA LA CAJA */}
      {/* ================================================================================== */}
      </div>
    </div>
  );
};   
export default Donations;