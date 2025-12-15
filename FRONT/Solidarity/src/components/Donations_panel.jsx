import React, { useState } from "react";
import { ethers } from "ethers";

// ------------------------------------------------------------------
// 🔗 IMPORTACIÓN DE LOS CONTRATOS (LÓGICA TRAÍDA DE ConexionSol.jsx)
// Ajusta la ruta '../contracts/...' según donde tengas tu carpeta contracts
// ------------------------------------------------------------------
import DonacionesABI from '../contracts/Donaciones.json';
import PersonasABI from '../contracts/Personas.json';

// 📍 DIRECCIONES DE CONTRATOS (TRAÍDAS DE ConexionSol.jsx)
const donacionesAddress = "0x6804D45a30E4b505D73fce7659502cb48E0601be"; 
const personasAddress = "0x1c600655CD6F76D6324c2914233Ec1b810c3BdF3"; 


// --- ICONO DE ETHEREUM (DISEÑO) ---
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
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [placeholderText, setPlaceholderText] = useState('Otra cantidad');
  
  const presets = ["0.25", "0.55", "0.75", "1.00"];

  const handlePresetClick = (value) => {
    setAmount(value);
    setDisplayAmount(''); 
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setDisplayAmount(value);
    setAmount(value);
  };

  // ------------------------------------------------------------------
  // 🧠 LÓGICA DE DONACIÓN INTEGRADA (Fusionando Pasos 1 y 2)
  // ------------------------------------------------------------------
  const handleDonate = async () => {
    if (!cedula || !nombre || !apellido) return alert("Por favor completa tus datos personales.");
    if (!amount) return alert("Por favor selecciona un monto.");

    try {
      if (!window.ethereum) return alert("¡Instala Metamask!");
      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // --- PASO 1: INTENTAR REGISTRO CIVIL (Si aplica) ---
      // Como tu UI pide Nombre y Apellido, intentamos registrarlos primero en el contrato Personas
      // para que la donación no falle.
      try {
        const contratoPersonas = new ethers.Contract(personasAddress, PersonasABI.abi, signer);
        // Verificamos o intentamos registrar (Esto abrirá Metamask #1)
        console.log("Intentando registrar en Civil...");
        const txRegistro = await contratoPersonas.registrarPersonaEsencial(cedula, nombre, apellido);
        await txRegistro.wait();
        console.log("Registro Civil Exitoso");
      } catch (error) {
        // Si falla, asumimos que YA existe y seguimos a la donación.
        console.log("El usuario ya estaba registrado o hubo un error menor, continuamos a donar...", error);
      }

      // --- PASO 2: REGISTRAR DONACIÓN (Contrato Donaciones) ---
      // Conexión con TU contrato (Esto abrirá Metamask #2)
      const contratoDonaciones = new ethers.Contract(donacionesAddress, DonacionesABI.abi, signer);
      const montoWei = ethers.parseEther(amount.toString());

      console.log("Procesando donación...");
      const txDonacion = await contratoDonaciones.RegistrarDonantes(cedula, montoWei);
      await txDonacion.wait();

      alert(`🎉 ¡Gracias ${nombre}! Has donado ${amount} ETH exitosamente.`);
      
      // Limpiar formulario
      setAmount(''); setDisplayAmount(''); setCedula(''); setNombre(''); setApellido('');

    } catch (error) {
      console.error(error);
      // Mensaje de error inteligente traído de tu lógica anterior
      if (error.reason && error.reason.includes("revert")) {
          alert("Error: El contrato rechazó la donación. Revisa si la cédula es correcta.");
      } else {
          alert("Hubo un error en la transacción. Revisa la consola.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // 🎨 ESTILOS (MODO LIGHT - NO SE TOCÓ NADA AQUÍ)
  // ------------------------------------------------------------------
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      background: '#f8fafc', 
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.9)', 
      borderRadius: '24px',
      padding: '40px 30px',
      maxWidth: '480px',
      width: '100%',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', 
      textAlign: 'center',
    },
    title: {
      marginBottom: '10px',
      fontSize: '1.8rem',
      fontWeight: '800',
      color: '#1e293b', 
      letterSpacing: '-0.5px'
    },
    subtitle: {
      color: '#64748b', 
      marginBottom: '30px',
      fontSize: '1rem',
      fontWeight: '400'
    },
    sectionTitle: {
      textAlign: 'left',
      color: '#0ea5e9', 
      fontSize: '0.85rem',
      marginBottom: '12px',
      marginTop: '25px',
      fontWeight: '700',
      letterSpacing: '1.2px',
      textTransform: 'uppercase'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '15px',
      marginBottom: '25px',
    },
    buttonPreset: {
      padding: '15px',
      borderRadius: '16px',
      borderWidth: '2px',
      borderStyle: 'solid',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '1.1rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    inputGroup: {
      marginBottom: '15px',
      display: 'flex',
      flexDirection: 'column',
      gap: '5px'
    },
    input: {
      width: '100%',
      padding: '14px 18px',
      borderRadius: '12px',
      backgroundColor: '#f1f5f9', 
      border: '1px solid #cbd5e1', 
      color: '#334155', 
      fontSize: '1rem',
      textAlign: 'left',
      display: 'block',
      outline: 'none',
      transition: 'border-color 0.3s ease, background-color 0.3s ease',
      boxSizing: 'border-box'
    },
    amountInputWrapper: {
       marginTop: '20px',
       position: 'relative'
    },
    amountInput: {
      textAlign: 'center',
      fontSize: '1.3rem',
      fontWeight: 'bold',
      paddingRight: '50px',
      backgroundColor: '#ffffff', 
    },
    ethSuffix: {
        position: 'absolute',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#0ea5e9', 
        fontWeight: 'bold'
    },
    mainButton: {
      width: '100%',
      padding: '18px',
      borderRadius: '50px',
      border: 'none',
      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      color: 'white',
      fontSize: '1.2rem',
      fontWeight: '800',
      cursor: 'pointer',
      marginTop: '30px',
      boxShadow: '0 10px 20px -10px rgba(14, 165, 233, 0.5)', 
      letterSpacing: '1px',
      transition: 'transform 0.2s ease',
    },
    link: {
      marginTop: '25px',
      background: 'none',
      border: 'none',
      color: '#64748b', 
      textDecoration: 'none',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '500',
      borderBottom: '1px dotted #cbd5e1'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        <h2 style={styles.title}>Donar con Solidarity</h2>
        <p style={styles.subtitle}>
          Tu apoyo impulsa la diferencia en la Blockchain
        </p>

        {/* --- DATOS PERSONALES --- */}
        <div style={{ textAlign: 'left' }}>
          <p style={styles.sectionTitle}>TUS DATOS PERSONALES</p>
          <div style={styles.inputGroup}><input type="text" placeholder="Cédula de Identidad" value={cedula} onChange={(e) => setCedula(e.target.value)} style={styles.input} /></div>
          <div style={styles.inputGroup}><input type="text" placeholder="Nombres" value={nombre} onChange={(e) => setNombre(e.target.value)} style={styles.input} /></div>
          <div style={styles.inputGroup}><input type="text" placeholder="Apellidos" value={apellido} onChange={(e) => setApellido(e.target.value)} style={styles.input} /></div>
        </div>

        {/* --- SELECCIÓN DE MONTO --- */}
        <p style={styles.sectionTitle}>SELECCIONA UN MONTO</p>

        <div style={styles.grid}>
          {presets.map((preset) => {
            const isSelected = amount === preset;
            const borderColor = isSelected ? '#0ea5e9' : '#cbd5e1'; 
            const textColor = isSelected ? '#0ea5e9' : '#64748b'; 
            const bgColor = isSelected ? 'rgba(14, 165, 233, 0.1)' : '#ffffff'; 

            return (
              <button key={preset} onClick={() => handlePresetClick(preset)} style={{...styles.buttonPreset, borderColor, color: textColor, backgroundColor: bgColor}}>
                <span>{preset} ETH</span>
                <SmallEthIcon />
              </button>
            );
          })}
        </div>

        <div style={styles.amountInputWrapper}>
          <input
            type="number" step="0.01"
            placeholder={placeholderText} onFocus={() => setPlaceholderText('')} onBlur={() => setPlaceholderText('Otra cantidad')}
            value={displayAmount} onChange={handleInputChange}
            style={{...styles.input, ...styles.amountInput}}
          />
          <span style={styles.ethSuffix}>ETH</span>
        </div>

        <button 
          style={{...styles.mainButton, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', transform: loading ? 'none' : 'scale(1)'}}
          onClick={handleDonate} disabled={loading}
          onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
        >
          {loading ? "Procesando..." : "DONAR AHORA"}
        </button>

        <button style={styles.link}>¿Cómo funciona Solidarity?</button>
      </div>
    </div>
  );
};   

export default Donations;