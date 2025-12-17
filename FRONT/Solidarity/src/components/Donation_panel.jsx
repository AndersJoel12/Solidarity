import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import '../components/Tailwind.css';
import Swal from 'sweetalert2'; // Importamos SweetAlert2

import DonacionesABI from '../contracts/Donaciones.json';
import PersonasABI from '../contracts/Personas.json';
import DonationsList from "./Donation_list"; 

// 📍 DIRECCIONES
const donacionesAddress = "0x5B20E78a3f6C8FbA7F38CdF5ad7562604C3DCb0f"; 
const personasAddress = "0xeeabaF2a2e2AC925735b0B98935A8868e8151a4c"; 

const THEME = {
    orange: '#F97316',
    darkInput: '#374151', 
    textWhite: '#ffffff',
    textGray: '#9ca3af',
    bgDark: '#1f2937'
};

// --- CONFIGURACIÓN DE SWEETALERT (MIXINS) ---
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: THEME.bgDark,
    color: '#fff',
    iconColor: THEME.orange,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

const MySwal = Swal.mixin({
    background: THEME.bgDark,
    color: '#ffffff',
    confirmButtonColor: THEME.orange,
    cancelButtonColor: '#d33',
    showClass: { popup: 'animate__animated animate__fadeInDown' },
    hideClass: { popup: 'animate__animated animate__fadeOutUp' },
    customClass: {
        popup: 'border border-gray-700 shadow-2xl rounded-2xl',
        title: 'font-bold text-xl',
        htmlContainer: 'text-gray-300'
    }
});

