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


// --- ICONO DE ETHEREUM (Colores adaptados al tema Naranja/Oscuro) ---
const SmallEthIcon = () => (
  <svg width="18" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '10px', flexShrink: 0 }}>
    <path d="M16 0L7.41 16.82L16 21.84V0Z" fill="#ffffff" opacity="0.8"/>
    <path d="M16 0L16.08 0.255V21.84L24.59 16.82L16 0Z" fill="#F97316"/> {/* Naranja */}
    <path d="M16 21.84L24.59 16.82L16 12.87V21.84Z" fill="#141F30"/>
    <path d="M7.41 16.82L16 21.84V12.87L7.41 16.82Z" fill="#8A92B2"/>
    <path d="M16 22.99V31.995L24.59 18.96L16 22.99Z" fill="#F97316"/> {/* Naranja */}
    <path d="M7.41 18.96L16 31.995V22.99L7.41 18.96Z" fill="#ffffff" opacity="0.6"/>
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
  
  // Validación para evitar negativos
  const handleInputChange = (e) => { 
    const value = e.target.value; 
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


  // --- ESTILOS INSPIRADOS EN PETSOLIDARITY (DARK MODE + ORANGE) ---
  const theme = {
    orange: '#F97316', // El naranja de la captura
    darkBg: '#111827', // Fondo oscuro profundo
    cardBg: 'rgba(31, 41, 55, 0.75)', // Fondo semitransparente oscuro
    inputBg: 'rgba(255, 255, 255, 0.1)', // Inputs oscuros
    textWhite: '#F9FAFB',
    textGray: '#9CA3AF',
    border: 'rgba(255, 255, 255, 0.1)'
  };

  const styles = {
    container: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh',
      padding: '40px 20px', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      // Si tienes la imagen del perro, cámbialo por: backgroundImage: `url('TU_URL_AQUI')`, backgroundSize: 'cover'
      background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), ${theme.darkBg}`, 
      gap: '30px', color: theme.textWhite
    },
    card: {
      backgroundColor: theme.cardBg, 
      backdropFilter: 'blur(12px)', // Efecto cristal
      border: `1px solid ${theme.border}`, 
      borderRadius: '16px',
      padding: '40px 30px', maxWidth: '480px', width: '100%',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', 
      textAlign: 'center',
    },
    title: { marginBottom: '10px', fontSize: '1.8rem', fontWeight: '800', color: theme.textWhite, letterSpacing: '-0.5px' },
    subtitle: { color: theme.textGray, marginBottom: '30px', fontSize: '1rem', fontWeight: '400' },
    sectionTitle: { textAlign: 'left', color: theme.orange, fontSize: '0.85rem', marginBottom: '12px', marginTop: '25px', fontWeight: '700', letterSpacing: '1.2px', textTransform: 'uppercase' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' },
    
    // Botones de montos predefinidos
    buttonPreset: { 
      padding: '15px', borderRadius: '12px', borderWidth: '1px', borderStyle: 'solid', 
      cursor: 'pointer', fontWeight: '700', fontSize: '1.1rem', 
      display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.3s ease' 
    },
    
    inputGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '5px' },
    
    // Inputs estilo PetSolidarity (Oscuros)
    input: { 
      width: '100%', padding: '14px 18px', borderRadius: '8px', 
      backgroundColor: theme.inputBg, 
      border: '1px solid transparent', 
      color: theme.textWhite, 
      fontSize: '1rem', textAlign: 'left', display: 'block', outline: 'none', 
      transition: 'border-color 0.3s ease', boxSizing: 'border-box' 
    },

    amountInputWrapper: { marginTop: '20px', position: 'relative' },
    amountInput: { textAlign: 'center', fontSize: '1.3rem', fontWeight: 'bold', paddingRight: '50px' },
    ethSuffix: { position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: theme.orange, fontWeight: 'bold' },
    
    // Botón principal NARANJA
    mainButton: { 
      width: '100%', padding: '16px', borderRadius: '8px', border: 'none', 
      background: theme.orange, 
      color: 'white', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', marginTop: '30px', 
      boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.3)', 
      transition: 'transform 0.2s ease' 
    },
    
    searchButton: { 
      width: '100%', padding: '15px', borderRadius: '8px', border: 'none', 
      background: theme.orange, 
      color: 'white', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', marginTop: '15px', 
      transition: 'background 0.2s ease' 
    },
    
    resultBox: { 
      marginTop: '20px', padding: '20px', 
      backgroundColor: 'rgba(0, 0, 0, 0.3)', 
      borderRadius: '12px', border: `1px solid ${theme.orange}`, 
      color: theme.textWhite, textAlign: 'left', animation: 'fadeIn 0.5s ease' 
    },
  };

  return (
    <div style={styles.container}>
      {/* Estilo para los placeholders (que no se pueden poner inline fácilmente) */}
      <style>{`
        ::placeholder { color: #6B7280; opacity: 1; }
        input:focus { border: 1px solid #F97316 !important; }
      `}</style>
      
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
            <span style={styles.errorMessage}></span>
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
            // Estilos dinámicos para los botones de monto
            const borderColor = isSelected ? theme.orange : theme.border; 
            const textColor = isSelected ? theme.orange : theme.textGray; 
            const bgColor = isSelected ? 'rgba(249, 115, 22, 0.1)' : 'transparent'; 
            
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
            min="0"  
            placeholder={placeholderText} 
            onFocus={() => setPlaceholderText('')} 
            onBlur={() => setPlaceholderText('Otra cantidad')} 
            value={displayAmount} 
            onChange={handleInputChange} 
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
                placeholder="Buscar (Cédula o Address)" 
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
                        <p style={{margin:0, fontSize:'0.8rem', color: theme.textGray, textTransform:'uppercase', fontWeight:'bold'}}>Donante Registrado</p>
                        <h3 style={{margin:'5px 0 10px 0', color: theme.textWhite}}>{searchResult.nombre} {searchResult.apellido}</h3>
                        <div style={{borderTop:`1px dashed ${theme.border}`, paddingTop:'10px'}}>
                            <span style={{fontWeight:'bold'}}>Total Donado:</span> 
                            <span style={{float:'right', fontWeight:'bold', color: theme.orange}}>{searchResult.monto} ETH</span>
                        </div>
                    </>
                  )}

                  {/* CASO: CONTRATO */}
                  {searchResult.type === 'contract' && (
                    <>
                        <p style={{margin:0, fontSize:'0.8rem', color: theme.textGray, textTransform:'uppercase', fontWeight:'bold'}}>Smart Contract</p>
                        <p style={{fontSize:'0.8rem', color: searchResult.isOfficial ? '#22c55e' : '#eab308', fontWeight:'bold', marginBottom:'10px'}}>
                            {searchResult.isOfficial ? "✅ Contrato Oficial" : "⚠️ Contrato Externo"}
                        </p>
                        <div style={{borderTop:`1px dashed ${theme.border}`, paddingTop:'10px'}}>
                            <span style={{fontWeight:'bold'}}>Recaudado:</span> 
                            <span style={{float:'right', fontWeight:'bold', color: theme.orange}}>{searchResult.balance} ETH</span>
                        </div>
                    </>
                  )}

                  {/* CASO: WALLET */}
                  {searchResult.type === 'wallet' && (
                    <>
                        <p style={{margin:0, fontSize:'0.8rem', color: theme.textGray, textTransform:'uppercase', fontWeight:'bold'}}>Billetera (Wallet)</p>
                        <p style={{fontSize:'0.75rem', wordBreak:'break-all', color: theme.textWhite, marginBottom:'10px'}}>{searchResult.address}</p>
                        <div style={{borderTop:`1px dashed ${theme.border}`, paddingTop:'10px'}}>
                            <span style={{fontWeight:'bold'}}>Saldo:</span> 
                            <span style={{float:'right', fontWeight:'bold', color: theme.orange}}>{searchResult.balance} ETH</span>
                        </div>
                        <div style={{marginTop:'5px'}}>
                            <span style={{fontWeight:'bold', fontSize:'0.9rem'}}>Transacciones:</span> 
                            <span style={{float:'right', fontWeight:'bold', color: theme.textWhite}}>{searchResult.txCount}</span>
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