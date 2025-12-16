const Personas = artifacts.require("Personas");
const Donaciones = artifacts.require("Donaciones");

module.exports = async function (deployer) {
  // 1. Primero desplegamos el contrato de Personas (Registro Civil)
  await deployer.deploy(Personas);
  const personasInstance = await Personas.deployed();

  // 2. Ahora desplegamos Donaciones y LE PASAMOS la dirección de Personas
  // Esto llena el "constructor" que creamos en Solidity
  await deployer.deploy(Donaciones, personasInstance.address);
  
  console.log("------------------------------------------------");
  console.log("✅ Personas Address:", personasInstance.address);
  // Nota: Truffle no siempre devuelve la instancia en el return del deploy, 
  // pero la dirección se guarda en el build.
  console.log("⚠️ REVISA LA CONSOLA AL TERMINAR PARA VER LA ADDRESS DE DONACIONES");
  console.log("------------------------------------------------");
}