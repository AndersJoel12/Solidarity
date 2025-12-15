import React, { useState } from "react";
import { ethers } from "ethers";

// ------------------------------------------------------------------
// 🔗 IMPORTACIÓN DE LOS CONTRATOS
// ------------------------------------------------------------------
import DonacionesABI from '../contracts/Donaciones.json';
import PersonasABI from '../contracts/Personas.json';

// 📍 DIRECCIONES DE CONTRATOS OFICIALES
const donacionesAddress = "0xa535795B26a2529A5fF2b87204fA8c410F509Fe0"; 
const personasAddress = "0x83A6037870d3029E9a175A1D9EB775238fFA3dD5"; 


// --- ICONO DE ETHEREUM ---
const SmallEthIcon = () => (
  <svg width="18" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '10px', flexShrink: 0 }}>
    <path d="M16 0L7.41 16.82L16 21.84V0Z" fill="#C0CBF6"/>
    <path d="M16 0L16.08 0.255V21.84L24.59 16.82L16 0Z" fill="#627EEA"/>
    <path d="M16 21.84L24.59 16.82L16 12.87V21.84Z" fill="#141F30"/>
    <path d="M7.41 16.82L16 21.84V12.87L7.41 16.82Z" fill="#8A92B2"/>
    <path d="M16 22.99V31.995L24.59 18.96L16 22.99Z" fill="#627EEA"/>
    <path d="M7.41 18.96L16 31.995V22.99L7.41 18.96Z" fill="#C0CBF6"/>
  </svg>
);

