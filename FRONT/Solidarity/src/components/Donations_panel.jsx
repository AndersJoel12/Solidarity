import React, { useState } from "react";
import { ethers } from "ethers";
// Asegúrate de que tu archivo Tailwind se importe aquí si lo usas para otras cosas
// import './Tailwind.css' 

// ------------------------------------------------------------------
// 🔗 IMPORTACIÓN DE LOS CONTRATOS
// ------------------------------------------------------------------
import DonacionesABI from '../contracts/Donaciones.json';
import PersonasABI from '../contracts/Personas.json';

// 📍 DIRECCIONES DE CONTRATOS
const donacionesAddress = "0xa535795B26a2529A5fF2b87204fA8c410F509Fe0"; 
const personasAddress = "0x83A6037870d3029E9a175A1D9EB775238fFA3dD5"; 

// --- COLORES TEMA ---
const THEME = {
    orange: '#F97316',
    darkInput: '#374151', // Gris oscuro para inputs y botones inactivos
    textWhite: '#ffffff',
    textGray: '#9ca3af'
};

// --- ICONO DE ETHEREUM ---
const SmallEthIcon = () => (
  <svg width="14" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2 shrink-0">
    <path d="M16 0L7.41 16.82L16 21.84V0Z" fill="#ffffff" opacity="0.8"/>
    <path d="M16 0L16.08 0.255V21.84L24.59 16.82L16 0Z" fill={THEME.orange}/>
    <path d="M16 21.84L24.59 16.82L16 12.87V21.84Z" fill="#141F30"/>
    <path d="M7.41 16.82L16 21.84V12.87L7.41 16.82Z" fill="#8A92B2"/>
    <path d="M16 22.99V31.995L24.59 18.96L16 22.99Z" fill={THEME.orange}/>
    <path d="M7.41 18.96L16 31.995V22.99L7.41 18.96Z" fill="#ffffff" opacity="0.6"/>
  </svg>
);

