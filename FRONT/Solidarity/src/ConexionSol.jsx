import { useState } from 'react';
import { ethers } from 'ethers';
import DonacionesABI from './Donaciones.json'; // El archivo que copiaste

// Pega aquí la dirección que te dio la terminal (ej: 0x5FbDB...)
const contractAddress = "0x84E270cB2511359e5A508753b2b7Efdabf2C8236"; 

function Contrato() {
  const [cedula, setCedula] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [monto, setMonto] = useState('');

  // Función para conectar la Wallet (Metamask)
  async function requestAccount() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log("Wallet conectada:", accounts[0]);
      } catch (error) {
        console.error("Error conectando wallet:", error);
      }
    } else {
      alert("¡Instala Metamask chamo!");
    }
  }

  // Función para guardar en la Blockchain
  async function registrarDonacion() {
    if (!monto || !cedula) return;

    // 1. Conectamos con el proveedor (Metamask)
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // 2. Creamos la instancia del contrato
    const contrato = new ethers.Contract(contractAddress, DonacionesABI.abi, signer);

    try {
      // 3. Llamamos a la función del contrato
      // IMPORTANTE: El monto hay que pasarlo a formato "BigInt" o String si es muy grande
      const tx = await contrato.RegistrarDonantes(
        cedula,
        nombres,
        apellidos,
        monto // Como lo pusimos uint256, aquí pasamos el número directo
      );

      console.log("Transacción enviada:", tx.hash);
      alert("Esperando confirmación...");

      // 4. Esperamos a que la blockchain confirme
      await tx.wait();
      
      alert("¡Listo papá! Donación registrada en la Blockchain.");
    } catch (error) {
      console.error("Error al registrar:", error);
      alert("Error: Revisa la consola (F12). ¿Quizás la cédula ya existe?");
    }
  }

  // Nueva variable para mostrar los datos que traemos
  const [datosEncontrados, setDatosEncontrados] = useState(null);

  async function consultarDonacion() {
    if (!cedula) return alert("Epale, escribe la cédula en la cajita primero.");

    try {
      console.log("1. Buscando cédula:", cedula); // Chismoso 1
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contrato = new ethers.Contract(contractAddress, DonacionesABI.abi, provider);

      console.log("2. Llamando al contrato..."); // Chismoso 2
      const resultado = await contrato.obtenerPersonaPorCI(cedula);
      
      console.log("3. LO QUE LLEGÓ DEL CONTRATO:", resultado); // Chismoso 3 (Aquí veremos la verdad)

      // Intentamos leer los datos (Probamos las dos formas: por nombre o por posición)
      const nombre = resultado.Nombres || resultado[0];
      const apellido = resultado.Apellidos || resultado[1];
      const monto = resultado.Monto_Donacion || resultado[3]; // El 3 es porque es el cuarto dato del struct

      setDatosEncontrados({
        nombres: nombre,
        apellidos: apellido,
        monto: ethers.formatEther(monto)
      });
      
      console.log("4. Estado actualizado. Debería verse en pantalla.");

    } catch (error) {
      console.error("❌ ERROR FEO:", error); // Si sale rojo aquí, pégamelo
      
      // Si el error dice "revert", es que el contrato nos rebotó (Cédula no existe)
      if(error.message.includes("revert") || error.info?.error?.message.includes("no encontrada")) {
        alert("El contrato dice que esa cédula NO existe.");
      } else {
        alert("Ocurrió un error. Revisa la consola (F12) para ver qué pasó.");
      }
      setDatosEncontrados(null);
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>💸 Donaciones Web3</h1>
      <button onClick={requestAccount} style={{ background: 'orange', padding: '10px' }}>
        1. Conectar Wallet
      </button>

      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <input placeholder="Cédula" onChange={e => setCedula(e.target.value)} />
        <input placeholder="Nombres" onChange={e => setNombres(e.target.value)} />
        <input placeholder="Apellidos" onChange={e => setApellidos(e.target.value)} />
        <input type="number" placeholder="Monto" onChange={e => setMonto(e.target.value)} />
        
        <button onClick={registrarDonacion} style={{ background: '#4CAF50', color: 'white', padding: '10px' }}>
          2. Registrar Donación
        </button>
        {/* BOTÓN NUEVO PARA CONSULTAR */}
        <button onClick={consultarDonacion} style={{ background: '#2196F3', color: 'white', padding: '10px', marginTop: '10px' }}>
          3. Consultar por Cédula
        </button>

        {/* AQUÍ MOSTRAMOS EL RESULTADO */}
        {datosEncontrados && (
          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h3>📖 Datos en Blockchain:</h3>
            <p><strong>Nombre:</strong> {datosEncontrados.nombres} {datosEncontrados.apellidos}</p>
            <p><strong>Donó:</strong> {datosEncontrados.monto} ETH</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Contrato;