// --- ICONOS ---
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
  const [account, setAccount] = useState(null);
  
  // Estados de Formulario
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [placeholderText, setPlaceholderText] = useState('Otra cantidad');
  
  // Tab Activa
  const [activeTab, setActiveTab] = useState('registro');

  // Estados de Búsqueda
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const presets = ["0.25", "0.55", "0.75", "1.00"];

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
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(accounts[0]);
            Toast.fire({ icon: 'success', title: 'Wallet conectada fino 🦊' });
        } catch (error) {
            console.error(error);
        }
    } else {
        MySwal.fire({
            icon: 'warning',
            title: '¡Epa chamo!',
            text: 'Necesitas instalar MetaMask para usar esta dApp.',
            footer: '<a href="https://metamask.io/" target="_blank" class="text-orange-500 hover:underline">Descargar aquí</a>'
        });
    }
  };

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

  // ---------------------------------------------------------
  // 1. FUNCIÓN SOLO PARA REGISTRAR (Pestaña 1)
  // ---------------------------------------------------------
  const handleSoloRegistro = async () => {
    if (!cedula || !nombre || !apellido) 
        return Toast.fire({ icon: 'warning', title: 'Faltan datos en el formulario' });
    
    if (cedula.length <= 6) 
        return Toast.fire({ icon: 'error', title: 'La cédula es muy corta (mín 6 dígitos)' });
    
    if (!account) { await connectWallet(); }

    try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Verificamos primero si ya existe
        const contratoPersonasLectura = new ethers.Contract(personasAddress, PersonasABI.abi, provider);
        try {
            const id = await contratoPersonasLectura.obtenerIdPorCi(cedula);
            if (id > 0) {
                setLoading(false);
                return MySwal.fire({ 
                    icon: 'info', 
                    title: 'Ya registrado', 
                    text: 'Esta cédula ya existe. ¡Pasa a donar!',
                    confirmButtonText: 'Ir a Donar'
                }).then(() => setActiveTab('donar'));
            }
        } catch (e) { /* Si falla es que no existe, continuamos */ }

        // Procedemos a Registrar
        const contratoPersonas = new ethers.Contract(personasAddress, PersonasABI.abi, signer);
        const tx = await contratoPersonas.registrarPersonaEsencial(cedula, nombre, apellido);
        
        Toast.fire({ icon: 'info', title: 'Registrando en Blockchain...', timer: 8000 });
        await tx.wait();

        MySwal.fire({
            icon: 'success',
            title: '¡Registro Exitoso! 🎉',
            text: `Ahora ${nombre} está listo para donar.`,
            confirmButtonText: '¡Plomo!'
        }).then(() => {
            setNombre(''); setApellido(''); setCedula('');
            setActiveTab('donar');
        });

    } catch (error) {
        console.error(error);
        if (error.code === 'ACTION_REJECTED') {
            Toast.fire({ icon: 'warning', title: 'Transacción cancelada' });
        } else {
            MySwal.fire({ icon: 'error', title: 'Error', text: 'Revisa la consola para más detalles.' });
        }
    } finally {
        setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // 2. FUNCIÓN SOLO PARA DONAR (Pestaña 2)
  // ---------------------------------------------------------
  const handleSoloDonacion = async () => {
    if (!cedula) return Toast.fire({ icon: 'warning', title: 'Ingresa la Cédula' });
    if (!amount) return Toast.fire({ icon: 'warning', title: 'Selecciona un Monto' });
    if (!account) { await connectWallet(); }

    try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const montoWei = ethers.parseEther(amount.toString());

        // Verificar cédula
        const contratoPersonasLectura = new ethers.Contract(personasAddress, PersonasABI.abi, provider);
        try {
            const id = await contratoPersonasLectura.obtenerIdPorCi(cedula);
            if (id == 0) throw new Error("No existe");
        } catch (e) {
            setLoading(false);
            return MySwal.fire({
                icon: 'error',
                title: 'No Registrado',
                text: 'Esa cédula no está en el sistema. Regístrate primero.',
                confirmButtonText: 'Ir al Registro'
            }).then((res) => {
                if (res.isConfirmed) setActiveTab('registro');
            });
        }

        // Procedemos a Donar
        const contratoDonaciones = new ethers.Contract(donacionesAddress, DonacionesABI.abi, signer);
        const tx = await contratoDonaciones.RegistrarDonantes(cedula, montoWei, { value: montoWei });
        
        Toast.fire({ icon: 'info', title: 'Procesando donación...', timer: 10000 });
        await tx.wait();

        MySwal.fire({
            icon: 'success',
            title: '¡Donación Recibida! 🚀',
            html: `Gracias por tu aporte de <b style="color:${THEME.orange}">${amount} ETH</b>.`,
            footer: `<span class="text-xs text-gray-500 font-mono">Tx: ${tx.hash.substring(0,15)}...</span>`
        });
        
        setAmount(''); setDisplayAmount(''); setCedula('');
        setRefreshTrigger(prev => prev + 1);

    } catch (error) {
        console.error(error);
        if (error.code === 'INSUFFICIENT_FUNDS') {
            MySwal.fire({ icon: 'error', title: 'Sin Fondos', text: 'No tienes suficiente ETH para el gas.' });
        } else if (error.code === 'ACTION_REJECTED') {
            Toast.fire({ icon: 'warning', title: 'Transacción cancelada' });
        } else {
            MySwal.fire({ icon: 'error', title: 'Error', text: 'Algo salió mal en la transacción.' });
        }
    } finally {
        setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // BÚSQUEDA
  // ---------------------------------------------------------
  const handleSearch = async () => {
    if (!searchInput) return Toast.fire({ icon: 'warning', title: 'Escribe algo para buscar' });
    setSearchLoading(true);
    setSearchResult(null);
    try {
        if (!window.ethereum) return MySwal.fire({ icon: 'error', title: 'Instala MetaMask' });
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
            // Intentamos buscar, si falla asumimos que no existe
            let res;
            try {
                 res = await contratoDonaciones.obtenerPersonaPorCI(input);
            } catch (err) {
                 throw new Error("No encontrado");
            }

            const filter = contratoDonaciones.filters.NuevaDonacion(); 
            const currentBlock = await provider.getBlockNumber();
            const startBlock = Math.max(0, currentBlock - 5000);
            
            const events = await contratoDonaciones.queryFilter(filter, startBlock, "latest");
            const eventosFiltrados = events.filter(evt => String(evt.args[1]) === input);

            const historial = await Promise.all(eventosFiltrados.map(async evt => {
                return {
                    hash: evt.transactionHash,
                    fecha: new Date(Number(evt.args[5]) * 1000).toLocaleDateString(), 
                    monto: ethers.formatEther(evt.args[4]),
                    wallet: evt.args[0]
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
        Toast.fire({ icon: 'error', title: 'No encontrado', text: 'Verifica la cédula o address' });
        setSearchResult(null); 
    } finally { 
        setSearchLoading(false); 
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-[480px] mx-auto pb-10">
      
      {/* HEADER WALLET */}
      <div className="flex justify-end">
          {account ? (
              <span className="text-xs font-mono py-1 px-3 rounded-full bg-green-500/20 text-green-400 border border-green-500/50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  {account.slice(0,6)}...{account.slice(-4)}
              </span>
          ) : (
              <button onClick={connectWallet} className="text-xs font-bold py-1 px-3 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition shadow-lg">
                  🦊 Conectar Wallet
              </button>
          )}
      </div>

      {/* --- TARJETA PRINCIPAL (CON TABS) --- */}
      <div className="rounded-2xl shadow-2xl border border-gray-700 relative overflow-hidden" style={{ backgroundColor: THEME.bgDark }}>
        
        {/* PESTAÑAS DE NAVEGACIÓN */}
        <div className="flex border-b border-gray-700">
            <button 
                onClick={() => setActiveTab('registro')}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
                    activeTab === 'registro' ? 'bg-orange-500 text-white' : 'bg-transparent text-gray-500 hover:text-white hover:bg-white/5'
                }`}
            >
                📝 Registro
            </button>
            <button 
                onClick={() => setActiveTab('donar')}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
                    activeTab === 'donar' ? 'bg-orange-500 text-white' : 'bg-transparent text-gray-500 hover:text-white hover:bg-white/5'
                }`}
            >
                💰 Donar
            </button>
        </div>

        <div className="p-8">
            
            {/* --- SECCIÓN 1: REGISTRO --- */}
            {activeTab === 'registro' && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <h2 className="text-xl font-extrabold text-white mb-2 text-center">¡Registrate!</h2>
                    <p className="text-gray-400 text-xs text-center mb-6">Paso 1: Registra tus datos en la Blockchain</p>

                    <div className="flex flex-col gap-4 mb-6">
                        <div className="relative group">
                            <input type="text" placeholder="Cédula de Identidad" value={cedula} onChange={onChangeCedula} 
                                className="w-full p-3.5 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                style={{ backgroundColor: THEME.darkInput, color: THEME.textWhite }} 
                            />
                        </div>
                        <div className="relative group">
                            <input type="text" placeholder="Nombres" value={nombre} onChange={(e)=>onChangeSoloLetras(e, setNombre)} 
                                className="w-full p-3.5 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                style={{ backgroundColor: THEME.darkInput, color: THEME.textWhite }} 
                            />
                        </div>
                        <div className="relative group">
                            <input type="text" placeholder="Apellidos" value={apellido} onChange={(e)=>onChangeSoloLetras(e, setApellido)} 
                                className="w-full p-3.5 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                style={{ backgroundColor: THEME.darkInput, color: THEME.textWhite }} 
                            />
                        </div>
                    </div>

                    <button onClick={handleSoloRegistro} disabled={loading}
                        className="w-full py-4 rounded-lg font-extrabold text-lg shadow-lg hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50"
                        style={{ backgroundColor: THEME.orange, color: THEME.textWhite }}
                    >
                        {loading ? "REGISTRANDO..." : "GUARDAR DATOS"}
                    </button>
                </div>
            )}

            {/* --- SECCIÓN 2: DONAR --- */}
            {activeTab === 'donar' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-extrabold text-white mb-2 text-center">Realizar Donación</h2>
                    <p className="text-gray-400 text-xs text-center mb-6">Paso 2: Alimenta a un cachorro (Requiere registro previo)</p>

                    <div className="mb-6">
                        <input type="text" placeholder="Cédula del Donante" value={cedula} onChange={onChangeCedula} 
                            className="w-full p-3.5 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500/50 mb-4"
                            style={{ backgroundColor: THEME.darkInput, color: THEME.textWhite }} 
                        />
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {presets.map((preset) => {
                                const isSelected = amount === preset;
                                return (
                                    <button key={preset} onClick={() => handlePresetClick(preset)} 
                                        className="flex justify-center items-center py-3 px-2 rounded-lg border font-bold text-sm transition-all hover:scale-105"
                                        style={isSelected ? { backgroundColor: 'rgba(249, 115, 22, 0.15)', borderColor: THEME.orange, color: THEME.orange } : { backgroundColor: THEME.darkInput, borderColor: 'transparent', color: THEME.textGray }}
                                    >
                                        {preset} ETH <SmallEthIcon />
                                    </button>
                                )
                            })}
                        </div>

                        <div className="relative">
                            <input type="number" placeholder={placeholderText} onFocus={() => setPlaceholderText('')} onBlur={() => setPlaceholderText('Otra cantidad')} value={displayAmount} onChange={handleInputChange} 
                                className="w-full p-3.5 rounded-lg border border-transparent text-center font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                style={{ backgroundColor: THEME.darkInput, color: THEME.textWhite }} 
                            />
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 font-bold text-sm" style={{ color: THEME.orange }}>ETH</span>
                        </div>
                    </div>

                    <button onClick={handleSoloDonacion} disabled={loading}
                        className="w-full py-4 rounded-lg font-extrabold text-lg shadow-lg hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50"
                        style={{ backgroundColor: THEME.orange, color: THEME.textWhite }}
                    >
                        {loading ? "PROCESANDO..." : "DONAR AHORA"}
                    </button>
                </div>
            )}

        </div>
      </div>

      {/* TARJETA EXPLORADOR */}
      <div className="rounded-2xl p-8 shadow-2xl border border-gray-700 text-center" style={{ backgroundColor: THEME.bgDark }}>
          <h2 className="text-xl font-bold text-white mb-2 flex justify-center items-center gap-2">🔍 Explorador Blockchain</h2>
          <div className="flex gap-2 mb-4">
            <input type="text" placeholder="Buscar (Cédula o Address)" value={searchInput} onChange={onChangeBuscador} 
                className="w-full p-3 rounded-lg border border-transparent focus:outline-none placeholder-gray-500 text-sm focus:ring-2 focus:ring-orange-500/50"
                style={{ backgroundColor: THEME.darkInput, color: THEME.textWhite }} 
            />
            <button onClick={handleSearch} disabled={searchLoading}
                className="px-4 rounded-lg font-bold transition-colors text-xl hover:bg-gray-600"
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
                                <p className="text-[10px] uppercase font-bold" style={{ color: THEME.textGray }}>Donante</p>
                                <h3 className="text-lg font-bold" style={{ color: THEME.textWhite }}>{searchResult.nombre} {searchResult.apellido}</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-bold" style={{ color: THEME.textGray }}>Total Donado</p>
                                <span className="font-bold text-lg" style={{ color: THEME.orange }}>{searchResult.monto} ETH</span>
                            </div>
                        </div>
                        <div className="mt-4 border-t border-gray-700 pt-3">
                            <p className="text-xs font-bold mb-2 text-gray-400">HISTORIAL INDIVIDUAL:</p>
                            <div className="max-h-32 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                                {searchResult.historial.map((tx, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white/5 p-2 rounded hover:bg-white/10 transition">
                                        <div className="flex flex-col text-left">
                                            <span className="text-orange-400 font-mono text-xs font-bold">+{tx.monto} ETH</span>
                                            <span className="text-[10px] text-gray-500">{tx.fecha}</span>
                                            {tx.wallet && (
                                                <span className="text-[9px] text-gray-400 font-mono">
                                                    De: {tx.wallet.substring(0, 6)}...{tx.wallet.substring(38)}
                                                </span>
                                            )}
                                        </div>
                                        <a href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white text-[10px] underline" title={tx.hash}>
                                            Tx Hash ↗
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                  ) : (
                      <>
                        <p className="text-[10px] uppercase font-bold" style={{ color: THEME.textGray }}>{searchResult.type === 'contract' ? 'Contrato' : 'Wallet'}</p>
                        <p className="text-xs truncate mb-2 font-mono" style={{ color: THEME.textWhite }}>{searchResult.address}</p>
                        <span className="text-sm" style={{ color: THEME.textGray }}>Saldo:</span>
                        <span className="font-bold ml-2" style={{ color: THEME.orange }}>{searchResult.balance} ETH</span>
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