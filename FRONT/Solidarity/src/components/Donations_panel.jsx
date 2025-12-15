import React, { useState } from "react";
import { ethers } from "ethers";
import './Tailwind.css'

// ------------------------------------------------------------------
// 🔗 IMPORTACIÓN DE LOS CONTRATOS
// ------------------------------------------------------------------
import DonacionesABI from '../contracts/Donaciones.json';
import PersonasABI from '../contracts/Personas.json';

// 📍 DIRECCIONES DE CONTRATOS
const donacionesAddress = "0xa535795B26a2529A5fF2b87204fA8c410F509Fe0"; 
const personasAddress = "0x83A6037870d3029E9a175A1D9EB775238fFA3dD5"; 

// --- ICONO DE ETHEREUM ---
const SmallEthIcon = () => (
  <svg width="14" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2 shrink-0">
    <path d="M16 0L7.41 16.82L16 21.84V0Z" fill="#ffffff" opacity="0.8"/>
    <path d="M16 0L16.08 0.255V21.84L24.59 16.82L16 0Z" fill="#F97316"/>
    <path d="M16 21.84L24.59 16.82L16 12.87V21.84Z" fill="#141F30"/>
    <path d="M7.41 16.82L16 21.84V12.87L7.41 16.82Z" fill="#8A92B2"/>
    <path d="M16 22.99V31.995L24.59 18.96L16 22.99Z" fill="#F97316"/>
    <path d="M7.41 18.96L16 31.995V22.99L7.41 18.96Z" fill="#ffffff" opacity="0.6"/>
  </svg>
);

