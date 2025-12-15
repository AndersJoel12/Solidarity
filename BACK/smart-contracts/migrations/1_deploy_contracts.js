const Personas = artifacts.require("Personas");
const Donaciones = artifacts.require("Donaciones");

module.exports = async function (deployer) {
  // 1. Desplegamos el contrato del Profe (Registro Civil)
  await deployer.deploy(Personas);
  const personasContract = await Personas.deployed();

  // 2. Desplegamos tu contrato (Donaciones)
  await deployer.deploy(Donaciones);
  const donacionesContract = await Donaciones.deployed();

  // 3. CONEXIÓN: Le decimos a tu contrato dónde está el del profe
  await donacionesContract.setRegistroCivilAddress(personasContract.address);

  console.log("------------------------------------------------");
  console.log("✅ Contrato Personas (Profe) en: " + personasContract.address);
  console.log("✅ Contrato Donaciones (Tuyo) en: " + donacionesContract.address);
  console.log("🔗 Contratos conectados exitosamente.");
  console.log("------------------------------------------------");
};