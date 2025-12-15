const Donaciones = artifacts.require("Donaciones");

module.exports = function (deployer) {
  deployer.deploy(Donaciones);
};