function Donations() {
  // --- ESTADOS DE DONACIÓN (Tarjeta 1) ---
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [placeholderText, setPlaceholderText] = useState('Otra cantidad');
  
  // --- ESTADOS DE BÚSQUEDA (Tarjeta 2) ---
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const presets = ["0.25", "0.55", "0.75", "1.00"];

  // ------------------------------------------------------------------
  // 🛡️ FUNCIONES DE VALIDACIÓN ESTRICTA
  // ------------------------------------------------------------------
  
  // 1. Cédula: Solo Números y Máximo 9 dígitos al escribir
  const onChangeCedula = (e) => {
    const val = e.target.value;
    // Regex: Solo dígitos, longitud máxima 9
    if (/^\d{0,9}$/.test(val)) { 
        setCedula(val);
    }
  };

  // 2. Nombres/Apellidos: Solo Letras y espacios
  const onChangeSoloLetras = (e, setFunction) => {
    const val = e.target.value;
    if (/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/.test(val)) { 
        setFunction(val);
    }
  };

  // 3. Buscador: Alfanumérico (Para permitir Wallet y Cédula)
  const onChangeBuscador = (e) => {
    const val = e.target.value;
    if (/^[a-zA-Z0-9\s]*$/.test(val)) {
        setSearchInput(val);
    }
  };

  // ------------------------------------------------------------------

  const handlePresetClick = (value) => { setAmount(value); setDisplayAmount(''); };
  
  // 🟢 CAMBIO AQUI: Validación para evitar negativos
  const handleInputChange = (e) => { 
    const value = e.target.value; 
    // Si el valor es negativo, no hacemos nada (no actualizamos el estado)
    if (value < 0) return;
    
    setDisplayAmount(value); 
    setAmount(value); 
  };

  const handleDonate = async () => {
    // --- VALIDACIONES FINALES ANTES DE DONAR ---
    if (!cedula || !nombre || !apellido) return alert("Por favor completa tus datos personales.");
    
    // RESTRICCIONES DE CÉDULA PEDIDAS:
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
      if (error.reason && error.reason.includes("revert")) {
          alert("Error: El contrato rechazó la donación. Revisa los datos.");
      } else {
          alert("Hubo un error en la transacción.");
      }
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
        } 
        else { 
            // Si es solo números, asumimos Cédula
            const contratoDonaciones = new ethers.Contract(donacionesAddress, DonacionesABI.abi, provider);
            const resultado = await contratoDonaciones.obtenerPersonaPorCI(input);
            setSearchResult({ type: 'person', nombre: resultado[0], apellido: resultado[1], monto: ethers.formatEther(resultado[3]) });
        }
    } catch (error) {
        console.error(error);
        alert("No se encontraron resultados. Verifica la información.");
        setSearchResult(null);
    } finally { setSearchLoading(false); }
  };


  // --- ESTILOS ---
  const styles = {
    container: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh',
      padding: '40px 20px', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      background: '#f8fafc', gap: '30px'
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.9)', borderRadius: '24px',
      padding: '40px 30px', maxWidth: '480px', width: '100%',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', textAlign: 'center',
    },
    title: { marginBottom: '10px', fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.5px' },
    subtitle: { color: '#64748b', marginBottom: '30px', fontSize: '1rem', fontWeight: '400' },
    sectionTitle: { textAlign: 'left', color: '#0ea5e9', fontSize: '0.85rem', marginBottom: '12px', marginTop: '25px', fontWeight: '700', letterSpacing: '1.2px', textTransform: 'uppercase' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' },
    buttonPreset: { padding: '15px', borderRadius: '16px', borderWidth: '2px', borderStyle: 'solid', cursor: 'pointer', fontWeight: '700', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    inputGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '5px' },
    input: { width: '100%', padding: '14px 18px', borderRadius: '12px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', fontSize: '1rem', textAlign: 'left', display: 'block', outline: 'none', transition: 'border-color 0.3s ease, background-color 0.3s ease', boxSizing: 'border-box' },
    amountInputWrapper: { marginTop: '20px', position: 'relative' },
    amountInput: { textAlign: 'center', fontSize: '1.3rem', fontWeight: 'bold', paddingRight: '50px', backgroundColor: '#ffffff' },
    ethSuffix: { position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: '#0ea5e9', fontWeight: 'bold' },
    mainButton: { width: '100%', padding: '18px', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: 'white', fontSize: '1.2rem', fontWeight: '800', cursor: 'pointer', marginTop: '30px', boxShadow: '0 10px 20px -10px rgba(14, 165, 233, 0.5)', letterSpacing: '1px', transition: 'transform 0.2s ease' },
    searchButton: { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: '#334155', color: 'white', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', marginTop: '15px', transition: 'background 0.2s ease' },
    resultBox: { marginTop: '20px', padding: '20px', backgroundColor: '#e0f2fe', borderRadius: '16px', border: '1px solid #bae6fd', color: '#0369a1', textAlign: 'left', animation: 'fadeIn 0.5s ease' },
  };

  return (
    <div style={styles.container}>
      
      {/* ----------------- TARJETA 1: DONAR ----------------- */}
      <div style={styles.card}>
        <h2 style={styles.title}>Donar con Solidarity</h2>
        <p style={styles.subtitle}>Tu apoyo impulsa la diferencia en la Blockchain</p>

        <div style={{ textAlign: 'left' }}>
          <p style={styles.sectionTitle}>TUS DATOS PERSONALES</p>
          
          <div style={styles.inputGroup}>
            <input 
                type="text" 
                placeholder="Cédula de Identidad" 
                value={cedula} 
                onChange={onChangeCedula} 
                style={styles.input} 
            />
            <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold', marginLeft: '5px' }}>
              * campo obligatorio
            </span>
          </div>

          <div style={styles.inputGroup}>
            <input 
                type="text" 
                placeholder="Nombres" 
                value={nombre} 
                onChange={(e) => onChangeSoloLetras(e, setNombre)} 
                style={styles.input} 
            />
            <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold', marginLeft: '5px' }}>
              * campo obligatorio
            </span>
          </div>

          <div style={styles.inputGroup}>
            <input 
                type="text" 
                placeholder="Apellidos" 
                value={apellido} 
                onChange={(e) => onChangeSoloLetras(e, setApellido)} 
                style={styles.input} 
            />
            <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold', marginLeft: '5px' }}>
              * campo obligatorio
            </span>
          </div>
        </div>

        <p style={styles.sectionTitle}>SELECCIONA UN MONTO</p>
        <div style={styles.grid}>
          {presets.map((preset) => {
            const isSelected = amount === preset;
            const borderColor = isSelected ? '#0ea5e9' : '#cbd5e1'; 
            const textColor = isSelected ? '#0ea5e9' : '#64748b'; 
            const bgColor = isSelected ? 'rgba(14, 165, 233, 0.1)' : '#ffffff'; 
            return (
              <button key={preset} onClick={() => handlePresetClick(preset)} style={{...styles.buttonPreset, borderColor, color: textColor, backgroundColor: bgColor}}>
                <span>{preset} ETH</span> <SmallEthIcon />
              </button>
            );
          })}
        </div>

        <div style={styles.amountInputWrapper}>
          <input 
            type="number" 
            step="0.01" 
            min="0"  /* 🟢 AGREGADO: Evita decremento negativo en HTML */
            placeholder={placeholderText} 
            onFocus={() => setPlaceholderText('')} 
            onBlur={() => setPlaceholderText('Otra cantidad')} 
            value={displayAmount} 
            onChange={handleInputChange} 
            // 🟢 AGREGADO: Evita escribir el signo menos (-) con el teclado
            onKeyDown={(e) => ["-", "e", "E"].includes(e.key) && e.preventDefault()}
            style={{...styles.input, ...styles.amountInput}} 
          />
          <span style={styles.ethSuffix}>ETH</span>
        </div>

        <button style={{...styles.mainButton, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', transform: loading ? 'none' : 'scale(1)'}} onClick={handleDonate} disabled={loading}>
          {loading ? "Procesando..." : "DONAR AHORA"}
        </button>
      </div>

      {/* ----------------- TARJETA 2: BÚSQUEDA INTELIGENTE ----------------- */}
      <div style={styles.card}>
          <h2 style={{...styles.title, fontSize: '1.4rem'}}>🔍 Explorador Blockchain</h2>
          <p style={{...styles.subtitle, marginBottom:'15px'}}>Busca por Cédula, Dirección o Contrato</p>

          <div style={styles.inputGroup}>
            <input 
                type="text" 
                placeholder="Buscar" 
                value={searchInput} 
                onChange={onChangeBuscador} 
                style={{...styles.input, fontSize:'0.9rem'}} 
            />
          </div>

          <button style={{...styles.searchButton, opacity: searchLoading ? 0.7 : 1}} onClick={handleSearch} disabled={searchLoading}>
            {searchLoading ? "Analizando..." : "BUSCAR INFORMACIÓN"}
          </button>

          {/* RESULTADOS DINÁMICOS */}
          {searchResult && (
              <div style={styles.resultBox}>
                  
                  {/* CASO: PERSONA */}
                  {searchResult.type === 'person' && (
                    <>
                        <p style={{margin:0, fontSize:'0.8rem', color:'#64748b', textTransform:'uppercase', fontWeight:'bold'}}>Donante Registrado</p>
                        <h3 style={{margin:'5px 0 10px 0', color:'#0f172a'}}>{searchResult.nombre} {searchResult.apellido}</h3>
                        <div style={{borderTop:'1px dashed #bae6fd', paddingTop:'10px'}}>
                            <span style={{fontWeight:'bold'}}>Total Donado:</span> 
                            <span style={{float:'right', fontWeight:'bold', color:'#0284c7'}}>{searchResult.monto} ETH</span>
                        </div>
                    </>
                  )}

                  {/* CASO: CONTRATO */}
                  {searchResult.type === 'contract' && (
                    <>
                        <p style={{margin:0, fontSize:'0.8rem', color:'#64748b', textTransform:'uppercase', fontWeight:'bold'}}>Smart Contract</p>
                        <p style={{fontSize:'0.8rem', color: searchResult.isOfficial ? 'green' : 'orange', fontWeight:'bold', marginBottom:'10px'}}>
                            {searchResult.isOfficial ? "✅ Contrato Oficial" : "⚠️ Contrato Externo"}
                        </p>
                        <div style={{borderTop:'1px dashed #bae6fd', paddingTop:'10px'}}>
                            <span style={{fontWeight:'bold'}}>Recaudado:</span> 
                            <span style={{float:'right', fontWeight:'bold', color:'#0284c7'}}>{searchResult.balance} ETH</span>
                        </div>
                    </>
                  )}

                  {/* CASO: WALLET */}
                  {searchResult.type === 'wallet' && (
                    <>
                        <p style={{margin:0, fontSize:'0.8rem', color:'#64748b', textTransform:'uppercase', fontWeight:'bold'}}>Billetera (Wallet)</p>
                        <p style={{fontSize:'0.75rem', wordBreak:'break-all', color:'#334155', marginBottom:'10px'}}>{searchResult.address}</p>
                        <div style={{borderTop:'1px dashed #bae6fd', paddingTop:'10px'}}>
                            <span style={{fontWeight:'bold'}}>Saldo:</span> 
                            <span style={{float:'right', fontWeight:'bold', color:'#0284c7'}}>{searchResult.balance} ETH</span>
                        </div>
                        <div style={{marginTop:'5px'}}>
                            <span style={{fontWeight:'bold', fontSize:'0.9rem'}}>Transacciones:</span> 
                            <span style={{float:'right', fontWeight:'bold', color:'#334155'}}>{searchResult.txCount}</span>
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