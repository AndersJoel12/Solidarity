import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import '../components/Tailwind.css'

// ------------------------------------------------------------------
// 🔗 IMPORTACIÓN DE LOS CONTRATOS Y COMPONENTES
// ------------------------------------------------------------------
import DonacionesABI from '../contracts/Donaciones.json';
import PersonasABI from '../contracts/Personas.json';
import DonationsList from "../components/Donation_list"; 

// 📍 DIRECCIONES DE CONTRATOS (¡ACTUALÍZALAS AQUÍ!)
const donacionesAddress = "0x8795D27C354D970666578155AA240df5e9f8eEfB"; 
const personasAddress = "0x42c3a1119c7f08eC09e5b2f5547496a3351C9c6b"; 


// --- COLORES TEMA ---
const THEME = {
    orange: '#F97316',
    darkInput: '#374151', 
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
  const [account, setAccount] = useState(null);
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [placeholderText, setPlaceholderText] = useState('Otra cantidad');
  
  // Estados de Búsqueda
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Estados para forzar actualización de la lista
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const presets = ["0.25", "0.55", "0.75", "1.00"];

  // --- DETECTAR WALLET AL CARGAR ---
  useEffect(() => {
    if (window.ethereum) {
        window.ethereum.request({ method: 'eth_accounts' })
            .then(accounts => {
                if (accounts.length > 0) setAccount(accounts[0]);
            });
    }
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
    } else {
        alert("Instala Metamask");
    }
  };

  // ------------------------------------------------------------------
  // 🛡️ LÓGICA DE INPUTS
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

  // ------------------------------------------------------------------
  // 💰 LÓGICA DE DONACIÓN
  // ------------------------------------------------------------------
  const handleDonate = async () => {
    if (!cedula || !nombre || !apellido) return alert("Por favor completa tus datos personales.");
    if (cedula.length <= 6) return alert("La cédula debe tener más de 6 dígitos.");
    if (parseInt(cedula) > 35000000) return alert("La cédula no puede exceder los 35 Millones.");
    if (!amount) return alert("Por favor selecciona un monto.");
    if (!account) { await connectWallet(); }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const montoWei = ethers.parseEther(amount.toString());

      try {
        const contratoPersonas = new ethers.Contract(personasAddress, PersonasABI.abi, signer);
        const txRegistro = await contratoPersonas.registrarPersonaEsencial(cedula, nombre, apellido);
        await txRegistro.wait();
      } catch (error) { 
        console.log("Usuario ya registrado o error menor en Civil. Continuando..."); 
      }

      const contratoDonaciones = new ethers.Contract(donacionesAddress, DonacionesABI.abi, signer);
      const txDonacion = await contratoDonaciones.RegistrarDonantes(cedula, montoWei, { value: montoWei });
      await txDonacion.wait();

      alert(`🎉 ¡Gracias ${nombre}! Has donado ${amount} ETH exitosamente.`);
      setAmount(''); setDisplayAmount(''); setCedula(''); setNombre(''); setApellido('');
      setRefreshTrigger(prev => prev + 1); 

    } catch (error) { 
      console.error(error); 
      if (error.code === 'INSUFFICIENT_FUNDS') {
          alert("Error: Fondos insuficientes para donación + gas.");
      } else {
          alert("Hubo un error en la transacción. Revisa la consola.");
      }
    } finally { 
      setLoading(false); 
    }
  };

  // ------------------------------------------------------------------
  // 🔍 LÓGICA DE BÚSQUEDA
  // ------------------------------------------------------------------
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
        } 
        else { 
            const contratoDonaciones = new ethers.Contract(donacionesAddress, DonacionesABI.abi, provider);
            const res = await contratoDonaciones.obtenerPersonaPorCI(input);
            const filtro = contratoDonaciones.filters.NuevaDonacion(input);
            const eventos = await contratoDonaciones.queryFilter(filtro);

            const historial = await Promise.all(eventos.map(async evt => {
                const bl = await evt.getBlock(); 
                return {
                    hash: evt.transactionHash,
                    fecha: bl ? new Date(bl.timestamp * 1000).toLocaleDateString() : "-",
                    monto: ethers.formatEther(evt.args[3]) 
                };
            }));

            setSearchResult({ 
                type: 'person', 
                nombre: res[0], 
                apellido: res[1], 
                monto: ethers.formatEther(res[2]), 
                historial: historial.reverse() 
            });
        }
    } catch (error) { 
        console.error(error); 
        alert("No se encontraron resultados o la cédula no existe."); 
        setSearchResult(null); 
    } finally { 
        setSearchLoading(false); 
    }
  };

  // ------------------------------------------------------------------
  // 🎨 RENDERIZADO
  // ------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-8 w-full max-w-[480px] mx-auto pb-10">
      
      {/* HEADER: ESTADO DE WALLET */}
      <div className="flex justify-end">
          {account ? (
              <span className="text-xs font-mono py-1 px-3 rounded-full bg-green-500/20 text-green-400 border border-green-500/50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  {account.slice(0,6)}...{account.slice(-4)}
              </span>
          ) : (
              // 🟢 AQUÍ ESTÁ EL CAMBIO: Forzamos el color con STYLE para que no falle en modo claro
              <button 
                onClick={connectWallet} 
                className="text-xs font-bold py-1 px-3 rounded-full transition shadow-lg hover:shadow-orange-500/50 hover:opacity-90"
                style={{ backgroundColor: THEME.orange, color: THEME.textWhite }}
              >
                  🦊 Conectar Wallet
              </button>
          )}
      </div>

      {/* --- TARJETA 1: FORMULARIO --- */}
      <div className="rounded-2xl p-8 shadow-2xl border border-gray-700 relative overflow-hidden" style={{ backgroundColor: '#1f2937' }}>
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-orange-500 to-transparent opacity-50"></div>
        
        <h2 className="text-2xl font-extrabold text-white mb-2 text-center">Donar con PetSolidarity</h2>
        <p className="text-gray-400 text-sm text-center mb-8">Tu apoyo impulsa la diferencia en la Blockchain</p>

        {/* Inputs Datos */}
        <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: THEME.orange }}>Tus Datos Personales</p>
            <div className="flex flex-col gap-4">
                {[{pl: "Cédula de Identidad", val: cedula, fn: onChangeCedula}, {pl: "Nombres", val: nombre, fn: (e)=>onChangeSoloLetras(e, setNombre)}, {pl: "Apellidos", val: apellido, fn: (e)=>onChangeSoloLetras(e, setApellido)}].map((item, i) => (
                    <div key={i} className="relative group">
                        <input type="text" placeholder={item.pl} value={item.val} onChange={item.fn} 
                            className="w-full p-3.5 rounded-lg border border-transparent focus:outline-none transition-all placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50"
                            style={{ backgroundColor: THEME.darkInput, color: THEME.textWhite }} 
                        />
                        <span className="text-red-500 text-[10px] font-bold mt-1 block uppercase opacity-70 group-hover:opacity-100 transition-opacity">* campo obligatorio</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Inputs Monto */}
        <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: THEME.orange }}>Selecciona un Monto</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
                {presets.map((preset) => {
                    const isSelected = amount === preset;
                    const btnStyle = isSelected 
                        ? { backgroundColor: 'rgba(249, 115, 22, 0.15)', borderColor: THEME.orange, color: THEME.orange } 
                        : { backgroundColor: THEME.darkInput, borderColor: 'transparent', color: THEME.textGray };

                    return (
                        <button key={preset} onClick={() => handlePresetClick(preset)} 
                            className="flex justify-center items-center py-3 px-2 rounded-lg border font-bold text-sm transition-all hover:scale-105 active:scale-95"
                            style={btnStyle}
                        >
                            {preset} ETH <SmallEthIcon />
                        </button>
                    )
                })}
            </div>

            <div className="relative">
                <input type="number" placeholder={placeholderText} onFocus={() => setPlaceholderText('')} onBlur={() => setPlaceholderText('Otra cantidad')} value={displayAmount} onChange={handleInputChange} 
                    className="w-full p-3.5 rounded-lg border border-transparent text-center font-bold focus:outline-none placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50"
                    style={{ backgroundColor: THEME.darkInput, color: THEME.textWhite }} 
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 font-bold text-sm" style={{ color: THEME.orange }}>ETH</span>
            </div>
        </div>

        <button onClick={handleDonate} disabled={loading}
            className="w-full py-4 rounded-lg font-extrabold text-lg shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-orange-500/30"
            style={{ backgroundColor: THEME.orange, color: THEME.textWhite }}
        >
            {loading ? "PROCESANDO..." : "DONAR AHORA"}
        </button>
      </div>

      {/* --- TARJETA 2: BUSCADOR --- */}
      <div className="rounded-2xl p-8 shadow-2xl border border-gray-700 text-center" style={{ backgroundColor: '#1f2937' }}>
          <h2 className="text-xl font-bold text-white mb-2 flex justify-center items-center gap-2">🔍 Explorador Blockchain</h2>
          <p className="text-gray-400 text-sm mb-5">Rastrea donaciones por Cédula o Dirección</p>
          
          <div className="flex gap-2">
            <input type="text" placeholder="Buscar (Cédula o Address)" value={searchInput} onChange={onChangeBuscador} 
                className="w-full p-3 rounded-lg border border-transparent focus:outline-none placeholder-gray-500 text-sm focus:ring-2 focus:ring-orange-500/50"
                style={{ backgroundColor: THEME.darkInput, color: THEME.textWhite }} 
            />
            <button onClick={handleSearch} disabled={searchLoading}
                className="px-4 rounded-lg font-bold transition-colors text-xl"
                style={{ backgroundColor: THEME.darkInput, color: THEME.textWhite, border: `1px solid ${THEME.textGray}` }} 
            >
                {searchLoading ? "⏳" : "🔎"}
            </button>
          </div>

          {searchResult && (
              <div className="mt-5 p-4 bg-black/40 rounded-lg border text-left animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ borderColor: THEME.orange }}>
                    {searchResult.type === 'person' ? (
                    <>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] uppercase font-bold" style={{ color: THEME.textGray }}>Donante Registrado</p>
                                <h3 className="text-lg font-bold" style={{ color: THEME.textWhite }}>{searchResult.nombre} {searchResult.apellido}</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-bold" style={{ color: THEME.textGray }}>Último Aporte</p>
                                <span className="font-bold text-lg" style={{ color: THEME.orange }}>{searchResult.monto} ETH</span>
                            </div>
                        </div>

                        <div className="mt-4 border-t border-gray-700 pt-3">
                            <p className="text-xs font-bold mb-2 text-gray-400">HISTORIAL DE APORTES:</p>
                            <div className="max-h-32 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                                {searchResult.historial && searchResult.historial.length > 0 ? (
                                    searchResult.historial.map((tx, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white/5 p-2 rounded hover:bg-white/10 transition">
                                            <div className="flex flex-col">
                                                <span className="text-orange-400 font-mono text-xs font-bold">+{tx.monto} ETH</span>
                                                <span className="text-[10px] text-gray-500">{tx.fecha}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] text-gray-600 block">Hash Transacción</span>
                                                <a href="#" className="text-gray-400 hover:text-white text-[10px] underline" title={tx.hash}>
                                                    {tx.hash.substring(0, 6)}...
                                                </a>
                                            </div>
                                        </div>
                                    ))
                                ) : <p className="text-xs text-gray-500">Sin historial visible.</p>}
                            </div>
                        </div>
                    </>
                  ) : (
                      <>
                        <p className="text-[10px] uppercase font-bold" style={{ color: THEME.textGray }}>{searchResult.type === 'contract' ? 'Contrato' : 'Wallet'}</p>
                        <p className="text-xs truncate mb-2 font-mono" style={{ color: THEME.textWhite }}>{searchResult.address}</p>
                        <div className="border-t border-gray-600 mt-2 pt-2 flex justify-between">
                             <span className="text-sm" style={{ color: THEME.textGray }}>Saldo Actual:</span>
                             <span className="font-bold" style={{ color: THEME.orange }}>{searchResult.balance} ETH</span>
                        </div>
                      </>
                  )}
              </div>
          )}
      </div>

      <DonationsList key={refreshTrigger} contractAddress={donacionesAddress} />

    </div>
  );
};   

export default Donations;