function Donations() {
  // --- ESTADOS ---
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [placeholderText, setPlaceholderText] = useState('Otra cantidad');
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
        await (await contratoPersonas.registrarPersonaEsencial(cedula, nombre, apellido)).wait();
      } catch (error) { console.log("Continuando..."); }
      const contratoDonaciones = new ethers.Contract(donacionesAddress, DonacionesABI.abi, signer);
      await (await contratoDonaciones.RegistrarDonantes(cedula, ethers.parseEther(amount.toString()))).wait();
      alert(`🎉 ¡Gracias ${nombre}! Has donado ${amount} ETH exitosamente.`);
      setAmount(''); setDisplayAmount(''); setCedula(''); setNombre(''); setApellido('');
    } catch (error) { console.error(error); alert("Hubo un error en la transacción."); } finally { setLoading(false); }
  };

  const handleSearch = async () => {
    if (!searchInput) return alert("Ingresa una cédula o dirección para buscar.");
    setSearchLoading(true);
    setSearchResult(null);
    try {
        if (!window.ethereum) return alert("Necesitas Metamask.");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const input = searchInput.trim();
        if (ethers.isAddress(input)) {
            const code = await provider.getCode(input);
            const balanceEth = ethers.formatEther(await provider.getBalance(input));
            if (code === '0x') { 
                setSearchResult({ type: 'wallet', address: input, balance: balanceEth, txCount: await provider.getTransactionCount(input) });
            } else { 
                setSearchResult({ type: 'contract', address: input, isOfficial: input.toLowerCase() === donacionesAddress.toLowerCase(), balance: balanceEth });
            }
        } else { 
            const contratoDonaciones = new ethers.Contract(donacionesAddress, DonacionesABI.abi, provider);
            const res = await contratoDonaciones.obtenerPersonaPorCI(input);
            setSearchResult({ type: 'person', nombre: res[0], apellido: res[1], monto: ethers.formatEther(res[3]) });
        }
    } catch (error) { console.error(error); alert("No se encontraron resultados."); setSearchResult(null); } finally { setSearchLoading(false); }
  };

  // ------------------------------------------------------------------
  // 🎨 RENDERIZADO CON ESTILOS FORZADOS
  // ------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-8 w-full max-w-[480px] mx-auto">
      
      {/* TARJETA 1 */}
      {/* Usamos style inline para asegurar el fondo oscuro */}
      <div className="rounded-2xl p-8 shadow-2xl border border-gray-700" style={{ backgroundColor: '#1f2937' }}>
        <h2 className="text-2xl font-extrabold text-white mb-2 text-center">Donar con PetSolidarity</h2>
        <p className="text-gray-400 text-sm text-center mb-8">Tu apoyo impulsa la diferencia en la Blockchain</p>

        <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: THEME.orange }}>Tus Datos Personales</p>
            <div className="flex flex-col gap-4">
                {/* Inputs con estilos forzados */}
                {[{pl: "Cédula de Identidad", val: cedula, fn: onChangeCedula}, {pl: "Nombres", val: nombre, fn: (e)=>onChangeSoloLetras(e, setNombre)}, {pl: "Apellidos", val: apellido, fn: (e)=>onChangeSoloLetras(e, setApellido)}].map((item, i) => (
                    <div key={i} className="relative">
                        <input type="text" placeholder={item.pl} value={item.val} onChange={item.fn} 
                            className="w-full p-3.5 rounded-lg border border-transparent focus:outline-none transition-colors placeholder-gray-500"
                            style={{ backgroundColor: THEME.darkInput, color: THEME.textWhite }} // FORZADO
                        />
                        <span className="text-red-500 text-[10px] font-bold mt-1 block uppercase">* campo obligatorio</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: THEME.orange }}>Selecciona un Monto</p>
            
            {/* BOTONES PRESETS - CORRECCIÓN PRINCIPAL */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {presets.map((preset) => {
                    const isSelected = amount === preset;
                    // Definimos los estilos exactos aquí para que no fallen
                    const btnStyle = isSelected 
                        ? { backgroundColor: 'rgba(249, 115, 22, 0.15)', borderColor: THEME.orange, color: THEME.orange } 
                        : { backgroundColor: THEME.darkInput, borderColor: 'transparent', color: THEME.textGray };

                    return (
                        <button key={preset} onClick={() => handlePresetClick(preset)} 
                            className="flex justify-center items-center py-3 px-2 rounded-lg border font-bold text-sm transition-all hover:opacity-80"
                            style={btnStyle} // APLICAMOS EL ESTILO FORZADO
                        >
                            {preset} ETH <SmallEthIcon />
                        </button>
                    )
                })}
            </div>

            <div className="relative">
                <input type="number" placeholder={placeholderText} onFocus={() => setPlaceholderText('')} onBlur={() => setPlaceholderText('Otra cantidad')} value={displayAmount} onChange={handleInputChange} 
                    className="w-full p-3.5 rounded-lg border border-transparent text-center font-bold focus:outline-none placeholder-gray-500"
                    style={{ backgroundColor: THEME.darkInput, color: THEME.textWhite }} // FORZADO
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 font-bold text-sm" style={{ color: THEME.orange }}>ETH</span>
            </div>
        </div>

        {/* BOTON DONAR PRINCIPAL - CORRECCIÓN */}
        <button onClick={handleDonate} disabled={loading}
            className="w-full py-4 rounded-lg font-extrabold text-lg shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{ backgroundColor: THEME.orange, color: THEME.textWhite }} // FORZADO NARANJA
        >
            {loading ? "PROCESANDO..." : "DONAR AHORA"}
        </button>
      </div>

      {/* TARJETA 2 */}
      <div className="rounded-2xl p-8 shadow-2xl border border-gray-700 text-center" style={{ backgroundColor: '#1f2937' }}>
          <h2 className="text-xl font-bold text-white mb-2 flex justify-center items-center gap-2">🔍 Explorador Blockchain</h2>
          <p className="text-gray-400 text-sm mb-5">Busca por Cédula, Dirección o Contrato</p>
          <input type="text" placeholder="Buscar (Cédula o Address)" value={searchInput} onChange={onChangeBuscador} 
              className="w-full p-3 mb-3 rounded-lg border border-transparent focus:outline-none placeholder-gray-500 text-sm"
              style={{ backgroundColor: THEME.darkInput, color: THEME.textWhite }} // FORZADO
          />
          {/* BOTON BUSCAR PRINCIPAL - CORRECCIÓN */}
          <button onClick={handleSearch} disabled={searchLoading}
            className="w-full py-3 rounded-lg font-bold transition-colors text-sm hover:opacity-90"
            style={{ backgroundColor: THEME.darkInput, color: THEME.textWhite, border: `1px solid ${THEME.textGray}` }} // FORZADO OSCURO
          >
            {searchLoading ? "ANALIZANDO..." : "BUSCAR INFORMACIÓN"}
          </button>

          {searchResult && (
              <div className="mt-5 p-4 bg-black/40 rounded-lg border text-left animate-pulse" style={{ borderColor: THEME.orange }}>
                   {searchResult.type === 'person' ? (
                    <>
                        <p className="text-[10px] uppercase font-bold" style={{ color: THEME.textGray }}>Donante</p>
                        <h3 className="text-lg font-bold" style={{ color: THEME.textWhite }}>{searchResult.nombre} {searchResult.apellido}</h3>
                        <div className="border-t border-gray-600 mt-2 pt-2 flex justify-between">
                            <span className="text-sm" style={{ color: THEME.textGray }}>Donado:</span> 
                            <span className="font-bold" style={{ color: THEME.orange }}>{searchResult.monto} ETH</span>
                        </div>
                    </>
                  ) : (
                      <>
                        <p className="text-[10px] uppercase font-bold" style={{ color: THEME.textGray }}>{searchResult.type === 'contract' ? 'Contrato' : 'Wallet'}</p>
                        <p className="text-xs truncate mb-2" style={{ color: THEME.textWhite }}>{searchResult.address}</p>
                        <div className="border-t border-gray-600 mt-2 pt-2 flex justify-between">
                             <span className="text-sm" style={{ color: THEME.textGray }}>Saldo:</span>
                             <span className="font-bold" style={{ color: THEME.orange }}>{searchResult.balance} ETH</span>
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