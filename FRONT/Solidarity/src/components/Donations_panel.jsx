import React, { useState } from "react";
import { ethers } from "ethers";

function Donations() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  const presets = [5, 15, 25, 50];

  const handleDonate = async () => {
    if (!amount) return alert("Por favor selecciona un monto primero.");
    try {
      if (!window.ethereum) return alert("¡Necesitas MetaMask instalada!");
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contractAddress = "0x0000000000000000000000000000000000000000"; 
      
      const tx = await signer.sendTransaction({
        to: contractAddress,
        value: ethers.parseEther(amount.toString()) 
      });
      await tx.wait();
      alert(`¡Has donado ${amount} ETH exitosamente! 🌳`);
      setAmount('');
    } catch (error) {
      console.error(error);
      if (error.code !== 'ACTION_REJECTED') alert("Hubo un error en la transacción");
    } finally {
      setLoading(false);
    }
  };

  // --- ESTILOS NATIVOS (Para que funcione sin configurar nada) ---
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      // Usamos el fondo por defecto de Vite (transparente/heredado)
    },
    card: {
      // AQUÍ ESTÁ LA "CAJA"
      border: '1px solid rgba(255, 255, 255, 0.2)', // Borde sutil gris/blanco
      borderRadius: '20px', // Bordes redondeados
      padding: '30px',      // Espacio interno
      maxWidth: '450px',    // Ancho máximo para PC
      width: '100%',        // Ancho full para móvil (Responsive)
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', // Sombra suave
      textAlign: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.05)', // Un fondo gris muy suave para separar la caja
    },
    title: {
      marginBottom: '10px',
      fontSize: '1.5rem',
      fontWeight: 'bold',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr', // 2 columnas
      gap: '10px',
      marginBottom: '20px',
    },
    buttonPreset: {
      padding: '15px',
      borderRadius: '10px',
      border: '1px solid #555',
      backgroundColor: 'transparent',
      color: 'inherit',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    inputGroup: {
      marginBottom: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '5px'
    },
    input: {
      width: '90%', // Un poco menos del 100% para evitar desbordes con padding
      padding: '15px',
      borderRadius: '10px',
      border: '1px solid #555',
      backgroundColor: 'transparent',
      color: 'inherit',
      fontSize: '1.1rem',
      textAlign: 'center',
      margin: '0 auto', // Centrado
      display: 'block'
    },
    mainButton: {
      width: '100%',
      padding: '15px',
      borderRadius: '50px',
      border: 'none',
      backgroundColor: '#f97316', // Naranja (puedes cambiarlo si quieres)
      color: 'white',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '10px',
    },
    link: {
      marginTop: '20px',
      background: 'none',
      border: 'none',
      color: '#888',
      textDecoration: 'underline',
      cursor: 'pointer',
      fontSize: '0.9rem',
    }
  };

  return (
    <div style={styles.container}>
      {/* ESTA ES LA CARD (LA CAJA) */}
      <div style={styles.card}>
        
        <h2 style={styles.title}>¡Únete y dona ahora con Solidarity!</h2>
        <p style={{ color: '#888', marginBottom: '30px' }}>
          Tu apoyo hace la diferencia en la Blockchain
        </p>

        {/* Botones de montos */}
        <div style={styles.grid}>
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => setAmount(preset.toString())}
              style={{
                ...styles.buttonPreset,
                // Si está seleccionado, le ponemos borde naranja
                borderColor: amount === preset.toString() ? '#f97316' : '#555'
              }}
            >
              {preset} ETH
            </button>
          ))}
        </div>

        {/* Input Manual */}
        <div style={styles.inputGroup}>
          <input
            type="number"
            step="0.01"
            placeholder="Otra cantidad"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={styles.input}
          />
          <span style={{ fontSize: '0.8rem', color: '#888' }}>Monto en ETH</span>
        </div>

        {/* Botón Principal */}
        <button 
          style={{
            ...styles.mainButton,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          onClick={handleDonate}
          disabled={loading}
        >
          {loading ? "Procesando..." : "DONAR AHORA"}
        </button>

        <button style={styles.link}>
           ¿Cómo funciona esta dApp?
        </button>

      </div>
    </div>
  );
};   

export default Donations;