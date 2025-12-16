import { useState } from 'react';
import { ethers } from 'ethers';
import DonacionesABI from './contracts/Donaciones.json';
import PersonasABI from './contracts/Personas.json'; // <--- IMPORTANTE: EL NUEVO JSON

// ⚠️ PEGA AQUÍ LAS DIRECCIONES QUE TE DIO TRUFFLE MIGRATE
const donacionesAddress = "0xb154c5629A02dc64F19971020645697C6bD28101"; 
const personasAddress = "0x94bc4e3390FBAb46122967795F0d540ac9BCe61B"; 


function Contrato() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- ESTADOS PARA REGISTRO CIVIL (PROFE) ---
  const [regCedula, setRegCedula] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regApellido, setRegApellido] = useState('');

  // --- ESTADOS PARA DONACIONES (TUYO) ---
  const [donarCedula, setDonarCedula] = useState('');
  const [donarMonto, setDonarMonto] = useState('');
  const [datosEncontrados, setDatosEncontrados] = useState(null);

  // 1. CONECTAR WALLET
  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (error) { console.error(error); }
    } else { alert("Instala Metamask"); }
  }

  // 2. FUNCIÓN NUEVA: AGREGAR PERSONA AL REGISTRO CIVIL
  async function agregarPersonaAlCivil() {
    if (!regCedula || !regNombre || !regApellido) return alert("Faltan datos pal registro!");
    
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Creamos la conexión con el contrato del PROFE
      const contratoPersonas = new ethers.Contract(personasAddress, PersonasABI.abi, signer);

      console.log("Registrando en el contrato del Profe...");
      
      // Llamamos a la función "registrarPersonaEsencial" del profe
      const tx = await contratoPersonas.registrarPersonaEsencial(
        regCedula, 
        regNombre, 
        regApellido
      );
      
      await tx.wait(); // Esperamos confirmación
      
      alert(`✅ ¡${regNombre} registrado en el Civil con éxito! Ahora puede donar.`);
      setLoading(false);
      
      // Limpiamos
      setRegCedula(''); setRegNombre(''); setRegApellido('');

    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Error: ¿Quizás esa cédula ya existe en el Civil?");
    }
  }

  // 3. REGISTRAR DONACIÓN (Igual que antes)
  async function registrarDonacion() {
    if (!donarMonto || !donarCedula) return alert("Llena los datos pues!");

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Conexión con TU contrato
      const contratoDonaciones = new ethers.Contract(donacionesAddress, DonacionesABI.abi, signer);

      const montoWei = ethers.parseEther(donarMonto);

      const tx = await contratoDonaciones.RegistrarDonantes(donarCedula, montoWei);
      await tx.wait();

      alert("🎉 ¡Donación procesada correctamente!");
      setLoading(false);
      setDonarCedula(''); setDonarMonto('');

    } catch (error) {
      console.error(error);
      setLoading(false);
      // Mensaje inteligente de error
      if (error.reason && error.reason.includes("revert")) {
          alert("Error: El contrato rechazó la donación. ¿Esa cédula está registrada arriba?");
      } else {
          alert("Error desconocido. Revisa la consola.");
      }
    }
  }

  // 4. CONSULTAR DONACIÓN
  async function consultarDonacion() {
    if (!donarCedula) return alert("Escribe la cédula abajo para buscar.");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contratoDonaciones = new ethers.Contract(donacionesAddress, DonacionesABI.abi, provider);
      
      const resultado = await contratoDonaciones.obtenerPersonaPorCI(donarCedula);
      
      setDatosEncontrados({
        nombres: resultado.Nombres,
        apellidos: resultado.Apellidos,
        monto: ethers.formatEther(resultado.Monto_Donacion)
      });
    } catch (error) {
      console.error(error);
      alert("No conseguí donaciones con esa cédula.");
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🇻🇪 Sistema Integrado Web3</h1>
      
      {!account ? (
        <button onClick={connectWallet} style={{background:'orange', padding:'10px', width:'100%'}}>🦊 Conectar Metamask</button>
      ) : <p style={{color:'green', textAlign:'center'}}>Conectado: {account}</p>}

      {/* --- ZONA 1: REGISTRO CIVIL (PROFE) --- */}
      <div style={{background: '#f4f4f4', padding: '15px', borderRadius: '10px', marginTop: '20px', border: '2px solid #333'}}>
        <h3>🏛️ Paso 1: Registro Civil (Admin)</h3>
        <p style={{fontSize: '0.8em'}}>Registra a la persona aquí primero para que exista en la base de datos.</p>
        
        <div style={{display:'flex', gap:'5px', marginBottom:'10px'}}>
            <input placeholder="Cédula" value={regCedula} onChange={e=>setRegCedula(e.target.value)} style={{padding:'8px', width:'30%'}}/>
            <input placeholder="Nombre" value={regNombre} onChange={e=>setRegNombre(e.target.value)} style={{padding:'8px', width:'35%'}}/>
            <input placeholder="Apellido" value={regApellido} onChange={e=>setRegApellido(e.target.value)} style={{padding:'8px', width:'35%'}}/>
        </div>
        <button onClick={agregarPersonaAlCivil} disabled={loading} style={{background:'#333', color:'white', padding:'10px', width:'100%'}}>
            {loading ? "Registrando..." : "💾 Guardar en Registro Civil"}
        </button>
      </div>

      <div style={{textAlign:'center', fontSize:'2rem', margin:'10px'}}>⬇️</div>

      {/* --- ZONA 2: DONACIONES (TUYO) --- */}
      <div style={{background: '#e8f5e9', padding: '15px', borderRadius: '10px', border: '2px solid #4CAF50'}}>
        <h3>💸 Paso 2: Realizar Donación</h3>
        <p style={{fontSize: '0.8em'}}>Usa una cédula que ya hayas registrado arriba.</p>
        
        <input placeholder="Cédula del Donante" value={donarCedula} onChange={e=>setDonarCedula(e.target.value)} style={{padding:'8px', width:'100%', marginBottom:'10px'}}/>
        <input type="number" placeholder="Monto en ETH (ej: 0.1)" value={donarMonto} onChange={e=>setDonarMonto(e.target.value)} style={{padding:'8px', width:'100%', marginBottom:'10px'}}/>
        
        <div style={{display:'flex', gap:'10px'}}>
            <button onClick={registrarDonacion} disabled={loading} style={{background:'#4CAF50', color:'white', padding:'10px', flex:1}}>
                💰 Donar
            </button>
            <button onClick={consultarDonacion} style={{background:'#2196F3', color:'white', padding:'10px', flex:1}}>
                🔍 Consultar
            </button>
        </div>

        {datosEncontrados && (
            <div style={{marginTop:'15px', padding:'10px', background:'white', borderRadius:'5px'}}>
                <strong>Datos Traídos:</strong> {datosEncontrados.nombres} {datosEncontrados.apellidos} <br/>
                <strong>Donó:</strong> {datosEncontrados.monto} ETH
            </div>
        )}
      </div>
    </div>
  );
}

export default Contrato;