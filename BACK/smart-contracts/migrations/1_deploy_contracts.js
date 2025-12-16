const Personas = artifacts.require("Personas");
const Donaciones = artifacts.require("Donaciones");

module.exports = async function (deployer, network, accounts) {
  // accounts es un array con las 10 cuentas de Ganache.
  // accounts[0] = Tu cuenta (Deployer)
  // accounts[1] = Digamos que esta será la CUENTA DE LA FUNDACIÓN (Beneficiaria)
  
  /* const cuentaFundacion = accounts[1]; */
  const cuentaFundacion = "0x2A813eb9957734b3d0Ae483436C312dB636FECD5"
  // O puedes poner una dirección fija si quieres: const cuentaFundacion = "0x123...";

  // 1. Desplegamos Personas
  await deployer.deploy(Personas);
  const personasInstance = await Personas.deployed();

  // 2. Desplegamos Donaciones pasando:
  //    - La dirección de Personas
  //    - La dirección de la Fundación
  await deployer.deploy(Donaciones, personasInstance.address, cuentaFundacion);
  
  console.log("------------------------------------------------");
  console.log("✅ Contratos Desplegados");
  console.log("💰 El dinero irá automáticamente a:", cuentaFundacion);
  console.log("------------------------------------------------");
};