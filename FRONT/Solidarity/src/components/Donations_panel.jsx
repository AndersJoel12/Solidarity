import React from "react";
import { useState } from 'react';
function Donations(){
 const [amount, setAmount] = useState('');
  
  // Opciones predefinidas (Adaptadas a ETH para tu dApp)
  const presets = [5, 15, 25, 50];

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50 px-4">
      {/* Tarjeta Principal - Estilo similar a Screenshot 1 */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-800 uppercase tracking-wide">
            ¡Únete y dona ahora con Solidarity!
          </h2>
          <p className="text-gray-500 font-medium mt-2">
            Tu apoyo hace la diferencia en Solidarity
          </p>
        </div>

        {/* Grid de Botones (Presets) - Similar a los botones '5 trees', '20 trees' */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => setAmount(preset.toString())}
              className={`
                py-4 rounded-xl font-bold text-lg transition-all duration-200 border-2
                ${amount === preset.toString() 
                  ? 'border-green-600 bg-green-50 text-green-700 shadow-inner' // Estado Activo
                  : 'border-gray-200 text-gray-600 hover:border-green-400 hover:shadow-md bg-white' // Estado Normal
                }
              `}
            >
              {preset} SLD
            </button>
          ))}
        </div>
        
        {/* Input Personalizado - 'Other Amount' */}
        <div className="relative mb-8">
          <input
            type="number"
            step="0.01"
            placeholder="Otra cantidad"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-200 text-gray-700 font-bold rounded-xl py-4 px-4 focus:outline-none focus:border-green-500 focus:bg-white transition-colors"
          />
          <span className="absolute right-6 top-4 text-gray-400 font-bold">SLD</span>
        </div>

        {/* Botón de Acción - El botón naranja grande de Screenshot 1 */}
        <button 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xl py-4 rounded-full shadow-lg transform active:scale-95 transition-all duration-200 uppercase tracking-wider"
          onClick={() => alert(`Donando: ${amount} SLD`)} // Aquí conectaremos la lógica Web3 luego
        >
          Donar
        </button>

        {/* Link inferior - Estilo 'Donate with crypto' */}
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