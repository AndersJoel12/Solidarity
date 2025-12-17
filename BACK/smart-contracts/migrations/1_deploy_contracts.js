const Personas = artifacts.require("Personas");
const Donaciones = artifacts.require("Donaciones");
const fs = require('fs');
const path = require('path');

module.exports = async function (deployer, network, accounts) {
  // ---------------------------------------------------------
  // 1. CONFIGURACIÓN DE CUENTAS
  // ---------------------------------------------------------
  // accounts[0] = Tu cuenta (Deployer / Dueño del contrato)
  // accounts[9] = La cuenta de la Fundación (Beneficiaria)
  
  const cuentaFundacion = accounts[9]; 
  // Si quisieras una fija, descomenta esto: 
  // const cuentaFundacion = "0xTU_WALLET_REAL";

  console.log("🚀 Iniciando despliegue en red:", network);
  console.log("👤 Deployer (Admin):", accounts[0]);
  console.log("🏦 Beneficiario (Fundación):", cuentaFundacion);

  // ---------------------------------------------------------
  // 2. DESPLIEGUE DE CONTRATOS
  // ---------------------------------------------------------
  
  // A) Desplegar Personas
  await deployer.deploy(Personas);
  const personas = await Personas.deployed();
  console.log(`✅ Personas desplegado en: ${personas.address}`);

  // B) Desplegar Donaciones
  // Pasamos la dirección de Personas y la cuenta de la Fundación
  await deployer.deploy(Donaciones, personas.address, cuentaFundacion);
  const donaciones = await Donaciones.deployed();
  console.log(`✅ Donaciones desplegado en: ${donaciones.address}`);


  // ---------------------------------------------------------
  // 3. AUTOMATIZACIÓN NINJA (Mover archivos al Frontend)
  // ---------------------------------------------------------
  
  console.log("📦 Iniciando sincronización con el Frontend...");

  // RUTA DESTINO: Ajusta esto si tu carpeta 'src' está en otro lado.
  // Aquí asumo que está en:  raiz_proyecto/src
  const pathSrc = path.resolve(__dirname, '../../../FRONT/Solidarity/src'); 
  const pathContractsDestino = path.join(pathSrc, 'contracts');

  // A) Crear carpeta contracts si no existe
  if (!fs.existsSync(pathContractsDestino)){
    fs.mkdirSync(pathContractsDestino, { recursive: true });
  }

  // B) Función para copiar JSONs
  const copiarJSON = (nombre) => {
    const origen = path.resolve(__dirname, `../build/contracts/${nombre}.json`);
    const destino = path.join(pathContractsDestino, `${nombre}.json`);
    
    try {
      const data = fs.readFileSync(origen);
      fs.writeFileSync(destino, data);
      console.log(`   📄 JSON copiado: ${nombre}.json`);
    } catch (e) {
      console.error(`   ❌ Error copiando ${nombre}.json:`, e.message);
    }
  };

  copiarJSON("Personas");
  copiarJSON("Donaciones");

  // ---------------------------------------------------------
  // 4. ACTUALIZAR CONFIG.JS
  // ---------------------------------------------------------
  
  const configContent = `
// ⚠️ ARCHIVO GENERADO AUTOMÁTICAMENTE POR TRUFFLE
// FECHA: ${new Date().toLocaleString()}

export const PERSONAS_ADDRESS = "${personas.address}";
export const DONACIONES_ADDRESS = "${donaciones.address}";

export const THEME = {
    orange: '#F97316',
    bgDark: '#1f2937'
};
  `;

  const pathConfig = path.join(pathSrc, 'config.js');
  
  try {
      fs.writeFileSync(pathConfig, configContent);
      console.log("   ⚙️  config.js actualizado correctamente.");
  } catch (e) {
      console.error("   ❌ Error escribiendo config.js", e);
  }

  console.log("🎉 ¡Todo listo! Frontend sincronizado y contratos desplegados.");
};