function Donations() {
  // --- ESTADOS DE DONACIÓN ---
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [placeholderText, setPlaceholderText] = useState('Otra cantidad');
  
  // --- ESTADOS DE BÚSQUEDA ---
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const presets = ["0.25", "0.55", "0.75", "1.00"];

  // ------------------------------------------------------------------
  // 🛡️ LÓGICA (Intacta)
  // ------------------------------------------------------------------
  const onChangeCedula = (e) => {
    const val = e.target.value;
    if (/^\d{0,9}$/.test(val)) setCedula(val);
  };

  const onChangeSoloLetras = (e, setFunction) => {
    const val = e.target.value;
    if (/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/.test(val)) setFunction(val);
  };

  const onChangeBuscador = (e) => {
    const val = e.target.value;
    if (/^[a-zA-Z0-9\s]*$/.test(val)) setSearchInput(val);
  };

  const handlePresetClick = (value) => { setAmount(value); setDisplayAmount(''); };
  
  const handleInputChange = (e) => { 
    const value = e.target.value; 
    if (value < 0) return;
    setDisplayAmount(value); 
    setAmount(value); 
  };

  const handleDonate = async () => {
    if (!cedula || !nombre || !apellido) return alert("Por favor completa tus datos personales.");
    if (cedula.length <= 6) return alert("La cédula debe tener más de 6 dígitos.");
    if (parseInt(cedula) > 35000000) return alert("La cédula no puede exceder los 35 Millones.");
    if (!amount) return alert("Por favor selecciona un monto.");

    try {
      if (!window.ethereum) return alert("¡Instala Metamask!");
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      try {
        const contratoPersonas = new ethers.Contract(personasAddress, PersonasABI.abi, signer);
        const txRegistro = await contratoPersonas.registrarPersonaEsencial(cedula, nombre, apellido);
        await txRegistro.wait();
      } catch (error) { console.log("Usuario ya registrado o error menor, continuando..."); }

      const contratoDonaciones = new ethers.Contract(donacionesAddress, DonacionesABI.abi, signer);
      const montoWei = ethers.parseEther(amount.toString());
      const txDonacion = await contratoDonaciones.RegistrarDonantes(cedula, montoWei);
      await txDonacion.wait();

      alert(`🎉 ¡Gracias ${nombre}! Has donado ${amount} ETH exitosamente.`);
      setAmount(''); setDisplayAmount(''); setCedula(''); setNombre(''); setApellido('');
    } catch (error) {
      console.error(error);
      alert("Hubo un error en la transacción.");
    } finally { setLoading(false); }
  };

  const handleSearch = async () => {
    if (!searchInput) return alert("Ingresa una cédula o dirección para buscar.");
    setSearchLoading(true);
    setSearchResult(null);

    try {
        let provider;
        if (window.ethereum) {
             provider = new ethers.BrowserProvider(window.ethereum);
        } else {
             return alert("Necesitas Metamask para consultar.");
        }
        const input = searchInput.trim();

        if (ethers.isAddress(input)) {
            const code = await provider.getCode(input);
            const balanceWei = await provider.getBalance(input);
            const balanceEth = ethers.formatEther(balanceWei);
            if (code === '0x') { 
                const txCount = await provider.getTransactionCount(input);
                setSearchResult({ type: 'wallet', address: input, balance: balanceEth, txCount: txCount });
            } else { 
                const isOfficial = input.toLowerCase() === donacionesAddress.toLowerCase();
                setSearchResult({ type: 'contract', address: input, isOfficial: isOfficial, balance: balanceEth });
            }
        } else { 
            const contratoDonaciones = new ethers.Contract(donacionesAddress, DonacionesABI.abi, provider);
            const resultado = await contratoDonaciones.obtenerPersonaPorCI(input);
            setSearchResult({ type: 'person', nombre: resultado[0], apellido: resultado[1], monto: ethers.formatEther(resultado[3]) });
        }
    } catch (error) {
        console.error(error);
        alert("No se encontraron resultados.");
        setSearchResult(null);
    } finally { setSearchLoading(false); }
  };

  // ------------------------------------------------------------------
  // 🎨 RENDERIZADO (Replicando Imagen 4: Tarjeta Oscura)
  // ------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-8 w-full max-w-[480px] mx-auto">
      
      {/* TARJETA 1: FORMULARIO DONAR */}
      {/* Fondo oscuro sólido (#1f2937 - gray-800) como en la foto 4 */}
      <div className="bg-[#1f2937] rounded-2xl p-8 shadow-2xl border border-gray-700">
        
        <h2 className="text-2xl font-extrabold text-white mb-2 text-center">Donar con Solidarity</h2>
        <p className="text-gray-400 text-sm text-center mb-8">Tu apoyo impulsa la diferencia en la Blockchain</p>

        {/* DATOS PERSONALES */}
        <div className="mb-6">
            <p className="text-[#F97316] text-xs font-bold uppercase tracking-wider mb-3">Tus Datos Personales</p>
            
            <div className="flex flex-col gap-4">
                {/* Input Cédula */}
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Cédula de Identidad" 
                        value={cedula} 
                        onChange={onChangeCedula} 
                        className="w-full bg-[#374151] text-white p-3.5 rounded-lg border border-transparent focus:border-[#F97316] focus:outline-none placeholder-gray-500 transition-colors"
                    />
                     <span className="text-red-500 text-[10px] font-bold mt-1 block uppercase">* campo obligatorio</span>
                </div>

                {/* Input Nombre */}
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Nombres" 
                        value={nombre} 
                        onChange={(e) => onChangeSoloLetras(e, setNombre)} 
                        className="w-full bg-[#374151] text-white p-3.5 rounded-lg border border-transparent focus:border-[#F97316] focus:outline-none placeholder-gray-500 transition-colors"
                    />
                    <span className="text-red-500 text-[10px] font-bold mt-1 block uppercase">* campo obligatorio</span>
                </div>

                {/* Input Apellido */}
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Apellidos" 
                        value={apellido} 
                        onChange={(e) => onChangeSoloLetras(e, setApellido)} 
                        className="w-full bg-[#374151] text-white p-3.5 rounded-lg border border-transparent focus:border-[#F97316] focus:outline-none placeholder-gray-500 transition-colors"
                    />
                    <span className="text-red-500 text-[10px] font-bold mt-1 block uppercase">* campo obligatorio</span>
                </div>
            </div>
        </div>

        {/* SELECCIONAR MONTO */}
        <div className="mb-6">
            <p className="text-[#F97316] text-xs font-bold uppercase tracking-wider mb-3">Selecciona un Monto</p>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
                {presets.map((preset) => {
                    const isSelected = amount === preset;
                    return (
                        <button 
                            key={preset} 
                            onClick={() => handlePresetClick(preset)} 
                            className={`flex justify-center items-center py-3 px-2 rounded-lg border font-bold text-sm transition-all
                                ${isSelected 
                                    ? 'border-[#F97316] text-[#F97316] bg-orange-500/10' 
                                    : 'border-gray-600 text-gray-400 bg-[#374151] hover:bg-gray-600'}
                            `}
                        >
                            {preset} ETH <SmallEthIcon />
                        </button>
                    )
                })}
            </div>

            {/* Input Otro Monto */}
            <div className="relative">
                <input 
                    type="number" 
                    placeholder={placeholderText} 
                    onFocus={() => setPlaceholderText('')} 
                    onBlur={() => setPlaceholderText('Otra cantidad')} 
                    value={displayAmount} 
                    onChange={handleInputChange} 
                    className="w-full bg-[#374151] text-white p-3.5 rounded-lg border border-transparent focus:border-[#F97316] text-center font-bold focus:outline-none placeholder-gray-500"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#F97316] font-bold text-sm">ETH</span>
            </div>
        </div>

        {/* BOTON DONAR */}
        <button 
            onClick={handleDonate} 
            disabled={loading}
            className={`w-full py-4 rounded-lg bg-[#F97316] text-white font-extrabold text-lg shadow-lg hover:bg-orange-600 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {loading ? "PROCESANDO..." : "DONAR AHORA"}
        </button>

      </div>

      {/* TARJETA 2: EXPLORADOR (Mismo estilo) */}
      <div className="bg-[#1f2937] rounded-2xl p-8 shadow-2xl border border-gray-700 text-center">
          <h2 className="text-xl font-bold text-white mb-2 flex justify-center items-center gap-2">
            🔍 Explorador Blockchain
          </h2>
          <p className="text-gray-400 text-sm mb-5">Busca por Cédula, Dirección o Contrato</p>

          <input 
                type="text" 
                placeholder="Buscar (Cédula o Address)" 
                value={searchInput} 
                onChange={onChangeBuscador} 
                className="w-full bg-[#374151] text-white p-3 mb-3 rounded-lg border border-transparent focus:border-[#F97316] focus:outline-none placeholder-gray-500 text-sm"
            />

          <button 
            onClick={handleSearch} 
            disabled={searchLoading}
            className="w-full py-3 rounded-lg bg-[#374151] border border-gray-600 text-white font-bold hover:bg-gray-600 transition-colors text-sm"
          >
            {searchLoading ? "ANALIZANDO..." : "BUSCAR INFORMACIÓN"}
          </button>

          {/* RESULTADOS */}
          {searchResult && (
              <div className="mt-5 p-4 bg-black/40 rounded-lg border border-[#F97316] text-left animate-pulse">
                  {/* Lógica de visualización de resultados (persona, contrato, wallet) igual que antes pero con estilos Tailwind limpios */}
                   {searchResult.type === 'person' && (
                    <>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Donante</p>
                        <h3 className="text-lg text-white font-bold">{searchResult.nombre} {searchResult.apellido}</h3>
                        <div className="border-t border-gray-600 mt-2 pt-2 flex justify-between">
                            <span className="text-gray-300 text-sm">Donado:</span> 
                            <span className="text-[#F97316] font-bold">{searchResult.monto} ETH</span>
                        </div>
                    </>
                  )}
                  {searchResult.type !== 'person' && (
                      <>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">{searchResult.type === 'contract' ? 'Contrato' : 'Wallet'}</p>
                        <p className="text-xs text-white truncate mb-2">{searchResult.address}</p>
                        <div className="border-t border-gray-600 mt-2 pt-2 flex justify-between">
                             <span className="text-gray-300 text-sm">Saldo:</span>
                             <span className="text-[#F97316] font-bold">{searchResult.balance} ETH</span>
                        </div>
                      </>
                  )}
              </div>
          )}
      </div>

    </div>
  );
};   

export default Donations;